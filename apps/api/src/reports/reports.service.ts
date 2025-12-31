import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetTransactionsDto } from '../transactions/get-transactions.dto';
import { Prisma } from '../generated/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getCategoryBreakdown(query: GetTransactionsDto) {
    const { month, year, accountId } = query;
    const { startDate, endDate } = this.getDateRange(month, year);

    // Build where clause
    const where: any = {
      date: { gte: startDate, lt: endDate },
      amount: { lt: 0 }, // Expenses
    };

    if (accountId) {
      where.accountId = accountId;
    }

    // Get expenses only
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
        name: string;
        color: string;
        spent: number;
        budget: number;
        icon: string;
        familyId?: string;
      }
    >();

    // Initialize with ALL Expense categories
    const categories = await this.prisma.category.findMany({
      where: { type: 'EXPENSE' },
      orderBy: { name: 'asc' },
    });

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
      familyBaseColors.set(fId, palette[colorIndex % palette.length]);
      colorIndex++;
    });

    // 3. Assign Colors to Categories
    categories.forEach((c) => {
      const familyId = c.parentId || c.id;
      const baseColor = familyBaseColors.get(familyId) || '#cccccc';

      // Calculate shade
      let finalColor = baseColor;
      const siblings = familyMap.get(familyId) || [];

      if (siblings.length > 1) {
        // If there are multiple items in this family, vary the shade
        const index = siblings.indexOf(c.id);
        // Vary by simply adjusting brightness based on index
        // Alternating darken/lighten to keep it close to base?
        // Or just progressive steps.
        // Let's do: (index * 20) - (siblings.length * 10)?
        // Simple variation:
        const variance = (index * 15) % 60;
        // We want some to be lighter, some darker than base.
        // if base is index 0: 0
        // index 1: +15
        // index 2: +30
        // index 3: +45
        finalColor = this.adjustBrightness(baseColor, variance - 10);
      }

      categoryMap.set(c.id, {
        name: c.name,
        color: finalColor,
        icon: c.icon,
        spent: 0,
        budget: c.budget ? c.budget.toNumber() : 0,
        familyId: familyId, // Used for sorting
      });
    });

    // Add Uncategorized bucket
    categoryMap.set('uncategorized', {
      name: 'Uncategorized',
      color: '#94a3b8',
      icon: '?',
      spent: 0,
      budget: 0,
      familyId: 'zzzzzz', // Ensure it's last
    });

    // Aggregate
    transactions.forEach((t) => {
      // If transaction has splits, aggregate each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) => {
          let targetId = 'uncategorized';

          if (split.category) {
            targetId = split.category.id;
          }

          if (categoryMap.has(targetId)) {
            const current = categoryMap.get(targetId);
            if (current) {
              current.spent += Math.abs(split.amount.toNumber());
            }
          } else {
            const current = categoryMap.get('uncategorized');
            if (current) current.spent += Math.abs(split.amount.toNumber());
          }
        });
      } else {
        // No splits, use parent transaction category
        let targetId = 'uncategorized';

        if (t.category) {
          targetId = t.category.id;
        }

        if (categoryMap.has(targetId)) {
          const current = categoryMap.get(targetId);
          if (current) {
            current.spent += Math.abs(t.amount.toNumber());
          }
        } else {
          const current = categoryMap.get('uncategorized');
          if (current) current.spent += Math.abs(t.amount.toNumber());
        }
      }
    });

    // Sort by Family ID, then by Name
    return Array.from(categoryMap.values())
      .filter((c) => c.spent > 0)
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

  async getSankeyData(query: GetTransactionsDto) {
    const { month, year, accountId } = query;
    const { startDate, endDate } = this.getDateRange(month, year);

    // Build where clause
    const where: any = {
      date: { gte: startDate, lt: endDate },
    };

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

    transactions.forEach((t) => {
      // If transaction has splits, process each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) => {
          const amt = split.amount.toNumber();
          if (amt > 0) {
            totalIncome += amt;
            const sourceName = split.category ? split.category.name : 'Other Income';
            incomeSources.set(
              sourceName,
              (incomeSources.get(sourceName) || 0) + amt,
            );
          } else {
            const absAmt = Math.abs(amt);
            let targetName = 'Uncategorized';
            if (split.category) {
              targetName = split.category.parent
                ? split.category.parent.name
                : split.category.name;
            }
            expenseByCategory.set(
              targetName,
              (expenseByCategory.get(targetName) || 0) + absAmt,
            );
          }
        });
      } else {
        // No splits, use parent transaction
        const amt = t.amount.toNumber();
        if (amt > 0) {
          totalIncome += amt;
          // Group income by category if present, else 'Other Income'
          const sourceName = t.category ? t.category.name : 'Other Income';
          incomeSources.set(
            sourceName,
            (incomeSources.get(sourceName) || 0) + amt,
          );
        } else {
          const absAmt = Math.abs(amt);
          let targetName = 'Uncategorized';
          if (t.category) {
            targetName = t.category.parent
              ? t.category.parent.name
              : t.category.name;
          }
          expenseByCategory.set(
            targetName,
            (expenseByCategory.get(targetName) || 0) + absAmt,
          );
        }
      }
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
      links.push({ source: source, target: 'Income', value: val });
    });

    let totalExpenses = 0;
    // "Income" node -> Expense Categories
    expenseByCategory.forEach((val, target) => {
      totalExpenses += val;
      links.push({ source: 'Income', target: target, value: val });
    });

    // Remainder -> Savings
    const savings = totalIncome - totalExpenses;
    if (savings > 0) {
      links.push({ source: 'Income', target: 'Savings', value: savings });
    }

    return { nodes: uniqueNodes, links };
  }

  async getCostObjectBreakdown(query: GetTransactionsDto) {
    const { month, year, accountId } = query;

    if (!accountId) {
      return [];
    }

    // Build where clause for credit account transactions
    const where: any = { accountId };

    if (month && year) {
      const { startDate, endDate } = this.getDateRange(month, year);
      where.date = { gte: startDate, lt: endDate };
    }

    // Get all transactions for this account
    const transactions = await this.prisma.transaction.findMany({
      where,
      include: {
        costObject: true,
        splits: {
          include: {
            costObject: true,
          },
        },
      },
    });

    // Group by cost object
    const costObjectMap = new Map<
      string,
      { id: string | null; name: string; icon: string; color: string; total: number; count: number }
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

    transactions.forEach((t) => {
      // If transaction has splits, process each split separately
      if (t.splits && t.splits.length > 0) {
        t.splits.forEach((split) => {
          const amt = split.amount.toNumber();
          // Only count expenses (negative amounts) for credit card breakdown
          if (amt >= 0) return;

          const absAmt = Math.abs(amt);

          if (split.costObject) {
            const key = split.costObject.id;
            if (!costObjectMap.has(key)) {
              costObjectMap.set(key, {
                id: split.costObject.id,
                name: split.costObject.name,
                icon: split.costObject.icon,
                color: split.costObject.color || '#6366f1',
                total: 0,
                count: 0,
              });
            }
            const entry = costObjectMap.get(key)!;
            entry.total += absAmt;
            entry.count += 1;
          } else {
            const unassigned = costObjectMap.get('unassigned')!;
            unassigned.total += absAmt;
            unassigned.count += 1;
          }
        });
      } else {
        // No splits, use parent transaction
        const amt = t.amount.toNumber();
        // Only count expenses (negative amounts) for credit card breakdown
        if (amt >= 0) return;

        const absAmt = Math.abs(amt);

        if (t.costObject) {
          const key = t.costObject.id;
          if (!costObjectMap.has(key)) {
            costObjectMap.set(key, {
              id: t.costObject.id,
              name: t.costObject.name,
              icon: t.costObject.icon,
              color: t.costObject.color || '#6366f1',
              total: 0,
              count: 0,
            });
          }
          const entry = costObjectMap.get(key)!;
          entry.total += absAmt;
          entry.count += 1;
        } else {
          const unassigned = costObjectMap.get('unassigned')!;
          unassigned.total += absAmt;
          unassigned.count += 1;
        }
      }
    });

    // Return sorted by total (descending), filter out zero totals
    return Array.from(costObjectMap.values())
      .filter((c) => c.total > 0)
      .sort((a, b) => b.total - a.total);
  }

  private getDateRange(month?: number, year?: number) {
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 1); // Auto handles year rollover if m=12 -> next year Jan
    return { startDate, endDate };
  }
}
