# Changelog

## v1.19.0 - 2026-09-04

Desktop redesign. Expenses, Reports, Goals, Categories and Settings now have desktop layouts built in the same language as the phone ones; the mobile layout below 600px is unchanged.

- **Expenses** replace the three stacked summary cards and the wall of filter selects with a single summary strip and removable filter chips, so the first row of the table is visible without scrolling. Rows expand in place to edit category, date, amount and notes, and a side column ranks where the money went across the filtered set. Row density can be toggled between comfortable and compact.
- **Reports** move from four stacked full-width charts to a 2×2 grid: the category breakdown with drill-down to the transactions behind it, a composition doughnut, budget vs actual, and funding sources. Hiding a category now drops it from the total that every percentage is based on. The Sankey chart is dropped.
- **Goals** replace the nine-column table with a card per goal and a marker on the progress bar showing where the goal should be by now, so being behind is visible instead of calculated. The distribute sheet becomes a persistent panel, and over-allocated savings are shown as negative rather than absolute.
- **Categories** merge the two stacked tables into one tree with an Expense / Goal switch, and each row shows spend against its budget as a bar — grey where there is no budget, so unplanned spend reads as unplanned. The Goal tab drops the budget columns, which goal categories do not have.
- **Settings** replace the single long scroll with a persistent section index beside one section at a time, with a chip row taking over on narrow windows. Preferences use inline segmented controls instead of picker dialogs.
- Add / edit forms are dialogs instead of cards that pushed the page down, and side columns are removed at narrow widths rather than squeezed.
- Every screen follows the theme, dark mode included, and the accounts list now shows each account's current balance next to its opening balance.

## v1.18.0 - 2026-09-04

Mobile redesign. Every screen now has a phone layout below 600px; the desktop layout above that width is unchanged.

- **Reports** lead with "where did my money go" as a ranked bar list instead of the doughnut chart, with one report per screen via Breakdown / Budget / Funding tabs. Tapping a parent category expands its children inline and drills down to the transactions behind it. The Sankey chart is dropped on phones.
- **Expenses** replace the horizontally scrolling table with date-grouped rows showing date, amount and category. Suggested categories can be accepted with one tap; tapping a row opens a full-screen category sheet. Search, filters, reconciliation and bulk selection all moved into sheets, and rows now append on scroll instead of paginating.
- **Goals** lead with progress at a glance and an on-track / behind badge based on the target date, plus goal detail and new-goal screens.
- **Categories, Rules and Settings** were reworked in the same language: category tabs with parent/child rows, rule cards with mode badges, and a grouped navigation list for Settings instead of one long scroll.
- A month stepper replaces the control row that used to run off the side of the screen, and every tap target is now at least 44px.
- Native `alert()` and `confirm()` dialogs are replaced on phones by an inline snackbar and confirmation sheets; form validation shows errors under the field.
- Status pills use new translucent colours that meet contrast requirements on the dark theme.
- Fixed manual transaction creation, which the API rejected when the category or funding source was left empty.

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
