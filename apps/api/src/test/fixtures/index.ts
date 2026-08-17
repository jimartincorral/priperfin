import { Prisma } from '../../generated/client';

type Decimal = Prisma.Decimal;
const Decimal = Prisma.Decimal;

/**
 * Test fixture factories for creating mock data.
 * Each factory accepts optional overrides to customize the returned object.
 */

// ============================================
// Transaction Fixtures
// ============================================

export interface MockTransaction {
  id: string;
  date: Date;
  amount: Decimal;
  description: string;
  categoryId: string | null;
  category?: MockCategory | null;
  accountId: string | null;
  account?: MockAccount | null;
  costObjectId: string | null;
  costObject?: MockCostObject | null;
  notes: string | null;
  suggestedCategoryId: string | null;
  externalId: string | null;
  splits?: MockTransactionSplit[];
  createdAt: Date;
  updatedAt: Date;
}

export function createMockTransaction(
  overrides: Partial<MockTransaction> = {},
): MockTransaction {
  const now = new Date();
  return {
    id: 'tx-1',
    date: new Date('2025-01-15'),
    amount: new Decimal(-50.0),
    description: 'Test Transaction',
    categoryId: 'cat-1',
    accountId: 'acc-1',
    costObjectId: null,
    notes: null,
    suggestedCategoryId: null,
    externalId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// Category Fixtures
// ============================================

export type CategoryType = 'INCOME' | 'EXPENSE' | 'GOAL';

export interface MockCategory {
  id: string;
  name: string;
  color: string | null;
  icon: string;
  budget: Decimal | null;
  type: CategoryType;
  parentId: string | null;
  parent?: MockCategory | null;
  children?: MockCategory[];
  createdAt: Date;
  updatedAt: Date;
}

export function createMockCategory(
  overrides: Partial<MockCategory> = {},
): MockCategory {
  const now = new Date();
  return {
    id: 'cat-1',
    name: 'Groceries',
    color: '#22c55e',
    icon: '🛒',
    budget: new Decimal(500),
    type: 'EXPENSE',
    parentId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// Account Fixtures
// ============================================

export type AccountType = 'DEBIT' | 'CREDIT';

export interface MockAccount {
  id: string;
  name: string;
  initialBalance: Decimal;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockAccount(
  overrides: Partial<MockAccount> = {},
): MockAccount {
  const now = new Date();
  return {
    id: 'acc-1',
    name: 'Checking Account',
    initialBalance: new Decimal(1000),
    type: 'DEBIT',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// SavingsGoal Fixtures
// ============================================

export interface MockSavingsGoal {
  id: string;
  name: string;
  targetAmount: Decimal;
  savedAmount: Decimal;
  startDate: Date;
  targetDate: Date;
  categoryId: string | null;
  category?: MockCategory | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockSavingsGoal(
  overrides: Partial<MockSavingsGoal> = {},
): MockSavingsGoal {
  const now = new Date();
  return {
    id: 'goal-1',
    name: 'Vacation Fund',
    targetAmount: new Decimal(5000),
    savedAmount: new Decimal(2000),
    startDate: new Date('2025-01-01'),
    targetDate: new Date('2025-12-31'),
    categoryId: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// CostObject Fixtures
// ============================================

export interface MockCostObject {
  id: string;
  name: string;
  color: string | null;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockCostObject(
  overrides: Partial<MockCostObject> = {},
): MockCostObject {
  const now = new Date();
  return {
    id: 'cost-1',
    name: 'Project Alpha',
    color: '#3b82f6',
    icon: '📁',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// TransactionSplit Fixtures
// ============================================

export interface MockTransactionSplit {
  id: string;
  parentId: string;
  amount: Decimal;
  categoryId: string | null;
  category?: MockCategory | null;
  costObjectId: string | null;
  costObject?: MockCostObject | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockTransactionSplit(
  overrides: Partial<MockTransactionSplit> = {},
): MockTransactionSplit {
  const now = new Date();
  return {
    id: 'split-1',
    parentId: 'tx-1',
    amount: new Decimal(-25.0),
    categoryId: 'cat-1',
    costObjectId: null,
    description: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// MonthlyBalance Fixtures
// ============================================

export interface MockMonthlyBalance {
  id: string;
  month: string;
  balance: Decimal;
  accountId: string | null;
  account?: MockAccount | null;
  createdAt: Date;
  updatedAt: Date;
}

export function createMockMonthlyBalance(
  overrides: Partial<MockMonthlyBalance> = {},
): MockMonthlyBalance {
  const now = new Date();
  return {
    id: 'bal-1',
    month: '2025-01',
    balance: new Decimal(1500),
    accountId: 'acc-1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

// ============================================
// Setting Fixtures
// ============================================

export interface MockSetting {
  key: string;
  value: string;
}

export function createMockSetting(
  overrides: Partial<MockSetting> = {},
): MockSetting {
  return {
    key: 'theme',
    value: 'dark',
    ...overrides,
  };
}

// ============================================
// Bulk Data Helpers
// ============================================

/**
 * Creates multiple mock transactions with sequential IDs
 */
export function createMockTransactions(
  count: number,
  overrides: Partial<MockTransaction> = {},
): MockTransaction[] {
  return Array.from({ length: count }, (_, i) =>
    createMockTransaction({
      id: `tx-${i + 1}`,
      description: `Transaction ${i + 1}`,
      ...overrides,
    }),
  );
}

/**
 * Creates a parent category with children
 */
export function createMockCategoryWithChildren(
  parentOverrides: Partial<MockCategory> = {},
  childCount: number = 2,
): MockCategory {
  const parent = createMockCategory({
    id: 'parent-cat-1',
    name: 'Food & Dining',
    ...parentOverrides,
  });

  parent.children = Array.from({ length: childCount }, (_, i) =>
    createMockCategory({
      id: `child-cat-${i + 1}`,
      name: `Child Category ${i + 1}`,
      parentId: parent.id,
    }),
  );

  return parent;
}
