import { Test, TestingModule } from '@nestjs/testing';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaMockFactory } from '../test/prisma-mock.factory';
import { Decimal } from '../generated/client';

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<AccountsService>(AccountsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // create() Tests
  // ============================================
  describe('create', () => {
    it('should create an account with provided data', async () => {
      const dto = {
        name: 'Main Checking',
        type: 'DEBIT',
        initialBalance: 1000,
      };
      const mockResult = createMockAccount({
        id: 'acc-new',
        name: 'Main Checking',
        type: 'DEBIT',
        initialBalance: new Decimal(1000),
      });
      prismaMock.account.create.mockResolvedValue(mockResult);

      const result = await service.create(dto as any);

      expect(result.name).toBe('Main Checking');
      expect(prismaMock.account.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should create a credit account', async () => {
      const dto = {
        name: 'Credit Card',
        type: 'CREDIT',
        initialBalance: 0,
      };
      const mockResult = createMockAccount({
        id: 'acc-credit',
        name: 'Credit Card',
        type: 'CREDIT',
        initialBalance: new Decimal(0),
      });
      prismaMock.account.create.mockResolvedValue(mockResult);

      const result = await service.create(dto as any);

      expect(result.type).toBe('CREDIT');
    });
  });

  // ============================================
  // findAll() Tests
  // ============================================
  describe('findAll', () => {
    it('should return all accounts ordered by name', async () => {
      const mockAccounts = [
        createMockAccount({ id: 'acc-1', name: 'Account A' }),
        createMockAccount({ id: 'acc-2', name: 'Account B' }),
      ];
      prismaMock.account.findMany.mockResolvedValue(mockAccounts);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no accounts exist', async () => {
      prismaMock.account.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // findOne() Tests
  // ============================================
  describe('findOne', () => {
    it('should return account by id', async () => {
      const mockAccount = createMockAccount({ id: 'acc-1', name: 'Test Account' });
      prismaMock.account.findUnique.mockResolvedValue(mockAccount);

      const result = await service.findOne('acc-1');

      expect(result?.id).toBe('acc-1');
      expect(prismaMock.account.findUnique).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
      });
    });

    it('should return null when account not found', async () => {
      prismaMock.account.findUnique.mockResolvedValue(null);

      const result = await service.findOne('nonexistent');

      expect(result).toBeNull();
    });
  });

  // ============================================
  // update() Tests
  // ============================================
  describe('update', () => {
    it('should update account with new values', async () => {
      const updatedAccount = createMockAccount({
        id: 'acc-1',
        name: 'Updated Name',
      });
      prismaMock.account.update.mockResolvedValue(updatedAccount);

      const result = await service.update('acc-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(prismaMock.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { name: 'Updated Name' },
      });
    });
  });

  // ============================================
  // remove() Tests
  // ============================================
  describe('remove', () => {
    it('should delete account by id', async () => {
      prismaMock.account.delete.mockResolvedValue({ id: 'acc-1' });

      await service.remove('acc-1');

      expect(prismaMock.account.delete).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
      });
    });
  });
});
