import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SimulatorService } from './simulator.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
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
  const transactions = { getAccountBalance: jest.fn() };
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

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SimulatorService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AccountsService, useValue: accounts },
        { provide: TransactionsService, useValue: transactions },
        { provide: ReportsService, useValue: reports },
        { provide: SavingsGoalsService, useValue: goals },
      ],
    }).compile();
    service = module.get(SimulatorService);
  });

  describe('getBaseline', () => {
    it('averages the 12 complete months before now and sums every account', async () => {
      reports.getMonthlyCashFlow.mockResolvedValue([]);
      accounts.findAll.mockResolvedValue([{ id: 'a1' }, { id: 'a2' }]);
      transactions.getAccountBalance
        .mockResolvedValueOnce({ balance: 1000.123 })
        .mockResolvedValueOnce({ balance: -200 });
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
        new Date('2026-10-27T10:00:00Z'),
      );

      expect(reports.getMonthlyCashFlow).toHaveBeenCalledWith(
        'p1',
        new Date(Date.UTC(2025, 9, 1)),
        12,
      );
      expect(baseline).toMatchObject({
        currency: 'EUR',
        currentMonth: '2026-10',
        balance: 800.12,
        accountCount: 2,
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
