import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSavingsGoalDto } from './create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './update-savings-goal.dto';

@Injectable()
export class SavingsGoalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateSavingsGoalDto, profileId: string) {
    console.log('Creating savings goal:', dto);
    try {
      return await this.prisma.savingsGoal.create({
        data: {
          ...dto,
          profileId,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
          targetAmount: dto.targetAmount,
          savedAmount: dto.savedAmount ?? 0,
        },
      });
    } catch (e) {
      console.error('Error creating savings goal:', e);
      throw e;
    }
  }

  async update(id: string, profileId: string, dto: UpdateSavingsGoalDto) {
    console.log('Updating savings goal:', id, dto);
    try {
      // Verify ownership
      const goal = await this.prisma.savingsGoal.findFirst({
        where: { id, profileId },
      });
      
      if (!goal) {
        throw new Error('Savings goal not found or access denied');
      }

      return await this.prisma.savingsGoal.update({
        where: { id },
        data: {
          ...dto,
          targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
          startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        },
      });
    } catch (e) {
      console.error('Error updating savings goal:', e);
      throw e;
    }
  }

  async findAll(profileId: string) {
    const goals = await this.prisma.savingsGoal.findMany({
      where: { profileId },
      include: { category: true },
      orderBy: { targetDate: 'asc' },
    });

    return goals.map((goal) => ({
      ...goal,
      monthlySavingsNeeded:
        goal.isEvergreen && goal.targetMonths
          ? this.calculateMonthlySavingsEvergreen(
              goal.targetAmount.toNumber(),
              goal.savedAmount.toNumber(),
              goal.targetMonths,
            )
          : goal.targetDate
            ? this.calculateMonthlySavings(
                goal.targetAmount.toNumber(),
                goal.savedAmount.toNumber(),
                goal.targetDate,
              )
            : 0,
      shouldHaveSaved:
        goal.isEvergreen || !goal.targetDate
          ? null
          : this.calculateShouldHaveSaved(
              goal.targetAmount.toNumber(),
              goal.startDate,
              goal.targetDate,
            ),
    }));
  }

  private calculateShouldHaveSaved(
    target: number,
    start: Date,
    end: Date,
  ): number {
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = new Date().getTime() - start.getTime();
    if (totalDuration <= 0) return target;
    const progress = Math.min(1, Math.max(0, elapsed / totalDuration));
    return parseFloat((target * progress).toFixed(2));
  }

  private calculateMonthlySavings(
    target: number,
    saved: number,
    date: Date,
  ): number {
    const now = new Date();
    const targetDate = new Date(date);

    // Calculate months difference
    let months = (targetDate.getFullYear() - now.getFullYear()) * 12;
    months -= now.getMonth();
    months += targetDate.getMonth();

    if (months <= 0) return target - saved; // If due or overdue, need all immediately

    const needed = (target - saved) / months;
    return Math.max(0, parseFloat(needed.toFixed(2)));
  }

  private calculateMonthlySavingsEvergreen(
    target: number,
    saved: number,
    targetMonths: number,
  ): number {
    const needed = (target - saved) / targetMonths;
    return Math.max(0, parseFloat(needed.toFixed(2)));
  }
  async remove(id: string, profileId: string) {
    const result = await this.prisma.savingsGoal.deleteMany({
      where: { id, profileId },
    });
    
    if (result.count === 0) {
      throw new Error('Savings goal not found or access denied');
    }
    
    return { success: true };
  }
}
