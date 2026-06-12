import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import {
  createMockTransaction,
  createMockCategory,
  createMockCostObject,
  createMockTransactionSplit,
} from '../test/fixtures';
import { Prisma } from '../generated/client';

const Decimal = Prisma.Decimal;

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // getDateRange() Tests
  // ============================================
  describe('getDateRange', () => {
    // Freeze the clock so tests are deterministic regardless of the real date.
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 5, 15, 12, 0, 0)); // June 15, 2025 (local time)
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return correct date range for month and year', () => {
      const result = (service as any).getDateRange({ month: 1, year: 2025 });

      expect(result.startDate).toEqual(new Date(2025, 0, 1));
      expect(result.endDate).toEqual(new Date(2025, 1, 1));
    });

    it('should handle December correctly (year rollover)', () => {
      const result = (service as any).getDateRange({ month: 12, year: 2025 });

      expect(result.startDate).toEqual(new Date(2025, 11, 1));
      expect(result.endDate).toEqual(new Date(2026, 0, 1)); // Jan 2026
    });

    it('should use current date when no month/year provided', () => {
      const result = (service as any).getDateRange({});

      // Frozen "now" is June 15, 2025 -> default month filter is June 2025
      expect(result.startDate).toEqual(new Date(2025, 5, 1));
      expect(result.endDate).toEqual(new Date(2025, 6, 1));
    });
  });

  // ============================================
  // adjustBrightness() Tests
  // ============================================
  describe('adjustBrightness', () => {
    it('should lighten color with positive amount', () => {
      const result = (service as any).adjustBrightness('#000000', 50);
      expect(result).toBe('#323232');
    });

    it('should darken color with negative amount', () => {
      const result = (service as any).adjustBrightness('#ffffff', -50);
      expect(result).toBe('#cdcdcd');
    });

    it('should handle 3-character hex codes', () => {
      const result = (service as any).adjustBrightness('#fff', -10);
      expect(result).toBe('#f5f5f5');
    });

    it('should clamp values to valid RGB range', () => {
      // Adding too much should clamp at 255
      const lightResult = (service as any).adjustBrightness('#f0f0f0', 100);
      expect(lightResult).toBe('#ffffff');

      // Subtracting too much should clamp at 0
      const darkResult = (service as any).adjustBrightness('#101010', -50);
      expect(darkResult).toBe('#000000');
    });

    it('should handle colors without hash prefix', () => {
      const result = (service as any).adjustBrightness('22c55e', 10);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  // ============================================
  // getCategoryBreakdown() Tests
  // ============================================
  describe('getCategoryBreakdown', () => {
    it('should group expenses by category correctly', async () => {
      const category = createMockCategory({
        id: 'cat-groceries',
        name: 'Groceries',
        type: 'EXPENSE',
        budget: new Decimal(500),
      });

      const transactions = [
        createMockTransaction({
          id: 'tx-1',
          amount: new Decimal(-50),
          category,
          categoryId: 'cat-groceries',
          splits: [],
        }),
        createMockTransaction({
          id: 'tx-2',
          amount: new Decimal(-30),
          category,
          categoryId: 'cat-groceries',
          splits: [],
        }),
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactions);
      prismaMock.category.findMany.mockResolvedValue([category]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Groceries');
      expect(result[0].spent).toBe(80); // 50 + 30
    });

    it('should handle split transactions', async () => {
      const category1 = createMockCategory({
        id: 'cat-1',
        name: 'Category 1',
        type: 'EXPENSE',
      });
      const category2 = createMockCategory({
        id: 'cat-2',
        name: 'Category 2',
        type: 'EXPENSE',
      });

      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        categoryId: null,
        category: null,
        splits: [
          {
            ...createMockTransactionSplit({ amount: new Decimal(-60) }),
            category: category1,
          },
          {
            ...createMockTransactionSplit({ amount: new Decimal(-40) }),
            category: category2,
          },
        ],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);
      prismaMock.category.findMany.mockResolvedValue([category1, category2]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      expect(result).toHaveLength(2);
      const cat1Result = result.find((c) => c.name === 'Category 1');
      const cat2Result = result.find((c) => c.name === 'Category 2');
      expect(cat1Result?.spent).toBe(60);
      expect(cat2Result?.spent).toBe(40);
    });

    it('should add uncategorized bucket for null categories', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-25),
        categoryId: null,
        category: null,
        splits: [],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);
      prismaMock.category.findMany.mockResolvedValue([]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Uncategorized');
      expect(result[0].spent).toBe(25);
    });

    it('should filter by accountId when specified', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.category.findMany.mockResolvedValue([]);

      await service.getCategoryBreakdown(
        { month: 1, year: 2025, accountId: 'acc-1' },
        'profile-1',
      );

      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            profileId: 'profile-1',
            amount: { lt: 0 },
            date: { gte: new Date(2025, 0, 1), lt: new Date(2025, 1, 1) },
            accountId: 'acc-1',
          },
        }),
      );
    });

    it('should return empty array when no expenses', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.category.findMany.mockResolvedValue([]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      expect(result).toEqual([]);
    });

    it('should assign colors based on category family', async () => {
      const parentCategory = createMockCategory({
        id: 'parent-cat',
        name: 'Food',
        type: 'EXPENSE',
        parentId: null,
      });
      const childCategory = createMockCategory({
        id: 'child-cat',
        name: 'Restaurants',
        type: 'EXPENSE',
        parentId: 'parent-cat',
      });

      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-50),
        category: childCategory,
        categoryId: 'child-cat',
        splits: [],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);
      prismaMock.category.findMany.mockResolvedValue([
        parentCategory,
        childCategory,
      ]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      // Parent has a budget (fixture default) so it's included despite zero spend
      expect(result).toHaveLength(2);
      result.forEach((c) => expect(c.color).toMatch(/^#[0-9a-f]{6}$/i));
    });

    it('should include zero-spend categories with a budget and exclude those without', async () => {
      const budgetedCategory = createMockCategory({
        id: 'budgeted-cat',
        name: 'Groceries',
        type: 'EXPENSE',
        budget: new Decimal(300),
      });
      const unbudgetedCategory = createMockCategory({
        id: 'unbudgeted-cat',
        name: 'Misc',
        type: 'EXPENSE',
        budget: null,
      });

      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.category.findMany.mockResolvedValue([
        budgetedCategory,
        unbudgetedCategory,
      ]);

      const result = await service.getCategoryBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('budgeted-cat');
      expect(result[0].spent).toBe(0);
      expect(result[0].budget).toBe(300);
    });
  });

  // ============================================
  // getSankeyData() Tests
  // ============================================
  describe('getSankeyData', () => {
    it('should create correct nodes for income and expenses', async () => {
      const incomeCategory = createMockCategory({
        id: 'cat-income',
        name: 'Salary',
        type: 'INCOME',
      });
      const expenseCategory = createMockCategory({
        id: 'cat-expense',
        name: 'Groceries',
        type: 'EXPENSE',
      });

      const transactions = [
        createMockTransaction({
          id: 'tx-income',
          amount: new Decimal(3000),
          category: incomeCategory,
          categoryId: 'cat-income',
          splits: [],
        }),
        createMockTransaction({
          id: 'tx-expense',
          amount: new Decimal(-500),
          category: expenseCategory,
          categoryId: 'cat-expense',
          splits: [],
        }),
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getSankeyData({ month: 1, year: 2025 }, 'profile-1');

      expect(result.nodes).toContainEqual({ id: 'Income' });
      expect(result.nodes).toContainEqual({ id: 'Salary' });
      expect(result.nodes).toContainEqual({ id: 'Groceries' });
      expect(result.nodes).toContainEqual({ id: 'Savings' });
    });

    it('should link income sources to Income node', async () => {
      const incomeCategory = createMockCategory({
        id: 'cat-salary',
        name: 'Salary',
        type: 'INCOME',
      });

      const transaction = createMockTransaction({
        id: 'tx-income',
        amount: new Decimal(5000),
        category: incomeCategory,
        categoryId: 'cat-salary',
        splits: [],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);

      const result = await service.getSankeyData({ month: 1, year: 2025 }, 'profile-1');

      const incomeLink = result.links.find(
        (l) => l.source === 'Salary' && l.target === 'Income',
      );
      expect(incomeLink).toBeDefined();
      expect(incomeLink?.value).toBe(5000);
    });

    it('should calculate savings as income minus expenses', async () => {
      const incomeCategory = createMockCategory({
        id: 'cat-income',
        name: 'Salary',
        type: 'INCOME',
      });
      const expenseCategory = createMockCategory({
        id: 'cat-expense',
        name: 'Rent',
        type: 'EXPENSE',
      });

      const transactions = [
        createMockTransaction({
          id: 'tx-income',
          amount: new Decimal(5000),
          category: incomeCategory,
          splits: [],
        }),
        createMockTransaction({
          id: 'tx-expense',
          amount: new Decimal(-3000),
          category: expenseCategory,
          splits: [],
        }),
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getSankeyData({ month: 1, year: 2025 }, 'profile-1');

      const savingsLink = result.links.find(
        (l) => l.source === 'Income' && l.target === 'Savings',
      );
      expect(savingsLink).toBeDefined();
      expect(savingsLink?.value).toBe(2000); // 5000 - 3000
    });

    it('should not add savings link when expenses exceed income', async () => {
      const expenseCategory = createMockCategory({
        id: 'cat-expense',
        name: 'Rent',
        type: 'EXPENSE',
      });

      const transaction = createMockTransaction({
        id: 'tx-expense',
        amount: new Decimal(-5000),
        category: expenseCategory,
        splits: [],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);

      const result = await service.getSankeyData({ month: 1, year: 2025 }, 'profile-1');

      const savingsLink = result.links.find(
        (l) => l.source === 'Income' && l.target === 'Savings',
      );
      expect(savingsLink).toBeUndefined();
    });

    it('should handle split transactions correctly', async () => {
      const category = createMockCategory({
        id: 'cat-food',
        name: 'Food',
        type: 'EXPENSE',
      });

      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        category: null,
        splits: [
          {
            ...createMockTransactionSplit({ amount: new Decimal(-100) }),
            category,
          },
        ],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);

      const result = await service.getSankeyData({ month: 1, year: 2025 }, 'profile-1');

      const expenseLink = result.links.find(
        (l) => l.source === 'Income' && l.target === 'Food',
      );
      expect(expenseLink).toBeDefined();
      expect(expenseLink?.value).toBe(100);
    });
  });

  // ============================================
  // getCostObjectBreakdown() Tests
  // ============================================
  describe('getCostObjectBreakdown', () => {
    it('should return empty array when no accountId provided', async () => {
      const result = await service.getCostObjectBreakdown(
        { month: 1, year: 2025 },
        'profile-1',
      );
      expect(result).toEqual([]);
    });

    it('should group by cost object correctly', async () => {
      const costObject = createMockCostObject({
        id: 'cost-1',
        name: 'Project A',
        color: '#3b82f6',
      });

      const transactions = [
        createMockTransaction({
          id: 'tx-1',
          amount: new Decimal(-100),
          costObject,
          costObjectId: 'cost-1',
          splits: [],
        }),
        createMockTransaction({
          id: 'tx-2',
          amount: new Decimal(-50),
          costObject,
          costObjectId: 'cost-1',
          splits: [],
        }),
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getCostObjectBreakdown(
        { month: 1, year: 2025, accountId: 'acc-1' },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Project A');
      expect(result[0].total).toBe(150);
      expect(result[0].count).toBe(2);
    });

    it('should add unassigned bucket for transactions without cost object', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-75),
        costObject: null,
        costObjectId: null,
        splits: [],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);

      const result = await service.getCostObjectBreakdown(
        { month: 1, year: 2025, accountId: 'acc-1' },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Unassigned');
      expect(result[0].total).toBe(75);
    });

    it('should only count expenses (negative amounts)', async () => {
      const costObject = createMockCostObject({
        id: 'cost-1',
        name: 'Project A',
      });

      const transactions = [
        createMockTransaction({
          id: 'tx-expense',
          amount: new Decimal(-100),
          costObject,
          costObjectId: 'cost-1',
          splits: [],
        }),
        createMockTransaction({
          id: 'tx-income',
          amount: new Decimal(200), // Income should be ignored
          costObject,
          costObjectId: 'cost-1',
          splits: [],
        }),
      ];

      prismaMock.transaction.findMany.mockResolvedValue(transactions);

      const result = await service.getCostObjectBreakdown(
        { month: 1, year: 2025, accountId: 'acc-1' },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].total).toBe(100); // Only expense counted
    });

    it('should handle split transactions', async () => {
      const costObject = createMockCostObject({
        id: 'cost-1',
        name: 'Project A',
      });

      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        costObject: null,
        splits: [
          {
            ...createMockTransactionSplit({ amount: new Decimal(-100) }),
            costObject,
          },
        ],
      });

      prismaMock.transaction.findMany.mockResolvedValue([transaction]);

      const result = await service.getCostObjectBreakdown(
        { month: 1, year: 2025, accountId: 'acc-1' },
        'profile-1',
      );

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Project A');
      expect(result[0].total).toBe(100);
    });
  });
});
