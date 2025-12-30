import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { GetTransactionsDto } from './get-transactions.dto';
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: dto,
    });
  }

  async getBalance() {
    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
    });
    return { total: result._sum.amount ? result._sum.amount.toNumber() : 0 };
  }

  async getAccountBalance(accountId: string) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      return { balance: 0, type: 'DEBIT' };
    }

    const result = await this.prisma.transaction.aggregate({
      where: { accountId },
      _sum: { amount: true },
    });

    const txSum = result._sum.amount?.toNumber() || 0;
    const initialBalance = account.initialBalance.toNumber();

    if (account.type === 'CREDIT') {
      // For credit accounts: owed = initial - sum
      // (purchases are negative, so -(-50) = +50 to debt; payments are positive, so -(+100) = -100 to debt)
      return {
        balance: initialBalance - txSum,
        type: 'CREDIT',
        accountName: account.name,
      };
    }

    // For debit accounts: balance = initial + sum
    return {
      balance: initialBalance + txSum,
      type: 'DEBIT',
      accountName: account.name,
    };
  }

  async suggestCategory(description: string) {
    if (!description) return { categoryId: null };

    // Find the most recent transaction with a similar description that has a category
    const match = await this.prisma.transaction.findFirst({
      where: {
        description: {
          contains: description,
        },
        categoryId: { not: null },
      },
      orderBy: { date: 'desc' },
      select: { categoryId: true },
    });

    return { categoryId: match?.categoryId || null };
  }

  async findAll(query: GetTransactionsDto) {
    const { month, year, accountId } = query;
    const where: any = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    } else if (year) {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year + 1, 0, 1);
      where.date = {
        gte: startDate,
        lt: endDate,
      };
    }

    // Filter by account if specified
    if (accountId) {
      where.accountId = accountId;
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true, costObject: true },
    });
  }

  async update(id: string, dto: any) {
    console.log(`[TransactionsService] Updating ${id} with:`, dto);
    try {
      const updated = await this.prisma.transaction.update({
        where: { id },
        data: dto,
      });

      return updated;
    } catch (e) {
      console.error(`[TransactionsService] Update failed for ${id}:`, e);
      throw e;
    }
  }

  // Public method for manual bulk update
  async propagateCategory(description: string, categoryId: string) {
    try {
      const result = await this.prisma.transaction.updateMany({
        where: {
          description: { equals: description }, // Strict match on description
          categoryId: null, // Only update uncategorized ones
        },
        data: { categoryId },
      });
      console.log(
        `[Ripple Effect] Updated ${result.count} transactions for "${description}"`,
      );
      return { count: result.count };
    } catch (e) {
      console.error('[Ripple Effect] Failed to propagate', e);
      throw e;
    }
  }

  async import(fileBuffer: Buffer) {
    try {
      const { parse } = await import('csv-parse/sync');
      const records = parse(fileBuffer, {
        columns: (headers: string[]) =>
          headers.map((h) => h.trim().toLowerCase()), // Case-insensitive headers
        skip_empty_lines: true,
        trim: true,
        bom: true, // Handle Excel BOM
      });

      console.log(`[CSV Import] Parsed ${records.length} records`);

      const transactionsToCreate = records
        .map((record: any, index: number) => {
          // Map common column variations
          const amountRaw =
            record.amount || record['amount (eur)'] || record['amount (usd)'];
          const dateRaw = record.date || record['transaction date'];
          const descRaw = record.description || record.memo || record.payee;
          const notesRaw =
            record.notes || record.note || record.comment || record.narrative;

          if (!amountRaw || !dateRaw) {
            console.warn(
              `[CSV Import] Skipping row ${index + 1}: Missing amount or date`,
              record,
            );
            return null;
          }

          const amount = parseFloat(amountRaw);
          const description = descRaw || 'Imported Transaction';
          const date = new Date(dateRaw);

          // Basic validation/sanitization
          if (isNaN(amount) || isNaN(date.getTime())) {
            console.warn(
              `[CSV Import] Skipping row ${index + 1}: Invalid data`,
              { amount, date: dateRaw },
            );
            return null;
          }

          const dto: CreateTransactionDto = {
            date: date.toISOString(),
            amount,
            description,
            notes: notesRaw || null,
            externalId: '', // Temporary
          };
          dto.externalId = this.generateHash(dto);
          return dto;
        })
        .filter((t) => t !== null);

      if (transactionsToCreate.length === 0) {
        console.warn('[CSV Import] No valid transactions found to import');
        return { count: 0, message: 'No valid records found' };
      }

      // Manual filter for duplicates (SQLite skipDuplicates compatibility)
      const externalIds = transactionsToCreate
        .map((t) => t.externalId)
        .filter((id) => !!id) as string[];
      const existingTransactions = await this.prisma.transaction.findMany({
        where: { externalId: { in: externalIds } },
        select: { externalId: true },
      });
      const existingIds = new Set(
        existingTransactions.map((t) => t.externalId),
      );
      const newTransactions = transactionsToCreate.filter(
        (t) => !t.externalId || !existingIds.has(t.externalId),
      );

      if (newTransactions.length === 0) {
        return { count: 0, skipped: transactionsToCreate.length };
      }

      const result = await this.prisma.transaction.createMany({
        data: newTransactions as any,
      });

      console.log(
        `[CSV Import] Successfully imported ${result.count} transactions`,
      );
      return {
        count: result.count,
        skipped: transactionsToCreate.length - result.count,
      };
    } catch (error) {
      console.error('[CSV Import] Failed to parse CSV:', error);
      throw new Error(`CSV Import Failed: ${error.message}`);
    }
  }

  async createMany(dtos: CreateTransactionDto[], force: boolean = false) {
    if (!dtos || !Array.isArray(dtos)) {
      console.warn(
        '[TransactionsService] createMany called with invalid dtos:',
        dtos,
      );
      return { newCount: 0, duplicateCount: 0, duplicates: [] };
    }

    const enhancedDtos = await Promise.all(
      dtos.map(async (dto) => {
        let categoryId = dto.categoryId;
        if (!categoryId || categoryId === 'uncategorized') {
          const suggestion = await this.suggestCategory(dto.description);
          if (suggestion && suggestion.categoryId) {
            categoryId = suggestion.categoryId;
          }
        }

        return {
          ...dto,
          categoryId,
          externalId: dto.externalId || this.generateHash(dto),
        };
      }),
    );

    // SQLite doesn't always support skipDuplicates in createMany reliably in all Prisma setups
    // Manual filter: Find existing externalIds
    const externalIds = enhancedDtos
      .map((d) => d.externalId)
      .filter((id) => !!id);

    const existingTransactions = await this.prisma.transaction.findMany({
      where: {
        externalId: { in: externalIds },
      },
      select: { externalId: true, date: true, amount: true, description: true },
    });

    const existingIds = new Set(existingTransactions.map((t) => t.externalId));
    const newTransactions = enhancedDtos.filter(
      (d) => !d.externalId || !existingIds.has(d.externalId),
    );
    const duplicates = enhancedDtos.filter(
      (d) => d.externalId && existingIds.has(d.externalId),
    );

    // If force=false and duplicates exist, return them for user review
    if (!force && duplicates.length > 0) {
      return {
        newCount: newTransactions.length,
        duplicateCount: duplicates.length,
        duplicates: duplicates.map((d) => ({
          date: d.date,
          amount: d.amount,
          description: d.description,
          externalId: d.externalId,
        })),
      };
    }

    // If force=true, import everything (including duplicates by regenerating their IDs)
    const transactionsToImport = force
      ? enhancedDtos.map((d) => {
          // Check if it's already in DB
          if (d.externalId && existingIds.has(d.externalId)) {
            // Return a copy with a unique externalId to allow re-import
            return {
              ...d,
              externalId:
                this.generateHash(d) +
                '_retry_' +
                Date.now() +
                '_' +
                Math.random().toString(36).substring(2, 9),
            };
          }
          return d;
        })
      : newTransactions;

    if (transactionsToImport.length === 0) {
      return { newCount: 0, duplicateCount: duplicates.length, duplicates: [] };
    }

    const result = await this.prisma.transaction.createMany({
      data: transactionsToImport,
    });

    return {
      newCount: result.count,
      duplicateCount: force ? 0 : duplicates.length,
      duplicates: [],
    };
  }

  generateHash(dto: CreateTransactionDto): string {
    const data = `${dto.date}_${dto.amount}_${dto.description}`;
    return crypto.createHash('md5').update(data).digest('hex');
  }

  async remove(id: string) {
    return this.prisma.transaction.delete({
      where: { id },
    });
  }
}
