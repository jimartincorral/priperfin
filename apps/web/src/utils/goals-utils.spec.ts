import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateUnassigned,
  getGoalStatus,
  getGoalProgress,
  getMonthlySavingsNeeded,
  sortGoals,
  calculateGoalTotals,
  formatCurrency,
  SavingsGoal,
  Category,
} from './goals-utils';

describe('goals-utils', () => {
  // Test data fixtures
  const mockGoals: SavingsGoal[] = [
    {
      id: 'goal-1',
      name: 'Vacation',
      targetAmount: 5000,
      savedAmount: 2500,
      targetDate: '2025-12-31',
      shouldHaveSaved: 2000,
      monthlySavingsNeeded: 250,
      categoryId: 'cat-1',
    },
    {
      id: 'goal-2',
      name: 'Emergency Fund',
      targetAmount: 10000,
      savedAmount: 3000,
      targetDate: '2026-06-30',
      shouldHaveSaved: 4000,
      monthlySavingsNeeded: 400,
      categoryId: 'cat-2',
    },
    {
      id: 'goal-3',
      name: 'New Car',
      targetAmount: 20000,
      savedAmount: 20000,
      targetDate: '2025-06-30',
      shouldHaveSaved: 18000,
      categoryId: null,
    },
  ];

  const mockCategories: Category[] = [
    { id: 'cat-1', name: 'Travel' },
    { id: 'cat-2', name: 'Safety' },
  ];

  // ============================================
  // calculateUnassigned() Tests
  // ============================================
  describe('calculateUnassigned', () => {
    it('should calculate positive unassigned amount', () => {
      const totalSavings = 30000;
      const result = calculateUnassigned(totalSavings, mockGoals);

      // 30000 - (2500 + 3000 + 20000) = 4500
      expect(result).toBe(4500);
    });

    it('should calculate negative unassigned (over-allocated)', () => {
      const totalSavings = 20000;
      const result = calculateUnassigned(totalSavings, mockGoals);

      // 20000 - 25500 = -5500
      expect(result).toBe(-5500);
    });

    it('should return total savings when no goals', () => {
      const result = calculateUnassigned(10000, []);

      expect(result).toBe(10000);
    });

    it('should handle goals with zero savedAmount', () => {
      const goals: SavingsGoal[] = [
        { id: '1', name: 'Test', targetAmount: 1000, savedAmount: 0, targetDate: '2025-12-31' },
      ];

      const result = calculateUnassigned(5000, goals);

      expect(result).toBe(5000);
    });
  });

  // ============================================
  // getGoalStatus() Tests
  // ============================================
  describe('getGoalStatus', () => {
    it('should return "completed" when saved >= target', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 1000,
        targetDate: '2025-12-31',
        shouldHaveSaved: 800,
      };

      expect(getGoalStatus(goal)).toBe('completed');
    });

    it('should return "completed" when saved exceeds target', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 1200,
        targetDate: '2025-12-31',
        shouldHaveSaved: 800,
      };

      expect(getGoalStatus(goal)).toBe('completed');
    });

    it('should return "ahead" when significantly ahead of schedule', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 600,
        targetDate: '2025-12-31',
        shouldHaveSaved: 400, // 200 ahead, which is > 5% of 1000 (50)
      };

      expect(getGoalStatus(goal)).toBe('ahead');
    });

    it('should return "behind" when significantly behind schedule', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 300,
        targetDate: '2025-12-31',
        shouldHaveSaved: 500, // 200 behind, which is > 5% of 1000 (50)
      };

      expect(getGoalStatus(goal)).toBe('behind');
    });

    it('should return "on-track" when within tolerance', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 490,
        targetDate: '2025-12-31',
        shouldHaveSaved: 500, // 10 behind, within 5% tolerance (50)
      };

      expect(getGoalStatus(goal)).toBe('on-track');
    });

    it('should return "on-track" when goal has not started', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 0,
        targetDate: '2025-12-31',
        shouldHaveSaved: 0,
      };

      expect(getGoalStatus(goal)).toBe('on-track');
    });
  });

  // ============================================
  // getGoalProgress() Tests
  // ============================================
  describe('getGoalProgress', () => {
    it('should calculate correct progress percentage', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 250,
        targetDate: '2025-12-31',
      };

      expect(getGoalProgress(goal)).toBe(25);
    });

    it('should cap progress at 100%', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 1500,
        targetDate: '2025-12-31',
      };

      expect(getGoalProgress(goal)).toBe(100);
    });

    it('should return 0 for zero target', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 0,
        savedAmount: 100,
        targetDate: '2025-12-31',
      };

      expect(getGoalProgress(goal)).toBe(0);
    });

    it('should return 0 for no savings', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 0,
        targetDate: '2025-12-31',
      };

      expect(getGoalProgress(goal)).toBe(0);
    });
  });

  // ============================================
  // getMonthlySavingsNeeded() Tests
  // ============================================
  describe('getMonthlySavingsNeeded', () => {
    beforeEach(() => {
      // Mock current date to 2025-01-15
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2025-01-15'));
    });

    it('should calculate monthly savings for future goal', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1200,
        savedAmount: 0,
        targetDate: '2025-07-15', // 6 months away
      };

      const result = getMonthlySavingsNeeded(goal);

      expect(result).toBe(200); // 1200 / 6 = 200
    });

    it('should return full remaining amount for past due goal', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 300,
        targetDate: '2024-12-15', // Past
      };

      const result = getMonthlySavingsNeeded(goal);

      expect(result).toBe(700); // Need full remaining amount
    });

    it('should return 0 when goal is already met', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1000,
        savedAmount: 1000,
        targetDate: '2025-12-31',
      };

      const result = getMonthlySavingsNeeded(goal);

      expect(result).toBe(0);
    });

    it('should account for current savings', () => {
      const goal: SavingsGoal = {
        id: '1',
        name: 'Test',
        targetAmount: 1200,
        savedAmount: 600,
        targetDate: '2025-07-15', // 6 months away
      };

      const result = getMonthlySavingsNeeded(goal);

      expect(result).toBe(100); // (1200 - 600) / 6 = 100
    });
  });

  // ============================================
  // sortGoals() Tests
  // ============================================
  describe('sortGoals', () => {
    it('should sort by target date ascending', () => {
      const result = sortGoals(mockGoals, mockCategories, 'targetDate', 'asc');

      expect(result[0].targetDate).toBe('2025-06-30');
      expect(result[result.length - 1].targetDate).toBe('2026-06-30');
    });

    it('should sort by target date descending', () => {
      const result = sortGoals(mockGoals, mockCategories, 'targetDate', 'desc');

      expect(result[0].targetDate).toBe('2026-06-30');
    });

    it('should sort by target amount', () => {
      const result = sortGoals(mockGoals, mockCategories, 'targetAmount', 'desc');

      expect(result[0].targetAmount).toBe(20000);
    });

    it('should sort by category name', () => {
      const result = sortGoals(mockGoals, mockCategories, 'categoryId', 'asc');

      // Empty category comes first, then Safety, then Travel
      expect(result[0].categoryId).toBeNull(); // No category
    });

    it('should sort by status (difference between saved and shouldHaveSaved)', () => {
      const result = sortGoals(mockGoals, mockCategories, 'status', 'desc');

      // goal-3 has highest diff (20000 - 18000 = 2000)
      expect(result[0].id).toBe('goal-3');
    });
  });

  // ============================================
  // calculateGoalTotals() Tests
  // ============================================
  describe('calculateGoalTotals', () => {
    it('should calculate correct totals', () => {
      const result = calculateGoalTotals(mockGoals);

      expect(result.totalTarget).toBe(35000); // 5000 + 10000 + 20000
      expect(result.totalSaved).toBe(25500); // 2500 + 3000 + 20000
      expect(result.totalMonthlySavingsNeeded).toBe(650); // 250 + 400 + 0
    });

    it('should return zeros for empty goals array', () => {
      const result = calculateGoalTotals([]);

      expect(result.totalTarget).toBe(0);
      expect(result.totalSaved).toBe(0);
      expect(result.totalMonthlySavingsNeeded).toBe(0);
    });
  });

  // ============================================
  // formatCurrency() Tests
  // ============================================
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      const result = formatCurrency(1234.56, 'USD');

      expect(result).toBe('$1,234.56');
    });

    it('should format EUR correctly', () => {
      const result = formatCurrency(1234.56, 'EUR');

      expect(result).toContain('1,234.56');
      expect(result).toContain('€');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-100, 'USD');

      expect(result).toBe('-$100.00');
    });

    it('should use USD as default currency', () => {
      const result = formatCurrency(100);

      expect(result).toBe('$100.00');
    });
  });
});
