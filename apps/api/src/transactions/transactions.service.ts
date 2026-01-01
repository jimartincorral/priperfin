import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { GetTransactionsDto } from './get-transactions.dto';
import { CreateSplitsDto } from './create-split.dto';
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
      include: {
        category: true,
        costObject: true,
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

  async createMany(
    dtos: CreateTransactionDto[],
    force: boolean = false,
    mergeInstructions: any[] = [],
  ) {
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
        manualMatchCount: 0,
        manualMatches: [],
      };
    }

    // Find manual matches (only for new transactions, not duplicates)
    const manualMatches = await this.findManualMatches(
      enhancedDtos,
      newTransactions,
    );

    // If force=false and manual matches exist, return them for user review
    if (!force && manualMatches.length > 0) {
      return {
        newCount: newTransactions.length,
        duplicateCount: 0,
        duplicates: [],
        manualMatchCount: manualMatches.length,
        manualMatches: manualMatches,
      };
    }

    // If force=true, import everything (including duplicates by regenerating their IDs)
    let transactionsToImport = force
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

    // Execute merges if merge instructions provided
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

    return {
      newCount: result.count,
      duplicateCount: force ? 0 : duplicates.length,
      duplicates: [],
      manualMatchCount: 0,
      manualMatches: [],
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
    // Validate transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { splits: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Validate no existing splits
    if (transaction.splits && transaction.splits.length > 0) {
      throw new BadRequestException(
        'Transaction already has splits. Use update instead.',
      );
    }

    // Validate splits sum to parent amount (±0.01 tolerance)
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

    // Create splits in a transaction
    return this.prisma.$transaction(async (tx) => {
      // Create all splits
      await tx.transactionSplit.createMany({
        data: dto.splits.map((split) => ({
          parentId: transactionId,
          amount: split.amount,
          categoryId: split.categoryId,
          costObjectId: split.costObjectId,
          description: split.description,
        })),
      });

      // Return updated transaction with splits
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
    // Validate transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Validate splits sum to parent amount (±0.01 tolerance)
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

    // Update splits in a transaction (delete all, create new)
    return this.prisma.$transaction(async (tx) => {
      // Delete existing splits
      await tx.transactionSplit.deleteMany({
        where: { parentId: transactionId },
      });

      // Create new splits
      await tx.transactionSplit.createMany({
        data: dto.splits.map((split) => ({
          parentId: transactionId,
          amount: split.amount,
          categoryId: split.categoryId,
          costObjectId: split.costObjectId,
          description: split.description,
        })),
      });

      // Return updated transaction with splits
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
    // Validate transaction exists
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { splits: true },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Transaction with ID ${transactionId} not found`,
      );
    }

    // Delete all splits
    await this.prisma.transactionSplit.deleteMany({
      where: { parentId: transactionId },
    });

    return { message: 'Splits deleted successfully' };
  }

  private calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    const lower1 = desc1.toLowerCase();
    const lower2 = desc2.toLowerCase();

    // Check substring match
    if (lower1.includes(lower2) || lower2.includes(lower1)) {
      return 100;
    }

    // Levenshtein distance
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
    // Weighted scoring: description (50%), date (30%), amount (20%)
    const dateScore = Math.max(0, 100 - daysDiff * 33.33); // 3 days = 0 score
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

    // Calculate date range from newDtos
    const dates = newDtos.map((d) => new Date(d.date));
    const minDate = new Date(
      Math.min(...dates.map((d) => d.getTime())) - 30 * 24 * 60 * 60 * 1000,
    );
    const maxDate = new Date(
      Math.max(...dates.map((d) => d.getTime())) + 30 * 24 * 60 * 60 * 1000,
    );

    // Fetch manual transactions in date range
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

    // For each imported transaction, find fuzzy matches
    newDtos.forEach((imported, importedIndex) => {
      const importedDate = new Date(imported.date);
      const importedAmount = imported.amount;

      manualTransactions.forEach((manual) => {
        const manualDate = new Date(manual.date);
        const daysDiff = Math.abs(
          (manualDate.getTime() - importedDate.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        // Check date proximity (±3 days)
        if (daysDiff > 3) return;

        // Check amount similarity
        const amountDiff = Math.abs(manual.amount.toNumber() - importedAmount);
        const amountPercent = (amountDiff / Math.abs(importedAmount)) * 100;
        if (amountDiff > 0.5 && amountPercent > 1) return;

        // Check description similarity (use helper method)
        const descScore = this.calculateDescriptionSimilarity(
          manual.description,
          imported.description,
        );
        if (descScore < 50) return; // Threshold: 50% similarity

        // Calculate overall match score
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

    // Sort by match score (highest first)
    return matches.sort((a, b) => b.matchScore - a.matchScore);
  }

  private async executeMerges(
    mergeInstructions: any[],
    importedDtos: any[],
  ): Promise<any[]> {
    const processedIndices = new Set<number>();

    for (const instruction of mergeInstructions) {
      const { manualId, importedTempId } = instruction;

      // Find the imported DTO by tempId
      const importedIndex = parseInt(importedTempId.replace('import-', ''));
      const importedDto = importedDtos[importedIndex];

      if (!importedDto || processedIndices.has(importedIndex)) continue;

      // Fetch manual transaction
      const manual = await this.prisma.transaction.findUnique({
        where: { id: manualId },
      });

      if (!manual) {
        console.warn(
          `Manual transaction ${manualId} not found, skipping merge`,
        );
        continue;
      }

      // Merge logic: Prefer manual categoryId/costObjectId, concatenate notes
      const mergedData = {
        ...importedDto,
        categoryId: manual.categoryId || importedDto.categoryId || null,
        costObjectId: manual.costObjectId || importedDto.costObjectId || null,
        notes: this.mergeNotes(manual.notes, importedDto.notes || null),
      };

      // Execute in transaction
      await this.prisma.$transaction(async (tx) => {
        // Create merged transaction (imported)
        await tx.transaction.create({ data: mergedData });

        // Delete manual transaction
        await tx.transaction.delete({ where: { id: manualId } });
      });

      // Mark this index as processed
      processedIndices.add(importedIndex);
    }

    // Remove merged transactions from the list
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
