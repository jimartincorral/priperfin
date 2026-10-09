#!/usr/bin/env bash
set -e

# Entrypoint for both ways of running the container:
#
#  1. As a Home Assistant add-on, where Supervisor writes /data/options.json and
#     bashio reads the user's configured options from it.
#  2. Standalone (docker run / docker compose), where there is no Supervisor and
#     configuration comes from environment variables instead.
#
# The Home Assistant path is unchanged; the standalone path is what makes it
# possible to run PriPerFin as a local server on Windows or macOS without a
# signed desktop installer.

if [ -f /data/options.json ] && [ -f /usr/lib/bashio/bashio.sh ]; then
    # Home Assistant add-on
    source /usr/lib/bashio/bashio.sh

    DATABASE_PATH=$(bashio::config 'database_path')
    BACKUP_DIR=$(bashio::config 'backup_dir')
    BACKUP_ENCRYPTION_KEY=$(bashio::config 'backup_encryption_key')

    log_info() { bashio::log.info "$@"; }
    log_error() { bashio::log.error "$@"; }

    # Shown in Settings so the Home Assistant integration can be pointed at
    # this add-on, and reported as the device software version.
    export PRIPERFIN_ADDON_HOSTNAME="$(bashio::addon.hostname)"
    export PRIPERFIN_VERSION="$(bashio::addon.version)"
else
    # Standalone container
    DATABASE_PATH="${DATABASE_URL:-file:/data/priperfin.db}"
    BACKUP_DIR="${BACKUP_DIR:-/data/backups}"
    BACKUP_ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"

    log_info() { echo "[INFO] $*"; }
    log_error() { echo "[ERROR] $*" >&2; }

    log_info "No Home Assistant options found; starting in standalone mode."

    # Without Ingress, requests reach the container from the Docker bridge
    # gateway rather than from loopback, which IngressSecurityMiddleware would
    # otherwise reject with 403. docker-compose.yml binds the published port to
    # the host's loopback address, so this does not expose the app to the LAN.
    export PRIPERFIN_ALLOW_DIRECT_ACCESS=true
fi

export DATABASE_URL="${DATABASE_PATH}"
export BACKUP_DIR="${BACKUP_DIR}"
export PORT="${PORT:-3000}"
export NODE_ENV=production

# BackupService throws at construction unless the key is exactly 32 characters,
# so only export it when the user actually set one.
if [ -n "${BACKUP_ENCRYPTION_KEY}" ]; then
    export BACKUP_ENCRYPTION_KEY
else
    unset BACKUP_ENCRYPTION_KEY
fi

log_info "Starting Personal Finance Tracker..."
log_info "Database: ${DATABASE_URL}"
log_info "Backup directory: ${BACKUP_DIR}"

mkdir -p "${BACKUP_DIR}"
mkdir -p /data

# Run Prisma schema push (works with driver adapters, unlike migrate deploy)
log_info "Syncing database schema..."
cd /app

# Run db push and make failures fatal (don't continue with broken schema)
# Keep --accept-data-loss to avoid hanging on prompts in non-interactive context
if ! npx prisma db push --schema=prisma/schema.prisma --accept-data-loss; then
  log_error "Failed to sync database schema!"
  log_error "The database schema is out of sync with the application."
  log_error "Please check logs above for details."
  exit 1
fi

log_info "Database schema synchronized successfully"

log_info "Starting application on port ${PORT}..."
exec node dist/src/main
