import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  Body,
  Query,
} from '@nestjs/common';
import { BackupService } from './backup.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { promises as fs } from 'fs';
import * as path from 'path';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  async createBackup(
    @Body('encryptionKey') encryptionKey: string | undefined,
    @Res() res: Response,
  ) {
    const { filename, filePath } =
      await this.backupService.createBackup(encryptionKey);
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
    const [fileStream, mimeType] =
      await this.backupService.getBackupFileStream(filename);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    fileStream.pipe(res);
  }

  @Post('restore')
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
        decryptionKey,
      );
      res.status(200).json({
        message: 'Backup restored successfully.',
        requiresReload: true,
        hint: 'Please refresh the page to see restored data.'
      });
    } finally {
      // Clean up the uploaded file
      await fs
        .unlink(file.path)
        .catch((err) =>
          console.error(`Failed to delete uploaded file: ${err.message}`),
        );
    }
  }
}
