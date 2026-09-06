# Changelog

## v1.18.0 - 2026-09-06

- Reworked the Expenses balance card so it adapts to whether the selected account is linked to a bank.
- Bank-linked accounts now show the bank balance as a read-only figure with the timestamp of the last sync, instead of an editable field that Open Banking sync silently overwrote on every run.
- Removed the discrepancy tile and the Balanced/Review badge for bank-linked accounts: the bank balance is the current closing balance while the calculated balance is scoped to the selected period, so the two were never comparable and the badge read *Review* permanently on any past month.
- Fixed the "All accounts" view, which compared a stale hand-typed figure against a live aggregate because Open Banking sync only ever writes per-account balances. It now sums the linked accounts' bank balances and states how many accounts are covered.
- Manual accounts keep the editable bank balance, the discrepancy tile and the reconciliation badge unchanged.

## v1.17.17 - 2026-09-01

- Configured `home-assistant/builder` to use architecture-matched builder images (`image: ${{ matrix.arch }}`) on native runners.

## v1.17.16 - 2026-09-01

- Enabled native ARM64 GitHub Actions runners (`ubuntu-24.04-arm`) for `aarch64` container builds, eliminating QEMU CPU emulation and speeding up builds from 15m to ~3m.

## v1.17.15 - 2026-09-01

- Prioritized bank `value_date` (*Fecha valor*) over `booking_date` (*Fecha contable*) during Open Banking sync so transactions match the operation date shown in online banking apps.

## v1.17.14 - 2026-08-31

- Fixed container startup crash by keeping `prisma` and `@prisma/config` in production dependencies for `run.sh` database schema synchronization (`prisma db push`).

## v1.17.13 - 2026-08-31

- Updated `CHANGELOG.md` with complete historical release notes so they are visible during Home Assistant add-on updates.
- Added changelog maintenance requirement to developer and release workflows.

## v1.17.12 - 2026-08-31

- Pruned Prisma CLI and dev-only type definitions from production container dependencies, lightening the runtime image.
- Streamlined `Dockerfile` builder stage by removing unnecessary C++ build tools from the TypeScript compilation step.
- Added GitHub Actions workflow concurrency control (`cancel-in-progress: true`) to automatically cancel superseded runs.
- Upgraded `softprops/action-gh-release` to v2 to eliminate GitHub runner Node deprecation warnings.

## v1.17.11 - 2026-08-31

- Parallelized multi-architecture container builds (`aarch64` and `amd64`) across concurrent runners using GitHub Actions matrix strategy.
- Accelerated Docker build stage using host-native TypeScript compilation via `BUILDPLATFORM`.
- Enabled Docker layer caching (`--self-cache`) in Home Assistant builder.

## v1.17.10 - 2026-08-31

- Fixed calculation of Income, Expenses, and Movement net in the Expenses view.
- Corrected inflow handling so positive amounts and income-category movements are properly counted towards Income regardless of category defaults.
- Fixed split transactions calculation so uncategorized split lines are fully included and never dropped.
- Extracted and thoroughly unit-tested `calculateMonthlyStats`.

## v1.17.9 - 2026-08-31

- Stripped CRLF line endings from container startup entrypoint (`run.sh`) to ensure reliable Docker container execution on all host platforms.

## v1.17.8 - 2026-08-31

- Set explicit container entrypoint to `/run.sh` to resolve local container execution permissions.

## v1.17.7 - 2026-08-31

- Removed deprecated `armv7` architecture to significantly accelerate build and deployment times.

## v1.17.6 - 2026-08-31

- Implemented full pagination loop in Open Banking (PSD2) synchronization to retrieve all pages of historical bank movements.

## v1.17.5 - 2026-08-31

- Prevented querying older than the bank lookback window to protect bank SCA (Strong Customer Authentication) session validity.

## v1.17.4 - 2026-08-31

- Added automatic bank account relinking upon re-authentication and automated clearing of session-expired alerts.

## v1.17.3 - 2026-08-31

- Added configurable initial historical lookback window setting for bank synchronization.

## v1.17.2 - 2026-08-31

- Resolved ESLint issues and optimized multi-architecture builder.

## v1.17.1 - 2026-08-31

- Fixed bank OAuth authentication flow by breaking out of the Home Assistant Ingress iframe.

## v1.17.0 - 2026-08-31

- Added automatic bank synchronization via Enable Banking Open Banking (PSD2) API.
- Implemented background daily auto-sync for connected bank accounts.
- Added multi-layer transaction deduplication.

## v1.16.3 - 2026-08-31

- Enabled SQLite WAL (Write-Ahead Logging) mode for enhanced database performance and concurrency.
- Added container health check endpoint and Docker healthcheck configuration.

## v1.16.2 - 2026-08-31

- Configured GitHub Container Registry (GHCR) multi-architecture publishing workflow.
- Implemented route-level code splitting and lazy loading for faster frontend loading times.

## v1.16.1 - 2026-08-31

- Slimmed production Docker image by purging build toolchain, intermediate compiler caches, and adding `.dockerignore`.

## v1.15.0 - 2026-08-31

- Added category refund netting against spend in financial reports.

## v1.14.0 - 2026-08-31

- Major reports overhaul: added Budget vs. Actual charts, Sankey cash flow diagrams, Cost Object spending breakdown, and Monthly Average view.

## v1.13.17 - 2026-08-31

- Fixed login trailing slash redirection loop on Home Assistant Ingress.

## v1.13.16 - 2026-08-31

- Balance precision and database integrity fixes.

## v1.13.14 - 2026-03-09

- Fixed backup/restore to include reconciliation-related settings (anchored starting balances, verified balances per account, and profile PIN length metadata).
- Fixed verified bank balance persistence so each account keeps its own independent value (no cross-account carryover).
- Improved login PIN UX/security with a single line-style input (instead of segmented boxes) and profile-specific auto-submit behavior based on stored PIN length.
- Added backend persistence for PIN length per profile and wired profile list responses to include `pinLength`.
- Refined expenses pagination behavior so `Todo el tiempo` suggests/selects total rows and non-`Todo el tiempo` modes reset to 20 rows per page.

## v1.13.13 - 2026-03-09

- Improved expenses reconciliation UX with clearer sections for reconciliation status and period breakdown.
- Added anchor-based balance workflow (`Fijar saldo desde aqui`) to set balances from a selected movement and auto-recalculate forward months.
- Updated key labels/tooltips in Spanish/English for clarity (`Descuadre`, `Neto`, actions tooltips, filters text, etc.).
- Moved the table columns button next to rows-per-page and improved pagination options with dynamic total rows option.
- Fixed date filter input behavior and calendar usability while keeping ISO-style (`yyyy-mm-dd`) workflow.
- Improved action buttons layout in the table to avoid icon overlap.
- Added defensive handling for invalid pagination/column config states to prevent empty table rendering.
- Improved i18n behavior to use browser locale when no saved language is present.
