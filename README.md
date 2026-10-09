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
- **Bank Sync**: Optional automatic import from European banks via Enable Banking (PSD2), see [Bank sync](#bank-sync-enable-banking)
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
5. Open it from the **Finance** entry in the Home Assistant sidebar (the add-on
   is only reachable through Ingress, not on a port of its own)

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
PRIPERFIN_IMAGE=ghcr.io/jimartincorral/priperfin-aarch64:1.27.1 docker compose up -d
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

## Bank sync (Enable Banking)

PriPerFin can pull transactions straight from a European bank account through
[Enable Banking](https://enablebanking.com), an Open Banking (PSD2) aggregator.
It is optional: nothing in the app depends on it, and the CSV and OFX importers
keep working either way. It is read-only. PriPerFin can see balances and
transactions; it cannot move money.

### What you need

- A bank that Enable Banking supports. Their site lists the banks by country.
- A free developer account at Enable Banking and an **application** registered
  in the mode they offer for personal use, which they call *restricted
  production*. It only works with accounts you authorise yourself, which is
  all PriPerFin needs. Registering the application gives you:
  - the **Application ID**;
  - an **RSA private key** as a `.pem` file, generated when you create the
    application. Keep it safe; Enable Banking does not store it;
  - a **redirect URL** that you type in when registering. Enable Banking sends
    you back to it after you authorise at your bank. It must use HTTPS and it
    must match, character for character, what you enter in PriPerFin. See
    [Choosing the redirect URL](#choosing-the-redirect-url).

### Setting it up

1. Open **Settings** and scroll to **Automatic Bank Synchronization**.
2. Enter the Application ID, upload or paste the `.pem` file, enter the
   redirect URL, and click **Save Configuration**. Both credentials show as
   *Configured* once saved. The key is never shown again; to replace it, paste
   a new one.
3. Click **+ Connect Bank**, pick the country and the bank, and click
   **Proceed to Bank Authentication**. You are sent to your bank's own login
   and second-factor screen to approve access. Inside Home Assistant this opens
   in a new window, because banks refuse to load inside the Home Assistant
   frame.
4. After approving, the bank sends you to the redirect URL with a `code` in
   the address. If that URL is PriPerFin's own Settings page, the connection
   completes by itself. Otherwise copy the full address from the browser's
   address bar, go back to Settings, click **Paste Callback**, and paste it.
5. The bank now appears under **Connected Banks** with the accounts it
   exposed. For each one, choose the PriPerFin account it should feed and click
   **Link Account**. Create the PriPerFin account first if it does not exist.

### Choosing the redirect URL

Enable Banking requires an HTTPS address, and PriPerFin only recognises the
code automatically when that address is its own Settings page. So:

- **Home Assistant with an HTTPS address** (Nabu Casa, a reverse proxy, or
  your own certificate): use the add-on's Settings page. Open Settings in the
  add-on, copy the address from the browser, and register that. The address
  contains the add-on's ingress path; if Home Assistant ever changes it, update
  the URL in both places.
- **Desktop app or Docker** (served over plain HTTP on your machine): register
  any HTTPS page you control, even one that shows an error. The page's content
  does not matter; only the address with the `code` does. After approving at
  the bank, copy that address and use **Paste Callback**. Do not use
  `/api/bank-sync/callback`: that endpoint only accepts the code from the app
  itself, not a browser visit.

### How syncing works

- **Sync Now** on a connected bank, or **Sync Bank** on the Expenses screen,
  pulls new transactions for every linked account.
- **Daily automatic sync** runs once a day at 06:00 server time for every
  profile that has a linked account. It is on by default once credentials are
  saved and can be switched off in the same section.
- The **first sync** of an account fetches the last 90 days by default; choose
  30 to 730 days under *Initial sync historical lookback* before linking. If
  the account already holds imported transactions, the sync starts a week
  before the newest one instead, so the two overlap rather than leave a gap.
- **Later syncs** fetch from five days before the previous sync, and anything
  already stored is skipped, so re-syncing never duplicates a transaction.
- Imported rows get the bank's description, with any further detail in the
  notes, and your categorisation rules run on them like on any other import.

### Consent expiry

Bank access under PSD2 is granted for **90 days**. The connection card shows
*Active*, then *Expiring Soon* during the last 14 days, then *Expired*; an
expired connection stops syncing and the Expenses screen warns you. Click
**Re-authenticate** to go through the bank approval again. The accounts you
linked are moved to the renewed connection automatically, matched by bank
account, and their history is kept.
**Disconnect** removes the bank connection; the PriPerFin accounts and the
transactions already imported stay.

### Where the credentials live, and what is not backed up

- The Application ID and the private key are stored in PriPerFin's database.
  The key is stored as you pasted it. Protect the database file as you would
  the key itself; on the desktop app it sits in the data folder listed under
  [Where your data lives](#where-your-data-lives).
- The credentials are shared by every profile on the same installation, since
  they identify the application, not a person. Bank connections and linked
  accounts belong to the profile that created them.
- **Backups do not include** the Enable Banking credentials or the bank
  connections. After restoring a backup on a new machine, enter the
  credentials and connect the banks again. The transactions themselves are in
  the backup.
- A profile with a connected bank can only ever read its own accounts.
  Enable Banking's own terms limit how often an unattended sync may run; the
  daily schedule stays well inside that limit, and manual syncs count too, so
  avoid clicking **Sync Now** repeatedly.

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
