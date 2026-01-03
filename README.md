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

1. Add this repository to your Home Assistant add-on store
2. Install the "Personal Finance Tracker" add-on
3. Configure the add-on options (optional)
4. Start the add-on
5. Access the web interface at `http://homeassistant.local:3000`

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
