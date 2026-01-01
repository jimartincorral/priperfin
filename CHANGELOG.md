# Changelog

All notable changes to this project will be documented in this file.

## [1.1.2] - 2026-01-02

### 🐛 Fixes

- **Schema Sync Reliability**: Fixed critical issue where database schema sync failures were silently ignored during startup, causing runtime errors when expected columns were missing. Schema sync failures now properly halt startup with clear error messages.
- **Startup Validation**: Added database schema validation on app startup to detect missing columns early and provide actionable remediation steps before serving requests.

## [1.1.0] - 2026-01-01

### ✨ Features

- **Smart Categorization (ML)**: Integrated a local Naive Bayes Classifier to suggest categories for new transactions based on your history. Suggestions are now displayed for confirmation instead of being applied automatically.
- **Reports**: Added a "Group by Parent Category" toggle to the Expenses Pie Chart, allowing for better high-level financial overviews.
- **CSV Import**: Enhanced the CSV importer to provide categorization suggestions for imported transactions.
- **Database Diagnostics**: Added a backend diagnostics tool to monitor database health and table statistics.

### 🐛 Fixes

- **Backup & Restore**: Fixed a critical issue where restoring a backup could cause data loss or fail due to schema mismatches. The restore process now uses non-destructive schema patching.
- **Startup Reliability**: Corrected the startup script to ensure database migrations are applied reliably in the Home Assistant add-on environment.
- **Frontend Stability**: Improved error handling in the Expenses view to prevent the entire page from crashing if auxiliary data (like cost objects) fails to load.
- **Schema Sync**: Resolved an issue where local database columns (like `suggestedCategoryId`) were missing, causing API crashes.

### 🔧 Technical

- **Prisma 7**: Upgraded to Prisma 7.x and updated configuration for better compatibility with the `better-sqlite3` adapter.
- **Logging**: Added detailed logging to the CSV import process to aid in debugging duplicate detection.
- **Dependencies**: Moved `prisma` CLI to runtime dependencies to ensure migration scripts function correctly in production.
