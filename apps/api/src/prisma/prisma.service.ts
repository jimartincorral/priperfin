import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
    console.log('[PrismaService] DATABASE_URL:', rawUrl);

    let dbPath = rawUrl.replace('file:', '');

    // Resolve relative paths based on CWD
    if (!dbPath.includes(':') && !dbPath.startsWith('/') && !dbPath.startsWith('\\')) {
      dbPath = path.join(process.cwd(), dbPath);
    }

    const resolvedUrl = `file:${dbPath}`;
    console.log('[PrismaService] Resolved URL:', resolvedUrl);

    // Prisma 7.x adapter API - pass URL to factory
    const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
