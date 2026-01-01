import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
    console.log('[PrismaService] DATABASE_URL:', rawUrl);

    let dbPath = rawUrl.replace('file:', '');

    // Resolve relative paths based on CWD
    if (
      !dbPath.includes(':') &&
      !dbPath.startsWith('/') &&
      !dbPath.startsWith('\\')
    ) {
      dbPath = path.join(process.cwd(), dbPath);
    }

    const resolvedUrl = `file:${dbPath}`;
    console.log('[PrismaService] Resolved URL:', resolvedUrl);

    // Prisma 7.x adapter API - pass URL to factory
    const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
    super({ adapter });
  }

  private async validateSchema() {
    try {
      // Try to query a transaction with suggestedCategoryId to verify column exists
      // Using raw query ensures we check the column exists without Prisma type checks
      await this.$queryRaw`
        SELECT suggestedCategoryId
        FROM Transaction
        LIMIT 1
      `;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('suggestedCategoryId') ||
        errorMessage.includes('no such column')
      ) {
        console.error('[PrismaService] Database schema validation failed!');
        console.error(
          '[PrismaService] The Transaction table is missing the suggestedCategoryId column.',
        );
        console.error(
          '[PrismaService] This usually means the database was not properly migrated.',
        );
        console.error('[PrismaService]');
        console.error(
          '[PrismaService] To fix this, run: npx prisma db push --schema=prisma/schema.prisma',
        );
        console.error(
          '[PrismaService] Or restart the add-on to trigger automatic schema sync.',
        );

        throw new Error(
          'Database schema is out of sync. Missing required column: Transaction.suggestedCategoryId. ' +
            'Please run: npx prisma db push --schema=prisma/schema.prisma',
        );
      }

      // Re-throw other errors
      throw error;
    }
  }

  async onModuleInit() {
    await this.$connect();
    await this.validateSchema();
  }
}
