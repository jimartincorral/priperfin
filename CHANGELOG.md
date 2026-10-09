# Changelog

## v1.28.0 - 2026-10-09

Home Assistant integration: entities, an import event, and profile pre-selection from the sidebar.

- **Entities in Home Assistant.** A new companion integration, installed through HACS from this same repository, turns each profile into a device with sensors: uncategorized transactions, pending rule suggestions, this month's income, expenses and net, total balance and one balance per account, categories over budget and budget remaining, goals saved, left and behind schedule, last bank sync, bank consent days left and a "bank consent expired" problem sensor. It fires a `priperfin_import` event whenever an import or bank sync adds transactions. See the README section "Home Assistant integration".
- **API tokens.** Settings → Home Assistant creates long-lived, read-only tokens for the integration (shown once, revocable). A token can only read that profile's summary; every other endpoint still needs the PIN session.
- **Profile pre-selection from the sidebar.** When the add-on is opened from Home Assistant, the sign-in screen can start on the profile mapped to the Home Assistant user. Switch it on under Settings → Home Assistant. The PIN is still required.
- **Currency** is now also stored on the server so the money sensors carry the right unit.
- The add-on is unchanged for anyone who does not install the integration; the new endpoints are off the Ingress path and require a token.

## v1.27.1 - 2026-10-09

Documentation for bank synchronization. No functional changes.

- **Bank sync is now documented.** The README has a full guide to the optional Enable Banking integration: what to register, how to choose the redirect URL for Home Assistant, the desktop app and Docker, how syncing and the 90-day consent work, and what is and is not included in backups. The add-on documentation has a shorter version.
- The redirect URL field in Settings no longer suggests an address that only the app itself can use; it now points at the Settings page and explains the Paste Callback alternative.

## v1.27.0 - 2026-10-08

Structural fixes from the pre-release review: data model, transfers, performance and housekeeping.

- **Import dedup key is now per profile.** Two profiles importing the same joint-account statement used to fail with "Internal server error" on the second import, because the key that detects re-imported rows was unique across the whole database. It is now unique within each profile. This is a schema change: the add-on applies it on start as usual; the desktop app, which refuses schema changes that could lose data, now recognises that adding a unique constraint drops nothing and applies it too. Any other kind of change still stops with an error as before.
- **Transfer linking is validated.** Linking two transactions as a transfer now requires equal and opposite amounts, and refuses a transaction that is already part of a transfer (which would have orphaned its old partner). Moving one leg of a transfer to another account updates the partner's counterpart account, and moving it onto the partner's own account is refused.
- **Faster on large ledgers.** On a 30,000-transaction ledger the all-time category and cash-flow reports went from about 1.2 to 1.5 seconds to 0.3 seconds, the yearly report from 0.27 to 0.07 seconds, and the all-time transaction list from 35 MB to 1.1 MB on the wire (responses are now compressed) and 30 percent faster to produce. A new index covers per-profile date ranges.
- **Housekeeping.** All API lint warnings are fixed, two broken developer scripts and an unused web component are removed, and the docs no longer list armv7 (the add-on builds for amd64 and aarch64).

## v1.26.2 - 2026-10-08

Polish from the pre-release review. No new features.

- **No more pop-up dialogs on desktop.** Saves, errors and sync results used to open the browser's native alert box. They now appear as a toast in the bottom-right corner, with an action button where one applies, the same way the mobile layout already did.
- **Currency symbol follows your setting.** GBP, JPY, CAD and AUD showed `$` everywhere; the duplicate-merge step of the CSV import and the split dialog showed `$` even for EUR. Every amount now uses the symbol of the currency chosen in Settings.
- **Light theme renders native controls in light.** The page forced dark `color-scheme`, so date pickers, drop-downs and scrollbars stayed dark in the light theme. The CSV import wizard, the rules list and the split dialog also used fixed light colours that read badly in dark mode; they use the theme palette now.
- **Spanish login and setup.** The login and setup screens, the profile picker's filter box and the wrong-PIN and rate-limit messages are translated. The session token is no longer written to the browser console.
- **Reports agree on what counts as spending.** A negative amount on an income category (a clawback) and an outflow to a savings goal are no longer counted as "Uncategorized" spending in the category breakdown; the cash-flow diagram treats them the same way, reducing the income source and leaving goal contributions in the Savings remainder.

## v1.26.1 - 2026-10-08

Fixes found in a pre-release review. No new features.

