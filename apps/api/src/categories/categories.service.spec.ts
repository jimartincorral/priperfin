import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockCategory } from '../test/fixtures';
import { Decimal } from '../generated/client';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaMock: PrismaMock;

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

      const result = await service.create(dto as any);

      expect(result.name).toBe('Groceries');
      expect(prismaMock.category.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        createMockCategory({ id: 'cat-1', name: 'Income' }),
        createMockCategory({ id: 'cat-2', name: 'Expenses' }),
      ];
      prismaMock.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
    });

    it('should filter by type when specified', async () => {
      prismaMock.category.findMany.mockResolvedValue([]);

      await service.findAll('EXPENSE' as any);

      expect(prismaMock.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { type: 'EXPENSE' },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updatedCat = createMockCategory({ name: 'Updated Name' });
      prismaMock.category.update.mockResolvedValue(updatedCat);

      const result = await service.update('cat-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      prismaMock.category.delete.mockResolvedValue({ id: 'cat-1' });

      await service.remove('cat-1');

      expect(prismaMock.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });
  });
});
