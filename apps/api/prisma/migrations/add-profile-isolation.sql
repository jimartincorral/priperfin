-- Migration: Add profile isolation to all data models
-- This migration adds profileId to all user data tables and assigns existing data to the first profile

-- Step 1: Add profileId columns as nullable
PRAGMA foreign_keys=OFF;

-- Get the first profile ID (we'll need to run this after profiles exist)
-- If no profiles exist, this migration will fail - setup must be run first

-- Add profileId to Category
ALTER TABLE Category ADD COLUMN profileId TEXT;

-- Add profileId to Account
ALTER TABLE Account ADD COLUMN profileId TEXT;

-- Add profileId to CostObject
ALTER TABLE CostObject ADD COLUMN profileId TEXT;

-- Add profileId to Transaction
ALTER TABLE Transaction ADD COLUMN profileId TEXT;

-- Add profileId to CategorizationRule
ALTER TABLE CategorizationRule ADD COLUMN profileId TEXT;

-- Add profileId to RuleSuggestion
ALTER TABLE RuleSuggestion ADD COLUMN profileId TEXT;

-- Add profileId to SavingsGoal
ALTER TABLE SavingsGoal ADD COLUMN profileId TEXT;

-- Step 2: Assign all existing data to the first profile
-- This assumes at least one profile exists (from setup)
UPDATE Category SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE Account SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE CostObject SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE Transaction SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE CategorizationRule SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE RuleSuggestion SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;
UPDATE SavingsGoal SET profileId = (SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1) WHERE profileId IS NULL;

PRAGMA foreign_keys=ON;

-- Note: After this migration, run `npx prisma db push` to update indexes and constraints
