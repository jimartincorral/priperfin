import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import {
  BalancesService,
  monthKey,
} from '../monthly-balances/balances.service';
import { SaveScenarioDto } from './scenario.dto';

/** Complete months of history the Simulator can average over. */
export const HISTORY_MONTHS = 12;

/**
 * The id of the part of the balance that belongs to no account (see
 * getBaseline). Chosen so it cannot pass for a real account id.
 */
export const NO_ACCOUNT = '__no_account__';

const round2 = (n: number) => Math.round(n * 100) / 100;

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
    private balances: BalancesService,
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
    const [parts, recentUnassigned, goals, currencySetting] = await Promise.all(
      [
        this.balances.parts(profileId, accounts, { month: currentMonth }),
        // Whether any transaction without an account falls in the months
        // averaged, so its part is listed even when it adds up to nothing.
        this.prisma.transaction.findFirst({
          where: { profileId, accountId: null, date: { gte: from } },
          select: { id: true },
        }),
        this.goals.findAll(profileId),
        this.prisma.setting.findUnique({ where: { key: 'currency' } }),
      ],
    );

    const accountRows = accounts.map((a, i) => ({
      id: a.id,
      name: a.name,
      type: a.type as string,
      balance: parts.accounts[i],
    }));
    const noAccount = parts.noAccount;
    const rows =
      noAccount !== 0 || recentUnassigned
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
