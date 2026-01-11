import { Test, TestingModule } from '@nestjs/testing';
import { SavingsGoalsService } from './savings-goals.service';
import { PrismaService } from '../prisma/prisma.service';
import { createPrismaMock, PrismaMock } from '../test/prisma-mock.factory';
import { createMockSavingsGoal, createMockCategory } from '../test/fixtures';
import { Decimal } from '../generated/client';

describe('SavingsGoalsService', () => {
  let service: SavingsGoalsService;
  let prismaMock: PrismaMock;

  beforeEach(async () => {
    prismaMock = createPrismaMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavingsGoalsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SavingsGoalsService>(SavingsGoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // calculateShouldHaveSaved() Tests
  // ============================================
  describe('calculateShouldHaveSaved', () => {
    it('should return target if totalDuration <= 0', () => {
      const start = new Date('2025-01-15');
      const end = new Date('2025-01-01'); // End before start
      const target = 1000;

      const result = (service as any).calculateShouldHaveSaved(
        target,
        start,
        end,
      );

      expect(result).toBe(target);
    });

    it('should return 0 progress if elapsed time is negative (future start)', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const evenFutureDate = new Date(futureDate);
      evenFutureDate.setFullYear(evenFutureDate.getFullYear() + 1);

      const result = (service as any).calculateShouldHaveSaved(
        1000,
        futureDate,
        evenFutureDate,
      );

      expect(result).toBe(0);
    });

    it('should return proportional amount based on elapsed time', () => {
      // Start 6 months ago, end 6 months from now (50% elapsed)
      const now = new Date();
      const start = new Date(now);
      start.setMonth(start.getMonth() - 6);
      const end = new Date(now);
      end.setMonth(end.getMonth() + 6);

      const target = 1000;
      const result = (service as any).calculateShouldHaveSaved(
        target,
        start,
        end,
      );

      // Should be approximately 50% (500), allow some tolerance due to timing
      expect(result).toBeGreaterThan(400);
      expect(result).toBeLessThan(600);
    });

    it('should clamp progress to 100% maximum', () => {
      // Goal that ended in the past
      const start = new Date('2024-01-01');
      const end = new Date('2024-06-01');
      const target = 1000;

      const result = (service as any).calculateShouldHaveSaved(
        target,
        start,
        end,
      );

      expect(result).toBe(target); // Should not exceed target
    });
  });

  // ============================================
  // calculateMonthlySavings() Tests
  // ============================================
  describe('calculateMonthlySavings', () => {
    it('should return remaining amount if target date passed', () => {
      const pastDate = new Date('2024-01-01');
      const target = 1000;
      const saved = 300;

      const result = (service as any).calculateMonthlySavings(
        target,
        saved,
        pastDate,
      );

      expect(result).toBe(700); // target - saved
    });

    it('should calculate correct monthly amount for future goals', () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + 6); // 6 months from now

      const target = 1200;
      const saved = 0;

      const result = (service as any).calculateMonthlySavings(
        target,
        saved,
        futureDate,
      );

      // Should be approximately 200/month (1200 / 6)
      expect(result).toBeGreaterThan(150);
      expect(result).toBeLessThan(250);
    });

    it('should return 0 if already saved >= target', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 6);

      const target = 1000;
      const saved = 1500; // Already exceeded target

      const result = (service as any).calculateMonthlySavings(
        target,
        saved,
        futureDate,
      );

      expect(result).toBe(0); // Max ensures non-negative
    });

    it('should handle edge case of 1 month remaining', () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + 1);

      const target = 500;
      const saved = 200;

      const result = (service as any).calculateMonthlySavings(
        target,
        saved,
        futureDate,
      );

      expect(result).toBe(300); // All remaining in one month
    });
  });

  // ============================================
  // CRUD Operations Tests
  // ============================================
  describe('create', () => {
    it('should create a savings goal with all fields', async () => {
      const dto = {
        name: 'Vacation Fund',
        targetAmount: 5000,
        targetDate: '2025-12-31',
        savedAmount: 1000,
        startDate: '2025-01-01',
      };

      const mockGoal = createMockSavingsGoal({
        id: 'goal-new',
        name: dto.name,
        targetAmount: new Decimal(dto.targetAmount),
        savedAmount: new Decimal(dto.savedAmount),
      });

      prismaMock.savingsGoal.create.mockResolvedValue(mockGoal);

      const result = await service.create(dto as any);

      expect(result.id).toBe('goal-new');
      expect(prismaMock.savingsGoal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Vacation Fund',
            targetAmount: 5000,
          }),
        }),
      );
    });

    it('should default savedAmount to 0 if not provided', async () => {
      const dto = {
        name: 'Emergency Fund',
        targetAmount: 10000,
        targetDate: '2026-01-01',
      };

      prismaMock.savingsGoal.create.mockResolvedValue(
        createMockSavingsGoal({ savedAmount: new Decimal(0) }),
      );

      await service.create(dto as any);

      expect(prismaMock.savingsGoal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            savedAmount: 0,
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update savings goal with partial data', async () => {
      const id = 'goal-1';
      const dto = { savedAmount: 2500 };

      prismaMock.savingsGoal.update.mockResolvedValue(
        createMockSavingsGoal({ savedAmount: new Decimal(2500) }),
      );

      const result = await service.update(id, dto as any);

      expect(result.savedAmount.toNumber()).toBe(2500);
      expect(prismaMock.savingsGoal.update).toHaveBeenCalledWith({
        where: { id },
        data: expect.objectContaining({ savedAmount: 2500 }),
      });
    });

    it('should convert date strings to Date objects', async () => {
      const id = 'goal-1';
      const dto = { targetDate: '2026-06-15' };

      prismaMock.savingsGoal.update.mockResolvedValue(
        createMockSavingsGoal({ targetDate: new Date('2026-06-15') }),
      );

      await service.update(id, dto as any);

      expect(prismaMock.savingsGoal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            targetDate: expect.any(Date),
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return goals with calculated fields', async () => {
      const now = new Date();
      const futureDate = new Date(now);
      futureDate.setMonth(futureDate.getMonth() + 6);

      const mockGoals = [
        createMockSavingsGoal({
          id: 'goal-1',
          name: 'Vacation',
          targetAmount: new Decimal(1200),
          savedAmount: new Decimal(600),
          startDate: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
          targetDate: futureDate,
        }),
      ];

      prismaMock.savingsGoal.findMany.mockResolvedValue(mockGoals);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('monthlySavingsNeeded');
      expect(result[0]).toHaveProperty('shouldHaveSaved');
      expect(typeof result[0].monthlySavingsNeeded).toBe('number');
      expect(typeof result[0].shouldHaveSaved).toBe('number');
    });

    it('should include category in results', async () => {
      const category = createMockCategory({ id: 'cat-1', name: 'Travel' });
      const mockGoal = {
        ...createMockSavingsGoal({
          id: 'goal-1',
          categoryId: 'cat-1',
        }),
        category,
      };

      prismaMock.savingsGoal.findMany.mockResolvedValue([mockGoal]);

      const result = await service.findAll();

      expect(result[0].category).toBeDefined();
      expect(result[0].category.name).toBe('Travel');
    });

    it('should order goals by targetDate ascending', async () => {
      prismaMock.savingsGoal.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prismaMock.savingsGoal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { targetDate: 'asc' },
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete savings goal by id', async () => {
      prismaMock.savingsGoal.delete.mockResolvedValue({ id: 'goal-1' });

      await service.remove('goal-1');

      expect(prismaMock.savingsGoal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
      });
    });
  });
});
