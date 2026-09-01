import { Test, TestingModule } from '@nestjs/testing';
import { BankSyncService } from './bank-sync.service';
import { EnableBankingService } from './enable-banking.service';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

describe('BankSyncService', () => {
  let service: BankSyncService;
  let mockPrismaService: any;
  let mockEnableBankingService: any;
  let mockTransactionsService: any;

  beforeEach(async () => {
    mockPrismaService = {
      setting: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
      bankConnection: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      account: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };

    mockEnableBankingService = {
      getBanks: jest.fn(),
      startAuth: jest.fn(),
      createSession: jest.fn(),
      getAccountDetails: jest.fn(),
      getAccountBalances: jest.fn(),
      getAccountTransactions: jest.fn(),
    };

    mockTransactionsService = {
      createMany: jest.fn(),
      generateHash: jest.fn().mockReturnValue('mock-hash'),
      calculateDescriptionSimilarity: jest.fn().mockReturnValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BankSyncService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EnableBankingService, useValue: mockEnableBankingService },
        { provide: TransactionsService, useValue: mockTransactionsService },
      ],
    }).compile();

    service = module.get<BankSyncService>(BankSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return settings status accurately', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          if (where.key === 'enable_banking_redirect_url')
            return Promise.resolve({ value: 'https://example.com/callback' });
          return Promise.resolve(null);
        },
      );

      const result = await service.getSettings();
      expect(result).toEqual({
        hasAppId: true,
        hasKey: true,
        redirectUrl: 'https://example.com/callback',
        autoSyncEnabled: true,
        initialLookbackDays: 90,
      });
    });

    it('should respect custom initialLookbackDays setting', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          if (where.key === 'enable_banking_initial_lookback_days')
            return Promise.resolve({ value: '180' });
          return Promise.resolve(null);
        },
      );

      const result = await service.getSettings();
      expect(result.initialLookbackDays).toBe(180);
    });

    it('should respect disabled autoSyncEnabled setting', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          if (where.key === 'enable_banking_auto_sync_enabled')
            return Promise.resolve({ value: 'false' });
          return Promise.resolve(null);
        },
      );

      const result = await service.getSettings();
      expect(result.autoSyncEnabled).toBe(false);
    });
  });

  describe('startAuth', () => {
    it('should call startAuth on EnableBankingService with Abanca details and redirect URL', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          if (where.key === 'enable_banking_redirect_url')
            return Promise.resolve({ value: 'https://example.com/callback' });
          return Promise.resolve(null);
        },
      );

      mockEnableBankingService.startAuth.mockResolvedValue({
        url: 'https://auth.enablebanking.com/aspsp/abanca-auth-link',
      });

      const result = await service.startAuth('Abanca', 'ES');
      expect(result.url).toBe(
        'https://auth.enablebanking.com/aspsp/abanca-auth-link',
      );
      expect(result.state).toBeDefined();
      expect(mockEnableBankingService.startAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          aspsp: { name: 'Abanca', country: 'ES' },
          redirect_url: 'https://example.com/callback',
        }),
        'my-app-id',
        'my-key',
      );
    });
  });

  describe('handleCallback', () => {
    it('should exchange code for session and store bank connection', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          return Promise.resolve(null);
        },
      );

      mockEnableBankingService.createSession.mockResolvedValue({
        session_id: 'session-123',
        aspsp: { name: 'Abanca', country: 'ES' },
        access: { valid_until: '2026-11-30T00:00:00Z' },
        accounts: ['acc-uid-1'],
      });

      mockEnableBankingService.getAccountDetails.mockResolvedValue({
        uid: 'acc-uid-1',
        account_id: { iban: 'ES9120800000000000000000' },
        currency: 'EUR',
        name: 'Cuenta Nómina Abanca',
      });

      mockPrismaService.bankConnection.upsert.mockResolvedValue({
        id: 'conn-1',
        aspspName: 'Abanca',
        aspspCountry: 'ES',
        validUntil: new Date('2026-11-30T00:00:00Z'),
      });

      const result = await service.handleCallback('code-xyz', 'profile-1');
      expect(result.connectionId).toBe('conn-1');
      expect(result.aspspName).toBe('Abanca');
      expect(result.accounts.length).toBe(1);
      expect(result.accounts[0].account_id?.iban).toBe(
        'ES9120800000000000000000',
      );
    });
  });

  describe('syncTransactions', () => {
    it('should prioritize value_date over booking_date when mapping transactions', async () => {
      mockPrismaService.setting.findUnique.mockImplementation(
        ({ where }: any) => {
          if (where.key === 'enable_banking_app_id')
            return Promise.resolve({ value: 'my-app-id' });
          if (where.key === 'enable_banking_key')
            return Promise.resolve({ value: 'my-key' });
          return Promise.resolve(null);
        },
      );

      mockPrismaService.account.findMany.mockResolvedValue([
        {
          id: 'acc-1',
          name: 'Main Checking',
          bankAccountUid: 'uid-1',
          lastSyncedAt: new Date('2026-08-25T00:00:00Z'),
          bankConnection: {
            id: 'conn-1',
            validUntil: new Date('2026-11-30T00:00:00Z'),
          },
        },
      ]);

      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [
          {
            transaction_id: 'tx-1',
            booking_date: '2026-09-01',
            value_date: '2026-08-31',
            transaction_amount: { amount: '45.50', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            remittance_information: ['Supermarket purchase'],
          },
        ],
      });

      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockTransactionsService.createMany.mockResolvedValue({
        newCount: 1,
        duplicateCount: 0,
      });
      mockPrismaService.account.update.mockResolvedValue({});

      const result = await service.syncTransactions('acc-1', 'profile-1');
      expect(result.newCount).toBe(1);

      expect(mockTransactionsService.createMany).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            date: new Date('2026-08-31').toISOString(),
            amount: -45.5,
            description: 'Supermarket purchase',
          }),
        ]),
        false,
        [],
        'profile-1',
        true,
      );
    });
  });
});
