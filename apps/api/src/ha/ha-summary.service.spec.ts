import { Test } from '@nestjs/testing';
import { Decimal } from '@prisma/client-runtime-utils';
import { HaSummaryService } from './ha-summary.service';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { BankSyncService } from '../bank-sync/bank-sync.service';

describe('HaSummaryService', () => {
  const profile = { id: 'profile-1', name: 'Jose' };
  const now = new Date('2026-10-09T12:00:00.000Z');

  const prisma = {
    setting: { findUnique: jest.fn() },
    transaction: { count: jest.fn() },
    ruleSuggestion: { count: jest.fn() },
  };
  const accounts = { findAll: jest.fn() };
  const transactions = { getAccountBalance: jest.fn() };
  const reports = {
    getCashFlowTotals: jest.fn(),
    getCategoryBreakdown: jest.fn(),
  };
  const goals = { findAll: jest.fn() };
  const bankSync = { getConnections: jest.fn() };

  let service: HaSummaryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    prisma.setting.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.key === 'currency' ? { key: 'currency', value: 'EUR' } : null,
      ),
    );
    prisma.transaction.count.mockResolvedValue(3);
    prisma.ruleSuggestion.count.mockResolvedValue(2);
    reports.getCashFlowTotals.mockResolvedValue({
      income: 3000,
      expenses: 1200.5,
      net: 1799.5,
    });
    reports.getCategoryBreakdown.mockResolvedValue([]);
    accounts.findAll.mockResolvedValue([]);
    goals.findAll.mockResolvedValue([]);
    bankSync.getConnections.mockResolvedValue([]);

    const module = await Test.createTestingModule({
      providers: [
        HaSummaryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AccountsService, useValue: accounts },
        { provide: TransactionsService, useValue: transactions },
        { provide: ReportsService, useValue: reports },
        { provide: SavingsGoalsService, useValue: goals },
        { provide: BankSyncService, useValue: bankSync },
      ],
    }).compile();
    service = module.get(HaSummaryService);
  });

  it('reports counts, month totals and currency for the current UTC month', async () => {
    const summary = await service.getSummary(profile, now);

    expect(summary.profile).toEqual(profile);
    expect(summary.currency).toBe('EUR');
    expect(summary.uncategorizedCount).toBe(3);
    expect(summary.pendingSuggestions).toBe(2);
    expect(summary.month).toEqual({
      year: 2026,
      month: 10,
      income: 3000,
      expenses: 1200.5,
      net: 1799.5,
    });
    expect(reports.getCashFlowTotals).toHaveBeenCalledWith('profile-1', {
      gte: new Date('2026-10-01T00:00:00.000Z'),
      lt: new Date('2026-11-01T00:00:00.000Z'),
    });
    expect(prisma.transaction.count).toHaveBeenCalledWith({
      where: { profileId: 'profile-1', categoryId: null, isTransfer: false },
    });
    expect(summary.bank).toEqual({
      connectionCount: 0,
      lastSyncAt: null,
      expired: false,
      daysUntilExpiry: null,
    });
    expect(summary.lastImport).toBeNull();
  });

  it('sums account balances the way the Expenses screen shows them', async () => {
    accounts.findAll.mockResolvedValue([
      { id: 'a1', name: 'Checking', type: 'DEBIT' },
      { id: 'a2', name: 'Card', type: 'CREDIT' },
    ]);
    transactions.getAccountBalance.mockImplementation((id: string) =>
      Promise.resolve({
        balance: id === 'a1' ? 1500.456 : -200,
        type: 'DEBIT',
        accountName: id,
      }),
    );

    const summary = await service.getSummary(profile, now);

    expect(summary.accounts).toEqual([
      { id: 'a1', name: 'Checking', type: 'DEBIT', balance: 1500.46 },
      { id: 'a2', name: 'Card', type: 'CREDIT', balance: -200 },
    ]);
    expect(summary.totalBalance).toBe(1300.46);
  });

  it('judges a budgeted parent on its own plus its children spend', async () => {
    reports.getCategoryBreakdown.mockResolvedValue([
      { id: 'food', name: 'Food', spent: 50, budget: 300, parentId: undefined },
      {
        id: 'groceries',
        name: 'Groceries',
        spent: 200,
        budget: 0,
        parentId: 'food',
      },
      {
        id: 'dining',
        name: 'Dining',
        spent: 120,
        budget: 100,
        parentId: 'food',
      },
      { id: 'fun', name: 'Fun', spent: 20, budget: 80, parentId: undefined },
      {
        id: 'uncategorized',
        name: 'Uncategorized',
        spent: 999,
        budget: 0,
        parentId: undefined,
      },
    ]);

    const summary = await service.getSummary(profile, now);

    // Food: 50 + 200 + 120 = 370 > 300 (over). Dining: 120 > 100 (over). Fun: 20 of 80.
    expect(summary.budgets).toEqual({
      budgetedCategories: 3,
      overBudgetCount: 2,
      remaining: 60,
    });
  });

  it('counts goals behind schedule and money left to reach them', async () => {
    goals.findAll.mockResolvedValue([
      {
        savedAmount: new Decimal(100),
        targetAmount: new Decimal(1000),
        shouldHaveSaved: 500,
      }, // behind
      {
        savedAmount: new Decimal(900),
        targetAmount: new Decimal(1000),
        shouldHaveSaved: 500,
      }, // ahead
      {
        savedAmount: new Decimal(1200),
        targetAmount: new Decimal(1000),
        shouldHaveSaved: 900,
      }, // completed, over target
      {
        savedAmount: new Decimal(300),
        targetAmount: new Decimal(600),
        shouldHaveSaved: null,
      }, // evergreen: on track
    ]);

    const summary = await service.getSummary(profile, now);

    expect(summary.goals).toEqual({
      count: 4,
      totalSaved: 2500,
      totalLeft: 1300,
      behindCount: 1,
    });
  });

  it('reports the latest sync, expiry and the earliest consent countdown', async () => {
    bankSync.getConnections.mockResolvedValue([
      {
        isExpired: false,
        daysRemaining: 40,
        linkedAccounts: [
          { lastSyncedAt: new Date('2026-10-08T06:00:00Z') },
          { lastSyncedAt: null },
        ],
      },
      {
        isExpired: true,
        daysRemaining: 0,
        linkedAccounts: [{ lastSyncedAt: new Date('2026-09-01T06:00:00Z') }],
      },
    ]);

    const summary = await service.getSummary(profile, now);

    expect(summary.bank).toEqual({
      connectionCount: 2,
      lastSyncAt: '2026-10-08T06:00:00.000Z',
      expired: true,
      daysUntilExpiry: 0,
    });
  });

  it('parses the last-import marker and ignores a corrupt one', async () => {
    prisma.setting.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.key === 'ha_last_import_profile_profile-1'
          ? {
              key: where.key,
              value: JSON.stringify({
                at: '2026-10-09T06:00:00.000Z',
                newCount: 7,
                uncategorizedCount: 2,
              }),
            }
          : null,
      ),
    );
    let summary = await service.getSummary(profile, now);
    expect(summary.lastImport).toEqual({
      at: '2026-10-09T06:00:00.000Z',
      newCount: 7,
      uncategorizedCount: 2,
    });
    expect(summary.currency).toBeNull();

    prisma.setting.findUnique.mockImplementation(({ where }) =>
      Promise.resolve(
        where.key.startsWith('ha_last_import')
          ? { key: where.key, value: '{not json' }
          : null,
      ),
    );
    summary = await service.getSummary(profile, now);
    expect(summary.lastImport).toBeNull();
  });
});
