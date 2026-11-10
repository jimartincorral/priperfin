import { Module } from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';
import { MonthlyBalancesController } from './monthly-balances.controller';
import { BalancesService } from './balances.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyBalancesController],
  providers: [MonthlyBalancesService, BalancesService],
  exports: [BalancesService],
})
export class MonthlyBalancesModule {}
