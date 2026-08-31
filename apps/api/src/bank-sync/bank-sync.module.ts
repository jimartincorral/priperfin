import { Module } from '@nestjs/common';
import { BankSyncService } from './bank-sync.service';
import { BankSyncController } from './bank-sync.controller';
import { EnableBankingService } from './enable-banking.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [PrismaModule, AuthModule, TransactionsModule],
  controllers: [BankSyncController],
  providers: [BankSyncService, EnableBankingService],
  exports: [BankSyncService, EnableBankingService],
})
export class BankSyncModule {}
