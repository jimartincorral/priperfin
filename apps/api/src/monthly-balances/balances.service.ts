import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * A point in time to work a balance out at. Starting balances set for months
 * after `month` are ignored. With `before`, only transactions dated before it
 * count (an opening balance); without it, every transaction recorded so far.
 */
export interface BalanceMoment {
  month: string;
  before?: Date;
}

export interface BalanceAccount {
  id: string;
  type: string;
  initialBalance: { toNumber(): number };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
export const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
const monthStart = (month: string) =>
  new Date(
    Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1),
  );

/**
 * How much money there is, the one rule the Expenses screen and the Simulator
 * share so they always show the same figure:
 * - an account: the latest starting balance set for a month (Monthly
 *   Balances), or else its initial balance, plus its transactions since;
 * - all accounts: the latest all-accounts starting balance set on the
 *   Expenses screen plus every transaction since; with none ever set, the
 *   accounts added up plus the transactions recorded without an account.
 *
 * Figures are money (a credit card that is owed comes out negative). A credit
 * card's own figures (its initial and monthly starting balances) are the
 * amount owed, so they count with the opposite sign and spending on the card
 * (negative amounts) adds to what is owed.
 */
@Injectable()
export class BalancesService {
  constructor(private prisma: PrismaService) {}

  private dated(since: Date | undefined, moment: BalanceMoment) {
    if (!since && !moment.before) return {};
    return {
      date: {
        ...(since ? { gte: since } : {}),
        ...(moment.before ? { lt: moment.before } : {}),
      },
    };
  }

  /** An account's balance in money. */
  async accountBalance(
    account: BalanceAccount,
    profileId: string,
    moment: BalanceMoment,
  ): Promise<number> {
    const anchor = await this.prisma.monthlyBalance.findFirst({
      where: { accountId: account.id, month: { lte: moment.month } },
      orderBy: { month: 'desc' },
    });
    const since = anchor ? monthStart(anchor.month) : undefined;
    const sum = await this.prisma.transaction.aggregate({
      where: {
        profileId,
        accountId: account.id,
        ...this.dated(since, moment),
      },
      _sum: { amount: true },
    });
    const moved = sum._sum.amount?.toNumber() ?? 0;
    const start = anchor
      ? anchor.balance.toNumber()
      : account.initialBalance.toNumber();
    return account.type === 'CREDIT' ? moved - start : start + moved;
  }

  /**
   * The all-accounts balance from the latest all-accounts starting balance
   * (`starting_balance_all_YYYY-MM`) plus every transaction since that month
   * began. Null when none was ever set.
   */
  async allAccountsBalance(
    profileId: string,
    moment: BalanceMoment,
  ): Promise<number | null> {
    const prefix = 'starting_balance_all_';
    const settings = await this.prisma.setting.findMany({
      where: { key: { startsWith: prefix } },
    });
    const latest = settings
      .map((s) => ({
        month: s.key.slice(prefix.length),
        value: Number(s.value),
      }))
      .filter(
        (s) =>
          /^\d{4}-\d{2}$/.test(s.month) &&
          s.month <= moment.month &&
          Number.isFinite(s.value),
      )
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    if (!latest) return null;
    const sum = await this.prisma.transaction.aggregate({
      where: { profileId, ...this.dated(monthStart(latest.month), moment) },
      _sum: { amount: true },
    });
    return latest.value + (sum._sum.amount?.toNumber() ?? 0);
  }

  /** What the transactions recorded without an account add up to. */
  async unassignedBalance(
    profileId: string,
    moment: BalanceMoment,
  ): Promise<number> {
    const sum = await this.prisma.transaction.aggregate({
      where: { profileId, accountId: null, ...this.dated(undefined, moment) },
      _sum: { amount: true },
    });
    return sum?._sum.amount?.toNumber() ?? 0;
  }

  /**
   * The balance in parts: each account, and what belongs to no account (the
   * transactions recorded without one or, once an all-accounts starting
   * balance is set, whatever it holds beyond the accounts). The parts add up
   * to the all-accounts balance.
   */
  async parts(
    profileId: string,
    accounts: BalanceAccount[],
    moment: BalanceMoment,
  ): Promise<{ accounts: number[]; noAccount: number }> {
    const [balances, allStart, unassigned] = await Promise.all([
      Promise.all(
        accounts.map((a) => this.accountBalance(a, profileId, moment)),
      ),
      this.allAccountsBalance(profileId, moment),
      this.unassignedBalance(profileId, moment),
    ]);
    const rounded = balances.map(round2);
    const total = rounded.reduce((sum, b) => sum + b, 0);
    return {
      accounts: rounded,
      noAccount: round2(allStart === null ? unassigned : allStart - total),
    };
  }

  /**
   * The balance at the start of `date` (before any of its transactions), as
   * the Expenses screen opens a period with it: for one account in that
   * account's own terms (a credit card: the amount owed), for all accounts in
   * money.
   */
  async openingBalance(
    profileId: string,
    date: Date,
    accountId?: string,
  ): Promise<number> {
    const moment = { month: monthKey(date), before: date };
    if (accountId) {
      const account = await this.prisma.account.findFirst({
        where: { id: accountId, profileId },
      });
      if (!account) throw new NotFoundException('Account not found');
      const money = await this.accountBalance(account, profileId, moment);
      return round2(account.type === 'CREDIT' ? -money : money);
    }
    const accounts = await this.prisma.account.findMany({
      where: { profileId },
    });
    const { accounts: parts, noAccount } = await this.parts(
      profileId,
      accounts,
      moment,
    );
    return round2(parts.reduce((sum, b) => sum + b, 0) + noAccount);
  }
}
