/**
 * Migration Script: Add Profile Isolation
 * 
 * This script migrates the database to add profileId to all user data models.
 * It assigns all existing data to the first profile (oldest by createdAt).
 * 
 * Run with: npx ts-node scripts/migrate-profile-isolation.ts
 */

import { PrismaClient } from '../src/generated/client';
import * as path from 'path';
import * as fs from 'fs';

// Set DATABASE_URL if not set (use dev.db by default)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting profile isolation migration...\n');

  // Step 1: Check if profiles exist
  const profiles = await prisma.$queryRaw<any[]>`SELECT * FROM Profile ORDER BY createdAt ASC`;
  
  if (profiles.length === 0) {
    console.error('❌ ERROR: No profiles found in database!');
    console.error('   Please create at least one profile via setup before running this migration.');
    process.exit(1);
  }

  const firstProfileId = profiles[0].id;
  console.log(`✅ Found ${profiles.length} profile(s)`);
  console.log(`   First profile: ${profiles[0].name} (ID: ${firstProfileId})`);
  console.log(`   All existing data will be assigned to this profile.\n`);

  // Step 2: Add profileId columns (SQLite doesn't support adding NOT NULL directly with data)
  console.log('📝 Adding profileId columns...');
  
  try {
    // Check if columns already exist
    const tables = ['Category', 'Account', 'CostObject', 'Transaction', 'CategorizationRule', 'RuleSuggestion', 'SavingsGoal'];
    
    for (const table of tables) {
      try {
        // Try to select profileId - if it fails, column doesn't exist
        await prisma.$queryRawUnsafe(`SELECT profileId FROM "${table}" LIMIT 1`);
        console.log(`   ⏭️  ${table}.profileId already exists, skipping...`);
      } catch (e) {
        // Column doesn't exist, add it
        console.log(`   ➕ Adding ${table}.profileId...`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN profileId TEXT`);
      }
    }
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }

  console.log('✅ Columns added successfully\n');

  // Step 3: Assign all existing data to the first profile
  console.log('📝 Assigning existing data to first profile...');
  
  try {
    const updates = [
      { table: 'Category', count: await prisma.$executeRaw`UPDATE Category SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'Account', count: await prisma.$executeRaw`UPDATE Account SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'CostObject', count: await prisma.$executeRaw`UPDATE CostObject SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'Transaction', count: await prisma.$executeRaw`UPDATE "Transaction" SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'CategorizationRule', count: await prisma.$executeRaw`UPDATE CategorizationRule SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'RuleSuggestion', count: await prisma.$executeRaw`UPDATE RuleSuggestion SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
      { table: 'SavingsGoal', count: await prisma.$executeRaw`UPDATE SavingsGoal SET profileId = ${firstProfileId} WHERE profileId IS NULL` },
    ];

    for (const { table, count } of updates) {
      console.log(`   ✅ ${table}: ${count} records updated`);
    }
  } catch (error) {
    console.error('❌ Error updating data:', error);
    process.exit(1);
  }

  console.log('\n✅ Data migration completed successfully!');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: cd apps/api && npx prisma generate');
  console.log('   2. Run: cd apps/api && npx prisma db push');
  console.log('   3. Restart the API server');
  console.log('\n   This will update the Prisma client and apply foreign key constraints.');
}

main()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
