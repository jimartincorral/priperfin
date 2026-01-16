# Configuration

## Database Path

The `database_path` option specifies where the SQLite database file is stored. The default location is `/data/priperfin.db`, which persists across add-on restarts.

**Default**: `file:/data/priperfin.db`

## Backup Directory

The `backup_dir` option specifies where backup files are stored. Backups can be created through the web interface.

**Default**: `/backup/priperfin`

**Note**: Make sure this directory is mapped to a persistent location in your Home Assistant setup.

## Backup Encryption Key

The `backup_encryption_key` is an optional 32-character string used to encrypt your backups. If not provided, backups will be stored unencrypted.

**Important**: 
- The key must be exactly 32 characters long
- Keep this key safe - you'll need it to restore encrypted backups
- If you lose the key, encrypted backups cannot be restored

**Example**: `YourSuperSecretKeyForBackup12398`

---

# Usage

## Accessing the Web Interface

Once the add-on is running, click the "Open Web UI" button in the Home Assistant add-on page or access it via the sidebar if you enabled the "Show in sidebar" option.

**Note:** Direct port access (port 3000) is disabled for security reasons. You must use the Home Assistant Ingress interface.

## Managing Transactions

### Adding Expenses
1. Navigate to the "Expenses" tab
2. Click "Add Transaction"
3. Fill in the date, amount, description, and category
4. Optionally add notes
5. Click "Save"

### Importing from CSV
1. Go to the "Expenses" tab
2. Click "Import CSV"
3. Select your CSV file (format: date, amount, description)
4. Review and confirm the import

## Setting Savings Goals

1. Navigate to the "Goals" tab
2. Click "Add Goal"
3. Enter the goal name, target amount, and target date
4. Optionally set a start date
5. Track progress as you save

## Viewing Reports

The "Reports" tab provides:
- **Category Breakdown**: Pie chart showing expenses by category
- **Sankey Diagram**: Visual flow of money from income to expenses
- **Monthly Summaries**: Track spending trends over time

## Backup and Restore

### Creating a Backup
1. Go to Settings
2. Click "Create Backup"
3. The backup file will be saved to your configured backup directory

### Restoring from Backup
1. Go to Settings
2. Click "Restore from Backup"
3. Select the backup file
4. Confirm the restoration (this will overwrite current data)

---

# Troubleshooting

## Add-on won't start

- Check the add-on logs for error messages
- Verify the `database_path` is writable
- Ensure the `backup_encryption_key` is exactly 32 characters (if provided)

## Cannot access web interface

- Verify the add-on is running
- Check that port 3000 is not being used by another service
- Try accessing via IP address instead of hostname

## Backup fails

- Verify the `backup_dir` exists and is writable
- Check available disk space
- Review add-on logs for specific error messages

## Database errors

- The database file may be corrupted
- Try restoring from a backup
- As a last resort, delete the database file (data will be lost) and restart the add-on

---

# Security

This add-on uses Home Assistant Ingress for secure access. Ingress provides:

- **Authentication**: Access is restricted to logged-in Home Assistant users
- **Encryption**: Traffic is encrypted when using HTTPS with Home Assistant
- **Network Isolation**: The add-on only accepts connections from the Home Assistant Ingress gateway

**Important**: Direct port access has been disabled for security. Always access the add-on through the Home Assistant UI via the sidebar panel or "Open Web UI" button.

## AppArmor

This add-on includes a custom AppArmor profile that restricts:
- File system access (only /data and /backup directories)
- Network capabilities (HTTP server only)
- System resource access

The AppArmor profile provides defense-in-depth security. You can view the profile in the `apparmor.txt` file in the add-on repository.

## Backup Encryption

Backups can optionally be encrypted with AES-256-CBC encryption. To enable:

1. Generate a strong random key (32+ characters recommended)
2. Add the key to the "Backup Encryption Key" configuration option
3. **Keep this key safe!** You'll need it to restore encrypted backups

Without the encryption key, encrypted backups cannot be restored.

---

# License

This add-on is licensed under the Apache License 2.0. See the [LICENSE](https://github.com/jimartincorral/priperfin/blob/master/LICENSE) file for details.

Copyright 2025 PriPerFin Contributors

---

# Support

For issues, questions, or feature requests:

- **GitHub Issues**: [https://github.com/jimartincorral/priperfin/issues](https://github.com/jimartincorral/priperfin/issues)
- **Discussions**: [https://github.com/jimartincorral/priperfin/discussions](https://github.com/jimartincorral/priperfin/discussions)

When reporting issues, please include:
- Add-on version (check the Info tab)
- Home Assistant version
- Architecture (amd64, armv7, aarch64)
- Relevant log entries (check the Log tab)
