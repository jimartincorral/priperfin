import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { CreateTransferDto, LinkTransferDto } from './create-transfer.dto';
import { GetTransactionsDto, DateFilterMode } from './get-transactions.dto';
import { CreateSplitsDto } from './create-split.dto';
import {
  utcDayStart,
  utcNextDay,
  utcMonthRange,
  utcYearRange,
} from './date-ranges';
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

  async create(dto: CreateTransactionDto, profileId: string) {
    // Disabled: too verbose during imports
    // this.logger.log(`Creating transaction: ${dto.description} (${dto.amount})`);
    const transaction = await this.prisma.transaction.create({
      data: {
        ...dto,
        profileId,
        merchant: null, // Deprecated
      },
    });

    if (dto.isTransfer) {
      return transaction;
    }

    // Evaluate rules
    const match = await this.rulesService.evaluateTransaction(
      transaction,
      profileId,
    );

    if (match) {
      // Disabled: too verbose during imports
      // this.logger.log(
      //   `Rule match found: ${match.rule.name}, mode: ${match.mode}`,
      // );
      const updateData: Prisma.TransactionUpdateInput = {
        suggestedRule: {
          connect: { id: match.rule.id },
        },
      };

      if (match.mode === RuleMode.AUTO_APPLY && match.categoryId) {
        // Disabled: too verbose during imports
        // this.logger.log(`Auto-applying category: ${match.categoryId}`);
        updateData.category = {
          connect: { id: match.categoryId },
        };
      }

      return this.prisma.transaction.update({
        where: { id: transaction.id },
        data: updateData,
      });
    }

    return transaction;
  }

  async getBalance(profileId: string) {
    const result = await this.prisma.transaction.aggregate({
      where: { profileId },
      _sum: { amount: true },
    });
    return { total: result._sum.amount ? result._sum.amount.toNumber() : 0 };
  }

  async suggestCategory(
    description: string,
    profileId: string,
    notes?: string,
  ) {
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
      profileId,
      suggestedCategoryId: null,
      suggestedByRuleId: null,
      externalId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      splits: [],
    } as any; // Mock transaction for rule evaluation

    const match = await this.rulesService.evaluateTransaction(
      mockTx,
      profileId,
    );
    if (match && match.categoryId) {
      return {
        categoryId: match.categoryId,
        source: 'rule',
        ruleId: match.rule.id,
      };
    }

    return { categoryId: null, source: null };
  }

  async getAccountBalance(accountId: string, profileId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id: accountId, profileId },
    });

    if (!account) {
      return { balance: 0, type: 'DEBIT' };
    }

    const result = await this.prisma.transaction.aggregate({
      where: { accountId, profileId },
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

  async findAll(query: GetTransactionsDto, profileId: string) {
    const { filterMode, month, year, startDate, endDate, accountId } = query;
    const where: Prisma.TransactionWhereInput = { profileId };

    switch (filterMode) {
      // Transaction dates are stored as UTC midnight, so every range boundary
      // is built in UTC too. Using the server's local time zone here shifted
      // transactions dated the 1st into the previous month west of UTC.
      case DateFilterMode.MONTH:
        if (month && year) {
          where.date = utcMonthRange(year, month);
        }
        break;

      case DateFilterMode.YEAR:
        if (year) {
          where.date = utcYearRange(year);
        }
        break;

      case DateFilterMode.CUSTOM:
        if (startDate || endDate) {
          where.date = {};
          if (startDate) {
            where.date.gte = utcDayStart(startDate);
          }
          if (endDate) {
            // Inclusive end date: everything before the next UTC midnight.
            where.date.lt = utcNextDay(endDate);
          }
        }
        break;

      case DateFilterMode.ALL_TIME:
        break;

      default:
        if (month && year) {
          where.date = utcMonthRange(year, month);
        } else if (year) {
          where.date = utcYearRange(year);
        }
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (query.type === 'transfer') {
      where.isTransfer = true;
    } else if (query.type === 'expense') {
      where.isTransfer = false;
      where.amount = { lt: 0 };
    } else if (query.type === 'income') {
      where.isTransfer = false;
      where.amount = { gt: 0 };
    }

    return this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        category: true,
        costObject: true,
        account: true,
        transferAccount: true,
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

  async update(
    id: string,
    profileId: string,
    dto: Prisma.TransactionUpdateInput,
  ) {
    this.logger.log(`Updating ${id} with: ${JSON.stringify(dto)}`);
    try {
      // Verify ownership
      const transaction = await this.prisma.transaction.findFirst({
        where: { id, profileId },
      });

      if (!transaction) {
        throw new NotFoundException('Transaction not found or access denied');
      }

      // Never let a client move a transaction to another profile or rewrite
      // its primary key through the update body.
      const {
        profileId: _ignoredProfileId,
        id: _ignoredId,
        ...safeDto
      } = dto as Prisma.TransactionUpdateInput & {
        profileId?: unknown;
        id?: unknown;
      };

      // The other leg of a transfer, if any. Looked up before writing so an
      // invalid account move is rejected instead of half-applied.
      const paired =
        transaction.isTransfer && transaction.transferId
          ? await this.prisma.transaction.findFirst({
              where: {
                transferId: transaction.transferId,
                id: { not: id },
                profileId,
              },
            })
          : null;

      const newAccountId = (safeDto as { accountId?: string | null }).accountId;
      if (paired && newAccountId !== undefined) {
        if (!newAccountId) {
          throw new BadRequestException(
            'A transfer leg must stay on an account',
          );
        }
        if (newAccountId === paired.accountId) {
          throw new BadRequestException(
            'A transfer cannot have both legs on the same account',
          );
        }
      }

      const updated = await this.prisma.transaction.update({
        where: { id },
        data: safeDto,
        include: {
          category: true,
          account: true,
          transferAccount: true,
        },
      });

      // If it's a transfer, synchronize the paired leg: same date, mirrored
      // amount, and its transferAccountId follows this leg's account.
      if (paired) {
        const pairedData: Prisma.TransactionUpdateInput = {};
        if (dto.date !== undefined) {
          pairedData.date = dto.date;
        }
        if (newAccountId !== undefined && newAccountId) {
          pairedData.transferAccount = { connect: { id: newAccountId } };
        }
        if (dto.amount !== undefined) {
          const rawAmount =
            typeof dto.amount === 'number'
              ? dto.amount
              : typeof (dto.amount as any)?.toNumber === 'function'
                ? (dto.amount as any).toNumber()
                : Number(dto.amount);
          if (!isNaN(rawAmount)) {
            pairedData.amount = new Prisma.Decimal(-rawAmount);
          }
        }
        if (Object.keys(pairedData).length > 0) {
          await this.prisma.transaction.update({
            where: { id: paired.id },
            data: pairedData,
          });
        }
      }

      return updated;
    } catch (e) {
      this.logger.error(`Update failed for ${id}:`, e);
      throw e;
    }
  }

  async propagateCategory(
    description: string,
    categoryId: string,
    profileId: string,
  ) {
    try {
      const result = await this.prisma.transaction.updateMany({
        where: {
          profileId,
          description: { equals: description },
          categoryId: null,
        },
        data: { categoryId },
      });
      this.logger.log(
        `[Ripple Effect] Updated ${result.count} transactions for "${description}"`,
      );
      return { count: result.count };
    } catch (e) {
      this.logger.error('[Ripple Effect] Failed to propagate', e);
      throw e;
    }
  }

  async bulkUpdateAccount(
    transactionIds: string[],
    accountId: string | null,
    profileId: string,
  ) {
    try {
      // Validate accountId if provided
      if (accountId) {
        const account = await this.prisma.account.findFirst({
          where: { id: accountId, profileId },
        });
        if (!account) {
          throw new BadRequestException('Invalid account ID');
        }
      }

      const result = await this.prisma.transaction.updateMany({
        where: {
          id: { in: transactionIds },
          profileId,
        },
        data: { accountId },
      });

      this.logger.log(
        `[Bulk Account Assignment] Updated ${result.count} transactions to account ${accountId || 'unassigned'}`,
      );
      return { count: result.count };
    } catch (e) {
      this.logger.error('[Bulk Account Assignment] Failed to update', e);
      throw e;
    }
  }

  async import(fileBuffer: Buffer, profileId: string) {
    try {
      const { parse } = await import('csv-parse/sync');
      const records = parse(fileBuffer, {
        columns: (headers: string[]) =>
          headers.map((h) => h.trim().toLowerCase()),
        skip_empty_lines: true,
        trim: true,
        bom: true,
      });

      this.logger.log(`[CSV Import] Parsed ${records.length} records`);

      const transactionsToCreate = records
        .map((record: any, index: number) => {
          const amountRaw =
            record.amount || record['amount (eur)'] || record['amount (usd)'];
          const dateRaw = record.date || record['transaction date'];
          const descRaw = record.description || record.memo || record.payee;
          const notesRaw =
            record.notes || record.note || record.comment || record.narrative;

          if (!amountRaw || !dateRaw) {
            this.logger.warn(
              `[CSV Import] Skipping row ${index + 1}: Missing amount or date: ${JSON.stringify(record)}`,
            );
            return null;
          }

          const amount = parseFloat(amountRaw);
          const description = descRaw || 'Imported Transaction';
          const date = new Date(dateRaw);

          if (isNaN(amount) || isNaN(date.getTime())) {
            this.logger.warn(
              `[CSV Import] Skipping row ${index + 1}: Invalid data - amount: ${amount}, date: ${dateRaw}`,
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
        this.logger.warn('[CSV Import] No valid transactions found to import');
        return { count: 0, message: 'No valid records found' };
      }

      // Two legitimate identical rows (same day, amount and description)
      // hash to the same externalId; give repeats a distinct id instead of
      // failing the whole file on the unique constraint.
      this.disambiguateBatchExternalIds(transactionsToCreate);

      const externalIds = transactionsToCreate
        .map((t) => t.externalId)
        .filter((id) => !!id) as string[];
      const existingTransactions = await this.prisma.transaction.findMany({
        where: { profileId, externalId: { in: externalIds } },
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
        data: newTransactions.map((t) => ({
          ...t,
          profileId,
          merchant: null,
        })),
      });

      this.logger.log(
        `[CSV Import] Successfully imported ${result.count} transactions`,
      );
      if (result.count > 0) {
        await this.recordImportMarker(profileId, newTransactions);
      }
      return {
        count: result.count,
        skipped: transactionsToCreate.length - result.count,
      };
    } catch (error) {
      this.logger.error('[CSV Import] Error processing file:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`CSV Import Failed: ${error.message}`);
    }
  }

  async createMany(
    dtos: CreateTransactionDto[],
    force: boolean = false,
    mergeInstructions: Array<{
      manualId: string;
      importedTempId: string;
    }> = [],
    profileId: string,
    skipDuplicatesAndInsert: boolean = false,
  ) {
    this.logger.log(
      `createMany called with ${dtos?.length} transactions, force=${force}, skipDuplicatesAndInsert=${skipDuplicatesAndInsert}`,
    );

    if (!dtos || !Array.isArray(dtos)) {
      this.logger.warn(
        `createMany called with invalid dtos: ${JSON.stringify(dtos)}`,
      );
      return {
        newCount: 0,
        duplicateCount: 0,
        duplicates: [],
        manualMatchCount: 0,
        manualMatches: [],
      };
    }

    // Rules with an "account" condition compare against the account name, so
    // the mock transaction below needs the real account attached.
    const accountsById = new Map(
      (
        await this.prisma.account.findMany({
          where: { profileId },
        })
      ).map((account) => [account.id, account]),
    );

    let enhancedDtos = await Promise.all(
      dtos.map(async (dto) => {
        let categoryId = dto.categoryId;
        let suggestedByRuleId = null;
        const account = dto.accountId
          ? (accountsById.get(dto.accountId) ?? null)
          : null;

        // Mock transaction for rule evaluation
        const mockTx = {
          ...dto,
          amount: new Prisma.Decimal(dto.amount),
          date: new Date(dto.date),
          merchant: null,
          profileId,
          id: 'temp',
          accountId: account?.id ?? null,
          account,
          costObjectId: dto.costObjectId ?? null,
          suggestedCategoryId: null,
          suggestedByRuleId: null,
          externalId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          splits: [],
        } as any; // Mock transaction for rule evaluation

        // Evaluate rules
        const match = await this.rulesService.evaluateTransaction(
          mockTx,
          profileId,
        );
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

    // Validate Foreign Keys to prevent constraints errors during import
    const categoryIds = new Set(
      enhancedDtos.map((d) => d.categoryId).filter((id) => !!id),
    );
    const ruleIds = new Set(
      enhancedDtos.map((d) => d.suggestedByRuleId).filter((id) => !!id),
    );
    const costObjectIds = new Set(
      enhancedDtos.map((d) => d.costObjectId).filter((id) => !!id),
    );
    const accountIds = new Set(
      enhancedDtos.map((d: any) => d.accountId).filter((id) => !!id),
    );

    let validCategoryIds = new Set<string>();
    if (categoryIds.size > 0) {
      const categories = await this.prisma.category.findMany({
        where: { id: { in: Array.from(categoryIds) as string[] }, profileId },
        select: { id: true },
      });
      validCategoryIds = new Set(categories.map((c) => c.id));
    }

    let validRuleIds = new Set<string>();
    if (ruleIds.size > 0) {
      const rules = await this.prisma.categorizationRule.findMany({
        where: { id: { in: Array.from(ruleIds) as string[] }, profileId },
        select: { id: true },
      });
      validRuleIds = new Set(rules.map((r) => r.id));
    }

    let validCostObjectIds = new Set<string>();
    if (costObjectIds.size > 0) {
      const costObjects = await this.prisma.costObject.findMany({
        where: { id: { in: Array.from(costObjectIds) as string[] }, profileId },
        select: { id: true },
      });
      validCostObjectIds = new Set(costObjects.map((c) => c.id));
    }

    let validAccountIds = new Set<string>();
    if (accountIds.size > 0) {
      const accounts = await this.prisma.account.findMany({
        where: { id: { in: Array.from(accountIds) as string[] }, profileId },
        select: { id: true },
      });
      validAccountIds = new Set(accounts.map((a) => a.id));
    }

    // Sanitize DTOs to ensure all IDs exist
    enhancedDtos = enhancedDtos.map((d) => ({
      ...d,
      categoryId:
        d.categoryId && validCategoryIds.has(d.categoryId)
          ? d.categoryId
          : null,
      suggestedByRuleId:
        d.suggestedByRuleId && validRuleIds.has(d.suggestedByRuleId)
          ? d.suggestedByRuleId
          : null,
      costObjectId:
        d.costObjectId && validCostObjectIds.has(d.costObjectId)
          ? d.costObjectId
          : null,
      accountId:
        (d as any).accountId && validAccountIds.has((d as any).accountId)
          ? (d as any).accountId
          : null,
    }));

    const externalIds = enhancedDtos
      .map((d) => d.externalId)
      .filter((id) => !!id);

    const existingTransactions = await this.prisma.transaction.findMany({
      where: {
        profileId,
        externalId: { in: externalIds },
      },
      select: { externalId: true, date: true, amount: true, description: true },
    });

    const existingIds = new Set(existingTransactions.map((t) => t.externalId));

    const seenInBatch = new Map<string, number>();
    const newTransactions: typeof enhancedDtos = [];
    const duplicates: Array<
      (typeof enhancedDtos)[0] & { reason: string; batchIndex?: number }
    > = [];

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

    this.logger.log(
      `createMany: ${newTransactions.length} new, ${duplicates.length} duplicates`,
    );

    if (!force && !skipDuplicatesAndInsert && duplicates.length > 0) {
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

    const manualMatches = !skipDuplicatesAndInsert
      ? await this.findManualMatches(enhancedDtos, newTransactions, profileId)
      : [];

    if (!force && !skipDuplicatesAndInsert && manualMatches.length > 0) {
      return {
        newCount: newTransactions.length,
        duplicateCount: 0,
        duplicates: [],
        manualMatchCount: manualMatches.length,
        manualMatches: manualMatches,
      };
    }

    let transactionsToImport = force
      ? this.disambiguateBatchExternalIds(
          enhancedDtos.map((d) => {
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
          }),
        )
      : newTransactions;

    if (force && mergeInstructions && mergeInstructions.length > 0) {
      transactionsToImport = (await this.executeMerges(
        mergeInstructions,
        transactionsToImport as any,
        profileId,
      )) as any;
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
      data: transactionsToImport.map((t) => ({ ...t, profileId })),
    });
    if (result.count > 0) {
      await this.recordImportMarker(profileId, transactionsToImport);
    }

    const response = {
      newCount: result.count,
      duplicateCount: force ? 0 : duplicates.length,
      duplicates: [],
      manualMatchCount: 0,
      manualMatches: [],
    };
    this.logger.log(`createMany returning: ${JSON.stringify(response)}`);
    return response;
  }

  /**
   * Make repeated externalIds within one batch distinct by suffixing the
   * second and later occurrences with "#2", "#3", ... The suffix is
   * deterministic, so re-importing the same file still detects every row as
   * a duplicate of what was stored.
   */
  private disambiguateBatchExternalIds<T extends { externalId?: string }>(
    items: T[],
  ): T[] {
    const seen = new Map<string, number>();
    for (const item of items) {
      if (!item.externalId) continue;
      const count = (seen.get(item.externalId) ?? 0) + 1;
      seen.set(item.externalId, count);
      if (count > 1) item.externalId = `${item.externalId}#${count}`;
    }
    return items;
  }

  /**
   * Remembers the last bulk import (CSV, wizard or bank sync) per profile so
   * the Home Assistant integration can fire an event when new transactions
   * arrive. Stored as a setting; never fatal for the import itself.
   */
  private async recordImportMarker(
    profileId: string,
    rows: Array<{ categoryId?: string | null; isTransfer?: boolean }>,
  ) {
    const marker = {
      at: new Date().toISOString(),
      newCount: rows.length,
      uncategorizedCount: rows.filter((r) => !r.categoryId && !r.isTransfer)
        .length,
    };
    const key = `ha_last_import_profile_${profileId}`;
    try {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(marker) },
        create: { key, value: JSON.stringify(marker) },
      });
    } catch (err) {
      this.logger.warn(`Could not record import marker: ${err?.message}`);
    }
  }

  generateHash(dto: CreateTransactionDto): string {
    const data = `${dto.date}_${dto.amount}_${dto.description}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  async remove(id: string, profileId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, profileId },
    });

    if (!tx) {
      throw new NotFoundException('Transaction not found or access denied');
    }

    if (tx.isTransfer && tx.transferId) {
      await this.prisma.transaction.deleteMany({
        where: { transferId: tx.transferId, profileId },
      });
      return { success: true, deletedTransfers: true };
    }

    await this.prisma.transaction.delete({
      where: { id },
    });

    return { success: true };
  }

  async findOne(id: string, profileId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, profileId },
      include: {
        category: true,
        costObject: true,
        account: true,
        transferAccount: true,
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

  async createTransfer(dto: CreateTransferDto, profileId: string) {
    if (dto.fromAccountId === dto.toAccountId) {
      throw new BadRequestException('From and To accounts must be different');
    }

    const [fromAccount, toAccount] = await Promise.all([
      this.prisma.account.findFirst({
        where: { id: dto.fromAccountId, profileId },
      }),
      this.prisma.account.findFirst({
        where: { id: dto.toAccountId, profileId },
      }),
    ]);

    if (!fromAccount) {
      throw new NotFoundException('Source account not found or access denied');
    }
    if (!toAccount) {
      throw new NotFoundException(
        'Destination account not found or access denied',
      );
    }

    const transferId = crypto.randomUUID();
    const absAmount = Math.abs(dto.amount);
    const date = new Date(dto.date);

    const descFrom = dto.description || `Transfer to ${toAccount.name}`;
    const descTo = dto.description || `Transfer from ${fromAccount.name}`;

    const [fromTransaction, toTransaction] = await this.prisma.$transaction([
      this.prisma.transaction.create({
        data: {
          date,
          amount: new Prisma.Decimal(-absAmount),
          description: descFrom,
          notes: dto.notes,
          accountId: fromAccount.id,
          isTransfer: true,
          transferId,
          transferAccountId: toAccount.id,
          profileId,
          merchant: null,
        },
        include: {
          account: true,
          transferAccount: true,
        },
      }),
      this.prisma.transaction.create({
        data: {
          date,
          amount: new Prisma.Decimal(absAmount),
          description: descTo,
          notes: dto.notes,
          accountId: toAccount.id,
          isTransfer: true,
          transferId,
          transferAccountId: fromAccount.id,
          profileId,
          merchant: null,
        },
        include: {
          account: true,
          transferAccount: true,
        },
      }),
    ]);

    return { fromTransaction, toTransaction };
  }

  async linkAsTransfer(dto: LinkTransferDto, profileId: string) {
    if (dto.transactionAId === dto.transactionBId) {
      throw new BadRequestException('Cannot link a transaction to itself');
    }

    const [txA, txB] = await Promise.all([
      this.prisma.transaction.findFirst({
        where: { id: dto.transactionAId, profileId },
      }),
      this.prisma.transaction.findFirst({
        where: { id: dto.transactionBId, profileId },
      }),
    ]);

    if (!txA || !txB) {
      throw new NotFoundException('One or both transactions not found');
    }

    if (!txA.accountId || !txB.accountId || txA.accountId === txB.accountId) {
      throw new BadRequestException(
        'Transfer transactions must belong to two different accounts',
      );
    }

    // A leg that is already part of a transfer would leave its old partner
    // orphaned (still flagged as a transfer, pointing at a dead transferId).
    if (txA.isTransfer || txB.isTransfer) {
      throw new BadRequestException(
        'One of the transactions is already part of a transfer. Unlink it first.',
      );
    }

    // Both legs must describe the same movement of money: equal amounts with
    // opposite signs. Anything else silently removes money from every report,
    // because transfers are excluded from income and expenses.
    const amountA = txA.amount.toNumber();
    const amountB = txB.amount.toNumber();
    if (amountA === 0 || Math.abs(amountA + amountB) > 0.005) {
      throw new BadRequestException(
        'Transfer legs must have equal and opposite amounts',
      );
    }

    const transferId = crypto.randomUUID();

    const [updatedA, updatedB] = await this.prisma.$transaction([
      this.prisma.transaction.update({
        where: { id: txA.id },
        data: {
          isTransfer: true,
          transferId,
          transferAccountId: txB.accountId,
          categoryId: null,
        },
        include: { account: true, transferAccount: true },
      }),
      this.prisma.transaction.update({
        where: { id: txB.id },
        data: {
          isTransfer: true,
          transferId,
          transferAccountId: txA.accountId,
          categoryId: null,
        },
        include: { account: true, transferAccount: true },
      }),
    ]);

    return { success: true, transferId, transactions: [updatedA, updatedB] };
  }

  async unlinkTransfer(id: string, profileId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, profileId },
    });
    if (!tx || !tx.transferId) {
      throw new NotFoundException('Transfer transaction not found');
    }

    await this.prisma.transaction.updateMany({
      where: { transferId: tx.transferId, profileId },
      data: {
        isTransfer: false,
        transferId: null,
        transferAccountId: null,
      },
    });

    return { success: true };
  }

  async findTransferMatches(profileId: string) {
    const candidateTransactions = await this.prisma.transaction.findMany({
      where: {
        profileId,
        isTransfer: false,
        accountId: { not: null },
      },
      orderBy: { date: 'desc' },
      take: 200,
      include: { account: true },
    });

    const matches: Array<{
      source: any;
      target: any;
      confidence: number;
    }> = [];

    const matchedIds = new Set<string>();

    for (let i = 0; i < candidateTransactions.length; i++) {
      const a = candidateTransactions[i];
      if (matchedIds.has(a.id)) continue;

      for (let j = i + 1; j < candidateTransactions.length; j++) {
        const b = candidateTransactions[j];
        if (matchedIds.has(b.id)) continue;
        if (a.accountId === b.accountId) continue;

        const amtA = a.amount.toNumber();
        const amtB = b.amount.toNumber();
        if (Math.abs(Math.abs(amtA) - Math.abs(amtB)) > 0.001) continue;
        if (amtA * amtB >= 0) continue; // Must be opposite signs

        const diffDays = Math.abs(
          (a.date.getTime() - b.date.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (diffDays <= 3) {
          const source = amtA < 0 ? a : b;
          const target = amtA < 0 ? b : a;
          matches.push({
            source,
            target,
            confidence:
              diffDays === 0
                ? 95
                : Math.max(70, Math.round(95 - diffDays * 10)),
          });
          matchedIds.add(a.id);
          matchedIds.add(b.id);
          break;
        }
      }
    }

    return matches;
  }

  async createSplits(
    transactionId: string,
    dto: CreateSplitsDto,
    profileId: string,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, profileId },
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

  async updateSplits(
    transactionId: string,
    dto: CreateSplitsDto,
    profileId: string,
  ) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, profileId },
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

  async deleteSplits(transactionId: string, profileId: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId, profileId },
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

  normalizeBankingText(text: string): string {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(
        /\b(compra en|pago en|recibo de|transferencia de|transf|bizum de|pago|compra|recibo|bizum|tarjeta|tarj|debit|crdt|s\.?a\.?|s\.?l\.?|s\.?l\.?u\.?|s\.?c\.?|es)\b/gi,
        ' ',
      )
      .replace(/\b\d{2}[:/]\d{2}([:/]\d{2,4})?\b/g, ' ') // remove dates and times
      .replace(/[*#_\\/\-,.:;]/g, ' ') // remove special chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  calculateDescriptionSimilarity(desc1: string, desc2: string): number {
    if (!desc1 || !desc2) return 0;
    const raw1 = desc1.toLowerCase().trim();
    const raw2 = desc2.toLowerCase().trim();

    if (raw1 === raw2 || raw1.includes(raw2) || raw2.includes(raw1)) {
      return 100;
    }

    const norm1 = this.normalizeBankingText(desc1);
    const norm2 = this.normalizeBankingText(desc2);

    if (norm1 && norm2) {
      if (norm1 === norm2 || norm1.includes(norm2) || norm2.includes(norm1)) {
        return 100;
      }

      // Token set overlap (Jaccard on words)
      const tokens1 = new Set(norm1.split(/\s+/).filter((w) => w.length > 1));
      const tokens2 = new Set(norm2.split(/\s+/).filter((w) => w.length > 1));

      if (tokens1.size > 0 && tokens2.size > 0) {
        let intersection = 0;
        tokens1.forEach((t) => {
          if (tokens2.has(t)) intersection++;
        });
        const union = new Set([...tokens1, ...tokens2]).size;
        const jaccard = (intersection / union) * 100;
        if (jaccard >= 40) {
          return Math.max(jaccard, 80);
        }
      }
    }

    const compare1 = norm1 || raw1;
    const compare2 = norm2 || raw2;
    const distance = this.levenshteinDistance(compare1, compare2);
    const maxLen = Math.max(compare1.length, compare2.length);
    const similarity = maxLen > 0 ? ((maxLen - distance) / maxLen) * 100 : 0;

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
    profileId: string,
  ): Promise<
    Array<{
      manualId: string;
      importedTempId: string;
      manualDate: string;
      importedDate: string;
      manualAmount: number;
      importedAmount: number;
      manualDescription: string;
      importedDescription: string;
      manualCategoryId: string | null;
      importedCategoryId: string | null;
      manualNotes: string | null;
      importedNotes: string | null;
      matchScore: number;
    }>
  > {
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
        profileId,
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

    const matches: Array<{
      manualId: string;
      importedTempId: string;
      manualDate: string;
      importedDate: string;
      manualAmount: number;
      importedAmount: number;
      manualDescription: string;
      importedDescription: string;
      manualCategoryId: string | null;
      importedCategoryId: string | null;
      manualNotes: string | null;
      importedNotes: string | null;
      matchScore: number;
    }> = [];

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
    mergeInstructions: Array<{
      manualId: string;
      importedTempId: string;
    }>,
    importedDtos: Array<
      CreateTransactionDto & {
        categoryId?: string | null;
        merchant: null;
        suggestedByRuleId?: string | null;
        externalId?: string;
      }
    >,
    profileId: string,
  ): Promise<
    Array<
      CreateTransactionDto & {
        categoryId?: string | null;
        merchant: null;
        suggestedByRuleId?: string | null;
        externalId?: string;
      }
    >
  > {
    const processedIndices = new Set<number>();

    for (const instruction of mergeInstructions) {
      const { manualId, importedTempId } = instruction;

      const importedIndex = parseInt(importedTempId.replace('import-', ''));
      const importedDto = importedDtos[importedIndex];

      if (!importedDto || processedIndices.has(importedIndex)) continue;

      // Scoped by profile: a merge instruction must not be able to delete
      // another profile's transaction.
      const manual = await this.prisma.transaction.findFirst({
        where: { id: manualId, profileId },
      });

      if (!manual) {
        this.logger.warn(
          `Manual transaction ${manualId} not found, skipping merge`,
        );
        continue;
      }

      const mergedData = {
        ...importedDto,
        profileId,
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
