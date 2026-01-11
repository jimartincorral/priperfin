import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService is needed
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
      // AES-256 requires 32-byte key
      this.logger.error(
        'BACKUP_ENCRYPTION_KEY must be 32 characters long for AES-256 encryption.',
      );
      throw new InternalServerErrorException(
        'Invalid backup encryption key length.',
      );
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

  private async getDatabaseUrl(): Promise<string> {
    const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
    return dbUrl;
  }

  private generateChecksum(
    filePath: string,
    algorithm = 'sha256',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash(algorithm);
      const stream = createReadStream(filePath);
      stream.on('error', (err) => reject(err));
      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  private deriveKey(password: string, salt: Buffer): Buffer {
    // Use PBKDF2 to derive a 32-byte key from any password
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }

  async createBackup(
    userEncryptionKey?: string,
  ): Promise<{ filename: string; filePath: string }> {
    this.logger.log('Initiating backup process...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const dbDumpFileName = `db_dump_${timestamp}.sql`;
    const dbDumpFilePath = path.join(this.backupDir, dbDumpFileName);
    const archiveFileName = `backup_${timestamp}.tar`;
    const archiveFilePath = path.join(this.backupDir, archiveFileName);
    const encryptedArchiveFileName = `backup_${timestamp}.tar.enc`;
    const encryptedArchiveFilePath = path.join(
      this.backupDir,
      encryptedArchiveFileName,
    );
    const metadataFileName = `metadata_${timestamp}.json`;
    const metadataFilePath = path.join(this.backupDir, metadataFileName);

    try {
      const dbUrl = await this.getDatabaseUrl();

      // Extract file path from SQLite URL (format: file:/path/to/db.db)
      const dbFilePath = dbUrl.replace('file:', '');

      // 1. Perform database backup by copying the SQLite file
      this.logger.log(
        `Backing up database from ${dbFilePath} to ${dbDumpFilePath}...`,
      );

      // For SQLite, we can simply copy the database file
      // This is safe when using WAL mode or when the database is not being written to
      await fs.copyFile(dbFilePath, dbDumpFilePath);
      this.logger.log('Database backup completed.');

      // 2. Generate checksum for the dump
      const dumpChecksum = await this.generateChecksum(dbDumpFilePath);
      this.logger.log(`Dump checksum generated: ${dumpChecksum}`);

      // 3. Create metadata file
      const metadata = {
        timestamp,
        dbDumpFileName,
        dumpChecksum,
        encrypted: !!this.encryptionKey,
        // Add more metadata as needed
      };
      await fs.writeFile(metadataFilePath, JSON.stringify(metadata, null, 2));
      this.logger.log(`Metadata file created: ${metadataFileName}`);

      // 4. Create .tar archive
      this.logger.log(`Creating tar archive ${archiveFileName}...`);
      const output = createWriteStream(archiveFilePath);
      const archive = archiver('tar', {
        gzip: false, // User requested .tar, not .tar.gz
      });

      // Create a promise that resolves when the output stream is closed
      const closePromise = new Promise<void>((resolve, reject) => {
        output.on('close', () => {
          this.logger.log(
            `Archiver has been finalized. ${archive.pointer()} total bytes.`,
          );
          resolve();
        });
        output.on('error', (err) => reject(err));
      });

      archive.on('warning', (err: any) => {
        if (err.code === 'ENOENT') {
          this.logger.warn(`Archiver warning: ${err.message}`);
        } else {
          throw err;
        }
      });
      archive.on('error', (err: any) => {
        throw new InternalServerErrorException(
          `Archive creation failed: ${err.message}`,
        );
      });

      archive.pipe(output);
      archive.file(dbDumpFilePath, { name: dbDumpFileName });
      archive.file(metadataFilePath, { name: metadataFileName });
      await archive.finalize();

      // Wait for the stream to actually close and file to be written to disk
      await closePromise;
      this.logger.log('Tar archive created.');

      // 5. Encrypt the archive if key is provided
      const encryptionPassword = userEncryptionKey || this.encryptionKey;

      if (encryptionPassword) {
        this.logger.log(`Encrypting archive to ${encryptedArchiveFileName}...`);

        // Generate a random salt for key derivation
        const salt = crypto.randomBytes(32);

        // Derive a 32-byte key from the password
        const derivedKey = this.deriveKey(encryptionPassword, salt);

        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv('aes-256-cbc', derivedKey, iv);

        const input = createReadStream(archiveFilePath);
        const outputEnc = createWriteStream(encryptedArchiveFilePath);

        // Write version byte (0x02 for PBKDF2 format), salt (32 bytes), then IV (16 bytes), then encrypted data
        this.logger.log('Writing encryption version marker: 0x02');
        outputEnc.write(Buffer.from([0x02])); // Version 2: PBKDF2 with salt
        outputEnc.write(salt);
        outputEnc.write(iv);

        await pipeline(input, cipher, outputEnc);
        this.logger.log('Archive encrypted.');

        await fs.unlink(archiveFilePath); // Delete unencrypted tar

        // Verify encrypted file exists before returning
        const encFileStats = await fs
          .stat(encryptedArchiveFilePath)
          .catch(() => null);
        if (!encFileStats) {
          throw new InternalServerErrorException(
            'Encrypted backup file was not created',
          );
        }
        this.logger.log(
          `[createBackup] Encrypted file created: ${encryptedArchiveFileName}, size: ${encFileStats.size} bytes`,
        );

        return {
          filename: encryptedArchiveFileName,
          filePath: encryptedArchiveFilePath,
        };
      } else {
        // Verify unencrypted file exists before returning
        const fileStats = await fs.stat(archiveFilePath).catch(() => null);
        if (!fileStats) {
          throw new InternalServerErrorException('Backup file was not created');
        }
        this.logger.log(
          `[createBackup] Unencrypted file created: ${archiveFileName}, size: ${fileStats.size} bytes, path: ${archiveFilePath}`,
        );

        return { filename: archiveFileName, filePath: archiveFilePath };
      }
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`, error.stack);
      throw error; // Re-throw to be caught by controller
    } finally {
      // Clean up temporary files
      await fs
        .unlink(dbDumpFilePath)
        .catch((e) =>
          this.logger.warn(`Failed to delete temp dump file: ${e.message}`),
        );
      await fs
        .unlink(metadataFilePath)
        .catch((e) =>
          this.logger.warn(`Failed to delete temp metadata file: ${e.message}`),
        );
      if (
        this.encryptionKey &&
        (await fs.stat(archiveFilePath).catch(() => null))
      ) {
        // If unencrypted tar still exists after encryption
        await fs
          .unlink(archiveFilePath)
          .catch((e) =>
            this.logger.warn(
              `Failed to delete temp archive file: ${e.message}`,
            ),
          );
      }
    }
  }

  async restoreBackup(
    backupFilePath: string,
    confirmOverwrite: boolean,
    userDecryptionKey?: string,
  ): Promise<void> {
    if (!confirmOverwrite) {
      throw new BadRequestException(
        'Confirmation to overwrite existing data is required for restore operation.',
      );
    }

    this.logger.log(`Initiating restore process from ${backupFilePath}...`);
    const tempRestoreDir = path.join(
      this.backupDir,
      `restore_temp_${Date.now()}`,
    );
    let decryptedArchiveFilePath: string | undefined;
    let metadata: any;
    let dumpFileName: string | undefined;
    let dumpFilePath: string | undefined;

    try {
      await fs.mkdir(tempRestoreDir, { recursive: true });

      // 1. Decrypt if encrypted
      let archiveToExtractPath = backupFilePath;
      if (backupFilePath.endsWith('.enc')) {
        const decryptionPassword = userDecryptionKey || this.encryptionKey;

        if (!decryptionPassword) {
          throw new BadRequestException(
            'Backup is encrypted, but no decryption key was provided.',
          );
        }

        this.logger.log('Decrypting backup archive...');
        decryptedArchiveFilePath = path.join(
          tempRestoreDir,
          path.basename(backupFilePath).replace('.enc', ''),
        );

        // Open file handle to read header synchronously-ish
        const handle = await fs.open(backupFilePath, 'r');
        let inputStream: ReadStream;
        let derivedKey: Buffer;
        let ivBuffer: Buffer;

        try {
          const stats = await handle.stat();

          // Validation: valid encrypted backup must be at least header size (1 + 32 + 16 = 49 bytes) + some data
          if (stats.size < 64) {
            const preview = Buffer.alloc(Math.min(stats.size, 50));
            await handle.read(preview, 0, preview.length, 0);
            const previewStr = preview.toString('utf8').replace(/\n/g, ' ');

            this.logger.error(
              `Invalid backup file detected (Size: ${stats.size} bytes). Content preview: "${previewStr}"`,
            );
            throw new BadRequestException(
              `Invalid backup file. The file is too small and appears to be a server response (e.g. download failed): "${previewStr}"`,
            );
          }

          const headerPreview = Buffer.alloc(1);
          const { bytesRead } = await handle.read(headerPreview, 0, 1, 0);

          if (headerPreview[0] === 0x02) {
            // New format: version byte + salt + IV
            this.logger.log('Detected new encryption format (v2 with PBKDF2)');

            const saltBuf = Buffer.alloc(32);
            await handle.read(saltBuf, 0, 32, 1); // offset 1

            const ivBuf = Buffer.alloc(this.ivLength);
            await handle.read(ivBuf, 0, this.ivLength, 1 + 32); // offset 33

            derivedKey = this.deriveKey(decryptionPassword, saltBuf);
            ivBuffer = ivBuf;

            // Stream the rest
            inputStream = createReadStream(backupFilePath, {
              start: 1 + 32 + this.ivLength,
            });
          } else {
            // Old format: first byte is part of IV, password must be exactly 32 chars
            this.logger.log('Detected old encryption format (direct key)');

            if (decryptionPassword.length !== 32) {
              throw new BadRequestException(
                'This backup uses the old encryption format and requires a 32-character key.',
              );
            }

            const ivBuf = Buffer.alloc(16);
            await handle.read(ivBuf, 0, 16, 0); // Read IV from start

            derivedKey = Buffer.from(decryptionPassword, 'utf8');
            ivBuffer = ivBuf;

            // Stream the rest
            inputStream = createReadStream(backupFilePath, { start: 16 });
          }
        } finally {
          await handle.close();
        }

        const output = createWriteStream(decryptedArchiveFilePath);

        const decipher = crypto.createDecipheriv(
          'aes-256-cbc',
          derivedKey,
          ivBuffer,
        );
        await pipeline(inputStream, decipher, output);
        this.logger.log('Backup archive decrypted.');
        archiveToExtractPath = decryptedArchiveFilePath;
      }

      // 2. Extract archive
      this.logger.log(
        `Extracting archive ${archiveToExtractPath} to ${tempRestoreDir}...`,
      );
      await tar.extract({
        file: archiveToExtractPath,
        cwd: tempRestoreDir,
      });
      this.logger.log('Archive extracted.');

      // 3. Read metadata and verify checksum
      const metadataFiles = (await fs.readdir(tempRestoreDir)).filter(
        (f) => f.startsWith('metadata_') && f.endsWith('.json'),
      );
      if (metadataFiles.length === 0) {
        throw new BadRequestException(
          'No metadata file found in the backup archive.',
        );
      }
      metadata = JSON.parse(
        await fs.readFile(path.join(tempRestoreDir, metadataFiles[0]), 'utf8'),
      );

      dumpFileName = metadata.dbDumpFileName;
      if (!dumpFileName) {
        throw new BadRequestException(
          'Database dump filename missing in metadata.',
        );
      }
      dumpFilePath = path.join(tempRestoreDir, dumpFileName);

      if (!(await fs.stat(dumpFilePath).catch(() => null))) {
        throw new BadRequestException(
          `Database dump file (${dumpFileName}) not found in the backup archive.`,
        );
      }

      const calculatedDumpChecksum = await this.generateChecksum(dumpFilePath);
      if (calculatedDumpChecksum !== metadata.dumpChecksum) {
        throw new BadRequestException(
          `Checksum mismatch for database dump. Expected ${metadata.dumpChecksum}, got ${calculatedDumpChecksum}.`,
        );
      }
      this.logger.log('Checksum verified for database dump.');

      // 4. Perform database restore
      this.logger.log('Restoring database...');
      const dbUrl = await this.getDatabaseUrl();

      // Disconnect Prisma before replacing the file
      this.logger.log('Disconnecting from database...');
      await this.prisma.$disconnect();

      // Extract file path from SQLite URL (format: file:/path/to/db.db)
      const dbFilePath = dbUrl.replace('file:', '');

      // Replace the database file with the backup
      // Retry mechanism for Windows EBUSY/EPERM issues
      let retries = 15;
      while (retries > 0) {
        try {
          await fs.copyFile(dumpFilePath, dbFilePath);
          break;
        } catch (err) {
          if ((err.code === 'EBUSY' || err.code === 'EPERM') && retries > 1) {
            this.logger.warn(
              `Database file locked (${err.code}), retrying in 1000ms... (${retries - 1} retries left)`,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries--;
          } else {
            this.logger.error(
              `Failed to copy database file: ${err.message} (Code: ${err.code})`,
            );
            throw err;
          }
        }
      }

      // Reconnect to the new database
      await this.prisma.$connect();

      // Run manual schema patch to ensure compatibility without data loss
      this.logger.log('Patching database schema manually...');
      try {
        // 1. Create CostObject table
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "CostObject" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "color" TEXT,
            "icon" TEXT NOT NULL,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL
          );
        `);

        // 2. Create TransactionSplit table
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "TransactionSplit" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "parentId" TEXT NOT NULL,
            "amount" DECIMAL NOT NULL,
            "categoryId" TEXT,
            "costObjectId" TEXT,
            "description" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "TransactionSplit_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "TransactionSplit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT "TransactionSplit_costObjectId_fkey" FOREIGN KEY ("costObjectId") REFERENCES "CostObject" ("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);

        // 3. Add costObjectId to Transaction if missing
        const tableInfo: any[] = await this.prisma.$queryRawUnsafe(
          'PRAGMA table_info("Transaction")',
        );
        const hasCostObject = tableInfo.some(
          (col) => col.name === 'costObjectId',
        );

        if (!hasCostObject) {
          this.logger.log('Adding costObjectId column to Transaction table...');
          await this.prisma.$executeRawUnsafe(
            'ALTER TABLE "Transaction" ADD COLUMN "costObjectId" TEXT',
          );
        }

        // 4. Create CategorizationRule table
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "CategorizationRule" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "enabled" BOOLEAN NOT NULL DEFAULT true,
            "priority" INTEGER NOT NULL DEFAULT 0,
            "categoryId" TEXT,
            "mode" TEXT NOT NULL DEFAULT 'SUGGEST',
            "conditionsJson" TEXT NOT NULL,
            "matchCount" INTEGER NOT NULL DEFAULT 0,
            "lastMatched" DATETIME,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "CategorizationRule_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);

        // 5. Create RuleSuggestion table
        await this.prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "RuleSuggestion" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "conditionsJson" TEXT NOT NULL,
            "categoryId" TEXT,
            "confidence" DECIMAL NOT NULL,
            "matchCount" INTEGER NOT NULL,
            "similarityType" TEXT NOT NULL,
            "sampleTxIds" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'PENDING',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL,
            CONSTRAINT "RuleSuggestion_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
          );
        `);

        // 6. Add suggestedByRuleId to Transaction if missing
        const txInfo: any[] = await this.prisma.$queryRawUnsafe(
          'PRAGMA table_info("Transaction")',
        );
        const hasRuleCol = txInfo.some(
          (col) => col.name === 'suggestedByRuleId',
        );

        if (!hasRuleCol) {
          this.logger.log(
            'Adding suggestedByRuleId column to Transaction table...',
          );
          await this.prisma.$executeRawUnsafe(
            'ALTER TABLE "Transaction" ADD COLUMN "suggestedByRuleId" TEXT',
          );
        }

        this.logger.log('Manual schema patching completed.');
      } catch (error) {
        this.logger.error('Failed to patch schema manually:', error.message);
        // Continue, as the DB might be mostly functional
      }

      this.logger.log('Database restore completed.');

      this.logger.log('Backup restored successfully.');
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Clean up temporary files and directory
      if (tempRestoreDir && (await fs.stat(tempRestoreDir).catch(() => null))) {
        await fs
          .rm(tempRestoreDir, { recursive: true, force: true })
          .catch((e) =>
            this.logger.warn(
              `Failed to delete temp restore directory: ${e.message}`,
            ),
          );
      }
    }
  }

  async getBackupFileStream(filename: string): Promise<[ReadStream, string]> {
    this.logger.log(`[getBackupFileStream] Requested filename: ${filename}`);
    this.logger.log(
      `[getBackupFileStream] Backup directory: ${this.backupDir}`,
    );

    // Validate filename to prevent path traversal attacks
    // Only allow alphanumeric, underscore, hyphen, and dot characters
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(filename)) {
      this.logger.error(
        `[getBackupFileStream] Invalid filename format: ${filename}`,
      );
      throw new BadRequestException('Invalid filename format.');
    }

    // Ensure the filename doesn't contain path traversal sequences
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      this.logger.error(
        `[getBackupFileStream] Path traversal attempt: ${filename}`,
      );
      throw new BadRequestException('Invalid filename.');
    }

    // Only allow .tar and .tar.enc extensions
    if (!filename.endsWith('.tar') && !filename.endsWith('.tar.enc')) {
      this.logger.error(`[getBackupFileStream] Invalid extension: ${filename}`);
      throw new BadRequestException('Invalid backup file extension.');
    }

    const filePath = path.join(this.backupDir, filename);
    this.logger.log(`[getBackupFileStream] Resolved file path: ${filePath}`);

    // Verify the resolved path is within the backup directory
    const normalizedFilePath = path.normalize(filePath);
    const normalizedBackupDir = path.normalize(this.backupDir);
    if (
      !normalizedFilePath.startsWith(normalizedBackupDir + path.sep) &&
      normalizedFilePath !== normalizedBackupDir
    ) {
      this.logger.error(
        `[getBackupFileStream] Path outside backup dir: ${normalizedFilePath}`,
      );
      throw new BadRequestException('Invalid file path.');
    }

    const fileStats = await fs.stat(filePath).catch(() => null);
    if (!fileStats) {
      this.logger.error(`[getBackupFileStream] File not found: ${filePath}`);
      // List files in backup directory for debugging
      try {
        const files = await fs.readdir(this.backupDir);
        this.logger.log(
          `[getBackupFileStream] Files in backup dir: ${JSON.stringify(files)}`,
        );
      } catch (e) {
        this.logger.error(
          `[getBackupFileStream] Could not list backup dir: ${e.message}`,
        );
      }
      throw new BadRequestException('Backup file not found.');
    }

    this.logger.log(
      `[getBackupFileStream] File exists, size: ${fileStats.size} bytes`,
    );
    const fileStream = createReadStream(filePath);
    const mimeType = 'application/octet-stream'; // Generic binary
    return [fileStream, mimeType];
  }

  async listBackups(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.backupDir);
      return files
        .filter(
          (f) =>
            f.startsWith('backup_') &&
            (f.endsWith('.tar') || f.endsWith('.tar.enc')),
        )
        .sort()
        .reverse();
    } catch (error) {
      this.logger.error(`Failed to list backups: ${error.message}`);
      throw new InternalServerErrorException('Failed to list backup files.');
    }
  }
}
