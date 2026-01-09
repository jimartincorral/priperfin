import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { GetTransactionsDto, DateFilterMode } from './get-transactions.dto';
import { CreateSplitsDto } from './create-split.dto';
import { RulesService } from '../rules/rules.service';
import { RuleMode } from '../generated/client';
import * as crypto from 'crypto';
import { Prisma } from '../generated/client';

@Injectable()
export class TransactionsService {
  private logger = new Logger(TransactionsService.name);

  constructor(
    private prisma: PrismaService,
    private rulesService: RulesService,
  ) {}

  async create(dto: CreateTransactionDto) {
    const transaction = await this.prisma.transaction.create({
      data: {
        ...dto,
        merchant: null, // Deprecated
      },
    });

    // Evaluate rules
    const match = await this.rulesService.evaluateTransaction(transaction);

    if (match) {
      const updateData: any = {
        suggestedByRuleId: match.rule.id,
      };

      if (match.mode === RuleMode.AUTO_APPLY && match.categoryId) {
        updateData.categoryId = match.categoryId;
      }

      return this.prisma.transaction.update({
        where: { id: transaction.id },
        data: updateData,
      });
    }

    return transaction;
  }

  async getBalance() {
    const result = await this.prisma.transaction.aggregate({
      _sum: { amount: true },
    });
    return { total: result._sum.amount ? result._sum.amount.toNumber() : 0 };
  }

  async suggestCategory(description: string, notes?: string) {
    if (!description) return null;

    // Create a minimal mock transaction for rule evaluation
    const mockTx = {
        description,
        notes: notes || null,
        amount: new Prisma.Decimal(0),
        date: new Date(),
        merchant: null,
        id: 'temp',
        categoryId: null,
        accountId: null,
        costObjectId: null,
        suggestedCategoryId: null,
        suggestedByRuleId: null,
        externalId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        splits: []
    } as any;

    const match = await this.rulesService.evaluateTransaction(mockTx);
    if (match && match.categoryId) {
        return { categoryId: match.categoryId, source: 'rule', ruleId: match.rule.id };
    }
    
    return { categoryId: null, source: null };
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
      return {
        balance: initialBalance - txSum,
        type: 'CREDIT',
        accountName: account.name,
      };
    }

