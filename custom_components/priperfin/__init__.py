"""The PriPerFin integration."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .api import PriPerFinClient
from .const import CONF_TOKEN, CONF_URL
from .coordinator import PriPerFinCoordinator

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]

type PriPerFinConfigEntry = ConfigEntry[PriPerFinCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: PriPerFinConfigEntry) -> bool:
    """Set up one PriPerFin profile."""
    client = PriPerFinClient(
        async_get_clientsession(hass), entry.data[CONF_URL], entry.data[CONF_TOKEN]
    )
    coordinator = PriPerFinCoordinator(hass, entry, client)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    entry.async_on_unload(entry.add_update_listener(_async_options_updated))
    return True


async def _async_options_updated(hass: HomeAssistant, entry: PriPerFinConfigEntry) -> None:
    """Reload so a new scan interval or currency takes effect."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: PriPerFinConfigEntry) -> bool:
    """Unload a profile."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
