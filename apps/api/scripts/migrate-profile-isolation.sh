#!/bin/bash
# Migration Script: Add Profile Isolation
# 
# This script migrates the database to add profileId to all user data models.
# It assigns all existing data to the first profile (oldest by createdAt).

DB_FILE="./dev.db"

echo "🚀 Starting profile isolation migration..."
echo ""

# Step 1: Check if profiles exist
PROFILE_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM Profile")

if [ "$PROFILE_COUNT" -eq 0 ]; then
    echo "❌ ERROR: No profiles found in database!"
    echo "   Please create at least one profile via setup before running this migration."
    exit 1
fi

echo "✅ Found $PROFILE_COUNT profile(s)"

# Get the first profile ID
FIRST_PROFILE_ID=$(sqlite3 "$DB_FILE" "SELECT id FROM Profile ORDER BY createdAt ASC LIMIT 1")
FIRST_PROFILE_NAME=$(sqlite3 "$DB_FILE" "SELECT name FROM Profile ORDER BY createdAt ASC LIMIT 1")

echo "   First profile: $FIRST_PROFILE_NAME (ID: $FIRST_PROFILE_ID)"
echo "   All existing data will be assigned to this profile."
echo ""

# Step 2: Add profileId columns
echo "📝 Adding profileId columns..."

# Function to add column if it doesn't exist
add_column_if_not_exists() {
    TABLE=$1
    # Check if column exists
    COLUMN_EXISTS=$(sqlite3 "$DB_FILE" "PRAGMA table_info($TABLE)" | grep -c "profileId")
    
    if [ "$COLUMN_EXISTS" -eq 0 ]; then
        echo "   ➕ Adding $TABLE.profileId..."
        sqlite3 "$DB_FILE" "ALTER TABLE \"$TABLE\" ADD COLUMN profileId TEXT"
    else
        echo "   ⏭️  $TABLE.profileId already exists, skipping..."
    fi
}

add_column_if_not_exists "Category"
add_column_if_not_exists "Account"
add_column_if_not_exists "CostObject"
add_column_if_not_exists "Transaction"
add_column_if_not_exists "CategorizationRule"
add_column_if_not_exists "RuleSuggestion"
add_column_if_not_exists "SavingsGoal"

echo "✅ Columns added successfully"
echo ""

# Step 3: Assign all existing data to the first profile
echo "📝 Assigning existing data to first profile..."

sqlite3 "$DB_FILE" "UPDATE Category SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
CATEGORY_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ Category: $CATEGORY_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE Account SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
ACCOUNT_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ Account: $ACCOUNT_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE CostObject SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
COSTOBJECT_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ CostObject: $COSTOBJECT_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE \"Transaction\" SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
TRANSACTION_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ Transaction: $TRANSACTION_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE CategorizationRule SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
RULE_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ CategorizationRule: $RULE_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE RuleSuggestion SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
SUGGESTION_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ RuleSuggestion: $SUGGESTION_COUNT records updated"

sqlite3 "$DB_FILE" "UPDATE SavingsGoal SET profileId = '$FIRST_PROFILE_ID' WHERE profileId IS NULL"
GOAL_COUNT=$(sqlite3 "$DB_FILE" "SELECT changes()")
echo "   ✅ SavingsGoal: $GOAL_COUNT records updated"

echo ""
echo "✅ Data migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Run: cd apps/api && npx prisma generate"
echo "   2. Run: cd apps/api && npx prisma db push"
echo "   3. Restart the API server"
echo ""
echo "   This will update the Prisma client and apply foreign key constraints."
