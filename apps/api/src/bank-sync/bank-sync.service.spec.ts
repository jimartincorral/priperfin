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
        update: jest.fn().mockResolvedValue({}),
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
        create: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn().mockResolvedValue({
          _count: { _all: 0 },
          _sum: { amount: null },
          _min: { date: null },
        }),
      },
    };

    mockEnableBankingService = {
      getBanks: jest.fn(),
      startAuth: jest.fn(),
      createSession: jest.fn(),
      getAccountDetails: jest.fn(),
      getAccountBalances: jest.fn(),
      getAccountTransactions: jest.fn(),
      getSession: jest.fn(),
      deleteSession: jest.fn(),
    };

    mockTransactionsService = {
      createMany: jest.fn(),
      generateHash: jest.fn().mockReturnValue('mock-hash'),
      calculateDescriptionSimilarity: jest.fn().mockReturnValue(0),
      findTransferMatches: jest.fn().mockResolvedValue([]),
      linkAsTransfer: jest.fn().mockResolvedValue({}),
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

      mockEnableBankingService.getBanks.mockResolvedValue({
        aspsps: [
          {
            name: 'Abanca',
            country: 'ES',
            logo: 'https://enablebanking.com/brands/ES/Abanca/',
          },
        ],
      });

      const result = await service.handleCallback('code-xyz', 'profile-1');
      expect(
        mockPrismaService.bankConnection.upsert.mock.calls[0][0].create
          .aspspLogoUrl,
      ).toBe('https://enablebanking.com/brands/ES/Abanca/');
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

  const credentials = () =>
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

  const linkedAccount = (over: any = {}) => ({
    id: 'acc-1',
    name: 'Main Checking',
    bankAccountUid: 'uid-1',
    bankConnectionId: 'conn-1',
    lastSyncedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    bankPendingFrom: null,
    bankConnection: {
      id: 'conn-1',
      sessionId: 'session-1',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    ...over,
  });

  describe('consent length', () => {
    it("asks for the bank's maximum consent", async () => {
      credentials();
      mockEnableBankingService.getBanks.mockResolvedValue({
        aspsps: [
          { name: 'Other', country: 'ES', maximum_consent_validity: 1 },
          {
            name: 'Abanca',
            country: 'ES',
            maximum_consent_validity: 180 * 24 * 3600,
          },
        ],
      });
      mockEnableBankingService.startAuth.mockResolvedValue({ url: 'u' });

      await service.startAuth('Abanca', 'ES');
      const validUntil = new Date(
        mockEnableBankingService.startAuth.mock.calls[0][0].access.valid_until,
      );
      const days = (validUntil.getTime() - Date.now()) / 86400000;
      expect(days).toBeGreaterThan(179.9);
      expect(days).toBeLessThan(180);
    });

    it('falls back to 90 days when the bank list cannot be read', async () => {
      credentials();
      mockEnableBankingService.getBanks.mockRejectedValue(new Error('down'));
      mockEnableBankingService.startAuth.mockResolvedValue({ url: 'u' });

      await service.startAuth('Abanca', 'ES');
      const validUntil = new Date(
        mockEnableBankingService.startAuth.mock.calls[0][0].access.valid_until,
      );
      const days = (validUntil.getTime() - Date.now()) / 86400000;
      expect(days).toBeGreaterThan(89.9);
      expect(days).toBeLessThan(90);
    });
  });

  describe('re-authentication', () => {
    const newSession = () => {
      credentials();
      mockEnableBankingService.createSession.mockResolvedValue({
        session_id: 'session-new',
        aspsp: { name: 'Abanca', country: 'ES' },
        access: { valid_until: '2027-05-01T00:00:00Z' },
        accounts: ['uid-new'],
      });
      mockEnableBankingService.getAccountDetails.mockResolvedValue({
        uid: 'uid-new',
        account_id: { iban: 'ES91 2100 0418 4502 0005 1332' },
      });
      mockPrismaService.bankConnection.upsert.mockResolvedValue({
        id: 'conn-new',
        aspspName: 'Abanca',
        validUntil: new Date('2027-05-01T00:00:00Z'),
      });
      mockPrismaService.bankConnection.delete.mockResolvedValue({});
    };
    const future = new Date(Date.now() + 30 * 86400000);

    it('replaces and revokes the connection it renews', async () => {
      newSession();
      mockPrismaService.bankConnection.findMany.mockResolvedValue([
        {
          id: 'conn-old',
          sessionId: 'session-old',
          validUntil: future,
          accountsJson: JSON.stringify([
            {
              uid: 'uid-old',
              account_id: { iban: 'ES9121000418450200051332' },
            },
          ]),
          accounts: [{ id: 'acc-1', name: 'Main', bankAccountUid: 'uid-old' }],
        },
      ]);

      await service.handleCallback('code', 'profile-1');

      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { bankConnectionId: 'conn-new', bankAccountUid: 'uid-new' },
      });
      expect(mockEnableBankingService.deleteSession).toHaveBeenCalledWith(
        'session-old',
        'my-app-id',
        'my-key',
      );
      expect(mockPrismaService.bankConnection.delete).toHaveBeenCalledWith({
        where: { id: 'conn-old' },
      });
    });

    it('keeps a second, unrelated login at the same bank', async () => {
      newSession();
      mockPrismaService.bankConnection.findMany.mockResolvedValue([
        {
          id: 'conn-joint',
          sessionId: 'session-joint',
          validUntil: future,
          accountsJson: JSON.stringify([
            {
              uid: 'uid-joint',
              account_id: { iban: 'ES7620770024003102575766' },
            },
          ]),
          accounts: [
            { id: 'acc-2', name: 'Joint', bankAccountUid: 'uid-joint' },
          ],
        },
      ]);

      await service.handleCallback('code', 'profile-1');

      expect(mockPrismaService.account.update).not.toHaveBeenCalled();
      expect(mockEnableBankingService.deleteSession).not.toHaveBeenCalled();
      expect(mockPrismaService.bankConnection.delete).not.toHaveBeenCalled();
    });
  });

  describe('createLinkedAccount', () => {
    const connection = {
      id: 'conn-1',
      aspspName: 'Abanca',
      accountsJson: JSON.stringify([
        {
          uid: 'card-uid',
          product: 'Visa Oro',
          cash_account_type: 'CARD',
          account_id: { iban: 'ES9121000418450200051332' },
        },
      ]),
    };

    it('creates a credit account for a card and links it', async () => {
      mockPrismaService.bankConnection.findFirst.mockResolvedValue(connection);
      mockPrismaService.account.findFirst.mockResolvedValue(null);
      mockPrismaService.account.create.mockResolvedValue({ id: 'acc-new' });

      await service.createLinkedAccount('conn-1', 'card-uid', 'profile-1');

      expect(mockPrismaService.account.create).toHaveBeenCalledWith({
        data: {
          name: 'Visa Oro ··1332',
          type: 'CREDIT',
          initialBalance: 0,
          profileId: 'profile-1',
          bankConnectionId: 'conn-1',
          bankAccountUid: 'card-uid',
        },
      });
    });

    it('refuses a bank account that is already linked or unknown', async () => {
      mockPrismaService.bankConnection.findFirst.mockResolvedValue(connection);
      mockPrismaService.account.findFirst.mockResolvedValue({ name: 'Visa' });
      await expect(
        service.createLinkedAccount('conn-1', 'card-uid', 'profile-1'),
      ).rejects.toThrow('already linked');
      await expect(
        service.createLinkedAccount('conn-1', 'other-uid', 'profile-1'),
      ).rejects.toThrow('not found');
      expect(mockPrismaService.account.create).not.toHaveBeenCalled();
    });
  });

  describe('deleteConnection', () => {
    it('revokes the session at Enable Banking before removing it', async () => {
      credentials();
      mockPrismaService.bankConnection.findFirst.mockResolvedValue({
        id: 'conn-1',
        sessionId: 'session-1',
      });
      mockPrismaService.bankConnection.delete.mockResolvedValue({});

      await service.deleteConnection('conn-1', 'profile-1');
      expect(mockEnableBankingService.deleteSession).toHaveBeenCalledWith(
        'session-1',
        'my-app-id',
        'my-key',
      );
      expect(mockPrismaService.bankConnection.delete).toHaveBeenCalled();
    });

    it('still removes the connection when revoking fails', async () => {
      credentials();
      mockPrismaService.bankConnection.findFirst.mockResolvedValue({
        id: 'conn-1',
        sessionId: 'session-1',
      });
      mockEnableBankingService.deleteSession.mockRejectedValue(
        new Error('already gone'),
      );
      mockPrismaService.bankConnection.delete.mockResolvedValue({});

      await expect(
        service.deleteConnection('conn-1', 'profile-1'),
      ).resolves.toEqual({ success: true });
    });
  });

  describe('syncTransactions details', () => {
    const row = (over: any = {}) => ({
      id: 'row-1',
      externalId: 'pend-1',
      date: new Date('2026-11-22'),
      amount: { toNumber: () => over.value ?? -30 },
      description: 'Hotel',
      notes: null,
      pending: true,
      transferId: null,
      ...over,
    });
    const pendingAggregate = (count: number, sum: number, min?: Date) =>
      mockPrismaService.transaction.aggregate.mockResolvedValue({
        _count: { _all: count },
        _sum: { amount: count ? sum : null },
        _min: { date: min ?? null },
      });

    beforeEach(() => {
      credentials();
      mockPrismaService.transaction.findMany.mockResolvedValue([]);
      mockPrismaService.transaction.aggregate = jest.fn();
      mockPrismaService.transaction.delete = jest.fn().mockResolvedValue({});
      mockPrismaService.transaction.updateMany = jest
        .fn()
        .mockResolvedValue({});
      mockPrismaService.transaction.update.mockResolvedValue({});
      pendingAggregate(0, 0);
      mockPrismaService.account.update.mockResolvedValue({});
      mockEnableBankingService.getAccountBalances.mockResolvedValue({
        balances: [],
      });
      mockTransactionsService.createMany.mockResolvedValue({
        newCount: 1,
        duplicateCount: 0,
      });
    });

    it('imports pending transactions flagged, and never cancelled ones', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [
          {
            entry_reference: 'booked-1',
            status: 'BOOK',
            booking_date: '2026-11-20',
            transaction_amount: { amount: '12.00', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            creditor: { name: 'Bakery' },
          },
          {
            status: 'PDNG',
            transaction_date: '2026-11-22',
            transaction_amount: { amount: '30.00', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            creditor: { name: 'Hotel hold' },
          },
          {
            status: 'CNCL',
            booking_date: '2026-11-19',
            transaction_amount: { amount: '99.00', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
          },
        ],
      });
      pendingAggregate(1, -30, new Date('2026-11-22'));

      await service.syncTransactions(undefined, 'profile-1');

      const inserted = mockTransactionsService.createMany.mock.calls[0][0];
      expect(inserted).toHaveLength(2);
      expect(inserted[0]).toMatchObject({ description: 'Bakery', amount: -12 });
      expect(inserted[0].pending).toBeUndefined();
      expect(inserted[1]).toMatchObject({
        description: 'Hotel hold',
        amount: -30,
        pending: true,
      });
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: expect.objectContaining({
          bankPendingFrom: new Date('2026-11-22'),
        }),
      });
    });

    it('turns a pending row into the booked transaction in place', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      // The hold was 30.00; the final charge adds a tip, under a new ID.
      mockPrismaService.transaction.findMany.mockResolvedValue([row()]);
      mockTransactionsService.calculateDescriptionSimilarity.mockReturnValue(
        80,
      );
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [
          {
            entry_reference: 'final-1',
            status: 'BOOK',
            booking_date: '2026-11-24',
            transaction_amount: { amount: '33.00', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            creditor: { name: 'Hotel' },
          },
        ],
      });

      const result = await service.syncTransactions(undefined, 'profile-1');

      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({
          amount: -33,
          externalId: 'final-1',
          pending: false,
          date: new Date('2026-11-24'),
        }),
      });
      expect(mockTransactionsService.createMany).not.toHaveBeenCalled();
      expect(mockPrismaService.transaction.delete).not.toHaveBeenCalled();
      expect(result.accountsSynced[0]).toMatchObject({ bookedCount: 1 });
    });

    it('follows a change to a transaction that is still pending', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockPrismaService.transaction.findMany.mockResolvedValue([row()]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [
          {
            entry_reference: 'pend-1',
            status: 'PDNG',
            transaction_date: '2026-11-22',
            transaction_amount: { amount: '31.50', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            creditor: { name: 'Hotel' },
          },
        ],
      });

      await service.syncTransactions(undefined, 'profile-1');

      expect(mockPrismaService.transaction.update).toHaveBeenCalledWith({
        where: { id: 'row-1' },
        data: expect.objectContaining({ amount: -31.5, pending: true }),
      });
      expect(mockPrismaService.transaction.delete).not.toHaveBeenCalled();
    });

    it('removes a pending row the bank dropped, unlinking any transfer', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockPrismaService.transaction.findMany.mockResolvedValue([
        row({ transferId: 'xfer-1' }),
      ]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [],
      });

      const result = await service.syncTransactions(undefined, 'profile-1');

      expect(mockPrismaService.transaction.updateMany).toHaveBeenCalledWith({
        where: { transferId: 'xfer-1', profileId: 'profile-1' },
        data: { isTransfer: false, transferId: null, transferAccountId: null },
      });
      expect(mockPrismaService.transaction.delete).toHaveBeenCalledWith({
        where: { id: 'row-1' },
      });
      expect(result.accountsSynced[0]).toMatchObject({ removedCount: 1 });
    });

    it('keeps pending rows when the fetch was cut short', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockPrismaService.transaction.findMany.mockResolvedValue([row()]);
      // Every page says there is more: the 25-page ceiling stops the fetch.
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [],
        continuation_key: 'more',
      });

      await service.syncTransactions(undefined, 'profile-1');

      expect(
        mockEnableBankingService.getAccountTransactions,
      ).toHaveBeenCalledTimes(25);
      expect(mockPrismaService.transaction.delete).not.toHaveBeenCalled();
    });

    it('adds pending transactions to a booked bank balance', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [],
      });
      mockEnableBankingService.getAccountBalances.mockResolvedValue({
        balances: [
          { balance_type: 'CLBD', balance_amount: { amount: '1000.00' } },
        ],
      });
      pendingAggregate(2, -45.1, new Date('2026-11-20'));

      await service.syncTransactions(undefined, 'profile-1');

      expect(mockPrismaService.setting.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { key: 'balance_verified_account_acc-1' },
          update: { value: '954.9' },
        }),
      );
    });

    it('stores the IBAN and links confirmed transfers, carrying on past a failure', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [
          {
            entry_reference: 'out-1',
            booking_date: '2026-11-20',
            transaction_amount: { amount: '500.00', currency: 'EUR' },
            credit_debit_indicator: 'DBIT',
            creditor: { name: 'Savings' },
            creditor_account: { iban: 'ES76 2077 0024 0031 0257 5766' },
          },
        ],
      });
      mockTransactionsService.findTransferMatches.mockResolvedValue([
        { source: { id: 'a' }, target: { id: 'b' }, confidence: 100 },
        { source: { id: 'c' }, target: { id: 'd' }, confidence: 100 },
        { source: { id: 'e' }, target: { id: 'f' }, confidence: 70 },
      ]);
      mockTransactionsService.linkAsTransfer
        .mockRejectedValueOnce(new Error('already linked'))
        .mockResolvedValueOnce({});

      const result = await service.syncTransactions(undefined, 'profile-1');

      expect(
        mockTransactionsService.createMany.mock.calls[0][0][0],
      ).toMatchObject({ counterpartyIban: 'ES7620770024003102575766' });
      expect(mockTransactionsService.linkAsTransfer).toHaveBeenCalledTimes(2);
      expect(result.transfersLinked).toBe(1);
    });

    it('reaches back to a pending transaction on the next sync', async () => {
      const pendingFrom = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      mockPrismaService.account.findMany.mockResolvedValue([
        linkedAccount({ bankPendingFrom: pendingFrom }),
      ]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [],
      });

      await service.syncTransactions(undefined, 'profile-1');

      const dateFrom =
        mockEnableBankingService.getAccountTransactions.mock.calls[0][3];
      const expected = new Date(pendingFrom);
      expected.setDate(expected.getDate() - 2);
      expect(dateFrom).toBe(expected.toISOString().split('T')[0]);
      expect(mockPrismaService.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: expect.objectContaining({ bankPendingFrom: null }),
      });
    });

    it('passes who started the sync on to every bank call', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockResolvedValue({
        transactions: [],
      });
      const psu = { ipAddress: '203.0.113.7', userAgent: 'Firefox' };

      await service.syncTransactions(undefined, 'profile-1', psu);

      expect(
        mockEnableBankingService.getAccountTransactions.mock.calls[0][6],
      ).toBe(psu);
      expect(mockEnableBankingService.getAccountBalances.mock.calls[0][3]).toBe(
        psu,
      );
    });

    it('reports consent withdrawn at the bank as REVOKED', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockRejectedValue(
        new Error('Forbidden'),
      );
      mockEnableBankingService.getSession.mockResolvedValue({
        status: 'REVOKED',
      });

      const result = await service.syncTransactions(undefined, 'profile-1');

      expect(result.accountsSynced[0]).toMatchObject({
        status: 'EXPIRED',
        reason: 'REVOKED',
      });
      expect(mockPrismaService.bankConnection.update).toHaveBeenCalledWith({
        where: { id: 'conn-1' },
        data: { validUntil: expect.any(Date) },
      });
    });

    it('leaves an authorized connection alone on an ordinary error', async () => {
      mockPrismaService.account.findMany.mockResolvedValue([linkedAccount()]);
      mockEnableBankingService.getAccountTransactions.mockRejectedValue(
        new Error('Bank timeout'),
      );
      mockEnableBankingService.getSession.mockResolvedValue({
        status: 'AUTHORIZED',
      });

      const result = await service.syncTransactions(undefined, 'profile-1');

      expect(result.accountsSynced[0]).toMatchObject({
        status: 'ERROR',
        message: 'Bank timeout',
      });
      expect(mockPrismaService.bankConnection.update).not.toHaveBeenCalled();
    });
  });
});
