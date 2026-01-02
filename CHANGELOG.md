# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
