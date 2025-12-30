import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonthlyBalancesService {
  constructor(private prisma: PrismaService) {}

  async findOne(month: string, accountId?: string | null) {
    // Use findFirst with composite filter since unique key is now (month, accountId)
    return this.prisma.monthlyBalance.findFirst({
      where: {
        month,
        accountId: accountId || null,
      },
    });
  }

  async upsert(month: string, balance: number, accountId?: string | null) {
    // Find existing record first
    const existing = await this.findOne(month, accountId);

    if (existing) {
      return this.prisma.monthlyBalance.update({
        where: { id: existing.id },
        data: { balance },
      });
    } else {
      return this.prisma.monthlyBalance.create({
        data: {
          month,
          balance,
          accountId: accountId || null,
        },
      });
    }
  }
}
