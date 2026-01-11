import { Controller, Delete, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Get('diagnostics')
  async getDiagnostics() {
    try {
      const transactionCount = await this.prisma.transaction.count();
      const accountCount = await this.prisma.account.count();
      const categoryCount = await this.prisma.category.count();
      const costObjectCount = await this.prisma.costObject
        .count()
        .catch(() => 'Error (Table missing?)');
      const splitCount = await this.prisma.transactionSplit
        .count()
        .catch(() => 'Error (Table missing?)');

      const tables = await this.prisma.$queryRawUnsafe<any[]>(
        "SELECT name FROM sqlite_master WHERE type='table';",
      );

      return {
        counts: {
          transactions: transactionCount,
          accounts: accountCount,
          categories: categoryCount,
          costObjects: costObjectCount,
          splits: splitCount,
        },
        tables: tables.map((t) => t.name),
        databaseUrl: process.env.DATABASE_URL,
      };
    } catch (e) {
      return { error: e.message };
    }
  }

  @Delete('reset')
  async resetData() {
    console.log('Resetting data...');
    // Delete in order to respect foreign keys
    await this.prisma.transaction.deleteMany();
    await this.prisma.savingsGoal.deleteMany();
    await this.prisma.monthlyBalance.deleteMany();
    // We keep categories as per requirements
    return { message: 'Data reset successful' };
  }
}
