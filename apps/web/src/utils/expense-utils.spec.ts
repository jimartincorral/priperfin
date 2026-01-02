import { describe, it, expect } from 'vitest';
import {
  filterTransactions,
  sortTransactions,
  calculateBudgetRemaining,
  paginate,
  getTotalPages,
  Transaction,
  Category,
} from './expense-utils';

describe('expense-utils', () => {
  // Test data fixtures
  const mockTransactions: Transaction[] = [
    { id: '1', date: '2025-01-15', description: 'Walmart Groceries', amount: -50, categoryId: 'cat-groceries', notes: 'weekly shopping' },
    { id: '2', date: '2025-01-14', description: 'Amazon Books', amount: -25, categoryId: 'cat-entertainment', notes: '' },
    { id: '3', date: '2025-01-10', description: 'Electric Bill', amount: -100, categoryId: 'cat-utilities', notes: 'January bill' },
    { id: '4', date: '2025-01-05', description: 'Salary Deposit', amount: 3000, categoryId: 'cat-income' },
    { id: '5', date: '2025-01-16', description: 'Coffee Shop', amount: -5, categoryId: null },
  ];

  const mockCategories: Category[] = [
    { id: 'cat-groceries', name: 'Groceries', parentId: 'cat-food', budget: 500 },
    { id: 'cat-food', name: 'Food', parentId: null, budget: 800 },
    { id: 'cat-entertainment', name: 'Entertainment', parentId: null, budget: 200 },
    { id: 'cat-utilities', name: 'Utilities', parentId: null, budget: 150 },
    { id: 'cat-income', name: 'Income', parentId: null },
  ];

  // ============================================
  // filterTransactions() Tests
  // ============================================
  describe('filterTransactions', () => {
    it('should filter by text in description', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterText: 'walmart',
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Walmart Groceries');
    });

    it('should filter by text in notes', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterText: 'weekly',
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });

    it('should filter by text case-insensitively', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterText: 'AMAZON',
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Amazon Books');
    });

    it('should filter by minimum amount', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterMinAmount: 50,
      });

      expect(result).toHaveLength(3); // -50, -100, 3000 (absolute values >= 50)
    });

    it('should filter by maximum amount', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterMaxAmount: 30,
      });

      expect(result).toHaveLength(2); // -25, -5 (absolute values <= 30)
    });

    it('should filter by date range', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterDateFrom: '2025-01-10',
        filterDateTo: '2025-01-15',
      });

      expect(result).toHaveLength(3);
    });

    it('should filter uncategorized transactions', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterCategoryId: 'uncategorized',
      });

      expect(result).toHaveLength(1);
      expect(result[0].categoryId).toBeNull();
    });

    it('should filter by parent category including children', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterCategoryId: 'cat-food',
      });

      expect(result).toHaveLength(1); // Only cat-groceries is child of cat-food
      expect(result[0].categoryId).toBe('cat-groceries');
    });

    it('should filter by specific category', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterCategoryId: 'cat-entertainment',
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Amazon Books');
    });

    it('should combine multiple filters', () => {
      const result = filterTransactions(mockTransactions, mockCategories, {
        filterText: 'bill',
        filterMinAmount: 50,
      });

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Electric Bill');
    });
  });

  // ============================================
  // sortTransactions() Tests
  // ============================================
  describe('sortTransactions', () => {
    it('should sort by date descending', () => {
      const result = sortTransactions(mockTransactions, 'date', 'desc');

      expect(result[0].date).toBe('2025-01-16');
      expect(result[result.length - 1].date).toBe('2025-01-05');
    });

    it('should sort by date ascending', () => {
      const result = sortTransactions(mockTransactions, 'date', 'asc');

      expect(result[0].date).toBe('2025-01-05');
      expect(result[result.length - 1].date).toBe('2025-01-16');
    });

    it('should sort by amount descending', () => {
      const result = sortTransactions(mockTransactions, 'amount', 'desc');

      expect(result[0].amount).toBe(3000);
      expect(result[result.length - 1].amount).toBe(-100);
    });

    it('should sort by description alphabetically', () => {
      const result = sortTransactions(mockTransactions, 'description', 'asc');

      expect(result[0].description).toBe('Amazon Books');
    });

    it('should apply secondary sort by date when values are equal', () => {
      const transactions: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Test', amount: -50, categoryId: 'cat-1' },
        { id: '2', date: '2025-01-16', description: 'Test', amount: -50, categoryId: 'cat-1' },
      ];

      const result = sortTransactions(transactions, 'amount', 'asc');

      // When amounts are equal, should sort by date descending
      expect(result[0].date).toBe('2025-01-16');
    });
  });

  // ============================================
  // calculateBudgetRemaining() Tests
  // ============================================
  describe('calculateBudgetRemaining', () => {
    it('should return remaining budget for category', () => {
      const result = calculateBudgetRemaining('cat-groceries', mockTransactions, mockCategories);

      // Budget: 500, Spent: 50 → Remaining: 450
      expect(result).toBe(450);
    });

    it('should return null for category without budget', () => {
      const result = calculateBudgetRemaining('cat-income', mockTransactions, mockCategories);

      expect(result).toBeNull();
    });

    it('should return null for non-existent category', () => {
      const result = calculateBudgetRemaining('nonexistent', mockTransactions, mockCategories);

      expect(result).toBeNull();
    });

    it('should include subcategory spending in parent budget calculation', () => {
      // cat-food has budget 800, cat-groceries is child with spent 50
      const result = calculateBudgetRemaining('cat-food', mockTransactions, mockCategories);

      // Should include spending from child category
      expect(result).toBe(750); // 800 - 50 from groceries
    });

    it('should only count expenses (negative amounts)', () => {
      const transactionsWithIncome: Transaction[] = [
        { id: '1', date: '2025-01-15', description: 'Groceries', amount: -50, categoryId: 'cat-groceries' },
        { id: '2', date: '2025-01-15', description: 'Refund', amount: 20, categoryId: 'cat-groceries' },
      ];

      const result = calculateBudgetRemaining('cat-groceries', transactionsWithIncome, mockCategories);

      // Should only count -50, not +20
      expect(result).toBe(450);
    });
  });

  // ============================================
  // paginate() Tests
  // ============================================
  describe('paginate', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    it('should return first page', () => {
      const result = paginate(items, 1, 3);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should return second page', () => {
      const result = paginate(items, 2, 3);

      expect(result).toEqual([4, 5, 6]);
    });

    it('should return partial last page', () => {
      const result = paginate(items, 4, 3);

      expect(result).toEqual([10]);
    });

    it('should return empty array for page beyond data', () => {
      const result = paginate(items, 10, 3);

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // getTotalPages() Tests
  // ============================================
  describe('getTotalPages', () => {
    it('should calculate correct number of pages', () => {
      expect(getTotalPages(10, 3)).toBe(4);
      expect(getTotalPages(9, 3)).toBe(3);
      expect(getTotalPages(10, 10)).toBe(1);
    });

    it('should return 1 for empty data', () => {
      expect(getTotalPages(0, 10)).toBe(1);
    });
  });
});
