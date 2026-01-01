import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { CategorizationService } from './categorization.service';

@Module({
  providers: [TransactionsService, CategorizationService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
