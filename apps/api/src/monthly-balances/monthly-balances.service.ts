import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MonthlyBalancesService {
  constructor(private prisma: PrismaService) {}

  async findOne(month: string, profileId: string, accountId?: string | null) {
    // Use findFirst with composite filter since unique key is now (month, accountId)
    return this.prisma.monthlyBalance.findFirst({
      where: {
        month,
        accountId: accountId || null,
        account: { profileId },
      },
    });
  }

  async upsert(
    month: string,
    balance: number,
    profileId: string,
    accountId?: string | null,
  ) {
    if (accountId) {
      // verify ownership
      const account = await this.prisma.account.findFirst({
        where: { id: accountId, profileId },
      });
      if (!account) {
        throw new NotFoundException('Account not found');
      }
    }

    // Find existing record first
    const existing = await this.findOne(month, profileId, accountId);

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
