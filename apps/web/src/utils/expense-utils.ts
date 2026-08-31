/**
 * Expense utility functions extracted for testing
 */

export interface TransactionSplit {
  id?: string;
  amount: number;
  categoryId?: string | null;
  description?: string | null;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  categoryId: string | null;
  notes?: string;
  splits?: TransactionSplit[];
}

export interface Category {
  id: string;
  name: string;
  type?: 'INCOME' | 'EXPENSE' | 'GOAL' | string;
  parentId: string | null;
  budget?: number;
}

export interface FilterOptions {
  filterText?: string;
  filterMinAmount?: number | null;
  filterMaxAmount?: number | null;
  filterDateFrom?: string;
  filterDateTo?: string;
  filterCategoryId?: string;
}

/**
 * Filter transactions based on various criteria
 */
export function filterTransactions(
  transactions: Transaction[],
  categories: Category[],
  options: FilterOptions
): Transaction[] {
  let filtered = [...transactions];

  // Filter by text (description or notes)
  if (options.filterText) {
    const lower = options.filterText.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.description.toLowerCase().includes(lower) ||
        (t.notes && t.notes.toLowerCase().includes(lower))
    );
  }

  // Filter by min amount
  if (options.filterMinAmount !== null && options.filterMinAmount !== undefined) {
    filtered = filtered.filter((t) => Math.abs(t.amount) >= options.filterMinAmount!);
  }

  // Filter by max amount
  if (options.filterMaxAmount !== null && options.filterMaxAmount !== undefined) {
    filtered = filtered.filter((t) => Math.abs(t.amount) <= options.filterMaxAmount!);
  }

  // Filter by date from
  if (options.filterDateFrom) {
    filtered = filtered.filter(
      (t) => new Date(t.date).toISOString().split('T')[0] >= options.filterDateFrom!
    );
  }

  // Filter by date to
  if (options.filterDateTo) {
    filtered = filtered.filter(
      (t) => new Date(t.date).toISOString().split('T')[0] <= options.filterDateTo!
    );
  }

  // Filter by category (including subcategories for parent categories)
  if (options.filterCategoryId) {
    if (options.filterCategoryId === 'uncategorized') {
      filtered = filtered.filter(
        (t) => !t.categoryId || t.categoryId === 'uncategorized'
      );
    } else {
      const isParent = categories.some(
        (c) => c.id === options.filterCategoryId && !c.parentId
      );
      if (isParent) {
        const children = categories
          .filter((c) => c.parentId === options.filterCategoryId)
          .map((c) => c.id);
        const ids = [options.filterCategoryId, ...children];
        filtered = filtered.filter((t) => ids.includes(t.categoryId || ''));
      } else {
        filtered = filtered.filter((t) => t.categoryId === options.filterCategoryId);
      }
    }
  }

  return filtered;
}

/**
 * Sort transactions by field with optional multi-level sorting
 */
export function sortTransactions(
  transactions: Transaction[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    let result = compare(a, b, sortField, sortDirection);
    if (result !== 0) return result;

    // Secondary sort: Date (always descending)
    if (sortField !== 'date') {
      result = compare(a, b, 'date', 'desc');
      if (result !== 0) return result;
    }

    // Tertiary sort: Description (alphabetical)
    if (sortField !== 'description') {
      result = compare(a, b, 'description', 'asc');
    }

    return result;
  });
}

function compare(
  a: Transaction,
  b: Transaction,
  field: string,
  direction: 'asc' | 'desc'
): number {
  let valA: any = (a as any)[field];
  let valB: any = (b as any)[field];

  // Handle special cases
  if (field === 'date') {
    valA = new Date(valA).getTime();
    valB = new Date(valB).getTime();
  } else if (typeof valA === 'string') {
    valA = valA.toLowerCase();
    valB = (valB || '').toLowerCase();
  }

  if (valA < valB) return direction === 'asc' ? -1 : 1;
  if (valA > valB) return direction === 'asc' ? 1 : -1;
  return 0;
}

/**
 * Calculate remaining budget for a category
 */
export function calculateBudgetRemaining(
  categoryId: string,
  transactions: Transaction[],
  categories: Category[]
): number | null {
  const category = categories.find((c) => c.id === categoryId);
  if (!category || !category.budget) return null;

  // Sum all expenses for this category (and subcategories)
  const children = categories.filter((c) => c.parentId === categoryId).map((c) => c.id);
  const categoryIds = [categoryId, ...children];

  const spent = transactions
    .filter((t) => t.amount < 0 && categoryIds.includes(t.categoryId || ''))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return category.budget - spent;
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Calculate total pages
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  return Math.ceil(totalItems / pageSize) || 1;
}

export interface MonthlyStats {
  income: number;
  expense: number;
}

/**
 * Calculate income and expense sums from transactions.
 * Positive amounts and INCOME category transactions are counted as income.
 * Negative amounts are counted as expenses (positive magnitude).
 * Split transactions are properly aggregated without dropping uncategorized splits.
 */
export function calculateMonthlyStats(
  transactions: Transaction[],
  categories: Category[],
): MonthlyStats {
  let income = 0;
  let expense = 0;

  const processLine = (amount: number | string, categoryId?: string | null) => {
    const numAmt = Number(amount);
    if (!Number.isFinite(numAmt)) return;

    const cat = categoryId ? categories.find((c) => c.id === categoryId) : null;
    const isIncome = cat?.type === 'INCOME' || numAmt > 0;

    if (isIncome) {
      income += numAmt;
    } else {
      // Expenses are stored as negative, so subtract to get positive magnitude
      expense -= numAmt;
    }
  };

  transactions.forEach((t) => {
    if (t.splits && t.splits.length > 0) {
      t.splits.forEach((split) => {
        processLine(split.amount, split.categoryId);
      });
    } else {
      processLine(t.amount, t.categoryId);
    }
  });

  return { income, expense };
}
