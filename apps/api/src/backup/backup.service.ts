import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import {
  createReadStream,
  createWriteStream,
  ReadStream,
  promises as fs,
} from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
// @ts-expect-error - tar package has incomplete type definitions
import * as tar from 'tar';
import { pipeline } from 'stream/promises';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir: string;
  private readonly encryptionKey: string | undefined;
  private readonly ivLength = 16; // AES standard IV length

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.backupDir = this.configService.get<string>(
      'BACKUP_DIR',
      '/app/backups',
    );
    this.encryptionKey = this.configService.get<string>(
      'BACKUP_ENCRYPTION_KEY',
    );

    this.logger.log(
      `[BackupService] Backup directory configured: ${this.backupDir}`,
    );
    this.logger.log(
      `[BackupService] Encryption key configured: ${!!this.encryptionKey}`,
    );

    if (!this.encryptionKey) {
      this.logger.warn(
        'BACKUP_ENCRYPTION_KEY is not set. Backups will NOT be encrypted.',
      );
    } else if (this.encryptionKey.length !== 32) {
      this.logger.error(
        'BACKUP_ENCRYPTION_KEY must be 32 characters long for AES-256 encryption.',
      );
      throw new InternalServerErrorException(
        'Invalid backup encryption key length.',
      );
    } else {
      this.validateEncryptionKeyStrength(this.encryptionKey);
    }

    // Ensure backup directory exists
    fs.mkdir(this.backupDir, { recursive: true }).catch((err) => {
      this.logger.error(
        `Failed to create backup directory ${this.backupDir}: ${err.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to initialize backup directory.',
      );
    });
  }

  private validateEncryptionKeyStrength(key: string): void {
    const weakPatterns = [
      /^(.)\1+$/, // All same character
      /^(01)+$|^(10)+$/, // Repeating binary
      /^(12345|password|qwerty)/i, // Common passwords
    ];

    if (weakPatterns.some((pattern) => pattern.test(key))) {
      this.logger.warn(
        'Encryption key appears weak. Consider using a stronger, more random key.',
      );
    }
  }

  private deriveKey(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }

  private isProfileSettingKey(
    key: string,
    accountIds: Set<string>,
    profileId: string,
  ): boolean {
    if (key === 'goals_total_savings') return true;
    if (key.startsWith('starting_balance_all_')) return true;
    if (key.startsWith('balance_verified_all_')) return true;
    if (key === 'balance_verified_account_all') return true;
    if (key === `pin_length_profile_${profileId}`) return true;

    for (const accountId of accountIds) {
      if (key.startsWith(`balance_verified_${accountId}_`)) {
        return true;
      }
      if (key === `balance_verified_account_${accountId}`) {
        return true;
      }
    }

    return false;
  }

  async exportProfileData(profileId: string) {
    this.logger.log(`Exporting data for profile ${profileId}...`);
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });
    const categories = await this.prisma.category.findMany({
      where: { profileId },
    });
    const accounts = await this.prisma.account.findMany({
      where: { profileId },
    });
    const costObjects = await this.prisma.costObject.findMany({
      where: { profileId },
    });
    const transactions = await this.prisma.transaction.findMany({
      where: { profileId },
      include: { splits: true },
    });
    const rules = await this.prisma.categorizationRule.findMany({
      where: { profileId },
    });
    const ruleSuggestions = await this.prisma.ruleSuggestion.findMany({
      where: { profileId },
    });
    const savingsGoals = await this.prisma.savingsGoal.findMany({
      where: { profileId },
    });
    const accountBalances = await this.prisma.accountBalance.findMany({
      where: { account: { profileId } },
    });
    const monthlyBalances = await this.prisma.monthlyBalance.findMany({
      where: { account: { profileId } },
    });
    const accountIds = new Set(accounts.map((account) => account.id));
    const settings = await this.prisma.setting.findMany();
    const scopedSettings = settings.filter((setting) =>
      this.isProfileSettingKey(setting.key, accountIds, profileId),
    );

    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      profile,
      categories,
      accounts,
      costObjects,
      transactions,
      rules,
      ruleSuggestions,
      savingsGoals,
      accountBalances,
      monthlyBalances,
      settings: scopedSettings,
    };
  }

  async importProfileData(data: any, targetProfileId: string) {
    this.logger.log(`Importing data into profile ${targetProfileId}...`);

    if (data.version !== 2) {
      this.logger.warn(
        `Importing legacy or unknown version (${data.version}). Attempting best effort.`,
      );
    }

    // Wrap in transaction to ensure atomicity
    await this.prisma.$transaction(
      async (tx) => {
        // 1. Clear existing data
        this.logger.log('Clearing existing profile data...');
        // Order matters for referential integrity
        await tx.transactionSplit.deleteMany({
          where: { parent: { profileId: targetProfileId } },
        });
        await tx.transaction.deleteMany({
          where: { profileId: targetProfileId },
        });
        await tx.savingsGoal.deleteMany({
          where: { profileId: targetProfileId },
        });
        await tx.categorizationRule.deleteMany({
          where: { profileId: targetProfileId },
        });
        await tx.ruleSuggestion.deleteMany({
          where: { profileId: targetProfileId },
        });
        await tx.monthlyBalance.deleteMany({
          where: { account: { profileId: targetProfileId } },
        });
        await tx.accountBalance.deleteMany({
          where: { account: { profileId: targetProfileId } },
        });
        await tx.costObject.deleteMany({
          where: { profileId: targetProfileId },
        });
        await tx.account.deleteMany({ where: { profileId: targetProfileId } });
        // Delete categories: children first, then parents.
        // Or simpler: set parentId=null then delete all.
        await tx.category.updateMany({
          where: { profileId: targetProfileId },
          data: { parentId: null },
        });
        await tx.category.deleteMany({ where: { profileId: targetProfileId } });

        // 2. Import new data
        this.logger.log('Creating new entities...');

        // Accounts
        if (data.accounts?.length) {
          await tx.account.createMany({
            data: data.accounts.map((a: any) => ({
              ...a,
              profileId: targetProfileId,
              initialBalance: a.initialBalance, // Decimal handling?
            })),
          });
        }

        // CostObjects
        if (data.costObjects?.length) {
          await tx.costObject.createMany({
            data: data.costObjects.map((c: any) => ({
              ...c,
              profileId: targetProfileId,
            })),
          });
        }

        // Categories (Two pass: create then link)
        if (data.categories?.length) {
          // Pass 1: Create with parentId = null
          await tx.category.createMany({
            data: data.categories.map((c: any) => ({
              ...c,
              parentId: null, // Defer linking
              profileId: targetProfileId,
              budget: c.budget, // Decimal handling?
            })),
          });

          // Pass 2: Restore parent links
          for (const c of data.categories) {
            if (c.parentId) {
              await tx.category.update({
                where: { id: c.id },
                data: { parentId: c.parentId },
              });
            }
          }
        }

        // Rules
        if (data.rules?.length) {
          await tx.categorizationRule.createMany({
            data: data.rules.map((r: any) => ({
              ...r,
              profileId: targetProfileId,
            })),
          });
        }

        // Rule Suggestions
        if (data.ruleSuggestions?.length) {
          await tx.ruleSuggestion.createMany({
            data: data.ruleSuggestions.map((r: any) => ({
              ...r,
              profileId: targetProfileId,
              confidence: r.confidence,
            })),
          });
        }

        // Savings Goals
        if (data.savingsGoals?.length) {
          await tx.savingsGoal.createMany({
            data: data.savingsGoals.map((s: any) => ({
              ...s,
              profileId: targetProfileId,
              targetAmount: s.targetAmount,
              savedAmount: s.savedAmount,
            })),
          });
        }

        // Transactions
        if (data.transactions?.length) {
          // Create transactions without splits first
          // Note: createMany cannot handle relation creation (splits) nested.
          // And we want to preserve IDs.
          // So we create transactions first, then splits.
          const txs = data.transactions.map((t: any) => {
            const { splits, ...txData } = t;
            return {
              ...txData,
              profileId: targetProfileId,
              amount: txData.amount,
            };
          });

          // Process in chunks to avoid variable limit
          const chunkSize = 500;
          for (let i = 0; i < txs.length; i += chunkSize) {
            await tx.transaction.createMany({
              data: txs.slice(i, i + chunkSize),
            });
          }

          // Restore splits
          const allSplits = data.transactions.flatMap((t: any) =>
            (t.splits || []).map((s: any) => ({
              ...s,
              parentId: t.id, // Ensure link
              amount: s.amount,
            })),
          );

          if (allSplits.length) {
            for (let i = 0; i < allSplits.length; i += chunkSize) {
              await tx.transactionSplit.createMany({
                data: allSplits.slice(i, i + chunkSize),
              });
            }
          }
        }

        // Account Balances
        if (data.accountBalances?.length) {
          await tx.accountBalance.createMany({
            data: data.accountBalances.map((b: any) => ({
              ...b,
              balance: b.balance,
            })),
          });
        }

        // Monthly Balances
        if (data.monthlyBalances?.length) {
          await tx.monthlyBalance.createMany({
            data: data.monthlyBalances.map((b: any) => ({
              ...b,
              balance: b.balance,
            })),
          });
        }

        // Settings related to balances/reconciliation/goals
        if (data.settings?.length) {
          for (const setting of data.settings) {
            if (!setting?.key) continue;
            await tx.setting.upsert({
              where: { key: setting.key },
              update: { value: setting.value ?? '' },
              create: {
                key: setting.key,
                value: setting.value ?? '',
              },
            });
          }
        }
      },
      {
        timeout: 60000, // Increase timeout for large imports
      },
    );

    this.logger.log('Profile data import completed.');
  }

  async createBackup(
    profileId: string,
    userEncryptionKey?: string,
  ): Promise<{ filename: string; filePath: string }> {
    this.logger.log(`Initiating backup process for profile ${profileId}...`);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const exportFileName = `export.json`;
    const exportFilePath = path.join(this.backupDir, exportFileName);
    const archiveFileName = `backup_${timestamp}.tar`;
    const archiveFilePath = path.join(this.backupDir, archiveFileName);
    const encryptedArchiveFileName = `backup_${timestamp}.tar.enc`;
    const encryptedArchiveFilePath = path.join(
      this.backupDir,
      encryptedArchiveFileName,
    );

    try {
      // 1. Export Data
      const data = await this.exportProfileData(profileId);
      await fs.writeFile(exportFilePath, JSON.stringify(data, null, 2));
      this.logger.log('Export JSON created.');

      // 2. Create archive
      this.logger.log(`Creating tar archive ${archiveFileName}...`);
      const output = createWriteStream(archiveFilePath);
      const archive = archiver('tar', { gzip: false });

      const closePromise = new Promise<void>((resolve, reject) => {
        output.on('close', resolve);
        output.on('error', reject);
      });

      archive.pipe(output);
      archive.file(exportFilePath, { name: exportFileName });
      await archive.finalize();
      await closePromise;

      // 3. Encrypt if needed
      const encryptionPassword = userEncryptionKey || this.encryptionKey;

      if (encryptionPassword) {
        this.logger.log(`Encrypting archive...`);
        const salt = crypto.randomBytes(32);
        const derivedKey = this.deriveKey(encryptionPassword, salt);
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

        const input = createReadStream(archiveFilePath);
        const outputEnc = createWriteStream(encryptedArchiveFilePath);

        outputEnc.write(Buffer.from([0x02]));
        outputEnc.write(salt);
        outputEnc.write(iv);

        await pipeline(input, cipher, outputEnc);
        await fs.unlink(archiveFilePath);

        return {
          filename: encryptedArchiveFileName,
          filePath: encryptedArchiveFilePath,
        };
      } else {
        return { filename: archiveFileName, filePath: archiveFilePath };
      }
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await fs.unlink(exportFilePath).catch(() => null);
    }
  }

  async restoreBackup(
    backupFilePath: string,
    confirmOverwrite: boolean,
    profileId: string,
    userDecryptionKey?: string,
  ): Promise<void> {
    if (!confirmOverwrite) {
      throw new BadRequestException(
        'Confirmation to overwrite existing data is required.',
      );
    }

    this.logger.log(`Initiating restore process...`);
    const tempRestoreDir = path.join(
      this.backupDir,
      `restore_temp_${Date.now()}`,
    );

    try {
      await fs.mkdir(tempRestoreDir, { recursive: true });
      let archivePath = backupFilePath;

      // 1. Decrypt if needed
      if (backupFilePath.endsWith('.enc')) {
        const password = userDecryptionKey || this.encryptionKey;
        if (!password)
          throw new BadRequestException('Decryption key required.');

        const decryptedPath = path.join(
          tempRestoreDir,
          path.basename(backupFilePath, '.enc'),
        );
        const handle = await fs.open(backupFilePath, 'r');
        try {
          const header = Buffer.alloc(1 + 32 + 16);
          await handle.read(header, 0, header.length, 0);

          let derivedKey, iv, start;
          if (header[0] === 0x02) {
            const salt = header.subarray(1, 33);
            iv = header.subarray(33, 49);
            derivedKey = this.deriveKey(password, salt);
            start = 49;
          } else {
            // Legacy/Old support not implemented for simplicity in this strict mode
            throw new BadRequestException('Unsupported encryption format.');
          }

          const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            derivedKey,
            iv,
          );
          const input = createReadStream(backupFilePath, { start });
          const output = createWriteStream(decryptedPath);
          await pipeline(input, decipher, output);
          archivePath = decryptedPath;
        } finally {
          await handle.close();
        }
      }

      // 2. Extract
      await tar.extract({ file: archivePath, cwd: tempRestoreDir });

      // 3. Import
      const exportFile = path.join(tempRestoreDir, 'export.json');
      if (await fs.stat(exportFile).catch(() => null)) {
        const data = JSON.parse(await fs.readFile(exportFile, 'utf8'));
        await this.importProfileData(data, profileId);
      } else {
        throw new BadRequestException(
          'Invalid backup: export.json not found. Legacy backups not supported.',
        );
      }
    } finally {
      await fs
        .rm(tempRestoreDir, { recursive: true, force: true })
        .catch(() => null);
    }
  }

  async getBackupFileStream(filename: string): Promise<[ReadStream, string]> {
    // Basic validation
    if (
      !/^[a-zA-Z0-9_.-]+$/.test(filename) ||
      filename.includes('..') ||
      (!filename.endsWith('.tar') && !filename.endsWith('.tar.enc'))
    ) {
      throw new BadRequestException('Invalid filename.');
    }

    const filePath = path.join(this.backupDir, filename);
    // ... basic checks ...
    const fileStream = createReadStream(filePath);
    return [fileStream, 'application/octet-stream'];
  }

  async listBackups(): Promise<string[]> {
    return (await fs.readdir(this.backupDir))
      .filter(
        (f) =>
          (f.startsWith('backup_') && f.endsWith('.tar')) ||
          f.endsWith('.tar.enc'),
      )
      .sort()
      .reverse();
  }
}
