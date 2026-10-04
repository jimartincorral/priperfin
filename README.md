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

PriPerFin runs three ways, all the same application against your own local
database:

| | Best for |
| --- | --- |
| [Home Assistant add-on](#home-assistant-add-on) | You already run Home Assistant |
| [Local server via Docker](#run-as-a-local-server-docker) | Windows or macOS, no Home Assistant, nothing to code-sign |
| [Desktop app](#desktop-app) | A real app window. Unsigned, so both systems ask you to confirm on first launch; Windows PCs with Smart App Control on need it switched off |

### Home Assistant add-on

1. Add this repository to your Home Assistant add-on store
2. Install the "Personal Finance Tracker" add-on
3. Configure the add-on options (optional)
4. Start the add-on
5. Access the web interface at `http://homeassistant.local:3000`

## Run as a local server (Docker)

If you just want PriPerFin running on your own machine, this is the most
reliable option on Windows and macOS. Everything inside the container is Linux,
so **Windows Smart App Control and macOS Gatekeeper are not involved** — there
are no unsigned Windows or macOS binaries for them to object to.

You need [Docker Desktop](https://www.docker.com/products/docker-desktop/)
(free for personal use). Then, from a copy of this repository:

```bash
docker compose up -d
```

Open <http://localhost:3000>.

On Apple silicon, point it at the arm64 image first:

```bash
PRIPERFIN_IMAGE=ghcr.io/jimartincorral/priperfin-aarch64:1.25.0 docker compose up -d
```

Your database and backups live in the `priperfin-data` Docker volume, so they
survive upgrades. To update, `docker compose pull && docker compose up -d`. To
stop it, `docker compose down` (this keeps the volume; `docker compose down -v`
would delete your data).

Trade-off: it runs in a browser tab rather than an app window, and it needs
Docker Desktop installed. In exchange there is nothing to code-sign and nothing
for Windows to block.

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

The installers are **not code-signed**. That is deliberate: signing costs money
every year on both platforms, and PriPerFin is a free project. Windows and macOS
will therefore warn you before running it. Here is how to get past each warning.

#### Windows

**SmartScreen** — *"Windows protected your PC"*. This is the usual case. Click
**More info**, then **Run anyway**. You only need to do this once.

**Smart App Control** — *"Smart App Control has blocked this app"*. This is a
different, stricter feature, and it has **no "Run anyway" button**: it blocks
every app that isn't signed, and it checks again **every time the app starts**,
not just when you install it. So if your PC has it switched on, PriPerFin can
only run with Smart App Control switched **off — and left off**.

It is on by default only on some clean installs of Windows 11; PCs upgraded
from an older Windows usually have it off. To check or change it, open **Windows
Security → App & browser control → Smart App Control settings**.

> **Before you switch it off, check your Windows version** (press Win+R, type
> `winver`). On Windows 11 24H2 build 26100.8116, 25H2 build 26200.8116 and
> later, you can switch it back on whenever you like. On earlier builds,
> switching it off is **permanent** until you reset or reinstall Windows.

If you'd rather keep Smart App Control on, use the
[Docker option](#run-as-a-local-server-docker) instead. Clearing the file's
mark-of-the-web (`Unblock-File` in PowerShell) does not help — Smart App Control
judges the signature, not where the file came from.

#### macOS

Open the `.dmg` and drag **PriPerFin** into your **Applications** folder.

**macOS 15 Sequoia and later:**

1. Double-click **PriPerFin** in Applications. macOS blocks it, saying Apple
   could not verify it is free of malware. Click **Done**.
2. Open **System Settings → Privacy & Security** and scroll down to the
   message about PriPerFin.
3. Click **Open Anyway**, then enter your Mac's password.
4. Click **Open** in the confirmation that follows.

**macOS 14 Sonoma and earlier:** right-click (or Control-click) **PriPerFin** in
Applications, choose **Open**, then click **Open** again.

You only need to do this once per downloaded version. The app doesn't update
itself, so each new version you download asks again.

If macOS instead says the app *"is damaged and can't be opened"*, please
[open an issue](https://github.com/jimartincorral/priperfin/issues) — the build
is meant to prevent that. As a workaround, run this in Terminal and open the app
again:

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
