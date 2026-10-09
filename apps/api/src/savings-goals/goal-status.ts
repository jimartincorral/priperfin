/**
 * Goal status as the Goals screen shows it (ported from
 * apps/web/src/utils/goals-utils.ts; keep the two in step).
 */
export type GoalStatus = 'completed' | 'ahead' | 'on-track' | 'behind';

export function getGoalStatus(goal: {
  savedAmount: number;
  targetAmount: number;
  shouldHaveSaved: number | null;
}): GoalStatus {
  const saved = Number(goal.savedAmount || 0);
  const target = Number(goal.targetAmount || 0);
  const shouldHave = Number(goal.shouldHaveSaved || 0);

  if (saved >= target) return 'completed';
  if (shouldHave <= 0) return 'on-track'; // not started, or evergreen

  const diff = saved - shouldHave;
  const tolerance = target * 0.05; // 5% tolerance
  if (diff >= tolerance) return 'ahead';
  if (diff <= -tolerance) return 'behind';
  return 'on-track';
}
