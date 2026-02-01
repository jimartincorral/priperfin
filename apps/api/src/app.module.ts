import { Module, Logger, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { IngressPathMiddleware } from './ingress-path.middleware';
import { IngressSecurityMiddleware } from './ingress-security.middleware';
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
import { RulesModule } from './rules/rules.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

// Note: Static file serving is now handled by AppController
// This provides better control over Home Assistant Ingress path handling

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Load .env files and make ConfigService available globally
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100000, // 100000 requests per minute
      },
      {
        name: 'login',
        ttl: 60000, // 1 minute
        limit: 5, // 5 login attempts per minute
      },
      {
        name: 'backup',
        ttl: 3600000, // 1 hour
        limit: 25, // 25 requests per hour
      },
      {
        name: 'import',
        ttl: 3600000, // 1 hour
        limit: 20, // 20 requests per hour
      },
    ]),
    // Note: ServeStaticModule disabled - static files are now served via AppController
    // This provides better control over Ingress path handling

    // Register all API modules under the /api prefix
    RouterModule.register([
      {
        path: 'api',
        children: [
          AuthModule,
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
          RulesModule,
        ],
      },
    ]),

    PrismaModule,
    AuthModule,
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
    RulesModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    // Throttler guard disabled to prevent rate limiting issues
    // Specific endpoints (login, backup, import) still have their own throttle limits
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware FIRST (before ingress path handling)
    // This strips the Ingress prefix so standard routing works
    consumer
      .apply(IngressSecurityMiddleware, IngressPathMiddleware)
      .forRoutes('*');
  }
}
