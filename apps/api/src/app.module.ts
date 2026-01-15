import { Module, Logger, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { RulesModule } from './rules/rules.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { IngressBaseMiddleware } from './ingress-base.middleware';

const logger = new Logger('AppModule');

// Determine static files path: Docker container uses /app/client, dev uses relative path
function getStaticPath(): string {
  logger.log('=== Static Path Detection ===');
  logger.log(`process.env.STATIC_PATH: ${process.env.STATIC_PATH}`);
  logger.log(`__dirname: ${__dirname}`);
  logger.log(`process.cwd(): ${process.cwd()}`);
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);

  if (process.env.STATIC_PATH) {
    const pathExists = existsSync(process.env.STATIC_PATH);
    logger.log(`Using STATIC_PATH: ${process.env.STATIC_PATH} (exists: ${pathExists})`);
    return process.env.STATIC_PATH;
  }
  
  const dockerPath = '/app/client';
  if (existsSync(dockerPath)) {
    logger.log(`✓ Found static files at Docker path: ${dockerPath}`);
    // Verify index.html exists
    const indexPath = join(dockerPath, 'index.html');
    if (existsSync(indexPath)) {
      logger.log(`✓ Verified index.html exists at: ${indexPath}`);
    } else {
      logger.error(`✗ WARNING: index.html NOT found at: ${indexPath}`);
    }
    return dockerPath;
  }

  // Fallback: try to find web/dist relative to current location
  // 1. From apps/api/src (Dev): ../../web/dist
  // 2. From apps/api/dist (Prod): ../../../web/dist

  const possiblePaths = [
    join(__dirname, '../..', 'web/dist'), // Dev structure
    join(__dirname, '../../..', 'web/dist'), // Built structure (dist/src/...)
    join(__dirname, '../../../../web/dist'), // Deeper nesting?
    join(process.cwd(), 'apps/web/dist'), // CWD based (Robust for monorepo)
    join(process.cwd(), '../web/dist'), // CWD if in apps/api
  ];

  logger.log('Searching for static files in possible paths:');
  for (const p of possiblePaths) {
    const exists = existsSync(p);
    logger.log(`  ${exists ? '✓' : '✗'} ${p}`);
    if (exists) {
      logger.log(`✓ Using static files at: ${p}`);
      return p;
    }
  }

  logger.error('✗ Could not find static files in any expected location!');
  logger.error('The application may not serve the frontend correctly.');
  return join(__dirname, '../..', 'web/dist'); // Default
}

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
    ServeStaticModule.forRoot({
      rootPath: getStaticPath(),
      serveRoot: '/',
      exclude: ['/api*'], // Don't serve static files for API routes
    }),
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
    // Apply the ingress base middleware to all routes (it will filter internally)
    consumer.apply(IngressBaseMiddleware).forRoutes('*');
  }
}
