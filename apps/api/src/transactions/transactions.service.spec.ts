import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from './categorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import {
  createMockTransaction,
  createMockAccount,
  createMockCategory,
} from '../test/fixtures';
import { Decimal } from '../generated/client';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let prismaMock: PrismaMock;
  let categorizationMock: { predict: jest.Mock; trainModel: jest.Mock };

  beforeEach(async () => {
    prismaMock = createPrismaMock();
    categorizationMock = {
      predict: jest.fn(),
      trainModel: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: CategorizationService, useValue: categorizationMock },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // getAccountBalance() Tests
  // ============================================
  describe('getAccountBalance', () => {
    it('should return correct balance for DEBIT account', async () => {
      const account = createMockAccount({
        id: 'acc-1',
        type: 'DEBIT',
        initialBalance: new Decimal(1000),
      });

      prismaMock.account.findUnique.mockResolvedValue(account);
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(-200) },
      });

      const result = await service.getAccountBalance('acc-1');

      // DEBIT: balance = initialBalance + txSum = 1000 + (-200) = 800
      expect(result.balance).toBe(800);
      expect(result.type).toBe('DEBIT');
      expect(result.accountName).toBe('Checking Account');
    });

    it('should return correct balance for CREDIT account', async () => {
      const account = createMockAccount({
        id: 'acc-2',
        name: 'Credit Card',
        type: 'CREDIT',
        initialBalance: new Decimal(0),
      });

      prismaMock.account.findUnique.mockResolvedValue(account);
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(-500) },
      });

      const result = await service.getAccountBalance('acc-2');

      // CREDIT: owed = initialBalance - txSum = 0 - (-500) = 500 (owed)
      expect(result.balance).toBe(500);
      expect(result.type).toBe('CREDIT');
      expect(result.accountName).toBe('Credit Card');
    });

    it('should return zero balance for non-existent account', async () => {
      prismaMock.account.findUnique.mockResolvedValue(null);

      const result = await service.getAccountBalance('non-existent');

      expect(result.balance).toBe(0);
      expect(result.type).toBe('DEBIT');
    });

    it('should handle empty transaction set correctly', async () => {
      const account = createMockAccount({
        id: 'acc-1',
        initialBalance: new Decimal(500),
      });

      prismaMock.account.findUnique.mockResolvedValue(account);
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
      });

      const result = await service.getAccountBalance('acc-1');

      // No transactions: balance = initialBalance = 500
      expect(result.balance).toBe(500);
    });

    it('should handle positive and negative transactions for DEBIT account', async () => {
      const account = createMockAccount({
        id: 'acc-1',
        type: 'DEBIT',
        initialBalance: new Decimal(1000),
      });

      prismaMock.account.findUnique.mockResolvedValue(account);
      // Net: +500 income, -300 expense = +200
      prismaMock.transaction.aggregate.mockResolvedValue({
        _sum: { amount: new Decimal(200) },
      });

      const result = await service.getAccountBalance('acc-1');

      expect(result.balance).toBe(1200); // 1000 + 200
    });
  });

  // ============================================
  // suggestCategory() Tests
  // ============================================
  describe('suggestCategory', () => {
    it('should return null for empty description', async () => {
      const result = await service.suggestCategory('');
      expect(result.categoryId).toBeNull();
    });

    it('should return category from merchant match', async () => {
      // First call: merchant match succeeds
      prismaMock.transaction.findFirst.mockResolvedValueOnce({
        categoryId: 'cat-groceries',
      });

      const result = await service.suggestCategory('WALMART STORE #123');

      expect(result.categoryId).toBe('cat-groceries');
      expect(result.source).toBe('merchant');
      expect(categorizationMock.predict).not.toHaveBeenCalled();
    });

    it('should return category from fuzzy match when no exact merchant match', async () => {
      // First call: merchant match fails
      prismaMock.transaction.findFirst.mockResolvedValueOnce(null);
      // Second call: fuzzy match succeeds
      prismaMock.transaction.findFirst.mockResolvedValueOnce({
        categoryId: 'cat-groceries',
        merchant: 'walmart store',
      });

      const result = await service.suggestCategory('WALMART STORE #456');

      expect(result.categoryId).toBe('cat-groceries');
      expect(result.source).toBe('fuzzy');
    });

    it('should return category from ML prediction when no matches', async () => {
      // All findFirst calls return null
      prismaMock.transaction.findFirst.mockResolvedValue(null);
      categorizationMock.predict.mockReturnValue('cat-restaurants');

      const result = await service.suggestCategory('New Restaurant ABC');

      expect(result.categoryId).toBe('cat-restaurants');
      expect(result.source).toBe('prediction');
    });

    it('should return null when no matches found', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue(null);
      categorizationMock.predict.mockReturnValue(null);

      const result = await service.suggestCategory('Unknown Transaction XYZ');

      expect(result.categoryId).toBeNull();
      expect(result.source).toBeNull();
    });

    it('should prefer merchant match over ML prediction', async () => {
      prismaMock.transaction.findFirst.mockResolvedValueOnce({
        categoryId: 'cat-merchant',
      });
      categorizationMock.predict.mockReturnValue('cat-ml');

      const result = await service.suggestCategory('AMAZON.COM*ABC123');

      expect(result.categoryId).toBe('cat-merchant');
      expect(result.source).toBe('merchant');
    });
  });

  // ============================================
  // generateHash() Tests
  // ============================================
  describe('generateHash', () => {
    it('should generate consistent hash for same input', () => {
      const dto = {
        date: '2025-01-15',
        amount: -50.0,
        description: 'Test Transaction',
      };

      const hash1 = service.generateHash(dto as any);
      const hash2 = service.generateHash(dto as any);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32); // MD5 hex length
    });

    it('should generate different hash for different amounts', () => {
      const dto1 = { date: '2025-01-15', amount: -50.0, description: 'Test' };
      const dto2 = { date: '2025-01-15', amount: -51.0, description: 'Test' };

      const hash1 = service.generateHash(dto1 as any);
      const hash2 = service.generateHash(dto2 as any);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hash for different dates', () => {
      const dto1 = { date: '2025-01-15', amount: -50.0, description: 'Test' };
      const dto2 = { date: '2025-01-16', amount: -50.0, description: 'Test' };

      expect(service.generateHash(dto1 as any)).not.toBe(
        service.generateHash(dto2 as any),
      );
    });
  });

  // ============================================
  // createSplits() Tests
  // ============================================
  describe('createSplits', () => {
    it('should create splits that sum to parent amount', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        splits: [],
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          transactionSplit: { createMany: jest.fn() },
          transaction: {
            findUnique: jest.fn().mockResolvedValue({
              ...transaction,
              splits: [
                { id: 's1', amount: new Decimal(-60) },
                { id: 's2', amount: new Decimal(-40) },
              ],
            }),
          },
        };
        return callback(txMock);
      });

      const dto = {
        splits: [
          { amount: -60, categoryId: 'cat-1' },
          { amount: -40, categoryId: 'cat-2' },
        ],
      };

      const result = await service.createSplits('tx-1', dto);
      expect(result.splits).toHaveLength(2);
    });

    it('should reject splits that do not sum correctly', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        splits: [],
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);

      const dto = {
        splits: [
          { amount: -60, categoryId: 'cat-1' },
          { amount: -30, categoryId: 'cat-2' }, // Sum: -90, parent: -100
        ],
      };

      await expect(service.createSplits('tx-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should allow splits within 0.01 tolerance', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        splits: [],
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          transactionSplit: { createMany: jest.fn() },
          transaction: { findUnique: jest.fn().mockResolvedValue(transaction) },
        };
        return callback(txMock);
      });

      const dto = {
        splits: [
          { amount: -60.005, categoryId: 'cat-1' },
          { amount: -39.999, categoryId: 'cat-2' }, // Sum: -100.004, diff: 0.004
        ],
      };

      // Should not throw - within tolerance
      await expect(service.createSplits('tx-1', dto)).resolves.toBeDefined();
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(null);

      const dto = { splits: [{ amount: -50, categoryId: 'cat-1' }] };

      await expect(service.createSplits('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject if transaction already has splits', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
        splits: [{ id: 'existing-split', amount: new Decimal(-100) }],
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);

      const dto = { splits: [{ amount: -100, categoryId: 'cat-1' }] };

      await expect(service.createSplits('tx-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ============================================
  // updateSplits() Tests
  // ============================================
  describe('updateSplits', () => {
    it('should update splits successfully', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);
      prismaMock.$transaction.mockImplementation(async (callback) => {
        const txMock = {
          transactionSplit: {
            deleteMany: jest.fn(),
            createMany: jest.fn(),
          },
          transaction: {
            findUnique: jest.fn().mockResolvedValue({
              ...transaction,
              splits: [{ id: 's1', amount: new Decimal(-100) }],
            }),
          },
        };
        return callback(txMock);
      });

      const dto = { splits: [{ amount: -100, categoryId: 'cat-new' }] };

      const result = await service.updateSplits('tx-1', dto);
      expect(result.splits).toHaveLength(1);
    });

    it('should reject updates with incorrect sum', async () => {
      const transaction = createMockTransaction({
        id: 'tx-1',
        amount: new Decimal(-100),
      });

      prismaMock.transaction.findUnique.mockResolvedValue(transaction);

      const dto = { splits: [{ amount: -50, categoryId: 'cat-1' }] };

      await expect(service.updateSplits('tx-1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(null);

      const dto = { splits: [{ amount: -100, categoryId: 'cat-1' }] };

      await expect(service.updateSplits('non-existent', dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // createMany() Tests
  // ============================================
  describe('createMany', () => {
    it('should create transactions with suggested categories', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue({
        categoryId: 'cat-suggested',
      });
      prismaMock.transaction.findMany.mockResolvedValue([]); // No existing
      prismaMock.transaction.createMany.mockResolvedValue({ count: 1 });

      const dtos = [
        {
          date: '2025-01-15',
          amount: -50,
          description: 'Test',
        },
      ];

      const result = await service.createMany(dtos as any, true);

      expect(result.newCount).toBe(1);
    });

    it('should identify duplicates by externalId', async () => {
      const existingTx = { externalId: 'hash123' };
      prismaMock.transaction.findMany.mockResolvedValue([existingTx]);
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const dtos = [
        {
          date: '2025-01-15',
          amount: -50,
          description: 'Test',
          externalId: 'hash123',
        },
      ];

      const result = await service.createMany(dtos as any, false);

      expect(result.duplicateCount).toBe(1);
      expect(result.duplicates).toHaveLength(1);
    });

    it('should return duplicates for user review when force=false', async () => {
      const existingTx = { externalId: 'hash123' };
      prismaMock.transaction.findMany.mockResolvedValue([existingTx]);
      prismaMock.transaction.findFirst.mockResolvedValue(null);

      const dtos = [
        {
          date: '2025-01-15',
          amount: -50,
          description: 'Duplicate Test',
          externalId: 'hash123',
        },
      ];

      const result = await service.createMany(dtos as any, false);

      expect(result.duplicateCount).toBe(1);
      expect(result.newCount).toBe(0);
    });

    it('should import all transactions when force=true', async () => {
      const existingTx = { externalId: 'hash123' };
      prismaMock.transaction.findMany
        .mockResolvedValueOnce([existingTx]) // First call: existing transactions
        .mockResolvedValueOnce([]); // Second call: manual matches query
      prismaMock.transaction.findFirst.mockResolvedValue(null);
      prismaMock.transaction.createMany.mockResolvedValue({ count: 1 });

      const dtos = [
        {
          date: '2025-01-15',
          amount: -50,
          description: 'Force Import',
          externalId: 'hash123',
        },
      ];

      const result = await service.createMany(dtos as any, true);

      expect(result.newCount).toBe(1);
      expect(result.duplicateCount).toBe(0);
    });

    it('should handle empty input array', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);
      prismaMock.transaction.createMany.mockResolvedValue({ count: 0 });

      const result = await service.createMany([], false);

      expect(result.newCount).toBe(0);
      expect(result.duplicateCount).toBe(0);
    });

    it('should handle null/undefined input', async () => {
      const result = await service.createMany(null as any, false);

      expect(result.newCount).toBe(0);
    });
  });

  // ============================================
  // Levenshtein Distance Tests
  // ============================================
  describe('levenshteinDistance (via calculateDescriptionSimilarity)', () => {
    it('should return 0 distance for identical strings', () => {
      // Access private method via any cast
      const distance = (service as any).levenshteinDistance('hello', 'hello');
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for single character difference', () => {
      const distance = (service as any).levenshteinDistance('hello', 'hallo');
      expect(distance).toBe(1);
    });

    it('should calculate correct distance for completely different strings', () => {
      const distance = (service as any).levenshteinDistance('abc', 'xyz');
      expect(distance).toBe(3);
    });

    it('should handle empty strings', () => {
      expect((service as any).levenshteinDistance('', '')).toBe(0);
      expect((service as any).levenshteinDistance('abc', '')).toBe(3);
      expect((service as any).levenshteinDistance('', 'xyz')).toBe(3);
    });
  });

  // ============================================
  // calculateDescriptionSimilarity Tests
  // ============================================
  describe('calculateDescriptionSimilarity', () => {
    it('should return 100 for substring match', () => {
      const similarity = (service as any).calculateDescriptionSimilarity(
        'Walmart Purchase',
        'Walmart',
      );
      expect(similarity).toBe(100);
    });

    it('should return 100 for reverse substring match', () => {
      const similarity = (service as any).calculateDescriptionSimilarity(
        'Purchase',
        'Walmart Purchase',
      );
      expect(similarity).toBe(100);
    });

    it('should return high similarity for similar strings', () => {
      const similarity = (service as any).calculateDescriptionSimilarity(
        'Amazon Prime',
        'Amazon Prine', // Typo
      );
      expect(similarity).toBeGreaterThan(80);
    });

    it('should return low similarity for different strings', () => {
      const similarity = (service as any).calculateDescriptionSimilarity(
        'Walmart',
        'Costco',
      );
      expect(similarity).toBeLessThan(50);
    });
  });

  // ============================================
  // CRUD Operations Tests
  // ============================================
  describe('create', () => {
    it('should create transaction and suggest category', async () => {
      prismaMock.transaction.findFirst.mockResolvedValue({
        categoryId: 'cat-1',
      });
      prismaMock.transaction.create.mockResolvedValue(
        createMockTransaction({ id: 'new-tx' }),
      );

      const dto = {
        date: '2025-01-15',
        amount: -50,
        description: 'Test Create',
      };

      const result = await service.create(dto as any);

      expect(result.id).toBe('new-tx');
      expect(prismaMock.transaction.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should filter by month and year', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);

      await service.findAll({ month: 1, year: 2025 });

      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lt: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('should filter by accountId', async () => {
      prismaMock.transaction.findMany.mockResolvedValue([]);

      await service.findAll({ accountId: 'acc-1' });

      expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accountId: 'acc-1',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return transaction by id', async () => {
      const tx = createMockTransaction({ id: 'tx-1' });
      prismaMock.transaction.findUnique.mockResolvedValue(tx);

      const result = await service.findOne('tx-1');

      expect(result.id).toBe('tx-1');
    });

    it('should throw NotFoundException for non-existent transaction', async () => {
      prismaMock.transaction.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete transaction', async () => {
      prismaMock.transaction.delete.mockResolvedValue({ id: 'tx-1' });

      await service.remove('tx-1');

      expect(prismaMock.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
      });
    });
  });

  describe('propagateCategory', () => {
    it('should update uncategorized transactions with matching description', async () => {
      prismaMock.transaction.updateMany.mockResolvedValue({ count: 5 });

      const result = await service.propagateCategory('Walmart', 'cat-groceries');

      expect(result.count).toBe(5);
      expect(prismaMock.transaction.updateMany).toHaveBeenCalledWith({
        where: {
          description: { equals: 'Walmart' },
          categoryId: null,
        },
        data: { categoryId: 'cat-groceries' },
      });
    });
  });
});
