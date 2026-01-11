import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountBalancesService {
  constructor(private prisma: PrismaService) {}

  async findAll(accountId?: string | null) {
    return this.prisma.accountBalance.findMany({
      where: {
        accountId: accountId || null,
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async findByDate(asOfDate: Date, accountId?: string | null) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate,
        accountId: accountId || null,
      },
      include: { account: true },
    });
  }

  async findLatestBefore(beforeDate: Date, accountId?: string | null) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate: { lt: beforeDate },
        accountId: accountId || null,
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async findLatestBeforeOrOn(beforeDate: Date, accountId?: string | null) {
    return this.prisma.accountBalance.findFirst({
      where: {
        asOfDate: { lte: beforeDate },
        accountId: accountId || null,
      },
      orderBy: { asOfDate: 'desc' },
      include: { account: true },
    });
  }

  async upsert(
    asOfDate: Date,
    balance: number,
    accountId?: string | null,
    notes?: string,
  ) {
    const existing = await this.findByDate(asOfDate, accountId);

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
        accountId: accountId || null,
        notes,
      },
      include: { account: true },
    });
  }

  async delete(id: string) {
    return this.prisma.accountBalance.delete({
      where: { id },
    });
  }

  async calculateBalanceAtDate(targetDate: Date, accountId?: string | null) {
    // 1. Find the most recent AccountBalance before or on targetDate
    const latestBalance = await this.findLatestBeforeOrOn(
      targetDate,
      accountId,
    );

    const startingBalance = latestBalance
      ? latestBalance.balance.toNumber()
      : 0;
    const startDate = latestBalance ? latestBalance.asOfDate : new Date(0);

    // 2. Sum all transactions between startDate (exclusive) and targetDate (inclusive)
    const whereClause: any = {
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
