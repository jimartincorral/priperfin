import { Module } from '@nestjs/common';
import { AccountBalancesService } from './account-balances.service';
import { AccountBalancesController } from './account-balances.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AccountBalancesController],
  providers: [AccountBalancesService],
  exports: [AccountBalancesService],
})
export class AccountBalancesModule {}
