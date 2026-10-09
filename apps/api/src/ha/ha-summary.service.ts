import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { BankSyncService } from '../bank-sync/bank-sync.service';
import { GetReportsDto } from '../reports/dto/get-reports.dto';
import { currentUtcMonth } from '../transactions/date-ranges';
import { getGoalStatus } from '../savings-goals/goal-status';

/** What the Home Assistant integration polls, one document per profile. */
export interface HaSummary {
  profile: { id: string; name: string };
  currency: string | null;
  appVersion: string | null;
  generatedAt: string;
  uncategorizedCount: number;
  pendingSuggestions: number;
  month: {
    year: number;
    month: number;
    income: number;
    expenses: number;
    net: number;
  };
  accounts: Array<{ id: string; name: string; type: string; balance: number }>;
  totalBalance: number;
  budgets: {
    budgetedCategories: number;
    overBudgetCount: number;
    remaining: number;
  };
  goals: {
    count: number;
    totalSaved: number;
    totalLeft: number;
    behindCount: number;
  };
  bank: {
    connectionCount: number;
    lastSyncAt: string | null;
    expired: boolean;
    daysUntilExpiry: number | null;
  };
  lastImport: {
    at: string;
    newCount: number;
    uncategorizedCount: number;
  } | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

@Injectable()
export class HaSummaryService {
  constructor(
    private prisma: PrismaService,
    private accounts: AccountsService,
    private transactions: TransactionsService,
    private reports: ReportsService,
    private goals: SavingsGoalsService,
    private bankSync: BankSyncService,
  ) {}

  async getSummary(
    profile: { id: string; name: string },
    now = new Date(),
  ): Promise<HaSummary> {
    const profileId = profile.id;
    const { year, month, gte, lt } = currentUtcMonth(now);

    const [
      currencySetting,
      uncategorizedCount,
      pendingSuggestions,
      monthTotals,
      accounts,
      breakdown,
      goals,
      connections,
      markerSetting,
    ] = await Promise.all([
      this.prisma.setting.findUnique({ where: { key: 'currency' } }),
      this.prisma.transaction.count({
        where: { profileId, categoryId: null, isTransfer: false },
      }),
      this.prisma.ruleSuggestion.count({
        where: { profileId, status: 'PENDING' },
      }),
      this.reports.getCashFlowTotals(profileId, { gte, lt }),
      this.accounts.findAll(profileId),
      this.reports.getCategoryBreakdown(
        { filterMode: 'month', month, year } as GetReportsDto,
        profileId,
      ),
      this.goals.findAll(profileId),
      this.bankSync.getConnections(profileId),
      this.prisma.setting.findUnique({
        where: { key: `ha_last_import_profile_${profileId}` },
      }),
    ]);

    // Balances: the same figure the Expenses screen shows per account.
    const accountBalances = await Promise.all(
      accounts.map(async (account) => {
        const { balance } = await this.transactions.getAccountBalance(
          account.id,
          profileId,
        );
        return {
          id: account.id,
          name: account.name,
          type: account.type,
          balance: round2(balance),
        };
      }),
    );
    const totalBalance = round2(
      accountBalances.reduce((sum, a) => sum + a.balance, 0),
    );

    // Budgets, with the Categories screen's rule: a parent or top-level
    // category is judged on its own spend plus its children's; a child on its
    // own spend. The breakdown already excludes transfers and nets refunds.
    const spentById = new Map(breakdown.map((c) => [c.id, c.spent]));
    const childrenOf = new Map<string, string[]>();
    for (const c of breakdown) {
      if (c.parentId) {
        childrenOf.set(c.parentId, [
          ...(childrenOf.get(c.parentId) ?? []),
          c.id,
        ]);
      }
    }
    let budgetedCategories = 0;
    let overBudgetCount = 0;
    let remaining = 0;
    for (const c of breakdown) {
      if (c.id === 'uncategorized' || !(c.budget > 0)) continue;
      const children = childrenOf.get(c.id) ?? [];
      const spent = c.parentId
        ? (spentById.get(c.id) ?? 0)
        : (spentById.get(c.id) ?? 0) +
          children.reduce((s, id) => s + (spentById.get(id) ?? 0), 0);
      budgetedCategories++;
      if (spent > c.budget) overBudgetCount++;
      remaining += Math.max(0, c.budget - spent);
    }

    // Goals
    let totalSaved = 0;
    let totalLeft = 0;
    let behindCount = 0;
    for (const goal of goals) {
      const saved = goal.savedAmount.toNumber();
      const target = goal.targetAmount.toNumber();
      totalSaved += saved;
      totalLeft += Math.max(0, target - saved);
      if (
        getGoalStatus({
          savedAmount: saved,
          targetAmount: target,
          shouldHaveSaved: goal.shouldHaveSaved,
        }) === 'behind'
      ) {
        behindCount++;
      }
    }

    // Bank sync
    const syncTimes = connections
      .flatMap((c) => c.linkedAccounts.map((a) => a.lastSyncedAt))
      .filter((d): d is Date => !!d)
      .map((d) => d.getTime());
    const bank = {
      connectionCount: connections.length,
      lastSyncAt: syncTimes.length
        ? new Date(Math.max(...syncTimes)).toISOString()
        : null,
      expired: connections.some((c) => c.isExpired),
      daysUntilExpiry: connections.length
        ? Math.min(...connections.map((c) => c.daysRemaining))
        : null,
    };

    let lastImport: HaSummary['lastImport'] = null;
    if (markerSetting?.value) {
      try {
        const parsed = JSON.parse(markerSetting.value);
        if (parsed && typeof parsed.at === 'string') {
          lastImport = {
            at: parsed.at,
            newCount: Number(parsed.newCount) || 0,
            uncategorizedCount: Number(parsed.uncategorizedCount) || 0,
          };
        }
      } catch {
        lastImport = null;
      }
    }

    return {
      profile: { id: profile.id, name: profile.name },
      currency: currencySetting?.value || null,
      appVersion: process.env.PRIPERFIN_VERSION || null,
      generatedAt: now.toISOString(),
      uncategorizedCount,
      pendingSuggestions,
      month: {
        year,
        month,
        income: monthTotals.income,
        expenses: monthTotals.expenses,
        net: monthTotals.net,
      },
      accounts: accountBalances,
      totalBalance,
      budgets: {
        budgetedCategories,
        overBudgetCount,
        remaining: round2(remaining),
      },
      goals: {
        count: goals.length,
        totalSaved: round2(totalSaved),
        totalLeft: round2(totalLeft),
        behindCount,
      },
      bank,
      lastImport,
    };
  }
}
