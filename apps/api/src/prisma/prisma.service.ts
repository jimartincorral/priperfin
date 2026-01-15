import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';

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

    // Prisma 7.x adapter API - pass URL to factory
    const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
    super({ adapter });
  }

  private async validateSchema() {
    try {
      // Validate schema by querying a basic transaction field
      // This ensures the database schema is properly initialized
      await this.transaction.findFirst({
        select: { id: true },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      if (
        errorMessage.includes('no such table') ||
        errorMessage.includes('no such column')
      ) {
        const logger = new (await import('@nestjs/common')).Logger(
          'PrismaService',
        );
        logger.error('Database schema validation failed!');
        logger.error(
          'The database schema is missing required tables or columns.',
        );
        logger.error(
          'This usually means the database was not properly migrated.',
        );
        logger.error('');
        logger.error(
          'To fix this, run: npx prisma db push --schema=prisma/schema.prisma',
        );
        logger.error(
          'Or restart the add-on to trigger automatic schema sync.',
        );

        throw new Error(
          'Database schema is out of sync. ' +
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

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
