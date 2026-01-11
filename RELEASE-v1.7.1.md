# v1.7.1 - Bug Fix Release

## What's New in v1.7.1

### 🐛 Bug Fix
- **Fixed rule creation from suggestions** - Corrected logic to properly handle POST vs PATCH requests when creating new rules from AI suggestions

This is a patch release that fixes a critical bug where accepting a rule suggestion would fail with a 500 error. The issue was that the frontend incorrectly attempted to PATCH `/rules/undefined` instead of POST `/rules` when creating new rules.

### 📝 Technical Details
- Fixed condition in `view-rules.ts` to check for `rule.id` before attempting PATCH
- New rules from suggestions now correctly POST to create, existing rules PATCH to update

---

## Full Feature Set (v1.7.x)

For users upgrading from earlier versions, here's what's included in the v1.7.x release series:

### 🎯 Enhanced Rules Feature with Dedicated Management Pages

### ✨ Key Features

#### **Dedicated Management Pages**
- **New Rules Page** (`/rules`) - Standalone page for managing categorization rules
  - Create, edit, and delete rules with full-featured editor
  - Accept AI-powered rule suggestions with 90%+ confidence
  - Apply rules retroactively to uncategorized transactions
  - Real-time pattern detection and matching preview

- **New Categories Page** (`/categories`) - Separate category management
  - Organize income, expense, and goal categories
  - Set budgets and customize icons/colors
  - Hierarchical category support

#### **Improved Rule Confidence System**
- **90% Minimum Confidence Threshold** - Only high-quality suggestions are shown
- **Weighted Multi-Factor Scoring**:
  - Description similarity: 40%
  - Notes patterns: 30% (increased weight)
  - Amount consistency: 20%
  - Merchant matching: 10%

#### **Enhanced User Experience**
- Rule suggestions now open full editor for configuration (not auto-accept)
- "Apply Rule" button to retroactively categorize transactions
- Reorganized navigation: Expenses → Goals → Reports → Categories → Rules → Settings
- Material Design icons for all navigation items

#### **Complete Spanish Support**
- Added 60+ translation keys for all rules features
- Full bilingual support (English/Spanish)

### 🧪 Testing
- Added comprehensive test suite for rules service (11 test cases)
- Prevents TypeScript errors and validates pattern detection logic
- Ensures data integrity and null safety

### 📦 Technical Changes
- Backend: Enhanced `PatternDetectionService` with combined pattern scoring
- Frontend: New Lit components for rules and categories management
- API: New endpoint `/api/rules/suggestions/for-transaction/:id`
- Database: No schema changes required

### 🔄 Upgrade Notes
This release requires no database migrations. Simply update to v1.7.1 and restart the add-on.

---

**Installation**: Update via Home Assistant Add-on Store.
