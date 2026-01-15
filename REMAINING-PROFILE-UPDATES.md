# Remaining Profile Isolation Updates

## ✅ Completed
- Categories Service & Controller
- Accounts Service & Controller  
- Transactions Service & Controller (including import, createMany, splits)

## 🚧 Remaining Services - Quick Reference

### 1. Rules Service & Controller
**File**: `apps/api/src/rules/rules.service.ts`

Update methods:
```typescript
async create(createRuleDto: CreateRuleDto, profileId: string) {
  // Add profileId check in line 34
  const existingRules = await this.prisma.categorizationRule.findMany({
    where: { profileId, categoryId: createRuleDto.categoryId },
    ...
  });
  
  // Add profileId in line 62
  return this.prisma.categorizationRule.create({
    data: { ...createRuleDto, profileId },
  });
}

async findAll(profileId: string, enabled?: boolean) {
  return this.prisma.categorizationRule.findMany({
    where: { profileId, ...(enabled !== undefined ? { enabled } : {}) },
    ...
  });
}

async findOne(id: string, profileId: string) {
  const rule = await this.prisma.categorizationRule.findFirst({
    where: { id, profileId },
    ...
  });
  if (!rule) throw new NotFoundException(...);
  return rule;
}

async update(id: string, profileId: string, updateRuleDto: UpdateRuleDto) {
  // Verify ownership first
  const rule = await this.findOne(id, profileId);
  return this.prisma.categorizationRule.update({ where: { id }, data: updateRuleDto });
}

async remove(id: string, profileId: string) {
  await this.findOne(id, profileId); // Verify ownership
  return this.prisma.categorizationRule.deleteMany({ where: { id, profileId } });
}

// IMPORTANT: Update evaluateTransaction method signature
async evaluateTransaction(transaction: Transaction, profileId: string) {
  const rules = await this.prisma.categorizationRule.findMany({
    where: { profileId, enabled: true },
    ...
  });
  ...
}
```

**Controller**: `apps/api/src/rules/rules.controller.ts`
- Add `@CurrentProfile() profile: Profile` to all methods
- Pass `profile.id` to service methods

### 2. SavingsGoals Service & Controller
**File**: `apps/api/src/savings-goals/savings-goals.service.ts`

Standard CRUD pattern - add `profileId: string` to:
- `create(dto, profileId)`
- `findAll(profileId)`
- `findOne(id, profileId)` 
- `update(id, profileId, dto)`
- `remove(id, profileId)`
- `contribute(id, profileId, amount)`

**Controller**: `apps/api/src/savings-goals/savings-goals.controller.ts`
- Add `@CurrentProfile()` decorator
- Import: `import { Profile } from '../generated/client';`
- Import: `import { CurrentProfile } from '../auth/decorators/current-profile.decorator';`

### 3. CostObjects Service & Controller
**File**: `apps/api/src/cost-objects/cost-objects.service.ts`

Standard CRUD - same pattern as Categories

**Controller**: Same pattern

### 4. Reports Service
**File**: `apps/api/src/reports/reports.service.ts`

All query methods need `profileId` filter:
```typescript
async getCategoryReport(profileId: string, year, month) {
  const transactions = await this.prisma.transaction.findMany({
    where: { profileId, date: { ... } },
    ...
  });
}
```

Every method that queries data needs `where: { profileId, ... }`

### 5. Account Balances Service
**File**: `apps/api/src/account-balances/account-balances.service.ts`

Filter via account relationship:
```typescript
async findAll(profileId: string) {
  return this.prisma.accountBalance.findMany({
    where: { account: { profileId } },
    include: { account: true },
  });
}
```

### 6. Monthly Balances Service  
**File**: `apps/api/src/monthly-balances/monthly-balances.service.ts`

Same as AccountBalances - filter via account

### 7. Backup Service
**File**: `apps/api/src/backup/backup.service.ts`

Update to only backup/restore profile's data:
```typescript
async createBackup(profileId: string, encryptionKey?: string) {
  // Query only profileId data
  const categories = await this.prisma.category.findMany({ where: { profileId } });
  const accounts = await this.prisma.account.findMany({ where: { profileId } });
  const transactions = await this.prisma.transaction.findMany({ where: { profileId } });
  ...
}
```

### 8. Admin Service
**File**: `apps/api/src/admin/admin.service.ts`

Update reset/diagnostics to be profile-scoped or admin-only

## Quick Steps to Complete

1. For each service file above:
   - Read the file
   - Add `profileId: string` parameter to methods
   - Add `where: { profileId }` to all Prisma queries
   - Add ownership checks to update/delete operations

2. For each controller file:
   - Add imports: `CurrentProfile` decorator and `Profile` type
   - Add `@CurrentProfile() profile: Profile` to all route handlers
   - Pass `profile.id` to service calls

3. Build and test:
   ```bash
   cd apps/api && pnpm build
   ```

## Testing Checklist

After completing all updates:
1. Create Profile A - add categories, accounts, transactions
2. Create Profile B - should see NO data from Profile A  
3. Add data to Profile B
4. Switch to Profile A - should still see Profile A's data only
5. Try accessing Profile A's transaction ID while logged in as Profile B (should fail)

## Estimated Time Remaining
- Rules: 10 min
- SavingsGoals: 5 min
- CostObjects: 5 min
- Reports: 10 min
- AccountBalances: 5 min
- MonthlyBalances: 5 min
- Backup: 15 min
- Admin: 5 min

**Total: ~1 hour**
