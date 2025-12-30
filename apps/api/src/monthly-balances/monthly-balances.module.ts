import { Module } from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';
import { MonthlyBalancesController } from './monthly-balances.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MonthlyBalancesController],
  providers: [MonthlyBalancesService],
})
export class MonthlyBalancesModule {}
