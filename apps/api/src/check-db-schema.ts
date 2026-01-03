import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient({

import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
let dbPath = rawUrl.replace('file:', '');
if (!dbPath.includes(':') && !dbPath.startsWith('/') && !dbPath.startsWith('\\')) {
    dbPath = path.join(process.cwd(), dbPath);
}
console.log('Opening DB at:', dbPath);

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Checking database schema...');
    const result = await prisma.$queryRawUnsafe("PRAGMA table_info(Transaction);");
    console.log(JSON.stringify(result, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
