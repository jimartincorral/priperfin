import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountBalancesService {
  constructor(private prisma: PrismaService) {}

  async findAll(profileId: string, accountId?: string | null) {
    return this.prisma.accountBalance.findMany({
      where: {
        accountId: accountId || null,
        account: { profileId },
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async findByDate(
    asOfDate: Date,
    profileId: string,
    accountId?: string | null,
  ) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate,
        accountId: accountId || null,
        account: { profileId },
      },
      include: { account: true },
    });
  }

  async findLatestBefore(
    beforeDate: Date,
    profileId: string,
    accountId?: string | null,
  ) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate: { lt: beforeDate },
        accountId: accountId || null,
        account: { profileId },
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async findLatestBeforeOrOn(
    beforeDate: Date,
    profileId: string,
    accountId?: string | null,
  ) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate: { lte: beforeDate },
        accountId: accountId || null,
        account: { profileId },
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async upsert(
    asOfDate: Date,
    balance: number,
    profileId: string,
    accountId?: string | null,
    notes?: string,
  ) {
    // Reject writes without an account: such rows can never be retrieved
    // because every read joins on account.profileId, so they would silently
    // disappear from the user's view.
    if (!accountId) {
      throw new BadRequestException('accountId is required');
    }

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, profileId },
    });
    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }

    const existing = await this.findByDate(asOfDate, profileId, accountId);

    if (existing) {
      return this.prisma.accountBalance.update({
        where: { id: existing.id },
        data: { balance, notes },
        include: { account: true },
      });
    }

    return this.prisma.accountBalance.create({
      data: {
        asOfDate,
        balance,
        accountId,
        notes,
      },
      include: { account: true },
    });
  }

  async delete(id: string, profileId: string) {
    const existing = await this.prisma.accountBalance.findFirst({
      where: {
        id,
        account: { profileId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Balance entry not found or access denied');
    }

    return this.prisma.accountBalance.delete({
      where: { id },
    });
  }

  async calculateBalanceAtDate(
    targetDate: Date,
    profileId: string,
    accountId?: string | null,
  ) {
    // 1. Find the most recent AccountBalance before or on targetDate
    const latestBalance = await this.findLatestBeforeOrOn(
      targetDate,
      profileId,
      accountId,
    );

    const startingBalance = latestBalance
      ? latestBalance.balance.toNumber()
      : 0;
    const startDate = latestBalance ? latestBalance.asOfDate : new Date(0);

    // 2. Sum all transactions between startDate (exclusive) and targetDate (inclusive)
    const whereClause: any = {
      profileId, // Filter by profile
      date: {
        gt: startDate,
        lte: targetDate,
      },
    };

    if (accountId) {
      whereClause.accountId = accountId;
    }

    const result = await this.prisma.transaction.aggregate({
      where: whereClause,
      _sum: { amount: true },
    });

    const transactionSum = result._sum.amount?.toNumber() || 0;

    return {
      balance: startingBalance + transactionSum,
      startingBalance,
      transactionSum,
      balanceAsOfDate: latestBalance?.asOfDate || null,
    };
  }
}
