import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { SaveScenarioDto } from './scenario.dto';

/** Complete months of history the Simulator can average over. */
export const HISTORY_MONTHS = 12;

/**
 * The id of the part of the balance that belongs to no account (see
 * getBaseline). Chosen so it cannot pass for a real account id.
 */
export const NO_ACCOUNT = '__no_account__';

const round2 = (n: number) => Math.round(n * 100) / 100;
const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

@Injectable()
export class SimulatorService {
  constructor(
    private prisma: PrismaService,
    private accounts: AccountsService,
    private reports: ReportsService,
    private goals: SavingsGoalsService,
  ) {}

  /**
   * The starting point every scenario is projected from: the last complete
   * months of cash flow, today's balance and the savings goals. The current
   * month is left out because it is not over yet.
   *
   * Today's balance is always the sum of the parts listed in `accounts`, so
   * whatever is picked adds up to what the parts show:
   * - each account, worked out on its own (see balanceToday);
   * - NO_ACCOUNT, listed when it holds anything: the transactions recorded
   *   without an account, or, once the all-accounts starting balance of the
   *   Expenses screen has been set, the difference between that figure and
   *   the sum of the accounts. With every part counted the total is therefore
   *   the Expenses screen's all-accounts balance.
   *
   * `accountIds` narrows the cash flow and the balance to those parts (ids
   * that are not this profile's are ignored); none, none left, or all of them
   * means everything. Goals are not per account and always come back.
   */
  async getBaseline(
    profileId: string,
    accountIds?: string[],
    now = new Date(),
  ) {
    const from = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - HISTORY_MONTHS, 1),
    );
    const currentMonth = monthKey(now);
    const accounts = await this.accounts.findAll(profileId);
    const [balances, allStart, unassigned, goals, currencySetting] =
      await Promise.all([
        Promise.all(
          accounts.map((account) =>
            this.balanceToday(account, profileId, currentMonth),
          ),
        ),
        this.allAccountsBalanceToday(profileId, currentMonth),
        this.unassignedToday(profileId, from),
        this.goals.findAll(profileId),
        this.prisma.setting.findUnique({ where: { key: 'currency' } }),
      ]);

    const accountRows = accounts.map((a, i) => ({
      id: a.id,
      name: a.name,
      type: a.type as string,
      balance: round2(balances[i]),
    }));
    const accountsTotal = accountRows.reduce((sum, a) => sum + a.balance, 0);
    const noAccount = round2(
      allStart === null ? unassigned.sum : allStart - accountsTotal,
    );
    const rows =
      noAccount !== 0 || unassigned.recent
        ? [
            ...accountRows,
            { id: NO_ACCOUNT, name: '', type: 'NONE', balance: noAccount },
          ]
        : accountRows;

    // What is counted: everything, unless some (not all) parts are picked.
    const wanted = new Set(accountIds ?? []);
    const picked = rows.filter((r) => wanted.has(r.id));
    const counted =
      picked.length && picked.length < rows.length ? picked : rows;
    const filter = counted === rows ? undefined : counted;
    const accountFilter = filter
      ?.filter((r) => r.id !== NO_ACCOUNT)
      .map((r) => r.id);
    const withUnassigned = !!filter?.some((r) => r.id === NO_ACCOUNT);

    const thisMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const [months, [toDate]] = await Promise.all([
      this.reports.getMonthlyCashFlow(
        profileId,
        from,
        HISTORY_MONTHS,
        accountFilter,
        withUnassigned,
      ),
      this.reports.getMonthlyCashFlow(
        profileId,
        thisMonth,
        1,
        accountFilter,
        withUnassigned,
      ),
    ]);

    return {
      currency: currencySetting?.value || null,
      currentMonth,
      today: now.toISOString(),
      balance: round2(counted.reduce((sum, r) => sum + r.balance, 0)),
      accounts: rows,
      selectedAccountIds: filter ? filter.map((r) => r.id) : [],
      months,
      // The current month so far; the client adds what is still to come.
      currentMonthToDate: {
        income: toDate?.income ?? 0,
        expenses: toDate?.expenses ?? 0,
      },
      goals: goals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount.toNumber(),
        savedAmount: g.savedAmount.toNumber(),
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        isEvergreen: g.isEvergreen,
      })),
    };
  }

  /**
   * Transactions recorded without an account: what they add up to, and
   * whether any falls in the months the Simulator looks at.
   */
  private async unassignedToday(profileId: string, since: Date) {
    const [sum, recent] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { profileId, accountId: null },
        _sum: { amount: true },
      }),
      this.prisma.transaction.findFirst({
        where: { profileId, accountId: null, date: { gte: since } },
        select: { id: true },
      }),
    ]);
    return { sum: sum?._sum.amount?.toNumber() ?? 0, recent: !!recent };
  }

  /**
   * The all-accounts balance the Expenses screen shows with no account picked:
   * the latest all-accounts starting balance (`starting_balance_all_YYYY-MM`)
   * up to this month plus every transaction since that month began. Null when
   * none was ever set.
   */
  private async allAccountsBalanceToday(
    profileId: string,
    currentMonth: string,
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
          s.month <= currentMonth &&
          Number.isFinite(s.value),
      )
      .sort((a, b) => b.month.localeCompare(a.month))[0];
    if (!latest) return null;
    const since = new Date(
      Date.UTC(
        Number(latest.month.slice(0, 4)),
        Number(latest.month.slice(5, 7)) - 1,
        1,
      ),
    );
    const sum = await this.prisma.transaction.aggregate({
      where: { profileId, date: { gte: since } },
      _sum: { amount: true },
    });
    return latest.value + (sum._sum.amount?.toNumber() ?? 0);
  }

  /**
   * An account's balance today, the way the Expenses screen arrives at it:
   * the latest starting balance set for a month (Monthly Balances) plus every
   * transaction of the account since that month began. Without one, the
   * account's initial balance plus all its transactions.
   *
   * The result is money: a credit card that is owed comes out negative. A
   * credit account's figures (its initial balance and its monthly starting
   * balances) are the amount owed, so they count with the opposite sign and
   * its spending (negative amounts) adds to what is owed.
   */
  private async balanceToday(
    account: {
      id: string;
      type: string;
      initialBalance: { toNumber(): number };
    },
    profileId: string,
    currentMonth: string,
  ): Promise<number> {
    const anchor = await this.prisma.monthlyBalance.findFirst({
      where: { accountId: account.id, month: { lte: currentMonth } },
      orderBy: { month: 'desc' },
    });
    const since = anchor
      ? new Date(
          Date.UTC(
            Number(anchor.month.slice(0, 4)),
            Number(anchor.month.slice(5, 7)) - 1,
            1,
          ),
        )
      : undefined;
    const sum = await this.prisma.transaction.aggregate({
      where: {
        profileId,
        accountId: account.id,
        ...(since ? { date: { gte: since } } : {}),
      },
      _sum: { amount: true },
    });
    const moved = sum._sum.amount?.toNumber() ?? 0;
    const start = anchor
      ? anchor.balance.toNumber()
      : account.initialBalance.toNumber();
    return account.type === 'CREDIT' ? moved - start : start + moved;
  }

  async findAll(profileId: string) {
    const rows = await this.prisma.scenario.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async create(profileId: string, dto: SaveScenarioDto) {
    const row = await this.prisma.scenario.create({
      data: {
        profileId,
        name: dto.name.trim(),
        changesJson: JSON.stringify(dto.changes),
        basisJson: JSON.stringify(dto.basis),
      },
    });
    return this.toDto(row);
  }

  async update(id: string, profileId: string, dto: SaveScenarioDto) {
    await this.findOwned(id, profileId);
    const row = await this.prisma.scenario.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        changesJson: JSON.stringify(dto.changes),
        basisJson: JSON.stringify(dto.basis),
      },
    });
    return this.toDto(row);
  }

  async remove(id: string, profileId: string) {
    await this.findOwned(id, profileId);
    await this.prisma.scenario.delete({ where: { id } });
    return { id };
  }

  private async findOwned(id: string, profileId: string) {
    const row = await this.prisma.scenario.findFirst({
      where: { id, profileId },
    });
    if (!row) throw new NotFoundException('Scenario not found');
    return row;
  }

  private toDto(row: {
    id: string;
    name: string;
    changesJson: string;
    basisJson: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      name: row.name,
      changes: parseJson<unknown[]>(row.changesJson, []),
      basis: parseJson<Record<string, unknown>>(row.basisJson, {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
