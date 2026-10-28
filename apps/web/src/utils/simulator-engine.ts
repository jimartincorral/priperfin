/**
 * The what-if Simulator's projection model.
 *
 * The starting point is an "average month" taken from past cash flow (the
 * user picks the period and can leave out months such as a bonus month).
 * The projection repeats that month from today's balance, then applies each
 * enabled change from its start month. Pure functions, no I/O, so the view
 * can recompute on every keystroke.
 *
 * Months are 'YYYY-MM' keys. Offset 0 is the current (unfinished) month and
 * holds today's balance; offset k is k months later.
 */

export interface BaselineMonth {
  month: string;
  income: number;
  expenses: number;
  categories: Record<string, number>;
  /** Parent category → subcategory → spend (part of the parent's figure). */
  subcategories?: Record<string, Record<string, number>>;
}

export interface BaselineGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string | null;
  isEvergreen: boolean;
}

export interface Baseline {
  currency: string | null;
  currentMonth: string;
  /** Today's date (ISO), for goal deadlines; the 1st of currentMonth if absent. */
  today?: string;
  /** Today's balance across the selected accounts (all when none selected). */
  balance: number;
  accounts: Array<{ id: string; name: string; type: string; balance: number }>;
  /** The accounts this baseline was built from; empty means all of them. */
  selectedAccountIds: string[];
  months: BaselineMonth[];
  /**
   * Cash flow of the current month so far. The rest of the month, up to the
   * average, is still to come and is added to the first projected month.
   */
  currentMonthToDate?: { income: number; expenses: number };
  goals: BaselineGoal[];
}

export type ChangeKind = 'recurring' | 'temporary' | 'oneoff' | 'income' | 'category';

export interface ScenarioChange {
  id: string;
  kind: ChangeKind;
  name: string;
  enabled: boolean;
  /**
   * recurring / temporary: payment per month. oneoff: the sum. Always a
   * positive amount of money. (Scenarios saved before `to` existed stored the
   * income change (+/−) or the category change in % here; still honoured.)
   */
  amount: number;
  /**
   * income: the new monthly income. category: the new monthly spending in
   * that category. The change is the difference from today's average.
   */
  to?: number;
  startMonth: string;
  /** temporary: how many months it lasts. */
  months?: number;
  /** recurring: the expense category it replaces. category: the one it adjusts. */
  category?: string;
  /** With `category`: just this subcategory of it is replaced or adjusted. */
  subcategory?: string;
  /** oneoff: money in or out. */
  direction?: 'in' | 'out';
}

export type Period = 3 | 6 | 12;
export type Horizon = 12 | 24 | 36;

export interface ScenarioBasis {
  period: Period;
  excluded: string[];
  horizon: Horizon;
  /** Accounts the starting point uses; empty means all of them. */
  accounts: string[];
}

export const DEFAULT_BASIS: ScenarioBasis = { period: 6, excluded: [], horizon: 24, accounts: [] };

/**
 * The category key the API uses for money transferred out of the selected
 * accounts (see ReportsService.getMonthlyCashFlow).
 */
export const TRANSFERS_OUT = '__transfers_out__';

/** The category key the API uses for money put into savings goals. */
export const GOAL_SAVINGS = '__goal_savings__';

// ---------------------------------------------------------------------------
// Months

