#!/usr/bin/env bash
set -e

# Source bashio library
source /usr/lib/bashio/bashio.sh

# Read configuration options from Home Assistant
DATABASE_PATH=$(bashio::config 'database_path')
BACKUP_DIR=$(bashio::config 'backup_dir')
BACKUP_ENCRYPTION_KEY=$(bashio::config 'backup_encryption_key')

# Export environment variables
export DATABASE_URL="${DATABASE_PATH}"
export BACKUP_DIR="${BACKUP_DIR}"
export BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY}"
export PORT=3000
export NODE_ENV=production

bashio::log.info "Starting Personal Finance Tracker..."
bashio::log.info "Database: ${DATABASE_URL}"
bashio::log.info "Backup directory: ${BACKUP_DIR}"

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Ensure data directory exists
mkdir -p /data

# Run Prisma schema push (works with driver adapters, unlike migrate deploy)
bashio::log.info "Syncing database schema..."
cd /app
npx prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss || bashio::log.warning "Schema sync failed"

# Start the application
bashio::log.info "Starting application on port ${PORT}..."
exec node dist/src/main
