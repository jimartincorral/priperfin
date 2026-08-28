import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

// Mock PrismaService before importing BackupService
jest.mock('../prisma/prisma.service', () => ({
  PrismaService: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    $queryRawUnsafe: jest.fn(),
  })),
}));

// Mock fs module
jest.mock('fs', () => ({
  createReadStream: jest.fn(),
  createWriteStream: jest.fn(),
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    readdir: jest.fn(),
    readFile: jest.fn(),
    writeFile: jest.fn(),
    copyFile: jest.fn(),
    unlink: jest.fn(),
    stat: jest.fn(),
    rm: jest.fn(),
  },
}));

import { BackupService } from './backup.service';
import { PrismaService } from '../prisma/prisma.service';

// Create a mock PrismaService instance
const createPrismaMock = () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $queryRawUnsafe: jest.fn(),
});

// Mock archiver
jest.mock('archiver', () => {
  return jest.fn().mockReturnValue({
    pipe: jest.fn(),
    file: jest.fn(),
    finalize: jest.fn().mockResolvedValue(undefined),
    pointer: jest.fn().mockReturnValue(1000),
    on: jest.fn(),
  });
});

// Mock tar
jest.mock('tar', () => ({
  extract: jest.fn().mockResolvedValue(undefined),
}));

// Mock stream/promises
jest.mock('stream/promises', () => ({
  pipeline: jest.fn().mockResolvedValue(undefined),
}));

import { promises as fs } from 'fs';
import * as path from 'path';

