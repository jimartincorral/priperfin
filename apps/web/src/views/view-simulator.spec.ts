import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NO_ACCOUNT, type Baseline } from '../utils/simulator-engine';

const baselineFor = (ids: string[] = []): Baseline => ({
  currency: 'EUR',
  currentMonth: '2026-11',
  today: '2026-11-09T00:00:00Z',
  balance: ids.length ? 100 : 1000,
  accounts: [
    { id: 'a', name: 'Main', type: 'DEBIT', balance: 900 },
    { id: 'b', name: 'Savings', type: 'DEBIT', balance: 100 },
  ],
  selectedAccountIds: ids,
  months: [],
  currentMonthToDate: { income: 0, expenses: 0 },
  goals: [],
});

const { simulatorApi } = vi.hoisted(() => ({
  simulatorApi: {
    getBaseline: vi.fn(),
    listScenarios: vi.fn(),
    deleteScenario: vi.fn(),
  },
}));
vi.mock('../api/client', () => ({ simulatorApi }));

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

async function mount() {
  await import('./view-simulator');
  const el = document.createElement('view-simulator') as any;
  document.body.appendChild(el);
  await tick(10);
  await el.updateComplete;
  return el;
}

describe('view-simulator accounts', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    simulatorApi.getBaseline.mockReset();
    simulatorApi.listScenarios.mockReset().mockResolvedValue([]);
    simulatorApi.deleteScenario.mockReset().mockResolvedValue({});
    // A filtered baseline takes a while; the full one comes back at once.
    simulatorApi.getBaseline.mockImplementation(
      (ids: string[] = []) => new Promise((r) => setTimeout(() => r(baselineFor(ids)), ids.length ? 30 : 0)),
    );
  });

  it('does not let a late answer for accounts switched back win', async () => {
    const el = await mount();

    el.toggleAccount('a'); // Main off: asks for Savings alone (slow)
    el.toggleAccount('a'); // Main back on before the answer
    await tick(60);

    expect(el.draft.basis.accounts).toEqual([]);
    expect(el.baseline.selectedAccountIds).toEqual([]);
    expect(el.baseline.balance).toBe(1000);
  });

  it('goes back to every account after deleting a scenario limited to some', async () => {
    simulatorApi.listScenarios.mockResolvedValue([
      { id: 's1', name: 'Savings only', changes: [], basis: { period: 6, excluded: [], horizon: 24, accounts: ['b'] } },
    ]);
    const el = await mount();
    el.openScenario('s1');
    await tick(60);
    expect(el.baseline.selectedAccountIds).toEqual(['b']);

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    await el.deleteScenario();
    await tick(10);

    expect(el.draft.basis.accounts).toEqual([]);
    expect(el.baseline.selectedAccountIds).toEqual([]);
  });

  it('drops saved accounts that no longer exist when opening a scenario', async () => {
    simulatorApi.listScenarios.mockResolvedValue([
      { id: 's1', name: 'Old', changes: [], basis: { period: 6, excluded: [], horizon: 24, accounts: ['gone', 'b'] } },
      { id: 's2', name: 'Older', changes: [], basis: { period: 6, excluded: [], horizon: 24, accounts: ['gone'] } },
    ]);
    const el = await mount();

    el.openScenario('s1');
    expect(el.draft.basis.accounts).toEqual(['b']);
    el.openScenario('s2');
    expect(el.draft.basis.accounts).toEqual([]);
  });

  it('shows the part with no account like an account, by name', async () => {
    simulatorApi.getBaseline.mockResolvedValue({
      ...baselineFor(),
      accounts: [...baselineFor().accounts, { id: NO_ACCOUNT, name: '', type: 'NONE', balance: -50 }],
    });
    const el = await mount();

    const chips = [...el.renderRoot.querySelectorAll('.chip .chip-month')].map((c: Element) => c.textContent?.trim());
    expect(chips).toContain('No account');

    el.toggleAccount(NO_ACCOUNT);
    expect(el.draft.basis.accounts).toEqual(['a', 'b']);
  });
});