    return {
      balance: initialBalance + txSum,
      type: 'DEBIT',
      accountName: account.name,
    };
  }

  async findAll(query: GetTransactionsDto) {
    const { filterMode, month, year, startDate, endDate, accountId } = query;
    const where: any = {};

    switch (filterMode) {
      case DateFilterMode.MONTH:
        if (month && year) {
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 1);
          where.date = { gte: start, lt: end };
        }
        break;

      case DateFilterMode.YEAR:
        if (year) {
          const start = new Date(year, 0, 1);
          const end = new Date(year + 1, 0, 1);
          where.date = { gte: start, lt: end };
        }
        break;

      case DateFilterMode.CUSTOM:
        if (startDate || endDate) {
          where.date = {};
          if (startDate) {
            where.date.gte = new Date(startDate);
          }
          if (endDate) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            where.date.lte = endDateObj;
          }
        }
        break;

      case DateFilterMode.ALL_TIME:
        break;

      default:
        if (month && year) {
          const start = new Date(year, month - 1, 1);
          const end = new Date(year, month, 1);
          where.date = { gte: start, lt: end };
        } else if (year) {
          const start = new Date(year, 0, 1);
          const end = new Date(year + 1, 0, 1);
          where.date = { gte: start, lt: end };
        }
    }

    if (accountId) {
      where.accountId = accountId;
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        costObject: true,
        suggestedRule: { include: { category: true } }, // Include suggested rule and its category
        splits: {
          include: {
            category: true,
            costObject: true,
          },
        },
      },
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

  async propagateCategory(description: string, categoryId: string) {
    try {
      const result = await this.prisma.transaction.updateMany({
        where: {
          description: { equals: description },
          categoryId: null,
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
          headers.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      console.log(`[CSV Import] Parsed ${records.length} records`);

      const transactionsToCreate = records
        .map((record: any, index: number) => {
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
            externalId: '',
          };
          dto.externalId = this.generateHash(dto);
          return dto;
        })
        .filter((t) => t !== null);

      if (transactionsToCreate.length === 0) {
        console.warn('[CSV Import] No valid transactions found to import');
        return { count: 0, message: 'No valid records found' };
      }

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

  async createMany(
    dtos: CreateTransactionDto[],
    force: boolean = false,
    mergeInstructions: any[] = [],
  ) {
    console.log(`[TransactionsService] createMany called with ${dtos?.length} transactions, force=${force}`);

    if (!dtos || !Array.isArray(dtos)) {
      console.warn(
        '[TransactionsService] createMany called with invalid dtos:',
        dtos,
      );
      return {
        newCount: 0,
        duplicateCount: 0,
        duplicates: [],
        manualMatchCount: 0,
        manualMatches: [],
      };
    }

    const enhancedDtos = await Promise.all(
      dtos.map(async (dto) => {
        let categoryId = dto.categoryId;
        let suggestedByRuleId = null;

        // Mock transaction for rule evaluation
        const mockTx = {
            ...dto,
            amount: new Prisma.Decimal(dto.amount),
            date: new Date(dto.date),
            merchant: null,
            id: 'temp',
            accountId: null,
            costObjectId: null,
            suggestedCategoryId: null,
            suggestedByRuleId: null,
            externalId: null,
            createdAt: new Date(),
            updatedAt: new Date(),
            splits: []
        } as any;

        // Evaluate rules
        const match = await this.rulesService.evaluateTransaction(mockTx);
        if (match) {
            if (match.mode === RuleMode.AUTO_APPLY && match.categoryId) {
                categoryId = match.categoryId;
                suggestedByRuleId = match.rule.id;
            } else {
                suggestedByRuleId = match.rule.id;
            }
        }

        return {
          ...dto,
          categoryId,
          merchant: null,
          suggestedByRuleId,
          externalId: dto.externalId || this.generateHash(dto),
        };
      }),
    );

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

    const seenInBatch = new Map<string, number>();
    const newTransactions: typeof enhancedDtos = [];
    const duplicates: Array<(typeof enhancedDtos)[0] & { reason: string; batchIndex?: number }> = [];

    for (const d of enhancedDtos) {
      if (d.externalId && existingIds.has(d.externalId)) {
        duplicates.push({ ...d, reason: 'database' });
      } else if (d.externalId && seenInBatch.has(d.externalId)) {
        const count = seenInBatch.get(d.externalId)! + 1;
        seenInBatch.set(d.externalId, count);
        duplicates.push({ ...d, reason: 'batch', batchIndex: count });
      } else {
        if (d.externalId) {
          seenInBatch.set(d.externalId, 1);
        }
        newTransactions.push(d);
      }
    }

    console.log(`[TransactionsService] createMany: ${newTransactions.length} new, ${duplicates.length} duplicates`);

    if (!force && duplicates.length > 0) {
      return {
        newCount: newTransactions.length,
        duplicateCount: duplicates.length,
        duplicates: duplicates.map((d) => ({
          date: d.date,
          amount: d.amount,
          description: d.description,
          externalId: d.externalId,
          reason: d.reason,
          batchIndex: d.batchIndex,
        })),
        manualMatchCount: 0,
        manualMatches: [],
      };
    }

    const manualMatches = await this.findManualMatches(
      enhancedDtos,
      newTransactions,
    );

    if (!force && manualMatches.length > 0) {
      return {
        newCount: newTransactions.length,
        duplicateCount: 0,
        duplicates: [],
        manualMatchCount: manualMatches.length,
        manualMatches: manualMatches,
      };
    }

    let transactionsToImport = force
      ? enhancedDtos.map((d) => {
          if (d.externalId && existingIds.has(d.externalId)) {
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

    if (force && mergeInstructions && mergeInstructions.length > 0) {
      transactionsToImport = await this.executeMerges(
        mergeInstructions,
        transactionsToImport,
      );
    }

    if (transactionsToImport.length === 0) {
      return {
        newCount: 0,
        duplicateCount: duplicates.length,
        duplicates: [],
        manualMatchCount: 0,
        manualMatches: [],
      };
    }

    const result = await this.prisma.transaction.createMany({
      data: transactionsToImport,
    });

    const response = {
      newCount: result.count,
      duplicateCount: force ? 0 : duplicates.length,
      duplicates: [],
      manualMatchCount: 0,
      manualMatches: [],
    };
    console.log('[TransactionsService] createMany returning:', response);
    return response;
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

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        costObject: true,
        account: true,
        splits: {
          include: {
            category: true,
            costObject: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async createSplits(transactionId: string, dto: CreateSplitsDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { splits: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    if (transaction.splits && transaction.splits.length > 0) {
      throw new BadRequestException(
        'Transaction already has splits. Use update instead.',
      );
    }

    const totalSplitAmount = dto.splits.reduce(
      (sum, split) => sum + split.amount,
      0,
    );
    const parentAmount = transaction.amount.toNumber();
    const diff = Math.abs(totalSplitAmount - parentAmount);

    if (diff > 0.01) {
      throw new BadRequestException(
        `Splits sum (${totalSplitAmount}) does not match parent amount (${parentAmount})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionSplit.createMany({
        data: dto.splits.map((split) => ({
          parentId: transactionId,
          amount: split.amount,
          categoryId: split.categoryId,
          costObjectId: split.costObjectId,
          description: split.description,
        })),
      });

      return tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          splits: {
            include: {
              category: true,
              costObject: true,
            },
          },
        },
      });
    });
  }

  async updateSplits(transactionId: string, dto: CreateSplitsDto) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    const totalSplitAmount = dto.splits.reduce(
      (sum, split) => sum + split.amount,
      0,
    );
    const parentAmount = transaction.amount.toNumber();
    const diff = Math.abs(totalSplitAmount - parentAmount);

    if (diff > 0.01) {
      throw new BadRequestException(
        `Splits sum (${totalSplitAmount}) does not match parent amount (${parentAmount})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.transactionSplit.deleteMany({
        where: { parentId: transactionId },
      });

      await tx.transactionSplit.createMany({
        data: dto.splits.map((split) => ({
          parentId: transactionId,
          amount: split.amount,
          categoryId: split.categoryId,
          costObjectId: split.costObjectId,
          description: split.description,
        })),
      });

      return tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          splits: {
            include: {
              category: true,
              costObject: true,
            },
          },
        },
      });
    });
  }

  async deleteSplits(transactionId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { splits: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    await this.prisma.transactionSplit.deleteMany({
      where: { parentId: transactionId },
    });

    return { message: 'Splits deleted successfully' };
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    const lower1 = desc1.toLowerCase();
    const lower2 = desc2.toLowerCase();

    if (lower1.includes(lower2) || lower2.includes(lower1)) {
      return 100;
    }

    const distance = this.levenshteinDistance(lower1, lower2);
    const maxLen = Math.max(desc1.length, desc2.length);
    const similarity = ((maxLen - distance) / maxLen) * 100;

    return similarity;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private calculateMatchScore(
    daysDiff: number,
    amountDiff: number,
    amountPercent: number,
    descScore: number,
  ): number {
    const dateScore = Math.max(0, 100 - daysDiff * 33.33);
    const amountScore = Math.max(
      0,
      100 - Math.max(amountDiff * 100, amountPercent * 50),
    );

    return descScore * 0.5 + dateScore * 0.3 + amountScore * 0.2;
  }

  private async findManualMatches(
    allDtos: CreateTransactionDto[],
    newDtos: CreateTransactionDto[],
  ): Promise<any[]> {
    if (newDtos.length === 0) return [];

    const dates = newDtos.map((d) => new Date(d.date));
    const minDate = new Date(
      Math.min(...dates.map((d) => d.getTime())) - 30 * 24 * 60 * 60 * 1000,
    );
    const maxDate = new Date(
      Math.max(...dates.map((d) => d.getTime())) + 30 * 24 * 60 * 60 * 1000,
    );

    const manualTransactions = await this.prisma.transaction.findMany({
      where: {
        externalId: null,
        date: { gte: minDate, lte: maxDate },
      },
      select: {
        id: true,
        date: true,
        amount: true,
        description: true,
        categoryId: true,
        costObjectId: true,
        notes: true,
      },
    });

    const matches: any[] = [];

    newDtos.forEach((imported, importedIndex) => {
      const importedDate = new Date(imported.date);
      const importedAmount = imported.amount;

      manualTransactions.forEach((manual) => {
        const manualDate = new Date(manual.date);
        const daysDiff = Math.abs(
          (manualDate.getTime() - importedDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        if (daysDiff > 3) return;

        const amountDiff = Math.abs(manual.amount.toNumber() - importedAmount);
        const amountPercent = (amountDiff / Math.abs(importedAmount)) * 100;
        if (amountDiff > 0.5 && amountPercent > 1) return;

        const descScore = this.calculateDescriptionSimilarity(
          manual.description,
          imported.description,
        );
        if (descScore < 50) return;

        const matchScore = this.calculateMatchScore(
          daysDiff,
          amountDiff,
          amountPercent,
          descScore,
        );

        matches.push({
          manualId: manual.id,
          importedTempId: `import-${importedIndex}`,
          manualDate: manual.date.toISOString(),
          importedDate: imported.date,
          manualAmount: manual.amount.toNumber(),
          importedAmount: importedAmount,
          manualDescription: manual.description,
          importedDescription: imported.description,
          manualCategoryId: manual.categoryId,
          importedCategoryId: imported.categoryId || null,
          manualNotes: manual.notes,
          importedNotes: imported.notes || null,
          matchScore: Math.round(matchScore),
        });
      });
    });

    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private async executeMerges(
    mergeInstructions: any[],
    importedDtos: any[],
  ): Promise<any[]> {
    const processedIndices = new Set<number>();

    for (const instruction of mergeInstructions) {
      const { manualId, importedTempId } = instruction;

      const importedIndex = parseInt(importedTempId.replace('import-', ''));
      const importedDto = importedDtos[importedIndex];

      if (!importedDto || processedIndices.has(importedIndex)) continue;

      const manual = await this.prisma.transaction.findUnique({
        where: { id: manualId },
      });

      if (!manual) {
        console.warn(
          `Manual transaction ${manualId} not found, skipping merge`,
        );
        continue;
      }

      const mergedData = {
        ...importedDto,
        categoryId: manual.categoryId || importedDto.categoryId || null,
        costObjectId: manual.costObjectId || importedDto.costObjectId || null,
        notes: this.mergeNotes(manual.notes, importedDto.notes || null),
      };

      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.create({ data: mergedData });
        await tx.transaction.delete({ where: { id: manualId } });
      });

      processedIndices.add(importedIndex);
    }

    return importedDtos.filter((_, index) => !processedIndices.has(index));
  }

  private mergeNotes(
    manualNotes: string | null,
    importedNotes: string | null,
  ): string | null {
    if (!manualNotes && !importedNotes) return null;
    if (!manualNotes) return importedNotes;
    if (!importedNotes) return manualNotes;
    return `Manual: ${manualNotes} | Imported: ${importedNotes}`;
  }
}
