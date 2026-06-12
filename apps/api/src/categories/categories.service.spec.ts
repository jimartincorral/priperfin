import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockCategory } from '../test/fixtures';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaMock: PrismaMock;
  const profileId = 'profile-1';

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto = { name: 'Groceries', icon: '🛒', type: 'EXPENSE' };
      const mockResult = createMockCategory({
        id: 'new-cat',
        name: 'Groceries',
      });
      prismaMock.category.create.mockResolvedValue(mockResult);

      const result = await service.create(dto as any, profileId);

      expect(result.name).toBe('Groceries');
      expect(prismaMock.category.create).toHaveBeenCalledWith({
        data: { ...dto, profileId },
      });
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        createMockCategory({ id: 'cat-1', name: 'Income' }),
        createMockCategory({ id: 'cat-2', name: 'Expenses' }),
      ];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll(profileId);

      expect(result).toHaveLength(2);
      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { profileId },
        }),
      );
    });

    it('should filter by type when specified', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);

      await service.findAll(profileId, 'EXPENSE' as any);

      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { profileId, type: 'EXPENSE' },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const existingCat = createMockCategory({ id: 'cat-1' });
      const updatedCat = createMockCategory({ name: 'Updated Name' });
      prismaMock.category.findFirst.mockResolvedValue(existingCat);
      prismaMock.category.update.mockResolvedValue(updatedCat);

      const result = await service.update('cat-1', profileId, {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
      expect(prismaMock.category.findFirst).toHaveBeenCalledWith({
        where: { id: 'cat-1', profileId },
      });
      expect(prismaMock.category.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: { name: 'Updated Name' },
      });
    });

    it('should throw when category does not belong to profile', async () => {
      prismaMock.category.findFirst.mockResolvedValue(null);

      await expect(
        service.update('cat-1', profileId, { name: 'Updated Name' }),
      ).rejects.toThrow('Category not found or access denied');
      expect(prismaMock.category.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      prismaMock.category.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('cat-1', profileId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.category.deleteMany).toHaveBeenCalledWith({
        where: { id: 'cat-1', profileId },
      });
    });

    it('should throw when nothing was deleted', async () => {
      prismaMock.category.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.remove('cat-1', profileId)).rejects.toThrow(
        'Category not found or access denied',
      );
    });
  });
});
