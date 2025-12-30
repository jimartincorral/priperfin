import {
  Injectable,
  Logger,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service'; // Assuming PrismaService is needed
import { exec, execSync } from 'child_process';
import {
  createReadStream,
  createWriteStream,
  ReadStream,
  promises as fs,
} from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
// @ts-ignore
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
    const dbUrl = this.configService.get<string>('DATABASE_URL');
    if (!dbUrl) {
      throw new InternalServerErrorException(
        'DATABASE_URL is not set in environment variables.',
      );
    }
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

      output.on('close', () => {
        this.logger.log(
          `Archiver has been finalized. ${archive.pointer()} total bytes.`,
        );
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
        return {
          filename: encryptedArchiveFileName,
          filePath: encryptedArchiveFilePath,
        };
      } else {
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
        const input = createReadStream(backupFilePath);
        const output = createWriteStream(decryptedArchiveFilePath);

        // Read first byte to check version
        const versionBuffer = await new Promise<Buffer>((resolve, reject) => {
          const onReadable = () => {
            const chunk = input.read(1) as Buffer;
            if (chunk) {
              input.removeListener('readable', onReadable);
              input.removeListener('error', onError);
              resolve(chunk);
            }
          };
          const onError = (err: Error) => {
            input.removeListener('readable', onReadable);
            input.removeListener('error', onError);
            reject(err);
          };
          input.on('readable', onReadable);
          input.on('error', onError);
        });

        this.logger.log(
          `Read first byte of encrypted file: 0x${versionBuffer[0].toString(16).padStart(2, '0')}`,
        );

        let derivedKey: Buffer;
        let ivBuffer: Buffer;

        // Check if this is version 2 (with salt) or old format (without version byte)
        if (versionBuffer[0] === 0x02) {
          // New format: version byte + salt + IV
          this.logger.log('Detected new encryption format (v2 with PBKDF2)');

          // Read salt (32 bytes)
          const saltBuffer = await new Promise<Buffer>((resolve, reject) => {
            const onReadable = () => {
              const chunk = input.read(32) as Buffer;
              if (chunk) {
                input.removeListener('readable', onReadable);
                input.removeListener('error', onError);
                resolve(chunk);
              }
            };
            const onError = (err: Error) => {
              input.removeListener('readable', onReadable);
              input.removeListener('error', onError);
              reject(err);
            };
            input.on('readable', onReadable);
            input.on('error', onError);
          });

          // Read IV (16 bytes)
          ivBuffer = await new Promise<Buffer>((resolve, reject) => {
            const onReadable = () => {
              const chunk = input.read(this.ivLength) as Buffer;
              if (chunk) {
                input.removeListener('readable', onReadable);
                input.removeListener('error', onError);
                resolve(chunk);
              }
            };
            const onError = (err: Error) => {
              input.removeListener('readable', onReadable);
              input.removeListener('error', onError);
              reject(err);
            };
            input.on('readable', onReadable);
            input.on('error', onError);
          });

          // Derive key from password using the salt
          derivedKey = this.deriveKey(decryptionPassword, saltBuffer);
        } else {
          // Old format: first byte is part of IV, password must be exactly 32 chars
          this.logger.log('Detected old encryption format (direct key)');

          if (decryptionPassword.length !== 32) {
            throw new BadRequestException(
              'This backup uses the old encryption format and requires a 32-character key.',
            );
          }

          // The byte we read is actually the first byte of the IV
          // Read the remaining 15 bytes of IV
          const remainingIV = await new Promise<Buffer>((resolve, reject) => {
            const onReadable = () => {
              const chunk = input.read(15) as Buffer;
              if (chunk) {
                input.removeListener('readable', onReadable);
                input.removeListener('error', onError);
                resolve(chunk);
              }
            };
            const onError = (err: Error) => {
              input.removeListener('readable', onReadable);
              input.removeListener('error', onError);
              reject(err);
            };
            input.on('readable', onReadable);
            input.on('error', onError);
          });

          // Combine the first byte with the remaining 15 bytes
          ivBuffer = Buffer.concat([versionBuffer, remainingIV]);
          derivedKey = Buffer.from(decryptionPassword, 'utf8');
        }

        const decipher = crypto.createDecipheriv(
          'aes-256-cbc',
          derivedKey,
          ivBuffer,
        );
        await pipeline(input, decipher, output);
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
      await fs.copyFile(dumpFilePath, dbFilePath);

      // Reconnect to the new database
      await this.prisma.$connect();

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
    const filePath = path.join(this.backupDir, filename);

    if (!(await fs.stat(filePath).catch(() => null))) {
      throw new BadRequestException('Backup file not found.');
    }

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
