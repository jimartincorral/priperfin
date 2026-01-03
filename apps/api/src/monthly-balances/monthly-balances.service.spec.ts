import { Test, TestingModule } from '@nestjs/testing';
import { MonthlyBalancesService } from './monthly-balances.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { Decimal } from '@prisma/client/runtime/library';

describe('MonthlyBalancesService', () => {
  let service: MonthlyBalancesService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MonthlyBalancesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MonthlyBalancesService>(MonthlyBalancesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // findOne() Tests
  // ============================================
  describe('findOne', () => {
    it('should find balance by month and accountId', async () => {
      const mockBalance = {
        id: 'balance-1',
        month: '2025-01',
        balance: new Decimal(5000),
        accountId: 'acc-1',
      };
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(mockBalance);

      const result = await service.findOne('2025-01', 'acc-1');

      expect(result?.balance.toNumber()).toBe(5000);
      expect(prismaMock.monthlyBalance.findFirst).toHaveBeenCalledWith({
        where: {
          month: '2025-01',
          accountId: 'acc-1',
        },
      });
    });

    it('should find balance with null accountId', async () => {
      const mockBalance = {
        id: 'balance-2',
        month: '2025-01',
        balance: new Decimal(10000),
        accountId: null,
      };
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(mockBalance);

      const result = await service.findOne('2025-01', null);

      expect(result?.accountId).toBeNull();
      expect(prismaMock.monthlyBalance.findFirst).toHaveBeenCalledWith({
        where: {
          month: '2025-01',
          accountId: null,
        },
      });
    });

    it('should return null when balance not found', async () => {
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(null);

      const result = await service.findOne('2030-12', 'nonexistent');

      expect(result).toBeNull();
    });
  });

  // ============================================
  // upsert() Tests
  // ============================================
  describe('upsert', () => {
    it('should create new balance when none exists', async () => {
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(null);
      const newBalance = {
        id: 'balance-new',
        month: '2025-02',
        balance: new Decimal(3000),
        accountId: 'acc-1',
      };
      prismaMock.monthlyBalance.create.mockResolvedValue(newBalance);

      const result = await service.upsert('2025-02', 3000, 'acc-1');

      expect(result.id).toBe('balance-new');
      expect(prismaMock.monthlyBalance.create).toHaveBeenCalledWith({
        data: {
          month: '2025-02',
          balance: 3000,
          accountId: 'acc-1',
        },
      });
    });

    it('should update existing balance', async () => {
      const existingBalance = {
        id: 'balance-1',
        month: '2025-01',
        balance: new Decimal(5000),
        accountId: 'acc-1',
      };
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(existingBalance);
      const updatedBalance = {
        ...existingBalance,
        balance: new Decimal(6000),
      };
      prismaMock.monthlyBalance.update.mockResolvedValue(updatedBalance);

      const result = await service.upsert('2025-01', 6000, 'acc-1');

      expect(result.balance.toNumber()).toBe(6000);
      expect(prismaMock.monthlyBalance.update).toHaveBeenCalledWith({
        where: { id: 'balance-1' },
        data: { balance: 6000 },
      });
    });

    it('should handle null accountId for upsert', async () => {
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(null);
      const newBalance = {
        id: 'balance-new',
        month: '2025-03',
        balance: new Decimal(15000),
        accountId: null,
      };
      prismaMock.monthlyBalance.create.mockResolvedValue(newBalance);

      const result = await service.upsert('2025-03', 15000, null);

      expect(result.accountId).toBeNull();
      expect(prismaMock.monthlyBalance.create).toHaveBeenCalledWith({
        data: {
          month: '2025-03',
          balance: 15000,
          accountId: null,
        },
      });
    });

    it('should handle undefined accountId as null', async () => {
      prismaMock.monthlyBalance.findFirst.mockResolvedValue(null);
      prismaMock.monthlyBalance.create.mockResolvedValue({
        id: 'balance-new',
        month: '2025-04',
        balance: new Decimal(2000),
        accountId: null,
      });

      await service.upsert('2025-04', 2000, undefined);

      expect(prismaMock.monthlyBalance.create).toHaveBeenCalledWith({
        data: {
          month: '2025-04',
          balance: 2000,
          accountId: null,
        },
      });
    });
  });
});
