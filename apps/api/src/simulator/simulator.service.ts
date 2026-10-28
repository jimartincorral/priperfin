import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { SaveScenarioDto } from './scenario.dto';

/** Complete months of history the Simulator can average over. */
export const HISTORY_MONTHS = 12;

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
   * `accountIds` narrows the cash flow and the balance to those accounts;
   * ids that are not this profile's are ignored, and none (or none left)
   * means every account. Goals are not per account and always come back.
   */
  async getBaseline(
    profileId: string,
    accountIds?: string[],
    now = new Date(),
  ) {
    const from = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - HISTORY_MONTHS, 1),
    );
    const accounts = await this.accounts.findAll(profileId);
    const wanted = new Set(accountIds ?? []);
    const selected = accounts.filter((a) => wanted.has(a.id)).map((a) => a.id);
    const filter = selected.length ? selected : undefined;

    const thisMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const [months, [toDate], goals, currencySetting, balances] =
      await Promise.all([
        this.reports.getMonthlyCashFlow(
          profileId,
          from,
          HISTORY_MONTHS,
          filter,
        ),
        this.reports.getMonthlyCashFlow(profileId, thisMonth, 1, filter),
        this.goals.findAll(profileId),
        this.prisma.setting.findUnique({ where: { key: 'currency' } }),
        Promise.all(
          accounts.map((account) =>
            this.balanceToday(account, profileId, monthKey(now)),
          ),
        ),
      ]);

    const accountRows = accounts.map((a, i) => ({
      id: a.id,
      name: a.name,
      type: a.type,
      balance: round2(balances[i]),
    }));
    const counted = filter
      ? accountRows.filter((a) => filter.includes(a.id))
      : accountRows;

    return {
      currency: currencySetting?.value || null,
      currentMonth: monthKey(now),
      balance: round2(counted.reduce((sum, a) => sum + a.balance, 0)),
      accounts: accountRows,
      selectedAccountIds: filter ?? [],
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
   * An account's balance today, the way the Expenses screen arrives at it:
   * the latest starting balance set for a month (Monthly Balances) plus every
   * transaction of the account since that month began. Without one, the
   * account's initial balance plus all its transactions.
   *
   * The result is money: a credit card that is owed comes out negative. With
   * a monthly starting balance it is whatever the user entered (the Expenses
   * screen shows start plus transactions for both kinds of account); the
   * initial balance of a credit account is the amount owed, hence the sign.
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
    if (anchor) return anchor.balance.toNumber() + moved;
    const initial = account.initialBalance.toNumber();
    return account.type === 'CREDIT' ? moved - initial : initial + moved;
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
