import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/client';
import {
  startOfMonth,
  endOfMonth,
  parseISO,
  format,
  subMonths,
} from 'date-fns';
import { GetTransactionsDto } from '../transactions/get-transactions.dto';
import { GetReportsDto } from './dto/get-reports.dto';

/** The category fields the sankey aggregation reads off each loaded line. */
type SankeyCategory = {
  name: string;
  type: string;
  parent: { name: string } | null;
} | null;

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getCategoryBreakdown(query: GetReportsDto, profileId: string) {
    const { accountId } = query;
    const { startDate, endDate } = this.getDateRange(query);
    const divisor = await this.getAveragingDivisor(query, profileId);

    // Build where clause
    // Incoming amounts are fetched too, not just expenses: money that comes
    // back into an expense category (a refund or a reimbursement) offsets what
    // was spent there, so a 400 restaurant bill with a 100 reimbursement counts
    // as 300 spent.
    const where: any = { profileId };

    // Only add date filter if dates are provided (not all_time mode)
    if (startDate && endDate) {
      where.date = { gte: startDate, lt: endDate };
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: { include: { parent: true } },
        splits: {
          include: {
            category: { include: { parent: true } },
          },
        },
      },
    });

    // Group by category
    const categoryMap = new Map<
      string,
      {
        id: string;
        name: string;
        color: string;
        spent: number;
        budget: number;
        icon: string;
        parentId?: string;
        familyId?: string;
        familyName?: string;
      }
    >();

    // Initialize with ALL Expense categories
    const categories = await this.prisma.category.findMany({
      where: { type: 'EXPENSE', profileId },
      orderBy: { name: 'asc' },
    });

    // Create a lookup for categories to find parent names
    const catLookup = new Map<string, { name: string; icon: string }>();
    categories.forEach((c) =>
      catLookup.set(c.id, { name: c.name, icon: c.icon }),
    );

    // 1. Group by Family (Parent ID or Self ID if top-level)
    const familyMap = new Map<string, string[]>(); // familyId -> list of categoryIds

    categories.forEach((c) => {
      const familyId = c.parentId || c.id;
      if (!familyMap.has(familyId)) {
        familyMap.set(familyId, []);
      }
      familyMap.get(familyId)?.push(c.id);
    });

    // 2. Assign Base Colors to Families
    const palette = [
      '#22c55e', // Green
      '#3b82f6', // Blue
      '#eab308', // Yellow
      '#ef4444', // Red
      '#a855f7', // Purple
      '#f97316', // Orange
      '#ec4899', // Pink
      '#06b6d4', // Cyan
      '#8b5cf6', // Violet
      '#14b8a6', // Teal
    ];

    const familyBaseColors = new Map<string, string>();
    let colorIndex = 0;
    // Sort families to ensure consistent coloring across reloads
    const sortedFamilies = Array.from(familyMap.keys()).sort();

    sortedFamilies.forEach((fId) => {
      // Check if this family (parent category) has a saved color
      const parentCategory = categories.find((c) => c.id === fId);
      if (parentCategory && parentCategory.color) {
        // Use the saved color
        familyBaseColors.set(fId, parentCategory.color);
      } else {
        // Use palette color as fallback
        familyBaseColors.set(fId, palette[colorIndex % palette.length]);
        colorIndex++;
      }
    });

    // 3. Assign Colors to Categories
    categories.forEach((c) => {
      const familyId = c.parentId || c.id;
      const baseColor = familyBaseColors.get(familyId) || '#cccccc';

      // Resolve Family Name
      let familyName = c.name;
      if (c.parentId && catLookup.has(c.parentId)) {
        const parent = catLookup.get(c.parentId);
        if (parent) {
          familyName = `${parent.icon} ${parent.name}`;
        }
      } else if (!c.parentId) {
        familyName = `${c.icon} ${c.name}`;
      }

      // Use saved color if available, otherwise calculate shade
      let finalColor = c.color || baseColor;

      // If no saved color, calculate variation based on position in family
      if (!c.color) {
        const siblings = familyMap.get(familyId) || [];

        if (siblings.length > 1) {
          // If there are multiple items in this family, vary the shade
          const index = siblings.indexOf(c.id);
          const variance = (index * 15) % 60;
          finalColor = this.adjustBrightness(baseColor, variance - 10);
        }
      }

      categoryMap.set(c.id, {
        id: c.id, // Include ID for navigation
        name: c.name,
        color: finalColor,
        icon: c.icon,
        spent: 0,
        budget: c.budget ? c.budget.toNumber() : 0,
        parentId: c.parentId || undefined, // Include parent relationship
        familyId: familyId, // Used for sorting
        familyName: familyName, // For grouping
      });
    });

    // Add Uncategorized bucket
    categoryMap.set('uncategorized', {
      id: 'uncategorized', // Include ID for navigation
      name: 'Uncategorized',
      color: '#94a3b8',
      icon: '?',
      spent: 0,
      budget: 0,
      parentId: undefined,
      familyId: 'zzzzzz', // Ensure it's last
      familyName: 'Uncategorized',
    });

    // Aggregate. Outgoing amounts add to what was spent; incoming amounts that
    // land on an expense category are refunds and net against it.
    const applyLine = (amount: number, categoryId?: string | null) => {
      // `categoryMap` only holds this profile's expense categories (plus the
      // uncategorized bucket), so a hit here means "this is an expense category"
      const known =
        categoryId && categoryMap.has(categoryId) ? categoryId : null;

      if (amount > 0) {
        // Only refunds inside an expense category belong in an expense report.
        // Real income, and any inflow without a category, is left out.
        if (known) {
          const current = categoryMap.get(known);
          if (current) current.spent -= amount;
        }
        return;
      }

      const current = categoryMap.get(known ?? 'uncategorized');
      if (current) current.spent += Math.abs(amount);
    };

    transactions.forEach((t) => {
      // If transaction has splits, aggregate each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) =>
          applyLine(split.amount.toNumber(), split.category?.id),
        );
      } else {
        // No splits, use parent transaction category
        applyLine(t.amount.toNumber(), t.category?.id);
      }
    });

    // Sort by Family ID, then by Name
    // Keep zero-spend categories that have a budget so budget reports can show them
    // `budget` is already a monthly figure, so only `spent` gets averaged.
    // Refunds can exceed the spend they offset, so clamp at zero rather than
    // hand the charts a negative slice.
    return Array.from(categoryMap.values())
      .map((c) => ({ ...c, spent: this.average(Math.max(0, c.spent), divisor) }))
      .filter((c) => c.spent > 0 || c.budget > 0)
      .sort((a, b) => {
        const famA = a.familyId || '';
        const famB = b.familyId || '';
        if (famA < famB) return -1;
        if (famA > famB) return 1;
        return a.name.localeCompare(b.name);
      });
  }

  private adjustBrightness(col: string, amt: number) {
    col = col.replace(/^#/, '');
    if (col.length === 3)
      col = col[0] + col[0] + col[1] + col[1] + col[2] + col[2];

    let r = parseInt(col.substring(0, 2), 16);
    let g = parseInt(col.substring(2, 4), 16);
    let b = parseInt(col.substring(4, 6), 16);

    r = Math.max(0, Math.min(255, r + amt));
    g = Math.max(0, Math.min(255, g + amt));
    b = Math.max(0, Math.min(255, b + amt));

    const toHex = (c: number) => {
      const hex = c.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  async getSankeyData(query: GetReportsDto, profileId: string) {
    const { accountId } = query;
    const { startDate, endDate } = this.getDateRange(query);
    const divisor = await this.getAveragingDivisor(query, profileId);

    // Build where clause
    const where: any = { profileId };

    // Only add date filter if dates are provided (not all_time mode)
    if (startDate && endDate) {
      where.date = { gte: startDate, lt: endDate };
    }

    if (accountId) {
      where.accountId = accountId;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        category: { include: { parent: true } },
        splits: {
          include: {
            category: { include: { parent: true } },
          },
        },
      },
    });

    let totalIncome = 0;
    const expenseByCategory = new Map<string, number>();
    const incomeSources = new Map<string, number>();

    const applyLine = (amount: number, category?: SankeyCategory) => {
      // Money flowing back into an expense category is a refund, not income: it
      // shrinks that category's outflow instead of adding a new source.
      if (amount > 0 && category?.type !== 'EXPENSE') {
        totalIncome += amount;
        // Group income by category if present, else 'Other Income'
        const sourceName = category ? category.name : 'Other Income';
        incomeSources.set(
          sourceName,
          (incomeSources.get(sourceName) || 0) + amount,
        );
        return;
      }

      let targetName = 'Uncategorized';
      if (category) {
        targetName = category.parent ? category.parent.name : category.name;
      }
      // Outgoing amounts are negative, so subtracting adds to the outflow and a
      // positive refund nets against it.
      expenseByCategory.set(
        targetName,
        (expenseByCategory.get(targetName) || 0) - amount,
      );
    };

    transactions.forEach((t) => {
      // If transaction has splits, process each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) =>
          applyLine(split.amount.toNumber(), split.category),
        );
      } else {
        // No splits, use parent transaction
        applyLine(t.amount.toNumber(), t.category);
      }
    });

    // A category refunded more than it was charged has no outflow left to draw,
    // so drop it before it becomes an orphan node.
    expenseByCategory.forEach((val, target) => {
      if (val <= 0) expenseByCategory.delete(target);
    });

    const nodes = [
      { id: 'Income' },
      { id: 'Savings' }, // Target for remainder
      ...Array.from(incomeSources.keys()).map((id) => ({ id })),
      ...Array.from(expenseByCategory.keys()).map((id) => ({ id })),
    ];
    // Remove duplicates (e.g. if 'Salary' is both input and output? Unlikely for category names)
    // Set for uniqueness
    const uniqueNodes = Array.from(new Set(nodes.map((n) => n.id))).map(
      (id) => ({ id }),
    );

    const links = [];

    // Income Sources -> "Income" node
    incomeSources.forEach((val, source) => {
      links.push({
        source: source,
        target: 'Income',
        value: this.average(val, divisor),
      });
    });

    let totalExpenses = 0;
    // "Income" node -> Expense Categories
    expenseByCategory.forEach((val, target) => {
      totalExpenses += val;
      links.push({
        source: 'Income',
        target: target,
        value: this.average(val, divisor),
      });
    });

    // Remainder -> Savings
    const savings = totalIncome - totalExpenses;
    if (savings > 0) {
      links.push({
        source: 'Income',
        target: 'Savings',
        value: this.average(savings, divisor),
      });
    }

    return { nodes: uniqueNodes, links };
  }

  async getCostObjectBreakdown(query: GetReportsDto, profileId: string) {
    const { accountId } = query;

    if (!accountId) {
      return [];
    }

    const divisor = await this.getAveragingDivisor(query, profileId);

    // Build where clause for credit account transactions
    const where: any = { profileId, accountId };

    const { startDate, endDate } = this.getDateRange(query);
    if (startDate && endDate) {
      where.date = { gte: startDate, lt: endDate };
    }

    // Get all transactions for this account. The category type is loaded to tell
    // a refund on an expense category apart from real income.
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        costObject: true,
        category: { select: { type: true } },
        splits: {
          include: {
            costObject: true,
            category: { select: { type: true } },
          },
        },
      },
    });

    // Group by cost object
    const costObjectMap = new Map<
      string,
      {
        id: string | null;
        name: string;
        icon: string;
        color: string;
        total: number;
        count: number;
      }
    >();

    // Add "Unassigned" bucket
    costObjectMap.set('unassigned', {
      id: null,
      name: 'Unassigned',
      icon: '❓',
      color: '#94a3b8',
      total: 0,
      count: 0,
    });

    const applyLine = (
      amount: number,
      costObject?: {
        id: string;
        name: string;
        icon: string;
        color: string | null;
      } | null,
      category?: { type: string } | null,
    ) => {
      const isRefund = amount > 0;
      // A refund on an expense category nets against what that cost object was
      // charged. Any other inflow (a card payment, a transfer, real income) has
      // no place in a spend breakdown.
      if (isRefund && category?.type !== 'EXPENSE') return;

      let key = 'unassigned';
      if (costObject) {
        key = costObject.id;
        if (!costObjectMap.has(key)) {
          costObjectMap.set(key, {
            id: costObject.id,
            name: costObject.name,
            icon: costObject.icon,
            color: costObject.color || '#6366f1',
            total: 0,
            count: 0,
          });
        }
      }

      const entry = costObjectMap.get(key)!;
      // Amounts spent are negative, so subtracting builds up the total and a
      // positive refund nets against it.
      entry.total -= amount;
      // A refund adjusts a charge that was already counted, so it isn't a
      // transaction of its own as far as the count goes.
      if (!isRefund) entry.count += 1;
    };

    transactions.forEach((t) => {
      // If transaction has splits, process each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) =>
          applyLine(split.amount.toNumber(), split.costObject, split.category),
        );
      } else {
        // No splits, use parent transaction
        applyLine(t.amount.toNumber(), t.costObject, t.category);
      }
    });

    // Return sorted by total (descending), filter out zero totals
    // Both total and count are averaged so every figure in the chart reads per month
    return Array.from(costObjectMap.values())
      .filter((c) => c.total > 0)
      .map((c) => ({
        ...c,
        total: this.average(c.total, divisor),
        count:
          divisor > 1 ? Math.round((c.count / divisor) * 10) / 10 : c.count,
      }))
      .sort((a, b) => b.total - a.total);
  }

  /**
   * Number of calendar months covered by the requested period. Used as the
   * divisor for the "monthly average" view.
   *
   * Future months never count towards the divisor, so asking for the current
   * year in August averages over 8 months, not 12. For `all_time` (or a custom
   * range with an open end) the span is taken from the profile's own data.
   */
  async getPeriodMonths(
    query: GetReportsDto,
    profileId: string,
  ): Promise<number> {
    const { startDate, endDate } = this.getDateRange(query);

    let rangeStart = startDate;
    let rangeEnd = endDate; // exclusive

    if (!rangeStart || !rangeEnd) {
      const where: Prisma.TransactionWhereInput = { profileId };
      if (query.accountId) {
        where.accountId = query.accountId;
      }

      const [first, last] = await Promise.all([
        this.prisma.transaction.findFirst({
          where,
          orderBy: { date: 'asc' },
          select: { date: true },
        }),
        this.prisma.transaction.findFirst({
          where,
          orderBy: { date: 'desc' },
          select: { date: true },
        }),
      ]);

      if (!first || !last) return 1;

      rangeStart = rangeStart ?? first.date;
      if (!rangeEnd) {
        const lastMonth = startOfMonth(last.date);
        rangeEnd = new Date(
          lastMonth.getFullYear(),
          lastMonth.getMonth() + 1,
          1,
        );
      }
    }

    // Don't let months that haven't happened yet dilute the average
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    if (rangeEnd > nextMonth) {
      rangeEnd = nextMonth;
    }

    const firstMonth = startOfMonth(rangeStart);
    // endDate is exclusive, so step back a millisecond to get the last day covered
    const lastMonth = startOfMonth(new Date(rangeEnd.getTime() - 1));
    const months =
      (lastMonth.getFullYear() - firstMonth.getFullYear()) * 12 +
      (lastMonth.getMonth() - firstMonth.getMonth()) +
      1;

    return Math.max(1, months);
  }

  private async getAveragingDivisor(
    query: GetReportsDto,
    profileId: string,
  ): Promise<number> {
    if (!query.averageMonthly) return 1;
    return this.getPeriodMonths(query, profileId);
  }

  private average(value: number, divisor: number): number {
    if (divisor <= 1) return value;
    return Math.round((value / divisor) * 100) / 100;
  }

  private getDateRange(query: GetTransactionsDto): {
    startDate?: Date;
    endDate?: Date;
  } {
    const {
      filterMode,
      month,
      year,
      startDate: customStart,
      endDate: customEnd,
    } = query;
    const now = new Date();

    switch (filterMode) {
      case 'year':
        // Full year filter
        const y = year || now.getFullYear();
        return {
          startDate: new Date(y, 0, 1),
          endDate: new Date(y + 1, 0, 1),
        };

      case 'custom':
        // Custom date range
        return {
          startDate: customStart ? new Date(customStart) : undefined,
          endDate: customEnd
            ? new Date(new Date(customEnd).getTime() + 24 * 60 * 60 * 1000)
            : undefined,
        };

      case 'all_time':
        // No date filter
        return { startDate: undefined, endDate: undefined };

      case 'month':
      default:
        // Default monthly filter
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth() + 1;
        return {
          startDate: new Date(targetYear, targetMonth - 1, 1),
          endDate: new Date(targetYear, targetMonth, 1),
        };
    }
  }
}
