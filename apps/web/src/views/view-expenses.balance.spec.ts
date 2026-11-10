import { describe, it, expect, vi, beforeEach } from 'vitest';

const { api } = vi.hoisted(() => ({ api: { get: vi.fn(), post: vi.fn() } }));
vi.mock('../api/client', () => ({ api, bankSyncApi: {} }));

// October: a 400 purchase (the movement the balance is set from) and a 100
// one. November: a 300 payment and a 50 purchase.
const history = (accountId: string) => [
  { id: 't1', date: '2026-10-05T00:00:00.000Z', amount: -400, accountId },
  { id: 't2', date: '2026-10-20T00:00:00.000Z', amount: -100, accountId },
  { id: 't3', date: '2026-11-02T00:00:00.000Z', amount: 300, accountId },
  { id: 't4', date: '2026-11-06T00:00:00.000Z', amount: -50, accountId },
];

async function setUp(type: 'DEBIT' | 'CREDIT', typed: string) {
  await import('./view-expenses');
  const el = document.createElement('view-expenses') as any;
  el.accounts = [{ id: 'acc', name: 'Account', type }];
  el.selectedAccountId = 'acc';
  el.loadData = vi.fn();
  el.notify = vi.fn();
  api.get.mockResolvedValue(history('acc'));
  vi.spyOn(window, 'prompt').mockReturnValue(typed);
  await el.setStartingBalanceFromTransaction({ id: 't1', date: '2026-10-05T00:00:00.000Z' });
  return el;
}

const posted = () =>
  api.post.mock.calls.map(([, body]: [string, any]) => [body.month, body.balance]);

describe('setting a balance from a movement', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset().mockResolvedValue({});
  });

  it('treats a card balance as the amount owed', async () => {
    // 400 owed right after the 400 purchase: nothing was owed on Oct 1, 500 by
    // Nov 1, and 250 after November's payment and purchase.
    const el = await setUp('CREDIT', '400');

    expect(posted()).toEqual([
      ['2026-10', 0],
      ['2026-11', 500],
    ]);
    expect(el.closingBalance(500, 300 - 50)).toBe(250);
  });

  it('keeps any other account in money', async () => {
    // 1000 in the account right after the 400 purchase.
    const el = await setUp('DEBIT', '1000');

    expect(posted()).toEqual([
      ['2026-10', 1400],
      ['2026-11', 900],
    ]);
    expect(el.closingBalance(900, 300 - 50)).toBe(1150);
  });
});

describe('the opening balance of what is on screen', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
  });

  async function load(setUp: (el: any) => void, opening: unknown) {
    await import('./view-expenses');
    const el = document.createElement('view-expenses') as any;
    el.accounts = [{ id: 'card', name: 'Card', type: 'CREDIT' }];
    el.month = 11;
    el.year = 2026;
    setUp(el);
    api.get.mockImplementation((endpoint: string) => {
      if (endpoint.startsWith('/monthly-balances/opening/')) return Promise.resolve(opening);
      if (endpoint === '/settings') return Promise.resolve([]);
      return Promise.resolve({ total: 0 });
    });
    await el.loadBalances();
    const call = api.get.mock.calls.find(([endpoint]: [string]) => endpoint.startsWith('/monthly-balances/opening/'));
    return { el, endpoint: call[0], params: call[1] };
  }

  it('opens every account from the start of the month, as worked out by the API', async () => {
    const { el, endpoint, params } = await load(() => {}, { date: '2026-11-01', balance: 68636.4 });

    expect(endpoint).toBe('/monthly-balances/opening/2026-11-01');
    expect(params).toEqual({});
    expect(el.startingBalance).toBe(68636.4);
    // Spending this month lowers it from there instead of starting at zero.
    expect(el.closingBalance(el.startingBalance, -3823.8)).toBeCloseTo(64812.6, 2);
  });

  it('opens a year from January 1st and one account with its own figure', async () => {
    const { endpoint, params } = await load((el) => {
      el.dateFilterMode = 'year';
      el.selectedAccountId = 'card';
    }, { balance: 400 });

    expect(endpoint).toBe('/monthly-balances/opening/2026-01-01');
    expect(params).toEqual({ accountId: 'card' });
  });

  it('opens a custom range from its first day', async () => {
    const { endpoint } = await load((el) => {
      el.dateFilterMode = 'custom';
      el.customStartDate = '2026-10-15';
      el.customEndDate = '2026-11-10';
    }, { balance: 1 });

    expect(endpoint).toBe('/monthly-balances/opening/2026-10-15');
  });

  it('leaves the balance unknown rather than starting from zero', async () => {
    // An empty answer reaches the view as {}.
    const { el } = await load(() => {}, {});

    expect(el.startingBalance).toBeNaN();
    expect(el.closingBalance(el.startingBalance, -3823.8)).toBeNaN();
  });
});
