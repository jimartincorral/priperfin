import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { existsSync } from 'fs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './categories/categories.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SavingsGoalsModule } from './savings-goals/savings-goals.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { MonthlyBalancesModule } from './monthly-balances/monthly-balances.module';
import { BackupModule } from './backup/backup.module';
import { AccountsModule } from './accounts/accounts.module';
import { CostObjectsModule } from './cost-objects/cost-objects.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Determine static files path: Docker container uses /app/client, dev uses relative path
function getStaticPath(): string {
  if (process.env.STATIC_PATH) {
    return process.env.STATIC_PATH;
  }
  const dockerPath = '/app/client';
  if (existsSync(dockerPath)) {
    return dockerPath;
  }
  return join(__dirname, '../..', 'web/dist');
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env files and make ConfigService available globally
    ServeStaticModule.forRoot({
      rootPath: getStaticPath(),
    }),
    PrismaModule,
    CategoriesModule,
    TransactionsModule,
    SavingsGoalsModule,
    ReportsModule,
    AdminModule,
    SettingsModule,
    MonthlyBalancesModule,
    BackupModule,
    AccountsModule,
    CostObjectsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
