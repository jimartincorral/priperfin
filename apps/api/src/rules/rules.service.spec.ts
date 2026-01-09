import { Test, TestingModule } from '@nestjs/testing';
import { RulesService } from './rules.service';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { PatternDetectionService } from './pattern-detection.service';
import { Transaction, CategorizationRule, RuleMode, Category } from '../generated/client';

describe('RulesService', () => {
  let service: RulesService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    transaction: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    categorizationRule: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    ruleSuggestion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockRuleEvaluator = {
    matches: jest.fn(),
    matchesConditions: jest.fn(),
  };

  const mockPatternDetection = {
    detectPatterns: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RulesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RuleEvaluatorService, useValue: mockRuleEvaluator },
        { provide: PatternDetectionService, useValue: mockPatternDetection },
      ],
    }).compile();

    service = module.get<RulesService>(RulesService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('applyToExisting', () => {
    it('should apply rule to uncategorized transactions', async () => {
      const ruleId = 'rule-1';
      const mockRule: CategorizationRule = {
        id: ruleId,
        name: 'Test Rule',
        description: null,
        enabled: true,
        priority: 0,
        categoryId: 'cat-1',
        mode: RuleMode.AUTO_APPLY,
        conditionsJson: JSON.stringify({
          operator: 'AND',
          conditions: [{ field: 'description', operator: 'contains', value: 'test' }]
        }),
        matchCount: 0,
        lastMatched: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockTransactions: Partial<Transaction>[] = [
        {
          id: 'tx-1',
          description: 'test transaction',
          categoryId: null,
          amount: 100 as any,
        },
        {
          id: 'tx-2',
          description: 'another test',
          categoryId: null,
          amount: 50 as any,
        },
      ];

      mockPrismaService.categorizationRule.findUnique.mockResolvedValue(mockRule);
      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockPrismaService.transaction.update.mockResolvedValue({});
      mockPrismaService.categorizationRule.update.mockResolvedValue({});
      mockRuleEvaluator.matches.mockReturnValue(true);

      const result = await service.applyToExisting(ruleId);

      expect(result.matchCount).toBe(2);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'tx-1' },
        data: expect.objectContaining({
          suggestedByRuleId: ruleId,
          categoryId: 'cat-1',
        }),
      });
    });
  });

  describe('suggestRuleForTransaction', () => {
    it('should return null if transaction not found', async () => {
      mockPrismaService.transaction.findUnique.mockResolvedValue(null);

      const result = await service.suggestRuleForTransaction('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return null if transaction has no category', async () => {
      const mockTransaction: Partial<Transaction> = {
        id: 'tx-1',
        description: 'Test',
        categoryId: null,
        amount: 100 as any,
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).toBeNull();
    });

    it('should return null if not enough similar transactions', async () => {
      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        name: 'Shopping',
        icon: '🛒',
      };

      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Amazon purchase',
        categoryId: 'cat-1',
        amount: 50 as any,
        merchant: 'amazon',
        notes: 'Books',
        category: mockCategory as Category,
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        { id: 'tx-2', description: 'Amazon', categoryId: 'cat-1', amount: 50 as any },
      ]); // Only 1 similar transaction (< 3)

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).toBeNull();
    });

    it('should return null if confidence is below 90%', async () => {
      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        name: 'Shopping',
        icon: '🛒',
      };

      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Random store',
        categoryId: 'cat-1',
        amount: 123.45 as any,
        merchant: null,
        notes: null,
        category: mockCategory as Category,
      };

      // 5 similar transactions but with very different descriptions
      const similarTransactions = Array.from({ length: 5 }, (_, i) => ({
        id: `tx-similar-${i}`,
        description: `Completely different ${i}`,
        categoryId: 'cat-1',
        amount: (Math.random() * 100) as any,
        merchant: null,
        notes: null,
      }));

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findMany.mockResolvedValue(similarTransactions);

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).toBeNull();
    });

    it('should suggest rule when high confidence match found', async () => {
      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        name: 'Coffee',
        icon: '☕',
      };

      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Starbucks Store #1234',
        categoryId: 'cat-1',
        amount: 5.50 as any,
        merchant: 'starbucks',
        notes: 'Morning coffee',
        category: mockCategory as Category,
      };

      // 10 similar Starbucks transactions with same pattern
      const similarTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-similar-${i}`,
        description: `Starbucks Store #${i}`,
        categoryId: 'cat-1',
        amount: 5.50 as any, // Same amount
        merchant: 'starbucks', // Same merchant
        notes: i < 7 ? 'Morning coffee' : 'Afternoon coffee',
      }));

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findMany.mockResolvedValue(similarTransactions);

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThanOrEqual(90);
      expect(result?.categoryId).toBe('cat-1');
      expect(result?.category).toEqual(mockCategory);
      
      // Should have conditions
      const conditions = JSON.parse(result!.conditionsJson);
      expect(conditions.operator).toBe('AND');
      expect(conditions.conditions.length).toBeGreaterThan(0);
      
      // Should include description or merchant condition
      const hasDescOrMerchant = conditions.conditions.some(
        (c: any) => c.field === 'description' || c.field === 'merchant'
      );
      expect(hasDescOrMerchant).toBe(true);
    });

    it('should include amount condition when amount is highly consistent', async () => {
      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        name: 'Subscription',
        icon: '📱',
      };

      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Netflix subscription monthly payment',
        categoryId: 'cat-1',
        amount: 15.99 as any,
        merchant: 'netflix',
        notes: 'Entertainment subscription',
        category: mockCategory as Category,
      };

      // All similar transactions have exact same amount (100% consistency) and similar description/notes
      const similarTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-similar-${i}`,
        description: 'Netflix subscription monthly payment',
        categoryId: 'cat-1',
        amount: 15.99 as any, // Exact same amount
        merchant: 'netflix',
        notes: 'Entertainment subscription',
      }));

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findMany.mockResolvedValue(similarTransactions);

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).not.toBeNull();
      
      const conditions = JSON.parse(result!.conditionsJson);
      const hasAmountCondition = conditions.conditions.some(
        (c: any) => c.field === 'amount' && c.operator === 'equals' && c.value === 15.99
      );
      expect(hasAmountCondition).toBe(true);
    });

    it('should include merchant condition when merchant is highly consistent', async () => {
      const mockCategory: Partial<Category> = {
        id: 'cat-1',
        name: 'Groceries',
        icon: '🛒',
      };

      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Whole Foods Market groceries shopping',
        categoryId: 'cat-1',
        amount: 45.67 as any,
        merchant: 'wholefoods',
        notes: 'Weekly shopping trip',
        category: mockCategory as Category,
      };

      // All transactions from same merchant with same description and notes
      const similarTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-similar-${i}`,
        description: 'Whole Foods Market groceries shopping',
        categoryId: 'cat-1',
        amount: 45.67 as any, // Same amount for high confidence
        merchant: 'wholefoods', // Same merchant
        notes: 'Weekly shopping trip',
      }));

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.findMany.mockResolvedValue(similarTransactions);

      const result = await service.suggestRuleForTransaction('tx-1');

      expect(result).not.toBeNull();
      expect(result?.confidence).toBeGreaterThanOrEqual(90);
      
      const conditions = JSON.parse(result!.conditionsJson);
      const hasMerchantCondition = conditions.conditions.some(
        (c: any) => c.field === 'merchant' && c.operator === 'equals' && c.value === 'wholefoods'
      );
      expect(hasMerchantCondition).toBe(true);
    });

    it('should handle transaction with null category gracefully', async () => {
      const mockTransaction: any = {
        id: 'tx-1',
        description: 'Test transaction',
        categoryId: 'cat-1',
        amount: 50 as any,
        merchant: null,
        notes: null,
        category: null, // Category is null even though categoryId exists
      };

      mockPrismaService.transaction.findUnique.mockResolvedValue(mockTransaction);

      const result = await service.suggestRuleForTransaction('tx-1');

      // Should return null because category is null
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new rule', async () => {
      const createDto = {
        name: 'Test Rule',
        conditionsJson: JSON.stringify({ operator: 'AND', conditions: [] }),
        categoryId: 'cat-1',
        mode: RuleMode.SUGGEST,
      };

      mockPrismaService.categorizationRule.create.mockResolvedValue({
        id: 'rule-1',
        ...createDto,
      });

      const result = await service.create(createDto as any);

      expect(result.id).toBe('rule-1');
      expect(mockPrismaService.categorizationRule.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('testRule', () => {
    it('should return matching transactions', async () => {
      const conditionsJson = JSON.stringify({
        operator: 'AND',
        conditions: [{ field: 'description', operator: 'contains', value: 'test' }]
      });

      const mockTransactions = [
        { id: 'tx-1', description: 'test transaction' },
        { id: 'tx-2', description: 'another test' },
        { id: 'tx-3', description: 'no match' },
      ];

      mockPrismaService.transaction.findMany.mockResolvedValue(mockTransactions);
      mockRuleEvaluator.matchesConditions
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(false);

      const result = await service.testRule(conditionsJson, 10);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe('tx-1');
      expect(result[1].id).toBe('tx-2');
    });
  });
});
