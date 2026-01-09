import { PrismaClient, RuleMode } from '../src/generated/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

async function migrate() {
  const rawUrl = process.env.DATABASE_URL || 'file:./dev.db';
  let dbPath = rawUrl.replace('file:', '');

  // Resolve relative paths based on CWD
  // If running from root D:\priperfin, and db is apps/api/dev.db
  // If running from apps/api, and db is ./dev.db
  // Simple check: if we are in root, append apps/api to path if it's relative?
  // Or just rely on running from apps/api dir.
  
  if (!path.isAbsolute(dbPath)) {
      dbPath = path.resolve(process.cwd(), dbPath);
  }

  const resolvedUrl = `file:${dbPath}`;
  console.log(`Connecting to database at ${resolvedUrl}`);

  const adapter = new PrismaBetterSqlite3({ url: resolvedUrl });
  const prisma = new PrismaClient({ adapter });
  
  console.log('Starting migration of merchants to rules...');
  
  // Find common patterns: same merchant assigned to same category >= 3 times
  // SQLite doesn't support extensive aggregation in the way we might want with Prisma's groupBy sometimes,
  // but let's try Prisma's groupBy.
  
  const patterns = await prisma.transaction.groupBy({
    by: ['merchant', 'categoryId'],
    _count: {
      _all: true
    },
    where: {
      merchant: { not: null },
      categoryId: { not: null }
    },
    having: {
      merchant: {
        _count: {
          gte: 3
        }
      }
    }
  });

  console.log(`Found ${patterns.length} potential patterns.`);

  let createdCount = 0;

  for (const p of patterns) {
    if (!p.merchant || !p.categoryId) continue;

    // Check if rule already exists for this merchant
    // (We construct a unique name or check conditions, simplistic check here)
    const existing = await prisma.categorizationRule.findFirst({
      where: {
        name: `Auto-migrated: ${p.merchant}`
      }
    });

    if (existing) {
      console.log(`Skipping existing rule for ${p.merchant}`);
      continue;
    }

    await prisma.categorizationRule.create({
      data: {
        name: `Auto-migrated: ${p.merchant}`,
        categoryId: p.categoryId,
        mode: RuleMode.SUGGEST, // Safe default
        priority: 0,
        conditionsJson: JSON.stringify({
          operator: 'AND',
          conditions: [{
            field: 'merchant',
            operator: 'equals',
            value: p.merchant,
            caseSensitive: false
          }]
        }),
        description: `Migrated from historical data (${p._count._all} occurrences)`
      }
    });
    createdCount++;
  }

  console.log(`Migration complete. Created ${createdCount} rules.`);
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
