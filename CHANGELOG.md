# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.13.1] - 2026-01-16

### Fixed
- **Configuration** - Removed empty `ports` key from configuration to fix validation issues in Home Assistant.

## [1.13.0] - 2026-01-16

### Security
- **Ingress IP Restriction** - Implemented strict IP checking middleware to allow requests only from Home Assistant Ingress gateway (172.30.32.2) and localhost.
- **AppArmor Profile** - Added custom `apparmor.txt` profile to restrict file system capabilities and network access.
- **Directory Access** - Removed unused write permissions for `/config` and `/share` directories.
- **Port Exposure** - Removed direct port 3000 exposure; access is now exclusively via Ingress.
- **CORS Policy** - Tightened CORS settings to allow only same-origin and localhost requests.

### Added
- **Configuration Translations** - Added English descriptions for add-on configuration options.
- **Documentation** - Added Security, License, and Support sections to documentation.

## [1.11.0] - 2026-01-15

### Added
- **Filterable Dropdown Component** - New `<filterable-select>` web component with type-to-filter functionality, keyboard navigation, and support for icons and nested options. Deployed to 13 locations across the app (categories, accounts, cost objects, profiles).
- **Compact Mode for Inline Editing** - Filterable dropdowns now support compact mode for inline table editing in expenses and split transactions.
- **Collapsible Category Groups** - Parent categories can now be collapsed/expanded in the category management view to improve organization.
- **"Between" Operator for Rules** - Amount conditions in categorization rules now support a "between" operator with separate min/max inputs.

### Fixed
- **CRITICAL: Reports Profile Isolation** - Fixed critical security/privacy bug where all report endpoints (`category-breakdown`, `sankey`, `cost-object-breakdown`) were pulling data from ALL profiles instead of just the authenticated user's profile. All reports now properly filter by `profileId`.
- **Amount Conditions in Rules** - Fixed rule editor storing amount values as strings instead of numbers. Amount inputs now properly parse to `float` values.
- **Rule Operator UX** - Improved operator selection with context-sensitive options (different for amount vs text fields). Added helpful tip about expense/income sign conventions.

### Changed
- **Alphabetical Category Sorting** - Categories are now sorted alphabetically throughout the application (parent categories first, then children within each parent).
- **Category Dropdown Improvements** - All category dropdowns now use the new filterable component with consistent formatting and nested display using indentation.

## [1.2.3] - 2026-01-03

### Fixed
- **API Dependencies** - Added missing `date-fns` and `multer` dependencies to `apps/api/package.json`.
- **Imports** - Fixed missing `GetTransactionsDto` import in `ReportsService` and corrected syntax in `check-db-schema.ts`.

## [1.2.2] - 2026-01-03

### Fixed
- **Local Startup Scripts** - Updated `start-local.sh` and `start-local.bat` to always rebuild the API. This ensures that the latest code changes are applied and prevents errors caused by stale build artifacts.

## [1.2.1] - 2026-01-03

### Fixed
- **Prisma Imports** - Updated all remaining imports in DTOs and tests that were still referencing the old custom `generated/client` path. This resolves `MODULE_NOT_FOUND` errors at runtime.

## [1.2.0] - 2026-01-03

### Removed
- **Desktop Application** - Removed the Electron-based desktop application. Users should now use the `start-local.sh` or `start-local.bat` scripts to run the application locally in their browser. This simplifies maintenance and reduces issues with native dependencies.

## [1.1.22] - 2026-01-03

### Fixed
- **Desktop Build** - Added `prebuild-install` dependency to `apps/desktop`. This fixes the `electron-builder install-app-deps` failure when rebuilding native modules like `better-sqlite3`.

## [1.1.21] - 2026-01-03

### Fixed
- **Prisma Integration** - Switched to standard Prisma Client generation in `node_modules`. This fixes the `MODULE_NOT_FOUND` error for `@prisma/client-runtime-utils` and simplifies the build process.

## [1.1.20] - 2026-01-03

### Fixed
- **CLI Startup** - Corrected the path to the main application file in `start-local.sh` and `start-local.bat`, fixing the "Module not found" error when running locally.

## [1.1.19] - 2026-01-03

### Added
- **Local Startup Scripts** - Added `start-local.sh` and `start-local.bat` to automate installation, building, database initialization, and starting the application locally. This provides an easier alternative to the Electron app for users who prefer running from source.

## [1.1.18] - 2026-01-03

### Fixed
- **Desktop Initialization** - Fixed the blank screen issue on macOS/Windows by bundling a pre-initialized database template (`template.db`). The app now copies this template on first run instead of trying to run `prisma db push`, which failed due to missing CLI tools in the packaged app.

