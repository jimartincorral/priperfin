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
   * recurring / temporary: payment per month. oneoff: the sum. income: change
   * per month (+ or −). category: percent more (+) or less (−).
   */
  amount: number;
  startMonth: string;
  /** temporary: how many months it lasts. */
  months?: number;
  /** recurring: the expense category it replaces. category: the one it adjusts. */
  category?: string;
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
  const income = used.reduce((sum, m) => sum + m.income, 0) / n;
  const spending = Object.values(categories).reduce((sum, v) => sum + v, 0);

  const incomes = baseline.months.map((m) => m.income).filter((v) => v > 0).sort((a, b) => a - b);
  const median = incomes.length ? incomes[Math.floor(incomes.length / 2)] : 0;
  const unusual = new Set(
    window.filter((m) => median > 0 && m.income > median * 1.3).map((m) => m.month),
  );

  const empty = new Set(window.filter((m) => !hasData(m)).map((m) => m.month));
  return { income, spending, categories, window, used: used.map((m) => m.month), unusual, empty };
}

// ---------------------------------------------------------------------------
// Changes

/**
 * The month offset a change starts in. One starting this month counts from
 * the first projected month, as this month's average is already on its way;
 * one that started earlier keeps its real (negative) start, so a loan taken
 * out months ago runs only for the payments it has left and a one-off that
 * already happened is not paid again (a saved scenario grows older).
 */
