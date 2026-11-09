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
