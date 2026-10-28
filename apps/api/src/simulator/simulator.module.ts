import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountsModule } from '../accounts/accounts.module';
import { ReportsModule } from '../reports/reports.module';
import { SavingsGoalsModule } from '../savings-goals/savings-goals.module';
import { SimulatorController } from './simulator.controller';
import { SimulatorService } from './simulator.service';

@Module({
  imports: [PrismaModule, AccountsModule, ReportsModule, SavingsGoalsModule],
  controllers: [SimulatorController],
  providers: [SimulatorService],
})
export class SimulatorModule {}
