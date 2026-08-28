# v1.7.0 - Enhanced Rules & Dedicated Management Pages

## What's New in v1.7.0

### 🎯 Enhanced Rules Feature with Dedicated Management Pages

This release significantly improves the categorization rules system with better confidence scoring, dedicated management pages, and a streamlined user experience.

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

### 🐛 Bug Fixes
- Fixed rule creation from suggestions - properly handles POST vs PATCH requests
- Fixed TypeScript null reference errors in pattern detection
- Fixed syntax errors in rules service
- Removed unused variables from settings view

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
This release requires no database migrations. Simply update to v1.7.0 and restart the add-on.

### 📝 Commits in This Release
- `ffe7d28` - fix: handle rule creation from suggestions correctly - check for rule.id before PATCH
- `437d419` - fix: remove unused category variables from settings render method
- `6166ab7` - fix: resolve TypeScript typing issues in rules service tests
- `bb783ee` - test: add comprehensive tests for rules service to prevent TypeScript errors
- `29ece2e` - fix: correct TypeScript syntax error in rules.service.ts
- `c8a34f3` - chore: bump version to v1.7.0
- `3aad0aa` - feat: enhance rules feature with dedicated pages and improved confidence scoring

---

**Installation**: Update via Home Assistant Add-on Store once this release is published.
