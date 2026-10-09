"""Constants for the PriPerFin integration."""

from __future__ import annotations

DOMAIN = "priperfin"

CONF_URL = "url"
CONF_TOKEN = "token"
CONF_SCAN_INTERVAL = "scan_interval"
CONF_CURRENCY = "currency"

DEFAULT_SCAN_INTERVAL = 60
MIN_SCAN_INTERVAL = 30
MAX_SCAN_INTERVAL = 3600

EVENT_IMPORT = "priperfin_import"

MANUFACTURER = "PriPerFin"
