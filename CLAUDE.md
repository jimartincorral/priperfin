# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PriPerFin is a personal finance tracking application built as a pnpm monorepo with three apps:
- **api**: NestJS backend with Prisma ORM and SQLite database
- **web**: Lit-based web frontend using Vite
- **desktop**: Electron-based desktop application

## Commands

### Development
```bash
pnpm dev              # Run both apps in parallel (api + web)
pnpm build            # Build all packages
pnpm test             # Run tests across all packages
pnpm lint             # Lint all packages
```

### API-specific (from apps/api)
```bash
pnpm start:dev        # Watch mode development
pnpm test             # Run Jest unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run e2e tests
pnpm lint             # ESLint with auto-fix
pnpm format           # Prettier formatting
```

### Database (from apps/api)
```bash
npx prisma generate   # Regenerate Prisma client after schema changes
npx prisma db push    # Push schema changes to database
npx prisma studio     # Open Prisma Studio GUI
```

### Web-specific (from apps/web)
```bash
pnpm dev              # Vite dev server on 0.0.0.0
pnpm build            # TypeScript compile + Vite build
```

## Architecture

### Backend (apps/api)

NestJS modular architecture with these domain modules:
- **TransactionsModule**: Financial transactions with CSV import support
- **CategoriesModule**: Hierarchical categories (income/expense/goal types)
- **AccountsModule**: Bank accounts with debit/credit types
- **SavingsGoalsModule**: Savings targets linked to categories
- **ReportsModule**: Financial analytics and reports
- **MonthlyBalancesModule**: Account balance tracking
- **BackupModule**: Data backup/restore functionality
- **SettingsModule**: App configuration (key-value store)
- **AdminModule**: Administrative operations

**Database**: SQLite via Prisma with better-sqlite3 adapter. Schema at `apps/api/prisma/schema.prisma`. Database path configured via `DATABASE_URL` env var.

**API pattern**: REST endpoints at `/api/*`. Controllers use DTOs with class-validator for validation.

### Frontend (apps/web)

Lit web components with Material Design 3 theming:
- **priperfin-app.ts**: Root component with Vaadin Router, navigation, and theme system
- **views/**: Route components (view-expenses, view-goals, view-reports, view-settings)
- **components/**: Reusable components (csv-wizard)
- **api/client.ts**: HTTP client for backend communication (port 3000)
- **i18n/**: Internationalization (en, es translations)

**Routing**: Vaadin Router with paths: `/`, `/goals`, `/reports`, `/settings`

### Key Data Models

- **Transaction**: date, amount, description, category, account, notes, externalId (for dedup)
- **Category**: name, icon, color, budget, type (INCOME/EXPENSE/GOAL), parent/children hierarchy
- **Account**: name, initialBalance, type (DEBIT/CREDIT)
- **SavingsGoal**: name, targetAmount, targetDate, savedAmount, category
- **MonthlyBalance**: month, balance, account (unique per month+account)

## Deployment

### Home Assistant Add-on

**Installation:**
1. Add the PriPerFin add-on repository to Home Assistant
2. Navigate to Settings → Add-ons → Add-on Store
3. Find "Personal Finance Tracker" and click Install
4. Configure options (optional) and click Start
5. Access via the sidebar panel or Ingress

**Configuration Options:**
- `database_path`: SQLite database location (default: `file:/data/priperfin.db`)
- `backup_dir`: Backup storage directory (default: `/backup/priperfin`)
- `backup_encryption_key`: Optional encryption key for backups

The add-on runs on port 3000 with Ingress support and is available on aarch64, amd64, and armv7 architectures.

### Desktop (Windows/macOS/Linux)

Run the app locally using the provided scripts:
- **Windows**: Run `start.bat`
- **macOS/Linux**: Run `./start.sh`

The app stores its SQLite database locally in the user data directory.

## Releasing New Versions

**IMPORTANT**: Every new version must be released as a GitHub Release so Home Assistant can detect and offer updates to users.

### Release Process

1. Update the version in `config.yaml` (the `version` field)
2. Commit all changes and push to main
3. Create a GitHub Release with:
   - Tag: `vX.Y.Z` (matching the version in config.yaml)
   - Title: `vX.Y.Z`
   - Description: Summary of changes
4. Home Assistant will automatically detect the new release and show an update available

### Quick Release Command
```bash
# After committing changes, create and push a tag:
git tag vX.Y.Z
git push origin vX.Y.Z
# Then create the release on GitHub from the tag
```

## Development Notes

- API serves static files from `apps/web/dist` in dev, `/app/client` in Docker
- Frontend connects to API at `http://{hostname}:3000/api`
- Theme system supports light/dark/auto modes via `data-theme` attribute
- Tests use Jest with ts-jest transform; test files match `*.spec.ts`