describe('BackupService', () => {
  let service: BackupService;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let configServiceMock: { get: jest.Mock };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock = createPrismaMock();
    configServiceMock = {
      get: jest.fn((key: string, defaultValue?: string) => {
        if (key === 'BACKUP_DIR') return '/test/backups';
        if (key === 'BACKUP_ENCRYPTION_KEY') return undefined;
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: ConfigService, useValue: configServiceMock },
      ],
    }).compile();

    service = module.get<BackupService>(BackupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // deriveKey() Tests
  // ============================================
  describe('deriveKey', () => {
    it('should derive a 32-byte key from password and salt', () => {
      const password = 'test-password';
      const salt = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

      const result = (service as any).deriveKey(password, salt);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBe(32);
    });

    it('should produce different keys for different salts', () => {
      const password = 'test-password';
      const salt1 = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');
      const salt2 = Buffer.from('fedcba9876543210fedcba9876543210', 'hex');

      const key1 = (service as any).deriveKey(password, salt1);
      const key2 = (service as any).deriveKey(password, salt2);

      expect(key1).not.toEqual(key2);
    });

    it('should produce same key for same password and salt', () => {
      const password = 'test-password';
      const salt = Buffer.from('0123456789abcdef0123456789abcdef', 'hex');

      const key1 = (service as any).deriveKey(password, salt);
      const key2 = (service as any).deriveKey(password, salt);

      expect(key1).toEqual(key2);
    });
  });

  // ============================================
  // listBackups() Tests
  // ============================================
  describe('listBackups', () => {
    it('should return backup files sorted by name descending', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        'backup_2025-01-01.tar',
        'backup_2025-01-02.tar',
        'backup_2025-01-03.tar.enc',
        'metadata_2025-01-01.json', // Should be filtered out
        'other_file.txt', // Should be filtered out
      ]);

      const result = await service.listBackups();

      expect(result).toEqual([
        'backup_2025-01-03.tar.enc',
        'backup_2025-01-02.tar',
        'backup_2025-01-01.tar',
      ]);
    });

    it('should return empty array when no backups exist', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([]);

      const result = await service.listBackups();

      expect(result).toEqual([]);
    });

    it('should filter out non-backup files', async () => {
      (fs.readdir as jest.Mock).mockResolvedValue([
        'metadata_2025-01-01.json',
        'db_dump_2025-01-01.sql',
        'random_file.tar',
        'backup_readme.txt',
      ]);

      const result = await service.listBackups();

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // getBackupFileStream() Tests
  // ============================================
  describe('getBackupFileStream', () => {
    it('should return a read stream without pre-checking file existence', async () => {
      // The service does not stat the file; createReadStream is lazy and
      // any missing-file error surfaces on the stream itself.
      const mockStream = { pipe: jest.fn() };
      const createReadStreamMock = jest.requireMock('fs').createReadStream;
      createReadStreamMock.mockReturnValue(mockStream);

      const [stream, mimeType] =
        await service.getBackupFileStream('nonexistent.tar');

      expect(stream).toBe(mockStream);
      expect(mimeType).toBe('application/octet-stream');
      expect(createReadStreamMock).toHaveBeenCalledWith(
        path.join('/test/backups', 'nonexistent.tar'),
      );
    });

    // ============================================
    // Path Traversal Protection Tests
    // ============================================
    describe('path traversal protection', () => {
      it('should reject filenames with path traversal sequences (..)', async () => {
        await expect(
          service.getBackupFileStream('../../../etc/passwd'),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getBackupFileStream('../../../etc/passwd'),
        ).rejects.toThrow('Invalid filename.');
      });

      it('should reject filenames with forward slashes', async () => {
        await expect(
          service.getBackupFileStream('path/to/file.tar'),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getBackupFileStream('path/to/file.tar'),
        ).rejects.toThrow('Invalid filename.');
      });

      it('should reject filenames with backslashes', async () => {
        await expect(
          service.getBackupFileStream('path\\to\\file.tar'),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getBackupFileStream('path\\to\\file.tar'),
        ).rejects.toThrow('Invalid filename.');
      });

      it('should reject filenames with invalid characters', async () => {
        await expect(
          service.getBackupFileStream('file<script>.tar'),
        ).rejects.toThrow(BadRequestException);
        await expect(
          service.getBackupFileStream('file<script>.tar'),
        ).rejects.toThrow('Invalid filename.');
      });

      it('should reject filenames with invalid extensions', async () => {
        await expect(service.getBackupFileStream('backup.sql')).rejects.toThrow(
          BadRequestException,
        );
        await expect(service.getBackupFileStream('backup.sql')).rejects.toThrow(
          'Invalid filename.',
        );
      });

      it('should reject filenames trying to escape with encoded sequences', async () => {
        await expect(
          service.getBackupFileStream('..%2F..%2Fetc%2Fpasswd.tar'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should accept valid .tar filenames', async () => {
        (fs.stat as jest.Mock).mockResolvedValue({ isFile: () => true });
        const mockStream = { pipe: jest.fn() };
        const createReadStreamMock = jest.requireMock('fs').createReadStream;
        createReadStreamMock.mockReturnValue(mockStream);

        const [stream, mimeType] = await service.getBackupFileStream(
          'backup_2025-01-01.tar',
        );

        expect(stream).toBe(mockStream);
        expect(mimeType).toBe('application/octet-stream');
      });

      it('should accept valid .tar.enc filenames', async () => {
        (fs.stat as jest.Mock).mockResolvedValue({ isFile: () => true });
        const mockStream = { pipe: jest.fn() };
        const createReadStreamMock = jest.requireMock('fs').createReadStream;
        createReadStreamMock.mockReturnValue(mockStream);

        const [stream, mimeType] = await service.getBackupFileStream(
          'backup_2025-01-01.tar.enc',
        );

        expect(stream).toBe(mockStream);
        expect(mimeType).toBe('application/octet-stream');
      });
    });
  });

  // ============================================
  // restoreBackup() Tests
  // ============================================
  describe('restoreBackup', () => {
    it('should throw BadRequestException when confirmOverwrite is false', async () => {
      await expect(
        service.restoreBackup('/path/to/backup.tar', false, 'profile-1'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.restoreBackup('/path/to/backup.tar', false, 'profile-1'),
      ).rejects.toThrow('Confirmation to overwrite existing data is required.');
    });

    it('should throw BadRequestException for encrypted backup without key', async () => {
      // Setup: file operations
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.stat as jest.Mock).mockImplementation((filePath) => {
        if (filePath.includes('restore_temp')) return Promise.resolve(null);
        return Promise.resolve({ isFile: () => true });
      });
      (fs.rm as jest.Mock).mockResolvedValue(undefined);

      await expect(
        service.restoreBackup('/path/to/backup.tar.enc', true, 'profile-1'),
      ).rejects.toThrow('Decryption key required.');
    });
  });

  // ============================================
  // Constructor Tests
  // ============================================
  describe('constructor', () => {
    it('should use default backup directory if not configured', async () => {
      const customConfigMock = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'BACKUP_DIR') return defaultValue; // Use default
          return undefined;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BackupService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: ConfigService, useValue: customConfigMock },
        ],
      }).compile();

      const serviceWithDefaults = module.get<BackupService>(BackupService);
      expect(serviceWithDefaults).toBeDefined();
    });

    it('should throw error for invalid encryption key length', async () => {
      const invalidKeyConfigMock = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'BACKUP_DIR') return '/test/backups';
          if (key === 'BACKUP_ENCRYPTION_KEY') return 'short-key'; // Invalid: not 32 chars
          return defaultValue;
        }),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            BackupService,
            { provide: PrismaService, useValue: prismaMock },
            { provide: ConfigService, useValue: invalidKeyConfigMock },
          ],
        }).compile(),
      ).rejects.toThrow('Invalid backup encryption key length');
    });

    it('should accept valid 32-character encryption key', async () => {
      const validKeyConfigMock = {
        get: jest.fn((key: string, defaultValue?: string) => {
          if (key === 'BACKUP_DIR') return '/test/backups';
          if (key === 'BACKUP_ENCRYPTION_KEY')
            return '12345678901234567890123456789012'; // 32 chars
          return defaultValue;
        }),
      };

      const module = await Test.createTestingModule({
        providers: [
          BackupService,
          { provide: PrismaService, useValue: prismaMock },
          { provide: ConfigService, useValue: validKeyConfigMock },
        ],
      }).compile();

      const serviceWithKey = module.get<BackupService>(BackupService);
      expect(serviceWithKey).toBeDefined();
    });
  });
});
