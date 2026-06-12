import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CostObjectsService } from './cost-objects.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockCostObject } from '../test/fixtures';

describe('CostObjectsService', () => {
  let service: CostObjectsService;
  let prismaMock: PrismaMock;
  const profileId = 'profile-1';

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

      const result = await service.create(dto as any, profileId);

      expect(result.name).toBe('Project Alpha');
      expect(prismaMock.costObject.create).toHaveBeenCalledWith({
        data: { ...dto, profileId },
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

      const result = await service.create(dto as any, profileId);

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

      const result = await service.findAll(profileId);

      expect(result).toHaveLength(2);
      expect(prismaMock.costObject.findMany).toHaveBeenCalledWith({
        where: { profileId },
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no cost objects exist', async () => {
      prismaMock.costObject.findMany.mockResolvedValue([]);

      const result = await service.findAll(profileId);

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // update() Tests
  // ============================================
  describe('update', () => {
    it('should update cost object name', async () => {
      const existingCostObject = createMockCostObject({ id: 'cost-1' });
      const updatedCostObject = createMockCostObject({
        id: 'cost-1',
        name: 'Renamed Project',
      });
      prismaMock.costObject.findFirst.mockResolvedValue(existingCostObject);
      prismaMock.costObject.update.mockResolvedValue(updatedCostObject);

      const result = await service.update('cost-1', profileId, {
        name: 'Renamed Project',
      });

      expect(result.name).toBe('Renamed Project');
      expect(prismaMock.costObject.findFirst).toHaveBeenCalledWith({
        where: { id: 'cost-1', profileId },
      });
      expect(prismaMock.costObject.update).toHaveBeenCalledWith({
        where: { id: 'cost-1' },
        data: { name: 'Renamed Project' },
      });
    });

    it('should update cost object color', async () => {
      const existingCostObject = createMockCostObject({ id: 'cost-1' });
      const updatedCostObject = createMockCostObject({
        id: 'cost-1',
        color: '#ef4444',
      });
      prismaMock.costObject.findFirst.mockResolvedValue(existingCostObject);
      prismaMock.costObject.update.mockResolvedValue(updatedCostObject);

      const result = await service.update('cost-1', profileId, {
        color: '#ef4444',
      });

      expect(result.color).toBe('#ef4444');
    });

    it('should throw NotFoundException when cost object does not belong to profile', async () => {
      prismaMock.costObject.findFirst.mockResolvedValue(null);

      await expect(
        service.update('cost-1', profileId, { name: 'Renamed Project' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.costObject.update).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // remove() Tests
  // ============================================
  describe('remove', () => {
    it('should delete cost object by id', async () => {
      prismaMock.costObject.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.remove('cost-1', profileId);

      expect(result).toEqual({ success: true });
      expect(prismaMock.costObject.deleteMany).toHaveBeenCalledWith({
        where: { id: 'cost-1', profileId },
      });
    });

    it('should throw NotFoundException when nothing was deleted', async () => {
      prismaMock.costObject.deleteMany.mockResolvedValue({ count: 0 });

      await expect(service.remove('cost-1', profileId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
