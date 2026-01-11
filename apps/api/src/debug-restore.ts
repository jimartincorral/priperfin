import { PrismaClient } from './generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';
import Database from 'better-sqlite3'; // Import better-sqlite3 directly if needed, or rely on adapter internals?
// The adapter constructor takes Database instance or config?
// Check PrismaService: new PrismaBetterSqlite3({ url: resolvedUrl });
// Actually, PrismaBetterSqlite3 usually takes a Database instance from 'better-sqlite3' package.
// But the PrismaService code showed: new PrismaBetterSqlite3({ url: resolvedUrl });
// Let's check imports in PrismaService again. It just imports PrismaBetterSqlite3.
// Wait, typically it's:
// const db = new Database('path/to/db');
// const adapter = new PrismaBetterSqlite3(db);
// But the service code I read said: const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
// Maybe the version 7.x changed this? I will trust the service code.

async function main() {
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
  console.log('Connecting to:', rawUrl);

  // Replicate logic from PrismaService
  const adapter = new PrismaBetterSqlite3({ url: rawUrl });
  const prisma = new PrismaClient({ adapter });

  console.log('Connecting to database...');
  await prisma.$connect();
  console.log('Connected.');

  try {
    // 1. Check Table Existence
    console.log('\n--- Checking Tables ---');
    const tables = await prisma.$queryRawUnsafe<any[]>(
      "SELECT name FROM sqlite_master WHERE type='table';",
    );
    console.log(
      'Tables found:',
      tables.map((t: any) => t.name),
    );

    const hasTransaction = tables.some((t: any) => t.name === 'Transaction');
    const hasCostObject = tables.some((t: any) => t.name === 'CostObject');
    const hasSplits = tables.some((t: any) => t.name === 'TransactionSplit');

    if (!hasTransaction) {
      console.error('CRITICAL: Transaction table missing!');
      return;
    }
    if (!hasCostObject) console.warn('WARNING: CostObject table missing');
    if (!hasSplits) console.warn('WARNING: TransactionSplit table missing');

    // 2. Check Transaction Columns
    console.log('\n--- Checking Transaction Columns ---');
    const columns = await prisma.$queryRawUnsafe<any[]>(
      'PRAGMA table_info("Transaction")',
    );
    console.log(
      'Columns:',
      columns.map((c: any) => c.name),
    );

    // 3. Check Transaction Count
    console.log('\n--- Checking Data ---');
    const count = await prisma.transaction.count();
    console.log(`Total Transactions: ${count}`);

    if (count > 0) {
      const first = await prisma.transaction.findFirst({
        include: {
          category: true,
          // Only include these if tables exist to avoid crash if they don't
          costObject: hasCostObject,
          splits: hasSplits ? { include: { category: true } } : false,
        },
      });
      console.log('Sample Transaction:', JSON.stringify(first, null, 2));
    } else {
      console.log('No transactions found. Attempting to create one...');
      try {
        const newTx = await prisma.transaction.create({
          data: {
            date: new Date(),
            amount: -10.5,
            description: 'Debug Transaction',
            categoryId: null,
          },
        });
        console.log('Created debug transaction:', newTx);
      } catch (e) {
        console.error('Failed to create transaction:', e);
      }
    }
  } catch (e) {
    console.error('Debug script failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
