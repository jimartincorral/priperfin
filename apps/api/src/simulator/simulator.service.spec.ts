import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
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
      );
      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        new Date(Date.UTC(2026, 9, 1)),
        1,
        undefined,
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

      // With an account filter the per-account balances apply instead.
      const filtered = await service.getBaseline('p1', ['a1']);
      expect(filtered.balance).toBe(999);
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
