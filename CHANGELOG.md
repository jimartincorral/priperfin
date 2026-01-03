# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
