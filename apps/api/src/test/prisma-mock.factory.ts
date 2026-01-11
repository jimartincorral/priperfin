import { jest } from '@jest/globals';
import { MockContext, Context, createMockContext } from './context';
import { Decimal } from '../generated/client';

/**
 * Creates a deep mock of the PrismaService for unit testing.
 * Returns fresh mocks for each test to ensure isolation.
 */
export function createPrismaMock() {
  const transactionMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    aggregate: jest.fn(),
    count: jest.fn(),
  };

  const categoryMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };

  const accountMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };

  const savingsGoalMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };

  const costObjectMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };

  const transactionSplitMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
  };

  const monthlyBalanceMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  };

  const settingMock = {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    upsert: jest.fn(),
    count: jest.fn(),
  };

  const prismaMock = {
    transaction: transactionMock,
    category: categoryMock,
    account: accountMock,
    savingsGoal: savingsGoalMock,
    costObject: costObjectMock,
    transactionSplit: transactionSplitMock,
    monthlyBalance: monthlyBalanceMock,
    setting: settingMock,

    // Prisma client methods
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $transaction: jest.fn(
      (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
        return callback(prismaMock);
      },
    ),
  };

  return prismaMock;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;

/**
 * Helper to convert a plain number to Prisma Decimal
 */
export function toDecimal(value: number): Decimal {
  return new Decimal(value);
}

/**
 * Helper to reset all mocks in the Prisma mock
 */
export function resetPrismaMock(mock: PrismaMock): void {
  Object.values(mock).forEach((model) => {
    if (typeof model === 'object' && model !== null) {
      Object.values(model).forEach((method) => {
        if (typeof method === 'function' && 'mockReset' in method) {
          (method as jest.Mock).mockReset();
        }
      });
    }
  });
}
