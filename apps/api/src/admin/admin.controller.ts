import {
  Controller,
  Delete,
  Get,
  UseGuards,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('admin')
@UseGuards(SessionAuthGuard)
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(private prisma: PrismaService) {}

  @Get('diagnostics')
  async getDiagnostics(@CurrentProfile() profile: Profile) {
    try {
      const transactionCount = await this.prisma.transaction.count({
        where: { profileId: profile.id },
      });
      const accountCount = await this.prisma.account.count({
        where: { profileId: profile.id },
      });
      const categoryCount = await this.prisma.category.count({
        where: { profileId: profile.id },
      });
      const costObjectCount = await this.prisma.costObject
        .count({ where: { profileId: profile.id } })
        .catch(() => 'Error (Table missing?)');
      const splitCount = await this.prisma.transactionSplit
        .count({ where: { parent: { profileId: profile.id } } })
        .catch(() => 'Error (Table missing?)');

      const tables = await this.prisma.$queryRawUnsafe<any[]>(
        "SELECT name FROM sqlite_master WHERE type='table';",
      );

      return {
        profile: { id: profile.id, name: profile.name },
        counts: {
          transactions: transactionCount,
          accounts: accountCount,
          categories: categoryCount,
          costObjects: costObjectCount,
          splits: splitCount,
        },
        tables: tables.map((t) => t.name),
        databaseUrl: '[REDACTED]',
        databaseConfigured: !!process.env.DATABASE_URL,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  @Delete('reset')
  async resetData(@CurrentProfile() profile: Profile) {
    this.logger.warn(
      `Resetting data for profile: ${profile.name} (${profile.id})`,
    );
    // Delete only the current profile's data
    // Transaction Splits cascade delete from Transaction
    await this.prisma.transaction.deleteMany({
      where: { profileId: profile.id },
    });
    await this.prisma.savingsGoal.deleteMany({
      where: { profileId: profile.id },
    });
    await this.prisma.monthlyBalance.deleteMany({
      where: { account: { profileId: profile.id } },
    });
    await this.prisma.accountBalance.deleteMany({
      where: { account: { profileId: profile.id } },
    });
    await this.prisma.categorizationRule.deleteMany({
      where: { profileId: profile.id },
    });
    await this.prisma.ruleSuggestion.deleteMany({
      where: { profileId: profile.id },
    });
    return { message: 'Profile data reset successful' };
  }

  @Delete('reset-all')
  async resetAllData(@CurrentProfile() profile: Profile) {
    this.logger.warn(
      `reset-all called by ${profile.name}. Redirecting to profile reset for safety.`,
    );
    // Redirect to profile reset to prevent accidental full database wipe
    return this.resetData(profile);
  }
}
