import { NotFoundException } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { Prisma } from '../generated/client';

const Decimal = Prisma.Decimal;

describe('BalancesService.openingBalance', () => {
  let prisma: PrismaMock;
  let service: BalancesService;
  const nov1 = new Date(Date.UTC(2026, 10, 1));

  const account = (id: string, type: string, initialBalance: number) => ({
    id,
    type,
    initialBalance: new Decimal(initialBalance),
  });
  /** Sums by account id ('none' for no account, 'all' for the profile). */
  const sums = (byKey: Record<string, number>) =>
    prisma.transaction.aggregate.mockImplementation(({ where }) => {
      const key =
        where.accountId === null ? 'none' : (where.accountId ?? 'all');
      return Promise.resolve({
        _sum: { amount: new Decimal(byKey[key] ?? 0) },
      });
    });

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new BalancesService(prisma as any);
    prisma.setting.findMany.mockResolvedValue([]);
    prisma.monthlyBalance.findFirst.mockResolvedValue(null);
  });

  it('adds up the accounts and what has no account when no all-accounts balance was set', async () => {
    prisma.account.findMany.mockResolvedValue([
      account('main', 'DEBIT', 1000),
      account('card', 'CREDIT', 200),
    ]);
    // Before November: Main moved +60,000, the card 300 more spent, and 500
    // was spent with no account.
    sums({ main: 60000, card: -300, none: -500 });

    // 61,000 - 500 owed - 500 = 60,000
    await expect(service.openingBalance('p1', nov1)).resolves.toBe(60000);
    expect(prisma.transaction.aggregate).toHaveBeenCalledWith({
      where: { profileId: 'p1', accountId: 'main', date: { lt: nov1 } },
      _sum: { amount: true },
    });
  });

  it('opens from the all-accounts balance when one was set', async () => {
    prisma.account.findMany.mockResolvedValue([account('main', 'DEBIT', 0)]);
    prisma.setting.findMany.mockResolvedValue([
      { key: 'starting_balance_all_2026-09', value: '50000' },
      // set for a later month: not known yet on November 1st
      { key: 'starting_balance_all_2026-12', value: '1' },
    ]);
    sums({ all: 2500, main: 10 });

    await expect(service.openingBalance('p1', nov1)).resolves.toBe(52500);
    expect(prisma.transaction.aggregate).toHaveBeenCalledWith({
      where: {
        profileId: 'p1',
        date: { gte: new Date(Date.UTC(2026, 8, 1)), lt: nov1 },
      },
      _sum: { amount: true },
    });
  });

  it("gives one account's opening from its latest starting balance", async () => {
    prisma.account.findFirst.mockResolvedValue(account('main', 'DEBIT', 0));
    prisma.monthlyBalance.findFirst.mockResolvedValue({
      month: '2026-10',
      balance: new Decimal(4000),
    });
    sums({ main: -1250.5 });

    await expect(service.openingBalance('p1', nov1, 'main')).resolves.toBe(
      2749.5,
    );
    expect(prisma.monthlyBalance.findFirst).toHaveBeenCalledWith({
      where: { accountId: 'main', month: { lte: '2026-11' } },
      orderBy: { month: 'desc' },
    });
  });

  it("gives a credit card's opening as the amount owed", async () => {
    prisma.account.findFirst.mockResolvedValue(account('card', 'CREDIT', 0));
    prisma.monthlyBalance.findFirst.mockResolvedValue({
      month: '2026-10',
      balance: new Decimal(300),
    });
    // October: 400 spent, 300 paid off.
    sums({ card: -100 });

    await expect(service.openingBalance('p1', nov1, 'card')).resolves.toBe(400);
  });

  it("refuses an account that is not the profile's", async () => {
    prisma.account.findFirst.mockResolvedValue(null);
    await expect(
      service.openingBalance('p1', nov1, 'someone-else'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
