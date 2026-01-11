import { Test, TestingModule } from '@nestjs/testing';
import { CostObjectsService } from './cost-objects.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockCostObject } from '../test/fixtures';

describe('CostObjectsService', () => {
  let service: CostObjectsService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CostObjectsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<CostObjectsService>(CostObjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // create() Tests
  // ============================================
  describe('create', () => {
    it('should create a cost object with provided data', async () => {
      const dto = {
        name: 'Project Alpha',
        icon: '📊',
        color: '#3b82f6',
      };
      const mockResult = createMockCostObject({
        id: 'cost-new',
        name: 'Project Alpha',
        icon: '📊',
        color: '#3b82f6',
      });
      prismaMock.costObject.create.mockResolvedValue(mockResult);

      const result = await service.create(dto as any);

      expect(result.name).toBe('Project Alpha');
      expect(prismaMock.costObject.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should create cost object without color', async () => {
      const dto = {
        name: 'Project Beta',
        icon: '🔧',
      };
      const mockResult = createMockCostObject({
        id: 'cost-new',
        name: 'Project Beta',
        icon: '🔧',
        color: null,
      });
      prismaMock.costObject.create.mockResolvedValue(mockResult);

      const result = await service.create(dto as any);

      expect(result.color).toBeNull();
    });
  });

  // ============================================
  // findAll() Tests
  // ============================================
  describe('findAll', () => {
    it('should return all cost objects ordered by name', async () => {
      const mockCostObjects = [
        createMockCostObject({ id: 'cost-1', name: 'Alpha Project' }),
        createMockCostObject({ id: 'cost-2', name: 'Beta Project' }),
      ];
      prismaMock.costObject.findMany.mockResolvedValue(mockCostObjects);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(prismaMock.costObject.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no cost objects exist', async () => {
      prismaMock.costObject.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // update() Tests
  // ============================================
  describe('update', () => {
    it('should update cost object name', async () => {
      const updatedCostObject = createMockCostObject({
        id: 'cost-1',
        name: 'Renamed Project',
      });
      prismaMock.costObject.update.mockResolvedValue(updatedCostObject);

      const result = await service.update('cost-1', {
        name: 'Renamed Project',
      });

      expect(result.name).toBe('Renamed Project');
      expect(prismaMock.costObject.update).toHaveBeenCalledWith({
        where: { id: 'cost-1' },
        data: { name: 'Renamed Project' },
      });
    });

    it('should update cost object color', async () => {
      const updatedCostObject = createMockCostObject({
        id: 'cost-1',
        color: '#ef4444',
      });
      prismaMock.costObject.update.mockResolvedValue(updatedCostObject);

      const result = await service.update('cost-1', { color: '#ef4444' });

      expect(result.color).toBe('#ef4444');
    });
  });

  // ============================================
  // remove() Tests
  // ============================================
  describe('remove', () => {
    it('should delete cost object by id', async () => {
      prismaMock.costObject.delete.mockResolvedValue({ id: 'cost-1' });

      await service.remove('cost-1');

      expect(prismaMock.costObject.delete).toHaveBeenCalledWith({
        where: { id: 'cost-1' },
      });
    });
  });
});
