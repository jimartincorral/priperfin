import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockAccount } from '../test/fixtures';
import { Prisma } from '../generated/client';

const Decimal = Prisma.Decimal;

describe('AccountsService', () => {
  let service: AccountsService;
  let prismaMock: PrismaMock;
  const profileId = 'profile-1';

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

      const result = await service.create(dto as any, profileId);

      expect(result.name).toBe('Main Checking');
      expect(prismaMock.account.create).toHaveBeenCalledWith({
        data: { ...dto, profileId },
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

      const result = await service.create(dto as any, profileId);

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

      const result = await service.findAll(profileId);

      expect(result).toHaveLength(2);
      expect(prismaMock.account.findMany).toHaveBeenCalledWith({
        where: { profileId },
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no accounts exist', async () => {
      prismaMock.account.findMany.mockResolvedValue([]);

      const result = await service.findAll(profileId);

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // findOne() Tests
  // ============================================
  describe('findOne', () => {
    it('should return account by id', async () => {
      const mockAccount = createMockAccount({
        id: 'acc-1',
        name: 'Test Account',
      });
      prismaMock.account.findFirst.mockResolvedValue(mockAccount);

      const result = await service.findOne('acc-1', profileId);

      expect(result?.id).toBe('acc-1');
      expect(prismaMock.account.findFirst).toHaveBeenCalledWith({
        where: { id: 'acc-1', profileId },
      });
    });

    it('should throw NotFoundException when account not found', async () => {
      prismaMock.account.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', profileId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ============================================
  // update() Tests
  // ============================================
  describe('update', () => {
    it('should update account with new values', async () => {
      const existingAccount = createMockAccount({ id: 'acc-1' });
      const updatedAccount = createMockAccount({
        id: 'acc-1',
        name: 'Updated Name',
      });
      prismaMock.account.findFirst.mockResolvedValue(existingAccount);
      prismaMock.account.update.mockResolvedValue(updatedAccount);

      const result = await service.update('acc-1', profileId, {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(prismaMock.account.findFirst).toHaveBeenCalledWith({
        where: { id: 'acc-1', profileId },
      });
      expect(prismaMock.account.update).toHaveBeenCalledWith({
        where: { id: 'acc-1' },
        data: { name: 'Updated Name' },
      });
    });

    it('should throw NotFoundException when account does not belong to profile', async () => {
      prismaMock.account.findFirst.mockResolvedValue(null);

      await expect(
        service.update('acc-1', profileId, { name: 'Updated Name' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.account.update).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // remove() Tests
  // ============================================
  describe('remove', () => {
    it('should delete account by id', async () => {
      prismaMock.account.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('acc-1', profileId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.account.deleteMany).toHaveBeenCalledWith({
        where: { id: 'acc-1', profileId },
      });
    });

    it('should throw NotFoundException when nothing was deleted', async () => {
      prismaMock.account.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.remove('acc-1', profileId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
