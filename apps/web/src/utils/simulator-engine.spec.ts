import { describe, it, expect } from 'vitest';
import {
  addMonths,
  averageMonth,
  changeStatus,
  cushionMonths,
  GOAL_SAVINGS,
  monthDiff,
  normalizeBasis,
  normalizeChanges,
  project,
  verdict,
  type Baseline,
  type ScenarioBasis,
  type ScenarioChange,
} from './simulator-engine';

/** Nov 2025 … Oct 2026; Dec and Jun carry an extra (bonus) payment. */
function makeBaseline(overrides: Partial<Baseline> = {}): Baseline {
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = addMonths('2025-11', i);
    const bonus = month.endsWith('-12') || month.endsWith('-06');
    return {
      month,
      income: bonus ? 6000 : 3000,
      expenses: 2000,
      categories: { Housing: 1000, Groceries: 600, Leisure: 400 },
    };
  });
  return {
    currency: 'EUR',
    currentMonth: '2026-11',
    balance: 10000,
    accounts: [],
    selectedAccountIds: [],
    months,
    goals: [],
    ...overrides,
  };
}

const basis = (b: Partial<ScenarioBasis> = {}): ScenarioBasis => ({
  period: 6,
  excluded: [],
  horizon: 12,
  accounts: [],
  ...b,
});

const change = (c: Partial<ScenarioChange>): ScenarioChange => ({
  id: 'c1',
  kind: 'recurring',
  name: 'Change',
  enabled: true,
  amount: 0,
  startMonth: '2026-12',
  ...c,
});

describe('months', () => {
  it('adds months across years and measures the gap', () => {
    expect(addMonths('2026-11', 3)).toBe('2027-02');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthDiff('2026-11', '2027-02')).toBe(3);
  });
});

describe('averageMonth', () => {
  it('averages the chosen period and flags bonus months', () => {
    const avg = averageMonth(makeBaseline(), basis());
    expect(avg.window.map((m) => m.month)).toEqual([
      '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10',
    ]);
    expect(avg.income).toBe(3500);
    expect(avg.spending).toBe(2000);
    expect([...avg.unusual]).toEqual(['2026-06']);
  });

  it('leaves excluded months out of the average', () => {
    const avg = averageMonth(makeBaseline(), basis({ excluded: ['2026-06'] }));
    expect(avg.income).toBe(3000);
    expect(avg.used).toHaveLength(5);
  });

  it('falls back to every month when all of them are excluded', () => {
    const b = makeBaseline();
    const avg = averageMonth(b, basis({ period: 3, excluded: ['2026-08', '2026-09', '2026-10'] }));
    expect(avg.used).toHaveLength(3);
    expect(avg.income).toBe(3000);
  });
});

describe('project', () => {
  const b = makeBaseline();
  const flat = basis({ excluded: ['2026-06'] }); // income 3000, spending 2000

  it('repeats the average month on the current path', () => {
    const p = project(b, flat, []);
    expect(p.base[0]).toBe(10000);
    expect(p.base[12]).toBe(22000);
    expect(p.scenario).toEqual(p.base);
    expect(p.firstShortfall).toBeNull();
  });

  it('applies a regular payment that replaces a category from its start month', () => {
    const p = project(b, flat, [
      change({ amount: 1500, category: 'Housing', startMonth: '2027-02' }),
    ]);
    // Months 1-2 save 1000, from month 3 the mortgage costs 500 more than rent.
    expect(p.scenarioNet.slice(1, 4)).toEqual([1000, 1000, 500]);
    const housing = p.endBreakdown.find((r) => r.key === 'cat:Housing')!;
    expect(housing.scenario).toBe(0);
    expect(p.endBreakdown.find((r) => r.key === 'change:c1')!.scenario).toBe(1500);
    expect(p.endBreakdown.at(-1)).toMatchObject({ key: 'left_over', base: 1000, scenario: 500 });
  });

  it('stops a payment for a set time after its months', () => {
    const p = project(b, flat, [
      change({ kind: 'temporary', amount: 300, months: 2, startMonth: '2027-01' }),
    ]);
    expect(p.scenarioNet.slice(1, 5)).toEqual([1000, 700, 700, 1000]);
    expect(p.scenario[12]).toBe(22000 - 600);
  });

  it('counts a one-off once and not as a shortfall', () => {
    const p = project(b, flat, [
      change({ kind: 'oneoff', amount: 5000, direction: 'out', startMonth: '2027-01' }),
    ]);
    expect(p.scenario[2]).toBe(10000 + 1000 + 1000 - 5000);
    expect(p.firstShortfall).toBeNull();
    expect(p.lowest).toEqual({ value: 7000, offset: 2 });
  });

  it('finds the first shortfall and the lowest balance after an income cut', () => {
    const p = project(b, flat, [change({ kind: 'income', amount: -1500, startMonth: '2027-03' })]);
    expect(p.firstShortfall).toBe(4);
    expect(p.lowest.offset).toBe(12);
    expect(verdict(p)).toBe('unsustainable');
  });

  it('adjusts a category by a percentage', () => {
    const p = project(b, flat, [change({ kind: 'category', category: 'Leisure', amount: -50 })]);
    expect(p.scenarioNet[1]).toBe(1200);
  });

  it('ignores switched-off changes', () => {
    const p = project(b, flat, [change({ kind: 'income', amount: -1500, enabled: false })]);
    expect(p.scenario).toEqual(p.base);
  });
});

