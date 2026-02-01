import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BackupService } from './backup.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { promises as fs } from 'fs';
import * as path from 'path';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('backup')
@UseGuards(SessionAuthGuard)
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  @Throttle({ backup: { limit: 25, ttl: 3600000 } })
  async createBackup(
    @Body('encryptionKey') encryptionKey: string | undefined,
    @Res() res: Response,
    @CurrentProfile() profile: Profile,
  ) {
    const { filename, filePath } = await this.backupService.createBackup(
      profile.id,
      encryptionKey,
    );
    this.logger.log(`Backup created: ${filename} at ${filePath}`);
    // For direct download after creation, or just return metadata
    res.status(201).json({
      message: 'Backup created successfully',
      filename: filename,
      downloadUrl: `/api/backup/download/${filename}`,
    });
  }

  @Get('list')
  async listBackups() {
    return this.backupService.listBackups();
  }

  @Get('download/:filename')
  async downloadBackup(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Download requested for: ${filename}`);
    try {
      const [fileStream, mimeType] =
        await this.backupService.getBackupFileStream(filename);

      this.logger.log('File stream obtained, sending response');
      res.set({
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      });
      fileStream.pipe(res);
    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('restore')
  @Throttle({ backup: { limit: 25, ttl: 3600000 } })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: async (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'temp_uploads');
          await fs.mkdir(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}_${file.originalname}`);
        },
      }),
    }),
  )
  async restoreBackup(
    @UploadedFile() file: Express.Multer.File,
    @Body('confirmOverwrite') confirmOverwrite: string, // Expecting 'true' or 'false'
    @Body('decryptionKey') decryptionKey: string | undefined,
    @Res() res: Response,
    @CurrentProfile() profile: Profile,
  ) {
    if (!file) {
      res.status(400).json({ message: 'No backup file uploaded.' });
      return;
    }

    const overwrite = confirmOverwrite === 'true';
    try {
      await this.backupService.restoreBackup(
        file.path,
        overwrite,
        profile.id,
        decryptionKey,
      );
      res.status(200).json({
        message: 'Backup restored successfully.',
        requiresReload: true,
        hint: 'Please refresh the page to see restored data.',
      });
    } finally {
      // Clean up the uploaded file
      await fs
        .unlink(file.path)
        .catch((err) =>
          this.logger.error(`Failed to delete uploaded file: ${err.message}`),
        );
    }
  }
}
