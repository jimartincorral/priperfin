/**
 * Goals utility functions extracted for testing
 */

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  startDate?: string;
  shouldHaveSaved?: number;
  monthlySavingsNeeded?: number;
  categoryId?: string | null;
}

export interface Category {
  id: string;
  name: string;
}

export type GoalStatus = 'on-track' | 'behind' | 'ahead' | 'completed';

/**
 * Calculate unassigned savings (total savings - sum of saved amounts)
 */
export function calculateUnassigned(totalSavings: number, goals: SavingsGoal[]): number {
  const allocated = goals.reduce((sum, g) => sum + Number(g.savedAmount || 0), 0);
  return totalSavings - allocated;
}

/**
 * Get the status of a savings goal
 */
export function getGoalStatus(goal: SavingsGoal): GoalStatus {
  const saved = Number(goal.savedAmount || 0);
  const target = Number(goal.targetAmount || 0);
  const shouldHave = Number(goal.shouldHaveSaved || 0);

  if (saved >= target) {
    return 'completed';
  }

  if (shouldHave <= 0) {
    return 'on-track'; // Goal hasn't started yet
  }

  const diff = saved - shouldHave;
  const tolerance = target * 0.05; // 5% tolerance

  if (diff >= tolerance) {
    return 'ahead';
  } else if (diff <= -tolerance) {
    return 'behind';
  }

  return 'on-track';
}

/**
 * Calculate progress percentage for a goal
 */
export function getGoalProgress(goal: SavingsGoal): number {
  const saved = Number(goal.savedAmount || 0);
  const target = Number(goal.targetAmount || 0);

  if (target <= 0) return 0;
  return Math.min(100, (saved / target) * 100);
}

/**
 * Get monthly savings needed to reach goal
 */
export function getMonthlySavingsNeeded(goal: SavingsGoal): number {
  const saved = Number(goal.savedAmount || 0);
  const target = Number(goal.targetAmount || 0);
  const remaining = target - saved;

  if (remaining <= 0) return 0;

  const targetDate = new Date(goal.targetDate);
  const now = new Date();

  // Calculate months remaining
  const monthsRemaining =
    (targetDate.getFullYear() - now.getFullYear()) * 12 +
    (targetDate.getMonth() - now.getMonth());

  if (monthsRemaining <= 0) {
    return remaining; // Past due, need full amount now
  }

  return remaining / monthsRemaining;
}

/**
 * Sort goals by various fields
 */
export function sortGoals(
  goals: SavingsGoal[],
  categories: Category[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): SavingsGoal[] {
  return [...goals].sort((a, b) => {
    let valA: any = (a as any)[sortField];
    let valB: any = (b as any)[sortField];

    // Special handling for category sorting
    if (sortField === 'categoryId') {
      const catA = categories.find((c) => c.id === a.categoryId);
      const catB = categories.find((c) => c.id === b.categoryId);
      valA = catA ? catA.name : '';
      valB = catB ? catB.name : '';
    }

    // Special handling for status sorting
    if (sortField === 'status') {
      const getDiff = (g: SavingsGoal) =>
        Number(g.savedAmount || 0) - Number(g.shouldHaveSaved || 0);
      valA = getDiff(a);
      valB = getDiff(b);
    }

    // Handle dates
    if (sortField === 'targetDate' || sortField === 'startDate') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    }

    // Compare
    if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
    if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Calculate totals for all goals
 */
export function calculateGoalTotals(goals: SavingsGoal[]): {
  totalTarget: number;
  totalSaved: number;
  totalMonthlySavingsNeeded: number;
} {
  return goals.reduce(
    (acc, g) => ({
      totalTarget: acc.totalTarget + Number(g.targetAmount || 0),
      totalSaved: acc.totalSaved + Number(g.savedAmount || 0),
      totalMonthlySavingsNeeded:
        acc.totalMonthlySavingsNeeded + Number(g.monthlySavingsNeeded || 0),
    }),
    { totalTarget: 0, totalSaved: 0, totalMonthlySavingsNeeded: 0 }
  );
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
