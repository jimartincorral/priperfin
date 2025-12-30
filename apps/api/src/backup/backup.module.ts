import { Module } from '@nestjs/common';
import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';
import { PrismaModule } from '../prisma/prisma.module'; // Assuming PrismaModule is needed for DB access

@Module({
  imports: [PrismaModule], // Import PrismaModule if BackupService needs PrismaClient
  providers: [BackupService],
  controllers: [BackupController],
  exports: [BackupService],
})
export class BackupModule {}