export function addMonths(key: string, n: number): string {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** Months from `from` to `to` (positive when `to` is later). */
export function monthDiff(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export function formatMonth(key: string, locale: string): string {
  const [y, m] = key.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(locale, {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

// ---------------------------------------------------------------------------
// The average month

export interface AverageMonth {
  income: number;
  spending: number;
  /** Average spend per top-level expense category. */
  categories: Record<string, number>;
  /** Average spend per subcategory, by parent (part of the parent's figure). */
  subcategories: Record<string, Record<string, number>>;
  /** The months in the chosen period, oldest first. */
  window: BaselineMonth[];
  /** The months actually averaged (the window minus exclusions). */
  used: string[];
  /** Months whose income is well above the usual, e.g. a bonus. */
  unusual: Set<string>;
  /** Months in the window with no transactions at all, never averaged. */
  empty: Set<string>;
}

/**
 * A month with no income and no spending is almost always one before the user
 * started tracking (or one never imported), not a month that cost nothing.
 */
function hasData(m: BaselineMonth): boolean {
  return m.income !== 0 || m.expenses !== 0 || Object.keys(m.categories).length > 0;
}

export function averageMonth(baseline: Baseline, basis: ScenarioBasis): AverageMonth {
  const window = baseline.months.slice(-basis.period);
  const excluded = new Set(basis.excluded);
  const withData = window.filter(hasData);
  let used = withData.filter((m) => !excluded.has(m.month));
  // Leaving every month out would leave nothing to average: use them all.
  if (!used.length) used = withData;

  const n = used.length || 1;
  const categories: Record<string, number> = {};
  for (const m of used) {
    for (const [name, value] of Object.entries(m.categories)) {
      categories[name] = (categories[name] ?? 0) + value / n;
    }
  }
  const subcategories: Record<string, Record<string, number>> = {};
  for (const m of used) {
    for (const [parent, subs] of Object.entries(m.subcategories ?? {})) {
      for (const [name, value] of Object.entries(subs)) {
        const into = (subcategories[parent] ??= {});
        into[name] = (into[name] ?? 0) + value / n;
      }
    }
  }
  const income = used.reduce((sum, m) => sum + m.income, 0) / n;
  const spending = Object.values(categories).reduce((sum, v) => sum + v, 0);

  const incomes = baseline.months.map((m) => m.income).filter((v) => v > 0).sort((a, b) => a - b);
  const median = incomes.length ? incomes[Math.floor(incomes.length / 2)] : 0;
  const unusual = new Set(
    window.filter((m) => median > 0 && m.income > median * 1.3).map((m) => m.month),
  );

  const empty = new Set(window.filter((m) => !hasData(m)).map((m) => m.month));
  return {
    income,
    spending,
    categories,
    subcategories,
    window,
    used: used.map((m) => m.month),
    unusual,
    empty,
  };
}

/**
 * What a category (or one of its subcategories) costs in an average month.
 * A subcategory never counts for more than its parent: refunds elsewhere in
 * the parent can make the parent's net smaller than one of its parts.
 */
export function categoryAverage(avg: AverageMonth, category: string, subcategory?: string): number {
  const parent = avg.categories[category] ?? 0;
  if (!subcategory) return parent;
  return Math.min(parent, avg.subcategories[category]?.[subcategory] ?? 0);
}

// ---------------------------------------------------------------------------
// Changes

/**
 * The month offset a change starts in, relative to the current month (0).
 * Changes start in a future month; a saved scenario grows older, though, so
 * a change can be under way or over. Offset 0 and earlier have happened (or
 * are happening) and are already in today's balance or this month's
 * remainder, so only offsets from 1 count: a loan taken out months ago runs
 * just for the payments it has left, and a past one-off is not paid again.
 */
function startOffset(change: ScenarioChange, currentMonth: string): number {
  return monthDiff(currentMonth, change.startMonth);
}

/** Last month offset a change applies to; Infinity when it never ends. */
function endOffset(change: ScenarioChange, currentMonth: string): number {
  const start = startOffset(change, currentMonth);
  if (change.kind === 'oneoff') return start;
  if (change.kind === 'temporary') return start + Math.max(1, change.months ?? 1) - 1;
  return Infinity;
}

export function isActive(change: ScenarioChange, offset: number, currentMonth: string): boolean {
  return (
    change.enabled &&
    offset >= Math.max(1, startOffset(change, currentMonth)) &&
    offset <= endOffset(change, currentMonth)
  );
}

/**
 * Where a change stands today: still to come, under way (it started this
 * month or earlier and is not over) or over (it no longer affects anything).
 */
export function changeStatus(
  change: ScenarioChange,
  currentMonth: string,
): 'upcoming' | 'ongoing' | 'over' {
  if (endOffset(change, currentMonth) < 1) return 'over';
  return startOffset(change, currentMonth) >= 1 ? 'upcoming' : 'ongoing';
}

/**
 * What a change does to one month, relative to the average month: extra
 * income, extra spending and per-category adjustments (all signed).
 */
export interface MonthEffect {
  income: number;
  spending: number;
  categories: Record<string, number>;
  /** Payments that are not an existing category (mortgage, loan), by change. */
  payments: Array<{ id: string; name: string; amount: number }>;
  /** Subcategories a change touches: parent → subcategory → new monthly cost. */
  subcategories: Record<string, Record<string, number>>;
}

/** Of several changes setting the same figure, the one that started last wins. */
function latest(list: ScenarioChange[]): ScenarioChange | undefined {
  return list.reduce<ScenarioChange | undefined>(
    (best, c) => (!best || c.startMonth >= best.startMonth ? c : best),
    undefined,
  );
}

export function monthEffect(
  changes: ScenarioChange[],
  offset: number,
  currentMonth: string,
  avg: AverageMonth,
): MonthEffect {
  const effect: MonthEffect = { income: 0, spending: 0, categories: {}, payments: [], subcategories: {} };
  const active = changes.filter((c) => isActive(c, offset, currentMonth));

  for (const c of active) {
    if (c.kind === 'recurring' || c.kind === 'temporary') {
      effect.spending += c.amount;
      effect.payments.push({ id: c.id, name: c.name, amount: c.amount });
    } else if (c.kind === 'oneoff') {
      if (c.direction === 'in') effect.income += c.amount;
      else effect.spending += c.amount;
    }
  }

  // Income: the newest "income becomes X" sets it; old-style +/- changes add.
  const incomeTarget = latest(active.filter((c) => c.kind === 'income' && c.to !== undefined));
  if (incomeTarget) effect.income += (incomeTarget.to as number) - avg.income;
  for (const c of active) {
    if (c.kind === 'income' && c.to === undefined) effect.income += c.amount;
  }

  // Categories, one parent at a time:
  // - a new payment that replaces the whole category leaves nothing of it
  //   (however many payments name it), and nothing left to change;
  // - otherwise the newest "spending becomes X" on the category sets it, and
  //   old-style % changes apply to its average;
  // - then each subcategory touched moves the category by its own difference:
  //   replaced (its average goes) or set to a new amount (the newest wins).
  // The category never costs less than nothing.
  const touched = new Set(
    active
      .filter((c) => (c.kind === 'recurring' || c.kind === 'category') && c.category)
      .map((c) => c.category as string),
  );
  for (const parent of touched) {
    const base = avg.categories[parent] ?? 0;
    const onParent = active.filter((c) => c.category === parent && !c.subcategory);
    if (onParent.some((c) => c.kind === 'recurring')) {
      if (base) {
        effect.categories[parent] = -base;
        effect.spending -= base;
      }
      continue;
    }
    let value = base;
    const target = latest(onParent.filter((c) => c.kind === 'category' && c.to !== undefined));
    if (target) value = Math.max(0, target.to as number);
    for (const c of onParent) {
      if (c.kind === 'category' && c.to === undefined) value += (base * Math.max(-100, c.amount)) / 100;
    }
    const subs = new Set(
      active.filter((c) => c.category === parent && c.subcategory).map((c) => c.subcategory as string),
    );
    for (const sub of subs) {
      const subBase = categoryAverage(avg, parent, sub);
      const onSub = active.filter((c) => c.category === parent && c.subcategory === sub);
      let subValue = subBase;
      if (onSub.some((c) => c.kind === 'recurring')) subValue = 0;
      else {
        const subTarget = latest(onSub.filter((c) => c.kind === 'category' && c.to !== undefined));
        if (subTarget) subValue = Math.max(0, subTarget.to as number);
      }
      value += subValue - subBase;
      (effect.subcategories[parent] ??= {})[sub] = subValue;
    }
    value = Math.max(0, value);
    if (value !== base) {
      effect.categories[parent] = value - base;
      effect.spending += value - base;
    }
  }
  return effect;
}

// ---------------------------------------------------------------------------
// Projection

export type GoalOutcome =
  | { kind: 'done' }
  | { kind: 'on_track'; month: string; baseMonth: string | null }
  | { kind: 'late'; month: string; baseMonth: string | null; monthsLate: number }
  | { kind: 'paused'; baseMonth: string | null }
  /** The target date has passed. */
  | { kind: 'overdue' };

export interface GoalImpact {
  goal: BaselineGoal;
  dueMonth: string;
  outcome: GoalOutcome;
}

export interface BreakdownRow {
  key: string;
  label: string;
  base: number;
  scenario: number;
  /** For rows where more is better (income, left over). */
  upIsGood: boolean;
  /** Set on a subcategory row: the category it belongs to. */
  parent?: string;
}

export interface Projection {
  months: string[];
  /** Balance at the end of each month on the current path; [0] is today. */
  base: number[];
  scenario: number[];
  /** Left over in an average month on the current path. */
  baseNet: number;
  /** What each month adds to the balance, one-offs included ([0] unused). */
  scenarioNet: number[];
  /** Left over in a typical month at the end of the projection (no one-offs). */
  endNet: number;
  lowest: { value: number; offset: number };
  /** First month the balance is below zero, or null. */
  belowZero: number | null;
  /** First month the scenario spends more than it earns, or null. */
  firstShortfall: number | null;
  /** The last month of the projection, line by line. */
  endBreakdown: BreakdownRow[];
  endSpending: number;
  goals: GoalImpact[];
}

export function project(
  baseline: Baseline,
  basis: ScenarioBasis,
  changes: ScenarioChange[],
): Projection {
  const avg = averageMonth(baseline, basis);
  const H = basis.horizon;
  const now = baseline.currentMonth;
  const baseNet = avg.income - avg.spending;
  const goalSaving = avg.categories[GOAL_SAVINGS] ?? 0;

  // Today's balance already holds this month's transactions so far; what an
  // average month would still bring lands by the end of the first projected
  // month. Never negative: a month already over its average stays as it is.
  const toDate = baseline.currentMonthToDate;
  const restOfMonth = toDate
    ? Math.max(0, avg.income - toDate.income) - Math.max(0, avg.spending - toDate.expenses)
    : 0;

  const months = [now];
  const base = [baseline.balance];
  const scenario = [baseline.balance];
  const scenarioNet = [0];
  // What could go to savings goals each month: what is left over plus what
  // already goes to them (both are free money as far as the goals go).
  const scenarioPool = [0];
  let firstShortfall: number | null = null;
  let belowZero: number | null = null;

  for (let k = 1; k <= H; k++) {
    months.push(addMonths(now, k));
    const carry = k === 1 ? restOfMonth : 0;
    base.push(base[k - 1] + baseNet + carry);
    const e = monthEffect(changes, k, now, avg);
    const net = baseNet + e.income - e.spending;
    scenarioNet.push(net);
    scenario.push(scenario[k - 1] + net + carry);
    scenarioPool.push(net + goalSaving + (e.categories[GOAL_SAVINGS] ?? 0));
    // A one-off is not a monthly shortfall; only count recurring deficits.
    const recurringNet = net + oneOffSpend(changes, k, now) - oneOffIncome(changes, k, now);
    if (firstShortfall === null && recurringNet < 0) firstShortfall = k;
    if (belowZero === null && scenario[k] < 0) belowZero = k;
  }

  let lowest = { value: scenario[0], offset: 0 };
  scenario.forEach((v, i) => {
    if (v < lowest.value) lowest = { value: v, offset: i };
  });

  // The last month, without one-offs, so it reads as a typical month.
  const end = monthEffect(changes.filter((c) => c.kind !== 'oneoff'), H, now, avg);
  const rows: BreakdownRow[] = [
    { key: 'income', label: '', base: avg.income, scenario: avg.income + end.income, upIsGood: true },
  ];
  const names = Object.keys(avg.categories).sort((a, b) => avg.categories[b] - avg.categories[a]);
  for (const name of names) {
    rows.push({
      key: `cat:${name}`,
      label: name,
      base: avg.categories[name],
      scenario: avg.categories[name] + (end.categories[name] ?? 0),
      upIsGood: false,
    });
    // Subcategories a change touches, under their category.
    for (const [sub, value] of Object.entries(end.subcategories[name] ?? {})) {
      rows.push({
        key: `sub:${name}/${sub}`,
        label: sub,
        base: categoryAverage(avg, name, sub),
        scenario: value,
        upIsGood: false,
        parent: name,
      });
    }
  }
  for (const p of end.payments) {
    rows.push({ key: `change:${p.id}`, label: p.name, base: 0, scenario: p.amount, upIsGood: false });
  }
  const endNet = baseNet + end.income - end.spending;
  rows.push({ key: 'left_over', label: '', base: baseNet, scenario: endNet, upIsGood: true });
  const endPool = endNet + goalSaving + (end.categories[GOAL_SAVINGS] ?? 0);

  return {
    months,
    base,
    scenario,
    baseNet,
    scenarioNet,
    endNet,
    lowest,
    belowZero,
    firstShortfall,
    endBreakdown: rows,
    endSpending: avg.spending + end.spending,
    goals: goalImpacts(
      baseline,
      () => baseNet + goalSaving,
      (k) => (k < scenarioPool.length ? scenarioPool[k] : endPool),
      H,
    ),
  };
}

function oneOffSpend(changes: ScenarioChange[], k: number, now: string): number {
  return changes
    .filter((c) => c.kind === 'oneoff' && c.direction !== 'in' && isActive(c, k, now))
    .reduce((s, c) => s + c.amount, 0);
}

function oneOffIncome(changes: ScenarioChange[], k: number, now: string): number {
  return changes
    .filter((c) => c.kind === 'oneoff' && c.direction === 'in' && isActive(c, k, now))
    .reduce((s, c) => s + c.amount, 0);
}

/**
 * Whole months from `from` until `to`, counted the way the Goals screen does
 * (a month counts only if it ends before the target date).
 */
export function fullMonthsUntil(from: Date, to: Date): number {
  if (to.getTime() <= from.getTime()) return 0;
  let months =
    (to.getUTCFullYear() - from.getUTCFullYear()) * 12 + (to.getUTCMonth() - from.getUTCMonth());
  if (to.getUTCDate() <= from.getUTCDate()) months -= 1;
  return Math.max(0, months);
}

/**
 * Savings goals with a target date, funded together from `poolAt(k)`: each
 * month every open goal asks for what it still needs spread over the months
 * it has left (as the Goals screen plans it), gets it in full when there is
 * enough and a share when there is less. A goal that is done stops asking, so
 * the others can catch up.
 */
export function goalImpacts(
  baseline: Baseline,
  basePool: (k: number) => number,
  scenarioPool: (k: number) => number,
  horizon: number,
): GoalImpact[] {
  const now = baseline.currentMonth;
  const today = baseline.today ? new Date(baseline.today) : new Date(`${now}-01T00:00:00Z`);
  const plans = baseline.goals
    .filter((g) => !g.isEvergreen && g.targetDate)
    .map((g) => {
      const target = new Date(g.targetDate as string);
      return {
        goal: g,
        dueMonth: (g.targetDate as string).slice(0, 7),
        overdue: target.getTime() < today.getTime(),
        due: fullMonthsUntil(today, target),
        remaining: Math.max(0, g.targetAmount - g.savedAmount),
      };
    });
  const open = plans.filter((p) => p.remaining > 0 && !p.overdue);
  const limit = Math.max(120, ...open.map((p) => p.due + horizon));

  const finishMonths = (poolAt: (k: number) => number): Array<number | null> => {
    const saved = open.map(() => 0);
    const doneAt: Array<number | null> = open.map(() => null);
    for (let k = 1; k <= limit && doneAt.some((d) => d === null); k++) {
      const needs = open.map((p, i) =>
        doneAt[i] !== null ? 0 : (p.remaining - saved[i]) / Math.max(1, p.due - k + 1),
      );
      const total = needs.reduce((a, b) => a + b, 0);
      if (total <= 0) break;
      const share = Math.max(0, Math.min(1, poolAt(k) / total));
      needs.forEach((need, i) => {
        if (doneAt[i] !== null) return;
        saved[i] += need * share;
        if (saved[i] >= open[i].remaining - 0.005) doneAt[i] = k;
      });
    }
    return doneAt;
  };
  const baseDone = finishMonths(basePool);
  const scenarioDone = finishMonths(scenarioPool);

  return plans.map((p) => {
    const { goal, dueMonth } = p;
    if (p.remaining <= 0) return { goal, dueMonth, outcome: { kind: 'done' } };
    if (p.overdue) return { goal, dueMonth, outcome: { kind: 'overdue' } };
    const i = open.indexOf(p);
    const b = baseDone[i];
    const s = scenarioDone[i];
    const baseMonth = b === null ? null : addMonths(now, b);
    let outcome: GoalOutcome;
    if (s === null) outcome = { kind: 'paused', baseMonth };
    else if (s <= p.due) outcome = { kind: 'on_track', month: addMonths(now, s), baseMonth };
    else outcome = { kind: 'late', month: addMonths(now, s), baseMonth, monthsLate: s - p.due };
    return { goal, dueMonth, outcome };
  });
}

export type Verdict = 'comfortable' | 'tight' | 'unsustainable';

/** A one-word read of a projection, used on the comparison cards. */
export function verdict(p: Projection): Verdict {
  if (p.belowZero !== null || (p.firstShortfall !== null && p.endNet < 0)) return 'unsustainable';
  if (cushionMonths(p) < 3 || p.firstShortfall !== null) return 'tight';
  return 'comfortable';
}

/**
 * Months of spending the lowest balance would cover: 0 when it goes to zero
 * or below, Infinity when there is money and no spending to cover.
 */
export function cushionMonths(p: Projection): number {
  if (p.lowest.value <= 0) return 0;
  return p.endSpending > 0 ? p.lowest.value / p.endSpending : Infinity;
}

// ---------------------------------------------------------------------------
// Saved data

const KINDS: ChangeKind[] = ['recurring', 'temporary', 'oneoff', 'income', 'category'];
const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/** A saved basis with anything unknown replaced by the defaults. */
export function normalizeBasis(raw: unknown): ScenarioBasis {
  const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const period = [3, 6, 12].includes(b.period as number) ? (b.period as Period) : DEFAULT_BASIS.period;
  const horizon = [12, 24, 36].includes(b.horizon as number) ? (b.horizon as Horizon) : DEFAULT_BASIS.horizon;
  const excluded = Array.isArray(b.excluded)
    ? b.excluded.filter((m): m is string => typeof m === 'string' && MONTH.test(m))
    : [];
  const accounts = Array.isArray(b.accounts)
    ? b.accounts.filter((a): a is string => typeof a === 'string' && a.length > 0)
    : [];
  return { period, horizon, excluded, accounts };
}

/** Saved changes, dropping any that are not a change this version understands. */
export function normalizeChanges(raw: unknown): ScenarioChange[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item): ScenarioChange[] => {
    const c = (item ?? {}) as Record<string, unknown>;
    if (!KINDS.includes(c.kind as ChangeKind) || typeof c.startMonth !== 'string' || !MONTH.test(c.startMonth)) {
      return [];
    }
    const amount = Number(c.amount);
    if (!Number.isFinite(amount)) return [];
    return [{
      id: typeof c.id === 'string' && c.id ? c.id : `c${Math.random().toString(36).slice(2)}`,
      kind: c.kind as ChangeKind,
      name: typeof c.name === 'string' ? c.name : '',
      enabled: c.enabled !== false,
      amount,
      startMonth: c.startMonth,
      ...(typeof c.months === 'number' && c.months >= 1 ? { months: Math.round(c.months) } : {}),
      ...(typeof c.category === 'string' && c.category ? { category: c.category } : {}),
      ...(typeof c.category === 'string' && c.category && typeof c.subcategory === 'string' && c.subcategory
        ? { subcategory: c.subcategory }
        : {}),
      ...(c.direction === 'in' || c.direction === 'out' ? { direction: c.direction } : {}),
      ...(typeof c.to === 'number' && Number.isFinite(c.to) && c.to >= 0 ? { to: c.to } : {}),
    }];
  });
}
