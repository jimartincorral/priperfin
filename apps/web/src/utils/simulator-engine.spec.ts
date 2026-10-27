import { describe, it, expect } from 'vitest';
import {
  addMonths,
  averageMonth,
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
    accountCount: 2,
    months,
    goals: [],
    ...overrides,
  };
}

const basis = (b: Partial<ScenarioBasis> = {}): ScenarioBasis => ({
  period: 6,
  excluded: [],
  horizon: 12,
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
      targetDate: '2027-11-01T00:00:00.000Z', // 12 months away, needs 200/mo
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
    expect(impact.outcome).toMatchObject({ kind: 'on_track', month: '2027-11' });
  });

  it('is late when less is left over than the goal needs', () => {
    const [impact] = project(b, flat, [change({ kind: 'income', amount: -900 })]).goals;
    // 100 left over pays half of the 200 a month the goal needs.
    expect(impact.outcome).toMatchObject({ kind: 'late', month: '2028-11', monthsLate: 12 });
  });

  it('pauses when nothing is left over', () => {
    const [impact] = project(b, flat, [change({ kind: 'income', amount: -1500 })]).goals;
    expect(impact.outcome).toMatchObject({ kind: 'paused', baseMonth: '2027-11' });
  });

  it('skips goals without a target date', () => {
    expect(project(b, flat, []).goals).toHaveLength(1);
  });
});

describe('normalizing saved data', () => {
  it('replaces an unknown basis with the defaults', () => {
    expect(normalizeBasis({ period: 5, horizon: 24, excluded: ['2026-06', 'junk', 3] })).toEqual({
      period: 6,
      horizon: 24,
      excluded: ['2026-06'],
    });
    expect(normalizeBasis(null)).toEqual({ period: 6, horizon: 24, excluded: [] });
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