describe('goal impacts', () => {
  const goals = [
    {
      id: 'g1',
      name: 'Emergency fund',
      targetAmount: 3400,
      savedAmount: 1000,
      // Due 1 Nov 2027; seen on 1 Nov 2026 that is 11 whole months (the Goals
      // screen's count), so it needs 2400 / 11 a month.
      targetDate: '2027-11-01T00:00:00.000Z',
      isEvergreen: false,
    },
    {
      id: 'g2',
      name: 'Evergreen',
      targetAmount: 100,
      savedAmount: 0,
      targetDate: null,
      isEvergreen: true,
    },
  ];
  const b = makeBaseline({ goals });
  const flat = basis({ excluded: ['2026-06'] });

  it('is on track when there is enough left over', () => {
    const [impact] = project(b, flat, []).goals;
    expect(impact.outcome).toMatchObject({ kind: 'on_track', month: '2027-10' });
  });

  it('is late when less is left over than the goal needs', () => {
    const [impact] = project(b, flat, [change({ kind: 'income', amount: -900 })]).goals;
    // 100 left over a month pays 2400 in 24 months: 13 past the 11 it has.
    expect(impact.outcome).toMatchObject({ kind: 'late', month: '2028-11', monthsLate: 13 });
  });

  it('pauses when nothing is left over', () => {
    const [impact] = project(b, flat, [change({ kind: 'income', amount: -1500 })]).goals;
    expect(impact.outcome).toMatchObject({ kind: 'paused', baseMonth: '2027-10' });
  });

  it('skips goals without a target date', () => {
    expect(project(b, flat, []).goals).toHaveLength(1);
  });
});

describe('normalizing saved data', () => {
  it('replaces an unknown basis with the defaults', () => {
    expect(
      normalizeBasis({ period: 5, horizon: 24, excluded: ['2026-06', 'junk', 3], accounts: ['a1', '', 7] }),
    ).toEqual({
      period: 6,
      horizon: 24,
      excluded: ['2026-06'],
      accounts: ['a1'],
    });
    expect(normalizeBasis(null)).toEqual({ period: 6, horizon: 24, excluded: [], accounts: [] });
  });

  it('drops changes it does not understand', () => {
    const changes = normalizeChanges([
      { id: 'a', kind: 'temporary', name: 'Loan', amount: 300, startMonth: '2027-01', months: 24 },
      { id: 'b', kind: 'lottery', amount: 1, startMonth: '2027-01' },
      { id: 'c', kind: 'income', amount: 'lots', startMonth: '2027-01' },
      { id: 'd', kind: 'income', amount: 10, startMonth: 'soon' },
    ]);
    expect(changes).toEqual([
      { id: 'a', kind: 'temporary', name: 'Loan', enabled: true, amount: 300, startMonth: '2027-01', months: 24 },
    ]);
  });
});

