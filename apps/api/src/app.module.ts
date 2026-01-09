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
import { AccountBalancesModule } from './account-balances/account-balances.module';
import { ConfigModule } from '@nestjs/config';

// Determine static files path: Docker container uses /app/client, dev uses relative path
function getStaticPath(): string {
  console.log('[getStaticPath] process.env.STATIC_PATH:', process.env.STATIC_PATH);
  console.log('[getStaticPath] __dirname:', __dirname);

  if (process.env.STATIC_PATH) {
    console.log('[getStaticPath] Using STATIC_PATH:', process.env.STATIC_PATH);
    return process.env.STATIC_PATH;
  }
  const dockerPath = '/app/client';
  if (existsSync(dockerPath)) {
    console.log('[getStaticPath] Using Docker path:', dockerPath);
    return dockerPath;
  }

  // Fallback: try to find web/dist relative to current location
  // 1. From apps/api/src (Dev): ../../web/dist
  // 2. From apps/api/dist (Prod): ../../../web/dist
  
  const possiblePaths = [
    join(__dirname, '../..', 'web/dist'),       // Dev structure
    join(__dirname, '../../..', 'web/dist'),    // Built structure (dist/src/...)
    join(__dirname, '../../../../web/dist'),    // Deeper nesting?
    join(process.cwd(), 'apps/web/dist'),       // CWD based (Robust for monorepo)
    join(process.cwd(), '../web/dist')          // CWD if in apps/api
  ];

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      console.log('[getStaticPath] Found static files at:', p);
      return p;
    }
  }

  console.warn('[getStaticPath] Could not find static files!');
  return join(__dirname, '../..', 'web/dist'); // Default
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
    AccountBalancesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
