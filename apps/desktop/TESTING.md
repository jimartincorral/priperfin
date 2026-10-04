# Testing the desktop app

Run through this before tagging a release that changes `apps/desktop`,
`apps/api` or the packaging. It is ordered by risk — each tier only matters if
the one above it passed.

Most of what can go wrong here is invisible to the Linux CI: the native modules
(`better-sqlite3`, `bcrypt`) are only compiled for Electron's ABI at package
time, and the Electron main process never runs at all until someone launches an
installed app.

## Tier 0 — CI (no hardware needed)

Open a PR. Four checks must go green:

| Check | What a pass proves |
| --- | --- |
| `Lint, Test, and Build` | Nothing regressed; `apps/desktop` type-checks |
| `Add-on Image Build` | The Home Assistant image still builds |
| `Installer (windows-x64)` | Staging, the Electron-ABI native rebuild and NSIS all work |
| `Installer (macos-arm64)` | The same, plus DMG creation |

The installer jobs are the highest-value automated check. They also exercise
the guard in `scripts/rebuild-natives.mjs`: `bcrypt` ships a prebuilt binary
and never compiles from source, so if `@electron/rebuild` fails to produce
`build/Release/*.node` the job fails here rather than shipping an app that
cannot start (the packaging filter drops `prebuilds/`).

Download the two artifacts from the PR run — that is what you install below.

## Tier 1 — first launch

### Windows

1. Run `PriPerFin-Setup-<version>.exe`. SmartScreen shows *"Windows protected
   your PC"* → **More info** → **Run anyway**.

   If **Smart App Control** blocks it instead, there is no bypass: it rejects
   any app without a valid signature, per-app exceptions do not exist, and
   clearing the mark-of-the-web does not help. Test on a machine or VM with it
   off. Turning it off is permanent before Windows 11 24H2 build 26100.8116 /
   25H2 build 26200.8116. Until the installer is code-signed, every user with
   Smart App Control on is blocked the same way — so treat signing as a release
   blocker for Windows, not a polish item.
2. A wizard appears (not a one-click install), the install directory can be
   changed, and **no UAC prompt appears** — it is a per-user install.
3. The window shows the splash, then "Preparing database…", then
   "Starting server…", then the app.
4. **No Windows Firewall prompt.** The server binds `127.0.0.1` specifically to
   avoid one; a prompt means that is not working.

### macOS (Apple silicon)

1. Mount `PriPerFin-<version>-arm64.dmg` and drag the app to Applications.
2. Get past Gatekeeper — one of:
   - right-click (or Control-click) → **Open** → **Open**
   - System Settings → Privacy & Security → **Open Anyway**
   - `xattr -dr com.apple.quarantine /Applications/PriPerFin.app`
3. Confirm it launches. An unsigned arm64 binary still needs an ad-hoc
   signature to run at all; `mac.identity: null` is what provides it.

## Tier 2 — functional sweep

Each item targets something the packaging could plausibly have broken. Do them
on both platforms.

| Action | Why this one |
| --- | --- |
| Create a profile with a password | `bcrypt` — the native module with no compiled fallback |
| Add an account, then a transaction | `better-sqlite3` write path, WAL mode |
| **Import a CSV** | `csv-parse` is required lazily, so it does not load during a normal boot. That is exactly the shape of dependency the packaging filter could remove without anything noticing. The most informative single test here. |
| Open Reports | Aggregate queries through Prisma 7's WASM query compiler |
| Settings → create a backup | `archiver`/`tar`, and the `BACKUP_DIR` contract — `BackupService` throws in its constructor if that path is wrong |
| Menu → Open Data Folder | `data/`, `backups/` and `logs/` exist and are populated |

## Tier 3 — lifecycle

1. Quit the app. No `PriPerFin` process should remain in Task Manager /
   Activity Monitor.
2. Relaunch. It should start cleanly — proves no stale SQLite WAL lock.
3. **Hard-kill** the app (Task Manager → End task) and relaunch. This exercises
   the pidfile reaper in `server-process.ts`; without it an orphaned server
   holds the WAL lock and the next launch stalls on `busy_timeout` and then
   fails confusingly.
4. Launch a second copy while the first is running. The single-instance lock
   should focus the existing window rather than open another.
5. macOS: close the window with the red button (the app stays resident), then
   re-activate from the Dock. The window should return against the same server.
6. Run the Home Assistant add-on or `./start-local.sh` on port 3000 and launch
   the desktop app at the same time. Both should work — the desktop app probes
   a free port instead of hardcoding 3000.

## Tier 4 — upgrade and uninstall

1. Bump `config.yaml` to a throwaway version, rebuild, and install **over** the
   existing install **while the app is running**. This exercises the
   `taskkill` macro in `build/installer.nsh`: the server child is a second
   `PriPerFin.exe` by image name, which electron-builder's own kill-by-appId
   may not match.
2. Confirm existing data survived the upgrade.
3. Uninstall, and confirm `%APPDATA%\PriPerFin` /
   `~/Library/Application Support/PriPerFin` **still exists**.
   `nsis.deleteAppDataOnUninstall: false` protects it; deleting someone's
   financial records on uninstall would be the worst bug this app could have.

## When something fails

The error dialog has **Open Logs** and **Open Data Folder** buttons. Logs live
in `<userData>/logs/`:

- `main.log` — Electron side: startup sequence, `db push`, crash reports
- `server.log` — the API server's stdout and stderr

Two failure modes have deliberately readable messages:

- `NODE_MODULE_VERSION` mismatch → the build was packaged incorrectly; the
  native modules were not rebuilt for this Electron version.
- `SQLITE_BUSY` → another copy of the app may still be running.