describe('calculation fixes', () => {
  const flat = basis({ excluded: ['2026-06'] }); // income 3000, spending 2000

  it('does not average in months with no transactions at all', () => {
    const b = makeBaseline();
    // Tracking only started in Aug 2026: the earlier months are empty.
    b.months = b.months.map((m) =>
      m.month < '2026-08' ? { ...m, income: 0, expenses: 0, categories: {} } : m,
    );
    const avg = averageMonth(b, basis({ period: 6 }));
    expect(avg.income).toBe(3000);
    expect(avg.spending).toBe(2000);
    expect(avg.used).toEqual(['2026-08', '2026-09', '2026-10']);
    expect([...avg.empty]).toEqual(['2026-05', '2026-06', '2026-07']);
  });

  it('keeps a one-off in the last month out of "left over each month"', () => {
    const p = project(makeBaseline(), flat, [
      change({ kind: 'oneoff', amount: 5000, startMonth: '2027-11' }),
    ]);
    expect(p.scenarioNet[12]).toBe(-4000); // the month itself
    expect(p.endNet).toBe(1000); // a typical month
    expect(verdict(p)).toBe('comfortable');
  });

  it('does not restart a loan that began before today', () => {
    // 12 payments, Jun 2026 to May 2027. Today is Nov 2026, whose payment is
    // part of this month, so six are left to project (Dec 2026 to May 2027).
    const p = project(makeBaseline(), flat, [
      change({ kind: 'temporary', amount: 300, months: 12, startMonth: '2026-06' }),
    ]);
    const paying = p.scenarioNet.slice(1).filter((n) => n === 700).length;
    expect(paying).toBe(6);
  });

  it('does not apply a one-off dated before today again', () => {
    const p = project(makeBaseline(), flat, [
      change({ kind: 'oneoff', amount: 5000, startMonth: '2026-09' }),
    ]);
    expect(p.scenario).toEqual(p.base);
  });

  it('does not change a category that a new payment already replaced', () => {
    const p = project(makeBaseline(), flat, [
      change({ id: 'mortgage', amount: 1500, category: 'Housing' }),
      change({ id: 'cut', kind: 'category', category: 'Housing', amount: -50 }),
    ]);
    // Rent (1000) is gone, the mortgage costs 1500; the -50% has nothing left to cut.
    expect(p.endNet).toBe(500);
  });

  it('adds what is still to come this month to the first projected month', () => {
    const b = makeBaseline({ currentMonthToDate: { income: 0, expenses: 1500 } });
    const p = project(b, flat, []);
    // Salary (3000) still to come, 500 of the usual 2000 still to spend.
    expect(p.base[1]).toBe(10000 + 2500 + 1000);
    expect(p.scenario[1]).toBe(p.base[1]);
  });

  it('keeps an overdue goal from making the others look late', () => {
    const b = makeBaseline({
      goals: [
        { id: 'g1', name: 'Car', targetAmount: 50000, savedAmount: 0, targetDate: '2026-01-01T00:00:00.000Z', isEvergreen: false },
        { id: 'g2', name: 'Trip', targetAmount: 1200, savedAmount: 0, targetDate: '2027-11-01T00:00:00.000Z', isEvergreen: false },
      ],
    });
    const [car, trip] = project(b, flat, []).goals;
    expect(car.outcome.kind).toBe('overdue');
    expect(trip.outcome).toMatchObject({ kind: 'on_track', month: '2027-10' });
  });
});

