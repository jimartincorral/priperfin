# Changelog

## v1.22.0 - 2026-09-13

Adds OFX/QFX bank statement import alongside CSV.

- The import wizard now accepts `.ofx`/`.qfx` files in addition to CSV, parsing both SGML-style (OFX 1.x) and XML-style (OFX 2.x) exports client-side, with charset-aware decoding for non-UTF-8 bank files.
- OFX files skip the column-mapping step entirely, going straight to the review screen, since OFX fields are already unambiguous.
- Each transaction's bank-assigned FITID is used for duplicate detection, reusing the same review/merge flow as CSV imports.

## v1.21.0 - 2026-09-09

Introduces first-class account transfers with two-legged matching across accounts.

- **Account Transfers**: Record money movements between accounts (e.g. Checking → Savings) as linked two-legged transfers sharing a transfer ID, keeping balances accurate across both accounts.
- **Double-Counting Protection**: Transfers are excluded from expense totals, income totals, category breakdowns, Sankey diagrams, and cost object reports, ensuring money moving between accounts is never misclassified as household spend or income.
- **Paired Editing & Deletion**: Updating the amount or date on either leg automatically updates the counterpart leg in the other account. Deleting one leg cleans up both legs with a confirmation prompt.
- **Automatic & Manual Matching**: Open Banking bank sync automatically pairs opposite matching transactions across accounts within ±3 days. Transactions can also be manually linked or unlinked at any time.
- **Desktop & Mobile UI**:
  - Add Transaction modal and mobile sheet include a switcher for Expense, Income, and Transfer with source and destination account selectors.
  - Transactions display transfer badges and counterpart account names (`🔄 Transfer to {Account}` / `🔄 Transfer from {Account}`) instead of category selectors.
  - Expandable rows and mobile sheets offer 1-tap transfer unlinking and counterpart account details.
  - Filter by Type (All / Expenses / Income / Transfers) in both desktop and mobile views.
  - Full English and Spanish localization support.

## v1.20.2 - 2026-09-07

Fixes sorting on the Goals screen, which ordered amounts as text.

- Sorting by target amount or by saved amount put 10000 before 200 and 2500 before 300. Both columns are decimals, which arrive from the API as strings, and the comparator compared them as strings instead of numbers.
- Sorting by target date now places evergreen goals by the date they are working towards (start plus target months) rather than leaving them wherever the previous sort had them — they have no target date, so the old comparison against an empty value never ordered them.

## v1.20.1 - 2026-09-07

Restores the Redistribute All button on the Goals screen, lost in the v1.19.0 desktop rebuild.

- The desktop rebuild kept the "Distribute Unassigned" path but dropped the second button beside it, so nothing in the app could reach the redistribute-all code — resetting every goal and splitting the whole savings pot again was unreachable from either layout.
- Desktop: a *Redistribute All* button sits next to *Preview split* in the assign panel, using the selected fill mode. It stays enabled when nothing is unassigned, which is exactly when it is needed.
- Mobile: the distribute sheet gains an Unassigned / Whole pot switch, and the *Assign* link no longer disappears once everything is allocated — it opens straight into the whole-pot scope.
- The confirmation prompt before resetting saved amounts is unchanged.

## v1.20.0 - 2026-09-06

The Expenses balance card now adapts to whether the selected account is linked to a bank, because Open Banking sync had quietly invalidated what it was claiming.

- Bank-linked accounts show the bank balance as a read-only figure with the timestamp of the last sync, instead of an editable field that sync silently overwrote on every run.
- The discrepancy and the Balanced / Review badge are gone for bank-linked accounts. The bank figure is the current closing balance while the calculated figure is scoped to the selected period, so the two were never comparable and the badge read *Review* permanently on any past month.
- On desktop, the *Reconciled* cell becomes *Synced with bank* with the sync time; on mobile, the *Bank differs by* alert becomes a plain bank balance.
- Fixed the "All accounts" view, which compared a stale hand-typed figure against a live aggregate because sync only ever writes per-account balances. It now sums the linked accounts and states how many are covered.
- Manual and cash accounts keep the editable balance, the discrepancy and the badge unchanged — there the typed figure is still the only way to catch a missed entry.

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