function startOffset(change: ScenarioChange, currentMonth: string): number {
  const raw = monthDiff(currentMonth, change.startMonth);
  return raw === 0 ? 1 : raw;
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
 * What a change does to one month, relative to the average month: extra
 * income, extra spending and per-category adjustments (all signed).
 */
export interface MonthEffect {
  income: number;
  spending: number;
  categories: Record<string, number>;
  /** Payments that are not an existing category (mortgage, loan), by change. */
  payments: Array<{ id: string; name: string; amount: number }>;
}

export function monthEffect(
  changes: ScenarioChange[],
  offset: number,
  currentMonth: string,
  avg: AverageMonth,
): MonthEffect {
  const effect: MonthEffect = { income: 0, spending: 0, categories: {}, payments: [] };
  const adjust = (category: string, delta: number) => {
    effect.categories[category] = (effect.categories[category] ?? 0) + delta;
    effect.spending += delta;
  };
  // A category a new payment replaces is gone; a % change to it has nothing
  // left to change.
  const replaced = new Set(
    changes
      .filter((c) => c.kind === 'recurring' && c.category && isActive(c, offset, currentMonth))
      .map((c) => c.category as string),
  );
  for (const c of changes) {
    if (!isActive(c, offset, currentMonth)) continue;
    switch (c.kind) {
      case 'income':
        effect.income += c.amount;
        break;
      case 'recurring':
      case 'temporary':
        effect.spending += c.amount;
        effect.payments.push({ id: c.id, name: c.name, amount: c.amount });
        if (c.kind === 'recurring' && c.category && avg.categories[c.category]) {
          adjust(c.category, -avg.categories[c.category]);
        }
        break;
      case 'oneoff':
        if (c.direction === 'in') effect.income += c.amount;
        else effect.spending += c.amount;
        break;
      case 'category':
        if (c.category && avg.categories[c.category] && !replaced.has(c.category)) {
          adjust(c.category, (avg.categories[c.category] * c.amount) / 100);
        }
        break;
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
  /** The target date has passed; not counted against what is left over. */
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
  let firstShortfall: number | null = null;

  for (let k = 1; k <= H; k++) {
    months.push(addMonths(now, k));
    const carry = k === 1 ? restOfMonth : 0;
    base.push(base[k - 1] + baseNet + carry);
    const e = monthEffect(changes, k, now, avg);
    const net = baseNet + e.income - e.spending;
    scenarioNet.push(net);
    scenario.push(scenario[k - 1] + net + carry);
    // A one-off is not a monthly shortfall; only count recurring deficits.
    const recurringNet = net + oneOffSpend(changes, k, now) - oneOffIncome(changes, k, now);
    if (firstShortfall === null && recurringNet < 0) firstShortfall = k;
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
  }
  for (const p of end.payments) {
    rows.push({ key: `change:${p.id}`, label: p.name, base: 0, scenario: p.amount, upIsGood: false });
  }
  const endNet = baseNet + end.income - end.spending;
  rows.push({ key: 'left_over', label: '', base: baseNet, scenario: endNet, upIsGood: true });

  return {
    months,
    base,
    scenario,
    baseNet,
    scenarioNet,
    endNet,
    lowest,
    firstShortfall,
    endBreakdown: rows,
    endSpending: avg.spending + end.spending,
    goals: goalImpacts(baseline, baseNet, scenarioNet, endNet),
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
 * Each goal with a target date needs (target − saved) / months-left every
 * month. Those needs are paid from what is left over: in full when there is
 * enough, proportionally when there is less, not at all when nothing is left.
 */
export function goalImpacts(
  baseline: Baseline,
  baseNet: number,
  scenarioNet: number[],
  lastNet: number,
): GoalImpact[] {
  const now = baseline.currentMonth;
  const goals = baseline.goals.filter((g) => !g.isEvergreen && g.targetDate);
  const plans = goals.map((g) => {
    const dueMonth = g.targetDate!.slice(0, 7);
    const due = monthDiff(now, dueMonth);
    const remaining = Math.max(0, g.targetAmount - g.savedAmount);
    return { goal: g, dueMonth, due, remaining, need: due >= 1 ? remaining / due : 0 };
  });
  // An overdue goal would need everything at once, which would swamp the
  // shares of the goals still on schedule; it is reported on its own.
  const totalNeed = plans.reduce((s, p) => s + p.need, 0);
  const LIMIT = 120;

  const reach = (need: number, remaining: number, netAt: (k: number) => number) => {
    let saved = 0;
    for (let k = 1; k <= LIMIT; k++) {
      const share = totalNeed > 0 ? Math.max(0, Math.min(1, netAt(k) / totalNeed)) : 0;
      saved += need * share;
      if (saved >= remaining - 0.005) return k;
    }
    return null;
  };
  const scenarioAt = (k: number) => (k < scenarioNet.length ? scenarioNet[k] : lastNet);

  return plans.map(({ goal, dueMonth, due, remaining, need }) => {
    if (remaining <= 0) return { goal, dueMonth, outcome: { kind: 'done' } };
    if (due < 1) return { goal, dueMonth, outcome: { kind: 'overdue' } };
    const b = reach(need, remaining, () => baseNet);
    const s = reach(need, remaining, scenarioAt);
    const baseMonth = b === null ? null : addMonths(now, b);
    let outcome: GoalOutcome;
    if (s === null) outcome = { kind: 'paused', baseMonth };
    else if (s <= due) outcome = { kind: 'on_track', month: addMonths(now, s), baseMonth };
    else outcome = { kind: 'late', month: addMonths(now, s), baseMonth, monthsLate: s - due };
    return { goal, dueMonth, outcome };
  });
}

export type Verdict = 'comfortable' | 'tight' | 'unsustainable';

/** A one-word read of a projection, used on the comparison cards. */
export function verdict(p: Projection): Verdict {
  if (p.firstShortfall !== null && p.endNet < 0) return 'unsustainable';
  const cushion = p.endSpending > 0 ? p.lowest.value / p.endSpending : Infinity;
  if (cushion < 3 || p.firstShortfall !== null) return 'tight';
  return 'comfortable';
}

/** Months of spending the lowest balance would cover. */
export function cushionMonths(p: Projection): number {
  return p.endSpending > 0 ? Math.max(0, p.lowest.value) / p.endSpending : 0;
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
      ...(c.direction === 'in' || c.direction === 'out' ? { direction: c.direction } : {}),
    }];
  });
}
