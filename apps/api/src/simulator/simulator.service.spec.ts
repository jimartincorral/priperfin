import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { NO_ACCOUNT, SimulatorService } from './simulator.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { Prisma } from '../generated/client';
import { SaveScenarioDto } from './scenario.dto';

const Decimal = Prisma.Decimal;

describe('SimulatorService', () => {
  let service: SimulatorService;
  let prismaMock: PrismaMock;
  const accounts = { findAll: jest.fn() };
  const reports = { getMonthlyCashFlow: jest.fn() };
  const goals = { findAll: jest.fn() };

  const dto: SaveScenarioDto = {
    name: '  Buy a home ',
    changes: [
      {
        id: 'c1',
        kind: 'recurring',
        name: 'Mortgage',
        enabled: true,
        amount: 1420,
        startMonth: '2027-03',
        category: 'Housing',
      },
    ],
    basis: { period: 6, excluded: ['2026-06'], horizon: 24 },
  };

  /**
   * Per account: an optional monthly starting balance and the sum of the
   * transactions the service asks for (since that month, or all of them).
   */
  const setBalances = (
    byAccount: Record<
      string,
      { anchor?: { month: string; balance: number }; sum: number }
    >,
  ) => {
    prismaMock.monthlyBalance.findFirst.mockImplementation(({ where }) => {
      const anchor = byAccount[where.accountId]?.anchor;
      return Promise.resolve(
        anchor ? { ...anchor, balance: new Decimal(anchor.balance) } : null,
      );
    });
    prismaMock.transaction.aggregate.mockImplementation(({ where }) =>
      Promise.resolve({
        _sum: { amount: new Decimal(byAccount[where.accountId]?.sum ?? 0) },
      }),
    );
  };
  const account = (
    id: string,
    name: string,
    type = 'DEBIT',
    initialBalance = 0,
  ) => ({ id, name, type, initialBalance: new Decimal(initialBalance) });

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock = createPrismaMock();
    prismaMock.setting.findMany.mockResolvedValue([]);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulatorService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AccountsService, useValue: accounts },
        { provide: ReportsService, useValue: reports },
        { provide: SavingsGoalsService, useValue: goals },
      ],
    }).compile();
    service = module.get(SimulatorService);
  });

  describe('getBaseline', () => {
    it('averages the 12 complete months before now and sums every account', async () => {
      reports.getMonthlyCashFlow.mockResolvedValue([]);
      accounts.findAll.mockResolvedValue([
        account('a1', 'Main', 'DEBIT', 1000),
        account('a2', 'Card', 'CREDIT', 150),
      ]);
      // Main: 1000 initial + 0.123 moved. Card: 150 owed at the start and
      // 50 more spent since, so 200 owed, which is -200 of money.
      setBalances({ a1: { sum: 0.123 }, a2: { sum: -50 } });
      goals.findAll.mockResolvedValue([
        {
          id: 'g1',
          name: 'Emergency fund',
          targetAmount: new Decimal(10000),
          savedAmount: new Decimal(6000),
          targetDate: new Date('2027-12-01T00:00:00Z'),
          isEvergreen: false,
        },
      ]);
      prismaMock.setting.findUnique.mockResolvedValue({
        key: 'currency',
        value: 'EUR',
      });

      const baseline = await service.getBaseline(
        'p1',
        undefined,
        new Date('2026-10-27T10:00:00Z'),
      );

      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        new Date(Date.UTC(2025, 9, 1)),
        12,
        undefined,
        false,
      );
      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        new Date(Date.UTC(2026, 9, 1)),
        1,
        undefined,
        false,
      );
      expect(baseline).toMatchObject({
        currency: 'EUR',
        currentMonth: '2026-10',
        balance: 800.12,
        accounts: [
          { id: 'a1', name: 'Main', type: 'DEBIT', balance: 1000.12 },
          { id: 'a2', name: 'Card', type: 'CREDIT', balance: -200 },
        ],
        selectedAccountIds: [],
        goals: [
          {
            id: 'g1',
            targetAmount: 10000,
            savedAmount: 6000,
            targetDate: '2027-12-01T00:00:00.000Z',
            isEvergreen: false,
          },
        ],
      });
    });
  });

  describe('getBaseline with an account filter', () => {
    beforeEach(() => {
      reports.getMonthlyCashFlow.mockResolvedValue([]);
      accounts.findAll.mockResolvedValue([
        account('a1', 'Main'),
        account('a2', 'Savings'),
      ]);
      setBalances({ a1: { sum: 1000 }, a2: { sum: 5000 } });
      goals.findAll.mockResolvedValue([]);
      prismaMock.setting.findUnique.mockResolvedValue(null);
    });

    it('limits cash flow and balance to the selected accounts', async () => {
      const baseline = await service.getBaseline('p1', ['a2']);

      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        expect.any(Date),
        12,
        ['a2'],
        false,
      );
      expect(baseline.balance).toBe(5000);
      expect(baseline.selectedAccountIds).toEqual(['a2']);
      expect(baseline.accounts).toHaveLength(2);
    });

    it("ignores ids that are not this profile's and falls back to all", async () => {
      const baseline = await service.getBaseline('p1', ['someone-else']);

      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        expect.any(Date),
        12,
        undefined,
        false,
      );
      expect(baseline.balance).toBe(6000);
      expect(baseline.selectedAccountIds).toEqual([]);
    });
  });

  describe("today's balance", () => {
    beforeEach(() => {
      reports.getMonthlyCashFlow.mockResolvedValue([]);
      goals.findAll.mockResolvedValue([]);
      prismaMock.setting.findUnique.mockResolvedValue(null);
    });

    it('starts from the latest monthly starting balance, as the Expenses screen does', async () => {
      // No initial balance was ever entered: all transactions add up to
      // -1286, but the starting balance set for September was 2400.
      accounts.findAll.mockResolvedValue([account('a1', 'Main')]);
      setBalances({
        a1: { anchor: { month: '2026-09', balance: 2400 }, sum: -310.5 },
      });

      const baseline = await service.getBaseline(
        'p1',
        undefined,
        new Date('2026-10-28T10:00:00Z'),
      );

      expect(prismaMock.monthlyBalance.findFirst).toHaveBeenCalledWith({
        where: { accountId: 'a1', month: { lte: '2026-10' } },
        orderBy: { month: 'desc' },
      });
      expect(prismaMock.transaction.aggregate).toHaveBeenCalledWith({
        where: {
          profileId: 'p1',
          accountId: 'a1',
          date: { gte: new Date(Date.UTC(2026, 8, 1)) },
        },
        _sum: { amount: true },
      });
      expect(baseline.balance).toBe(2089.5);
    });

    it('uses the all-accounts starting balance when every account counts', async () => {
      accounts.findAll.mockResolvedValue([
        account('a1', 'Main'),
        account('a2', 'Card', 'CREDIT'),
      ]);
      setBalances({ a1: { sum: 999 }, a2: { sum: 999 } });
      prismaMock.setting.findMany.mockResolvedValue([
        { key: 'starting_balance_all_2026-08', value: '1000' },
        { key: 'starting_balance_all_2026-09', value: '3000' },
        // a later month is not "today" yet
        { key: 'starting_balance_all_2026-11', value: '9999' },
      ]);
      prismaMock.transaction.aggregate.mockImplementation(({ where }) =>
        Promise.resolve({
          _sum: {
            amount: new Decimal(where.accountId ? 999 : -450.25),
          },
        }),
      );

      const baseline = await service.getBaseline(
        'p1',
        undefined,
        new Date('2026-10-28T10:00:00Z'),
      );

      expect(prismaMock.transaction.aggregate).toHaveBeenCalledWith({
        where: {
          profileId: 'p1',
          date: { gte: new Date(Date.UTC(2026, 8, 1)) },
        },
        _sum: { amount: true },
      });
      expect(baseline.balance).toBe(2549.75);
      // What the accounts do not account for is listed as its own part, so
      // the parts add up to the total.
      expect(baseline.accounts).toEqual([
        { id: 'a1', name: 'Main', type: 'DEBIT', balance: 999 },
        { id: 'a2', name: 'Card', type: 'CREDIT', balance: 999 },
        { id: NO_ACCOUNT, name: '', type: 'NONE', balance: 551.75 },
      ]);

      // With an account filter only the parts picked count.
      const october = new Date('2026-10-28T10:00:00Z');
      const filtered = await service.getBaseline('p1', ['a1'], october);
      expect(filtered.balance).toBe(999);
      const withRest = await service.getBaseline(
        'p1',
        ['a1', NO_ACCOUNT],
        october,
      );
      expect(withRest.balance).toBe(1550.75);
    });

    it('reads the starting balance of a credit card as the amount owed', async () => {
      // 300 owed when October began, 50 spent on the card since: 350 owed.
      accounts.findAll.mockResolvedValue([
        account('a1', 'Main', 'DEBIT', 0),
        account('a2', 'Card', 'CREDIT', 0),
      ]);
      setBalances({
        a1: { anchor: { month: '2026-10', balance: 2000 }, sum: 100 },
        a2: { anchor: { month: '2026-10', balance: 300 }, sum: -50 },
      });

      const baseline = await service.getBaseline(
        'p1',
        undefined,
        new Date('2026-10-28T10:00:00Z'),
      );

      expect(baseline.accounts).toEqual([
        { id: 'a1', name: 'Main', type: 'DEBIT', balance: 2100 },
        { id: 'a2', name: 'Card', type: 'CREDIT', balance: -350 },
      ]);
      expect(baseline.balance).toBe(1750);
    });
  });

  describe('several accounts at once', () => {
    beforeEach(() => {
      reports.getMonthlyCashFlow.mockResolvedValue([]);
      goals.findAll.mockResolvedValue([]);
      prismaMock.setting.findUnique.mockResolvedValue(null);
      accounts.findAll.mockResolvedValue([
        account('a1', 'Main', 'DEBIT', 1000),
        account('a2', 'Card', 'CREDIT', 200),
        account('a3', 'Savings', 'DEBIT', 5000),
      ]);
      // Main 1000 + 400, Card 200 owed + 100 spent, Savings 5000 + 600.
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(null);
      prismaMock.transaction.aggregate.mockImplementation(({ where }) => {
        const sums: Record<string, number> = { a1: 400, a2: -100, a3: 600 };
        // Transactions with no account: 2400 spent over the year.
        const sum = where.accountId === null ? -2400 : sums[where.accountId];
        return Promise.resolve({ _sum: { amount: new Decimal(sum) } });
      });
      prismaMock.transaction.findFirst.mockResolvedValue({ id: 't1' });
    });

    const parts = (b: { accounts: Array<{ id: string; balance: number }> }) =>
      Object.fromEntries(b.accounts.map((a) => [a.id, a.balance]));

    it('lists money with no account as its own part and counts it in the total', async () => {
      const all = await service.getBaseline('p1');

      expect(parts(all)).toEqual({
        a1: 1400,
        a2: -300,
        a3: 5600,
        [NO_ACCOUNT]: -2400,
      });
      expect(all.balance).toBe(4300);
      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        expect.any(Date),
        12,
        undefined,
        false,
      );
    });

    it('adds up the parts picked, whichever they are', async () => {
      const all = parts(await service.getBaseline('p1'));
      const picks = [
        ['a1', 'a2'],
        ['a1', 'a3'],
        ['a2', 'a3'],
        ['a1', NO_ACCOUNT],
        ['a3'],
      ];
      for (const pick of picks) {
        const b = await service.getBaseline('p1', pick);
        const expected = pick.reduce((sum, id) => sum + all[id], 0);
        expect(b.balance).toBeCloseTo(expected, 2);
        expect([...b.selectedAccountIds].sort()).toEqual([...pick].sort());
      }
    });

    it('passes the transactions with no account on with the parts picked', async () => {
      await service.getBaseline('p1', ['a1', NO_ACCOUNT]);
      expect(reports.getMonthlyCashFlow).toHaveBeenLastCalledWith(
        'p1',
        expect.any(Date),
        1,
        ['a1'],
        true,
      );

      await service.getBaseline('p1', ['a1', 'a2', 'a3']);
      expect(reports.getMonthlyCashFlow).toHaveBeenLastCalledWith(
        'p1',
        expect.any(Date),
        1,
        ['a1', 'a2', 'a3'],
        false,
      );
    });

    it('treats every part picked as everything', async () => {
      const b = await service.getBaseline('p1', ['a3', 'a1', NO_ACCOUNT, 'a2']);
      expect(b.selectedAccountIds).toEqual([]);
      expect(b.balance).toBe(4300);
    });

    it('leaves the no-account part out when there is nothing in it', async () => {
      prismaMock.transaction.aggregate.mockImplementation(({ where }) =>
        Promise.resolve({
          _sum: { amount: new Decimal(where.accountId === null ? 0 : 10) },
        }),
      );
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const b = await service.getBaseline('p1');
      expect(b.accounts.map((a) => a.id)).toEqual(['a1', 'a2', 'a3']);
    });

    it('falls back to the initial balance and every transaction', async () => {
      accounts.findAll.mockResolvedValue([account('a1', 'Main', 'DEBIT', 500)]);
      setBalances({ a1: { sum: -1286 } });

      const baseline = await service.getBaseline('p1');

      expect(prismaMock.transaction.aggregate).toHaveBeenCalledWith({
        where: { profileId: 'p1', accountId: 'a1' },
        _sum: { amount: true },
      });
      expect(baseline.balance).toBe(-786);
    });
  });

  describe('scenarios', () => {
    it('stores changes and basis as JSON and returns them parsed', async () => {
      prismaMock.scenario.create.mockImplementation(({ data }) => ({
        id: 's1',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      }));

      const saved = await service.create('p1', dto);

      expect(prismaMock.scenario.create).toHaveBeenCalledWith({
        data: {
          profileId: 'p1',
          name: 'Buy a home',
          changesJson: JSON.stringify(dto.changes),
          basisJson: JSON.stringify(dto.basis),
        },
      });
      expect(saved).toMatchObject({
        id: 's1',
        name: 'Buy a home',
        changes: dto.changes,
        basis: dto.basis,
      });
    });

    it('falls back to empty values when stored JSON is unreadable', async () => {
      prismaMock.scenario.findMany.mockResolvedValue([
        { id: 's1', name: 'Broken', changesJson: '{', basisJson: 'x' },
      ]);

      const [row] = await service.findAll('p1');

      expect(row.changes).toEqual([]);
      expect(row.basis).toEqual({});
    });

    it("refuses to update or delete another profile's scenario", async () => {
      prismaMock.scenario.findFirst.mockResolvedValue(null);

      await expect(service.update('s1', 'p1', dto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.remove('s1', 'p1')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaMock.scenario.findFirst).toHaveBeenCalledWith({
        where: { id: 's1', profileId: 'p1' },
      });
      expect(prismaMock.scenario.update).not.toHaveBeenCalled();
      expect(prismaMock.scenario.delete).not.toHaveBeenCalled();
    });
  });
});
