"""Polling coordinator that also fires an event when an import happens."""

from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .api import CannotConnect, InvalidAuth, PriPerFinClient
from .const import CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL, DOMAIN, EVENT_IMPORT

_LOGGER = logging.getLogger(__name__)


class PriPerFinCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Fetches the profile summary on a schedule."""

    config_entry: ConfigEntry

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry, client: PriPerFinClient) -> None:
        interval = entry.options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL)
        super().__init__(
            hass,
            _LOGGER,
            config_entry=entry,
            name=f"{DOMAIN} {entry.title}",
            update_interval=timedelta(seconds=interval),
        )
        self.client = client
        self._last_import_at: str | None = None
        self._seen_first_update = False

    async def _async_update_data(self) -> dict[str, Any]:
        try:
            data = await self.client.async_get_summary()
        except InvalidAuth as err:
            raise ConfigEntryAuthFailed from err
        except CannotConnect as err:
            raise UpdateFailed(str(err)) from err

        self._maybe_fire_import_event(data)
        return data

    def _maybe_fire_import_event(self, data: dict[str, Any]) -> None:
        """Fire priperfin_import when the server's last-import marker changes.

        The first successful poll only records the marker, so a restart never
        replays an import that happened while Home Assistant was down.
        """
        last_import = data.get("lastImport") or {}
        at = last_import.get("at")
        if not self._seen_first_update:
            self._seen_first_update = True
            self._last_import_at = at
            return
        if at and at != self._last_import_at:
            profile = data.get("profile") or {}
            self.hass.bus.async_fire(
                EVENT_IMPORT,
                {
                    "profile_id": profile.get("id"),
                    "profile_name": profile.get("name"),
                    "at": at,
                    "new_count": last_import.get("newCount", 0),
                    "uncategorized_count": last_import.get("uncategorizedCount", 0),
                },
            )
        self._last_import_at = at
