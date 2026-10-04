# Personal Finance Tracker

A comprehensive personal finance management system for Home Assistant.

## Features

- **Expense Tracking**: Track all your expenses with categories, notes, and custom fields
- **Income Management**: Record income transactions
- **Savings Goals**: Set and track progress toward savings goals with target dates
- **Monthly Balances**: Set starting balances for each month
- **Reports & Analytics**: 
  - Category breakdown charts
  - Sankey diagrams for cash flow visualization
  - Monthly and yearly summaries
- **CSV Import**: Bulk import transactions from CSV files
- **Backup & Restore**: Encrypted backup and restore functionality
- **Responsive UI**: Modern web interface built with Lit web components

## Installation

PriPerFin can run two ways: as a Home Assistant add-on, or as a standalone
desktop app on Windows or macOS. Both run the same application against your own
local database — pick whichever suits you. See [Desktop App](#desktop-app) for
the second option.

### Home Assistant add-on

1. Add this repository to your Home Assistant add-on store
2. Install the "Personal Finance Tracker" add-on
3. Configure the add-on options (optional)
4. Start the add-on
5. Access the web interface at `http://homeassistant.local:3000`

## Desktop App

Download the latest installer from the
[Releases page](https://github.com/jimartincorral/priperfin/releases/latest).
Home Assistant is not required, and nothing needs to be installed first — no
Node.js, no pnpm, no terminal.

| System | File |
| --- | --- |
| Windows 10/11 (64-bit) | `PriPerFin-Setup-<version>.exe` |
| macOS 11+ on Apple silicon (M1 and later) | `PriPerFin-<version>-arm64.dmg` |

Intel Macs are not currently covered. The Home Assistant add-on still works on
any machine that can reach your Home Assistant instance.

### First launch

These builds are **not code-signed yet**, so Windows and macOS will both warn
you the first time you open the app. This is expected, and you only have to get
past it once.

**Windows.** SmartScreen shows *"Windows protected your PC"*. Click
**More info**, then **Run anyway**.

If instead you see *"Smart App Control has blocked this app"*, that is a
different and stricter feature, and there is **no "Run anyway" button** — Smart
App Control blocks any app that is not validly signed, with no per-app
exception. It is on by default on some clean installs of Windows 11 (upgrades
generally have it off). Your options are:

- Install on a machine or virtual machine where Smart App Control is off.
- Turn Smart App Control off, under **Windows Security → App & browser control
  → Smart App Control**. **Check your Windows build first** (run `winver`): on
  Windows 11 24H2 build 26100.8116, 25H2 build 26200.8116 and later you can
  turn it back on afterwards, but on earlier builds turning it off is permanent
  until you reset or reinstall Windows. Do not do this casually on a machine
  you rely on.

Clearing the file's mark-of-the-web (`Unblock-File` in PowerShell) does **not**
help here — Smart App Control judges the signature, not where the file came
from.

The real fix is for these builds to be code-signed, which is tracked as a
follow-up. Until then, Smart App Control will block the installer.

**macOS.** Drag PriPerFin to your Applications folder, then:

1. Open **Applications** in Finder, right-click (or Control-click) **PriPerFin**
   and choose **Open**, then **Open** again in the dialog.
2. On macOS 15 and later that may not be offered. Try to open the app normally,
   then go to **System Settings → Privacy & Security**, scroll to the message
   about PriPerFin and click **Open Anyway**.
3. If macOS says the app *"is damaged and can't be opened"* — that is the
   message Gatekeeper uses for a quarantined unsigned app, not actual
   corruption — clear the quarantine flag and open it again:

   ```bash
   xattr -dr com.apple.quarantine /Applications/PriPerFin.app
   ```

### Where your data lives

The desktop app keeps everything under your user account, so it survives
upgrades and is never written into the application folder:

| | Location |
| --- | --- |
| Windows | `%APPDATA%\PriPerFin` |
| macOS | `~/Library/Application Support/PriPerFin` |

Inside it, `data/` holds the SQLite database, `backups/` the backups and
`logs/` the application logs. The app menu has **Open Data Folder**,
**Open Backups Folder** and **Open Logs Folder** entries so you do not have to
find them by hand. Uninstalling does not delete this folder.

The app runs its own server on a loopback port that is chosen at startup, so it
never listens on your local network and does not conflict with a Home Assistant
add-on or a development server on port 3000.

## Configuration

### Options

- **database_path**: Path to the SQLite database file (default: `file:/data/priperfin.db`)
- **backup_dir**: Directory for storing backups (default: `/backup/priperfin`)
- **backup_encryption_key**: 32-character key for encrypting backups (optional)

### Example Configuration

```yaml
database_path: "file:/data/priperfin.db"
backup_dir: "/backup/priperfin"
backup_encryption_key: "YourSuperSecretKeyForBackup12398"
```

## Development

### Prerequisites

- Node.js 20+
- pnpm

### Running Locally (Simplified)

We provide helper scripts to automatically install, build, and run the application locally without needing to manually run multiple commands.

**Linux / macOS:**
```bash
./start-local.sh
```

**Windows:**
```cmd
start-local.bat
```

This will start the application at `http://localhost:3000`.

### Running Locally (Manual)

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Initialize the database (SQLite):
   - Ensure `apps/api/.env` exists (copy from `.env.example`):
     ```bash
     cp apps/api/.env.example apps/api/.env
     ```
   - Run push:
     ```bash
     pnpm db:push
     ```
4. Start the development server:
   ```bash
   pnpm dev
   ```
   - Web App: http://localhost:5173
   - API: http://localhost:3000

## Support

For issues and feature requests, please visit the GitHub repository.

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for details.
