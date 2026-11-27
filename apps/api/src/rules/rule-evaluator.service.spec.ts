import { Test, TestingModule } from '@nestjs/testing';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { Transaction, CategorizationRule, RuleMode } from '../generated/client';
import { PrismaService } from '../prisma/prisma.service';

describe('RuleEvaluatorService', () => {
  let service: RuleEvaluatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RuleEvaluatorService, PrismaService],
    }).compile();

    service = module.get<RuleEvaluatorService>(RuleEvaluatorService);
  });

  const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction =>
    ({
      id: 'tx-1',
      date: new Date('2023-01-01'),
      amount: 100 as any, // Decimal
      description: 'Amazon Marketplace',
      merchant: 'amazon',
      categoryId: null,
      accountId: null,
      costObjectId: null,
      notes: 'Book purchase',
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      suggestedByRuleId: null,
      suggestedCategoryId: null,
      ...overrides,
    }) as unknown as Transaction;

  const createRule = (conditionsJson: string): CategorizationRule => ({
    id: 'rule-1',
    name: 'Test Rule',
    description: null,
    enabled: true,
    priority: 0,
    categoryId: 'cat-1',
    profileId: 'profile-1',
    mode: RuleMode.SUGGEST,
    conditionsJson,
    matchCount: 0,
    lastMatched: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it('should match simple description contains', () => {
    const tx = mockTransaction({ description: 'Amazon Prime' });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [
          { field: 'description', operator: 'contains', value: 'Prime' },
        ],
      }),
    );

    expect(service.matches(tx, rule)).toBe(true);
  });

  it('should fail if description does not contain', () => {
    const tx = mockTransaction({ description: 'Netflix' });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [
          { field: 'description', operator: 'contains', value: 'Prime' },
        ],
      }),
    );

    expect(service.matches(tx, rule)).toBe(false);
  });

  it('should match numeric comparison', () => {
    const tx = mockTransaction({ amount: 150 as any });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [{ field: 'amount', operator: 'greaterThan', value: 100 }],
      }),
    );

    expect(service.matches(tx, rule)).toBe(true);
  });

  it('should match combined conditions (AND)', () => {
    const tx = mockTransaction({ description: 'Uber', amount: 50 as any });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [
          { field: 'description', operator: 'equals', value: 'Uber' },
          { field: 'amount', operator: 'lessThan', value: 100 },
        ],
      }),
    );

    expect(service.matches(tx, rule)).toBe(true);
  });

  it('should fail combined conditions (AND) if one fails', () => {
    const tx = mockTransaction({ description: 'Uber', amount: 150 as any });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [
          { field: 'description', operator: 'equals', value: 'Uber' },
          { field: 'amount', operator: 'lessThan', value: 100 },
        ],
      }),
    );

    expect(service.matches(tx, rule)).toBe(false);
  });

  it('should match combined conditions (OR)', () => {
    const tx = mockTransaction({ description: 'Lyft' });
    const rule = createRule(
      JSON.stringify({
        operator: 'AND',
        conditions: [
          {
            operator: 'OR',
            conditions: [
              { field: 'description', operator: 'equals', value: 'Uber' },
              { field: 'description', operator: 'equals', value: 'Lyft' },
            ],
          },
        ],
      }),
    );

    expect(service.matches(tx, rule)).toBe(true);
  });

  describe('merchant category code', () => {
    const rule = (condition: object) =>
      createRule(JSON.stringify({ operator: 'AND', conditions: [condition] }));

    it('matches a code, ignoring missing leading zeros', () => {
      const vet = mockTransaction({ merchantCategoryCode: '0742' } as any);
      expect(
        service.matches(
          vet,
          rule({ field: 'mcc', operator: 'equals', value: '742' }),
        ),
      ).toBe(true);
      expect(
        service.matches(
          mockTransaction({ merchantCategoryCode: '5411' } as any),
          rule({ field: 'mcc', operator: 'equals', value: '5411' }),
        ),
      ).toBe(true);
    });

    it('matches a range of codes', () => {
      const r = rule({
        field: 'mcc',
        operator: 'between',
        value: { min: 5811, max: 5814 },
      });
      expect(
        service.matches(
          mockTransaction({ merchantCategoryCode: '5812' } as any),
          r,
        ),
      ).toBe(true);
      expect(
        service.matches(
          mockTransaction({ merchantCategoryCode: '5411' } as any),
          r,
        ),
      ).toBe(false);
    });

    it('never matches a transaction without a code', () => {
      expect(
        service.matches(
          mockTransaction(),
          rule({ field: 'mcc', operator: 'equals', value: '5411' }),
        ),
      ).toBe(false);
    });
  });
});