- **Docker local server works.** Running `docker compose up` outside Home Assistant answered every request with a 403 "Direct access not allowed" page, because the browser's connection arrives from the Docker bridge rather than from Ingress or loopback. The container now allows direct access when it starts without Home Assistant, and the published port is bound to the host's loopback address so the app is still not exposed to the network by default.
- **Wrong PIN no longer reloads the page.** A mistyped PIN on the login screen, in Change PIN or when deleting a profile was treated as an expired session, which cleared the session and reloaded the login page. The error message is now shown in place.
- **Dates are handled in UTC end to end.** In time zones east of UTC (Spain and the rest of Europe) the From/To date filter was ignored and editing a transaction's date on desktop saved nothing; OFX imports were stored one day early. West of UTC (the Americas) transactions dated the 1st of a month showed up in the previous month in the list and in every report, and the mobile list showed dates a day early. Month, year and custom ranges on the server, the custom-range stepper, and the mobile date labels now all use the same UTC convention as the stored dates.
- **Missing translations.** Six labels showed their raw key instead of text: the "Saved" notice after unlinking a transfer, the Close button on the mobile transaction sheet, the delete-category dialog title and warning, the amount validation message and the account fallback in the delete-transfer dialog.
- **Profile isolation on the API.** The rule test, apply-rule, reorder, suggestion accept/reject and suggestion-for-transaction endpoints, and the bulk-import merge step, were not restricted to the logged-in profile. A transaction can also no longer be moved to another profile through an edit request.
- **Bank credentials no longer reach the browser.** The generic settings endpoint returned the Enable Banking application id and private key verbatim; those keys are now excluded.
- **Login attempts are rate limited again.** The limiter was configured but its guard was never registered, so the PIN could be tried without limit. The guard is now active with a single limiter, so the five-attempts-per-minute rule applies to login only and nothing else is throttled in normal use.
- **Identical same-day transactions import.** Two legitimate rows with the same date, amount and description (two coffees) used to fail the whole CSV or bulk import on a unique-key error that the UI reported as "Internal server error". Repeats within one import now get a distinct key, and re-importing the same file still skips every row as a duplicate.
- **Account-based rules fire during import.** Rules with an "account" condition never matched on CSV import because the account was stripped before evaluation.
- **Server start on IPv4-only hosts.** The server bound explicitly to `::` since v1.25.0, which fails where IPv6 is disabled; it now lets Node pick the address and fall back to IPv4.
- **Backup restore uploads go to the system temp folder** instead of the server's working directory, which in the desktop app is inside the application bundle.
- **Developer setup:** `pnpm dev` and the `start-local` scripts failed on a fresh checkout with "Cannot find module @prisma/client-runtime-utils"; it is now a direct dependency.
- README: the add-on is reachable through Ingress only, not on port 3000.

## v1.26.0 - 2026-10-08

Shows how much money is still missing to reach all your savings goals.

- The Goals screen now has a **Left to reach goals** total: in the summary strip on desktop, and as a tile on mobile.
- It adds up what each goal still needs (target minus saved). A goal that is already over its target counts as zero, so its surplus never hides a gap on another goal.

## v1.25.0 - 2026-10-04

Adds standalone desktop installers for Windows and macOS, so PriPerFin can run on a laptop without Home Assistant.

- **Windows**: an installer (`PriPerFin-Setup-1.25.0.exe`) is now attached to every release. It installs per-user, so there is no administrator prompt.
- **macOS (Apple silicon)**: a disk image (`PriPerFin-1.25.0-arm64.dmg`). Intel Macs are not covered by this release.
- The desktop app keeps its database and backups in the standard per-user application data folder, and the app menu has shortcuts to open the data, backups and logs folders.
- The installers are not code-signed, so both systems ask you to confirm before the first launch. On Windows, SmartScreen needs one click-through; PCs with **Smart App Control** switched on can only run the app with it switched off. On macOS, approve it once per downloaded version under **System Settings → Privacy & Security**. The **Desktop App** section of the README has the exact steps.
- **The Home Assistant add-on is unchanged.** If that is how you run PriPerFin, this release brings no functional changes and nothing needs to be done.

## v1.24.1 - 2026-09-14

Makes the desktop Goals cards more compact so more goals fit on screen at once.

- Tighter card density on the desktop Goals screen: reduced row padding, smaller gaps between and within cards, and a step-down in card text sizes (name, amounts, tags, captions). No information was removed, and the mobile layout is unchanged.

## v1.24.0 - 2026-09-14

Changes the default pagination on the Expenses screen so all transactions are visible at once.

- The **Rows per page** control now defaults to the total number of transactions in the current view, so every filtered row shows on a single page by default across all period modes (Month, Year, Custom, All time) — previously this only happened in All time.
- Picking a specific size (20/50/100/200) from the menu still sticks for the session; the total remains available as an option.

## v1.23.1 - 2026-09-13

Closes two mobile-only gaps where the phone layout could not reach something the desktop layout could.

- **Bank sync on mobile**: the *Sync Bank* action existed in the desktop toolbar and in the mobile empty state only, so once a single transaction was listed for the period there was no way to trigger a sync from a phone. It now sits in the mobile Expenses title row beside search and filter, disabled and spinning while a sync is in flight.
- **Editable savings pot on mobile**: the Goals savings pot is an inline field in the desktop strip, but the mobile *Saved so far* tile rendered it as a read-only figure. The tile is now a tap target that opens a bottom sheet editor, matching the sheets the rest of the mobile Goals screen already uses. Unassigned recalculates on save, and both layouts write through one shared path.

## v1.23.0 - 2026-09-13

Adds budget comparison to the "Where it went" panel on the desktop Expenses screen.

- Each category row now shows its spend against that category's monthly budget, with over-budget rows called out in red, alongside a panel summary of total budgeted spend and a count of the categories over.
- A **Categories / Subcategories** toggle switches the grouping level, so a parent that looks fine in aggregate can be drilled into — a group may sit inside its budget while one of its subcategories is well over. The choice is remembered per device.
- Within budget, the bar fills to spend against budget. Over budget, the track spans the spend and a tick marks the budget line, so the overspend is drawn to scale rather than a bar pinned at full width.
- Budgets are monthly amounts, so the comparison applies to Month periods directly and Year periods scaled by 12. Custom and All time keep the previous share-of-spend bars and say why the comparison is unavailable.
- Categories with no budget offer a **Set budget** link that opens Settings → Categories with the search already narrowed to that category.

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
