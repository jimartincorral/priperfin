import { PrismaClient } from './generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

async function main() {
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
  let dbPath = rawUrl.replace('file:', '');
  if (!dbPath.includes(':') && !dbPath.startsWith('/') && !dbPath.startsWith('\\')) {
      dbPath = path.join(process.cwd(), dbPath);
  }
  console.log('Opening DB at:', dbPath);

  // Use simple prisma client for check
  const prisma = new PrismaClient();

  try {
    console.log('Checking database schema...');
    const result = await prisma.$queryRawUnsafe("PRAGMA table_info('Transaction');");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();