## [1.1.16] - 2026-01-03

### Fixed
- **Installation** - Added `postinstall` script to automatically run `prisma generate`. This fixes build errors ("95 errors") caused by the Prisma client getting out of sync with the schema after updates.

## [1.1.15] - 2026-01-03

### Fixed
- **Developer Experience** - Added a default fallback to `file:./dev.db` in `prisma.config.ts`. This ensures `pnpm db:push` works out-of-the-box even if the `.env` file is missing, simplifying local setup.

## [1.1.14] - 2026-01-03

### Fixed
- **Prisma Configuration** - Resolved conflict between `prisma.config.ts` and `schema.prisma` by removing the deprecated `url` property from the schema file, ensuring compatibility with Prisma 7.

## [1.1.13] - 2026-01-03

### Fixed
- **Local Development** - Fixed `pnpm db:push` error by ensuring `schema.prisma` uses `env("DATABASE_URL")` and providing a `.env.example` file.

## [1.1.12] - 2026-01-03

### Fixed
- **Desktop App** - Fixed blank screen issue by correcting the internal API path and implementing a robust health check before loading the UI.
- **Local Development** - Added `db:push` script and instructions to easily initialize the database for local development, resolving "transactions not found" errors.

## [1.1.11] - 2026-01-03

### Added
- **Apple Silicon Support** - Added native build configuration (arm64) for macOS, ensuring optimal performance on M1/M2/M3 chips.

## [1.1.10] - 2026-01-03

### Fixed
- **Desktop Release** - Fixed version mismatch in desktop application configuration that prevented release artifacts from being built correctly.

## [1.1.9] - 2026-01-03

### Fixed
- **CSV Import** - Fixed "unexpected non-whitespace character" JSON parse error during bulk import.
- **Debug Logging** - Added enhanced telemetry in API Client and Transactions Service to track down connectivity issues.

## [1.1.8] - 2026-01-03

### Fixed
- **CSV Import** - Resolved "NetworkError" during CSV import in Home Assistant and development environments by correctly using relative API paths and configuring a proxy for the dev server.

## [1.1.7] - 2026-01-02

### Added
- **Savings Goals Filtering** - Added comprehensive filtering for savings goals (Name, Category, Date, Amount, Status) with persistent storage and multiple filter criteria.
- **Localization** - Added English and Spanish translations for the new filtering features.

### Fixed
- **Build Configuration** - Excluded test files from the web build process.
- **API Tests** - Improved integration tests and database isolation.

## [1.1.6] - 2026-01-02

### Added

- **Comprehensive Unit Test Suite** - Added 274 unit tests across API and Web apps

  #### API Tests (149 tests)
  - Test infrastructure with Prisma mock factory (`apps/api/src/test/prisma-mock.factory.ts`)
  - Test fixtures for all models (`apps/api/src/test/fixtures/index.ts`)
  - TransactionsService tests (~30 tests) - balance calculation, CSV import, splits, duplicates
  - ReportsService tests (~18 tests) - category breakdown, sankey diagrams, cost objects
  - SavingsGoalsService tests (~12 tests) - progress calculations, CRUD operations
  - CategorizationService tests (~10 tests) - preprocessing, ML training, prediction
  - BackupService tests (~12 tests) - key derivation, listing, restore validation
  - AccountsService tests (~10 tests) - CRUD operations
  - MonthlyBalancesService tests (~8 tests) - findOne, upsert operations
  - CostObjectsService tests (~8 tests) - CRUD operations
  - CategoriesService tests (~5 tests) - CRUD operations
  - Fixed all controller specs with proper mock providers

  #### Web Tests (125 tests)
  - Vitest test infrastructure with happy-dom environment
  - API Client tests (14 tests) - HTTP methods, error handling
  - I18n Service tests (17 tests) - singleton pattern, translations, events
  - CSV Utils tests (39 tests) - date/number parsing, duplicate detection
  - Expense Utils tests (26 tests) - filtering, sorting, pagination
  - Goals Utils tests (29 tests) - status calculation, progress tracking, totals

### Changed

- Added Vitest and testing dependencies to web app

## [1.1.5] - 2026-01-02

### Fixed

- Use Prisma API instead of raw SQL for schema validation

## [1.1.4] - 2026-01-02

### Fixed

- Remove --skip-generate flag for Prisma 7.x compatibility

## [1.1.3] - 2026-01-01

### Fixed

- Schema sync and startup validation improvements
