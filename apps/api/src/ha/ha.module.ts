import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountsModule } from '../accounts/accounts.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { ReportsModule } from '../reports/reports.module';
import { SavingsGoalsModule } from '../savings-goals/savings-goals.module';
import { BankSyncModule } from '../bank-sync/bank-sync.module';
import { HaController } from './ha.controller';
import { HaSummaryService } from './ha-summary.service';

@Module({
  imports: [
    PrismaModule,
    AccountsModule,
    TransactionsModule,
    ReportsModule,
    SavingsGoalsModule,
    BankSyncModule,
  ],
  controllers: [HaController],
  providers: [HaSummaryService],
  exports: [HaSummaryService],
})
export class HaModule {}