describe('review fixes', () => {
  const flat = basis({ excluded: ['2026-06'] }); // income 3000, spending 2000
  const b = makeBaseline();

  it('frees a replaced category once, however many payments replace it', () => {
    const p = project(b, flat, [
      change({ id: 'mortgage', amount: 1200, category: 'Housing' }),
      change({ id: 'insurance', amount: 50, category: 'Housing' }),
    ]);
    // 3000 - (2000 - 1000 rent) - 1200 - 50
    expect(p.endNet).toBe(750);
    expect(p.endBreakdown.find((r) => r.key === 'cat:Housing')!.scenario).toBe(0);
  });

  it('sets income and category spending to a new monthly amount', () => {
    const p = project(b, flat, [
      change({ id: 'pay', kind: 'income', amount: 0, to: 2500 }),
      change({ id: 'food', kind: 'category', category: 'Groceries', amount: 0, to: 400 }),
    ]);
    expect(p.endNet).toBe(2500 - (2000 - 600 + 400));
  });

  it('lets the newest income change win rather than adding them up', () => {
    const p = project(b, flat, [
      change({ id: 'cut', kind: 'income', amount: 0, to: 2500, startMonth: '2026-12' }),
      change({ id: 'raise', kind: 'income', amount: 0, to: 3500, startMonth: '2027-06' }),
    ]);
    expect(p.scenarioNet[1]).toBe(500);
    expect(p.endNet).toBe(1500);
  });

  it('never lets an old-style % change make spending negative', () => {
    const p = project(b, flat, [change({ kind: 'category', category: 'Leisure', amount: -150 })]);
    expect(p.endBreakdown.find((r) => r.key === 'cat:Leisure')!.scenario).toBe(0);
  });

  it('treats a change dated this month as already under way', () => {
    // 3 payments from Nov 2026 (this month): Dec and Jan are left.
    const loan = change({ kind: 'temporary', amount: 300, months: 3, startMonth: '2026-11' });
    const p = project(b, flat, [loan]);
    expect(p.scenarioNet.slice(1, 4)).toEqual([700, 700, 1000]);
    expect(changeStatus(loan, '2026-11')).toBe('ongoing');
    const oneoff = change({ kind: 'oneoff', amount: 5000, startMonth: '2026-11' });
    expect(project(b, flat, [oneoff]).scenario).toEqual(project(b, flat, []).scenario);
    expect(changeStatus(oneoff, '2026-11')).toBe('over');
  });

  it('calls a scenario that goes below zero not sustainable', () => {
    const p = project(b, flat, [change({ kind: 'oneoff', amount: 20000, startMonth: '2026-12' })]);
    expect(p.firstShortfall).toBeNull();
    expect(p.belowZero).toBe(1);
    expect(verdict(p)).toBe('unsustainable');
    expect(cushionMonths(p)).toBe(0);
  });

  it('has no cushion and no comfort with no spending and a negative balance', () => {
    const empty = makeBaseline({ balance: 0 });
    empty.months = empty.months.map((m) => ({ ...m, income: 0, expenses: 0, categories: {} }));
    const p = project(empty, flat, [change({ kind: 'oneoff', amount: 500 })]);
    expect(cushionMonths(p)).toBe(0);
    expect(verdict(p)).toBe('unsustainable');
  });

  it('lets other goals catch up once one is done', () => {
    // 1000 a month for both. A needs 1000 a month for 3 months and B about 92
    // for 12: together more than there is, so both get a share at first and A
    // lands a month late. Once A is done B gets all it needs and catches up.
    const goals = [
      { id: 'a', name: 'A', targetAmount: 3000, savedAmount: 0, targetDate: '2027-03-01T00:00:00.000Z', isEvergreen: false },
      { id: 'c', name: 'B', targetAmount: 1100, savedAmount: 0, targetDate: '2027-12-01T00:00:00.000Z', isEvergreen: false },
    ];
    const [a, c] = project(makeBaseline({ goals }), flat, []).goals;
    expect(a.outcome).toMatchObject({ kind: 'late', monthsLate: 1 });
    expect(c.outcome).toMatchObject({ kind: 'on_track', month: '2027-11' });
  });

  it('follows goals due more than ten years out', () => {
    const goals = [
      { id: 'far', name: 'Far', targetAmount: 15000, savedAmount: 0, targetDate: '2039-11-01T00:00:00.000Z', isEvergreen: false },
    ];
    const [far] = project(makeBaseline({ goals }), flat, []).goals;
    expect(far.outcome.kind).toBe('on_track');
  });

  it('counts money already going to goals as available to them', () => {
    const withSaving = makeBaseline({
      goals: [
        { id: 'g', name: 'G', targetAmount: 2200, savedAmount: 0, targetDate: '2027-11-01T00:00:00.000Z', isEvergreen: false },
      ],
    });
    // 200 a month already goes to goals and nothing else is left over.
    withSaving.months = withSaving.months.map((m) => ({
      ...m,
      income: 3000,
      expenses: 3000,
      categories: { ...m.categories, Leisure: 1200, [GOAL_SAVINGS]: 200 },
    }));
    const [g] = project(withSaving, flat, []).goals;
    expect(g.outcome).toMatchObject({ kind: 'on_track', month: '2027-10' });
  });

  it('marks a goal due later this month as not overdue yet', () => {
    const due = makeBaseline({
      today: '2026-11-10T00:00:00.000Z',
      goals: [
        { id: 'g', name: 'G', targetAmount: 100, savedAmount: 0, targetDate: '2026-11-30T00:00:00.000Z', isEvergreen: false },
      ],
    });
    expect(project(due, flat, []).goals[0].outcome.kind).not.toBe('overdue');
  });
});
