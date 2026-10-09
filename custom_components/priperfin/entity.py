"""Shared entity base: one device per PriPerFin profile."""

from __future__ import annotations

from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import CONF_CURRENCY, DOMAIN, MANUFACTURER
from .coordinator import PriPerFinCoordinator


class PriPerFinEntity(CoordinatorEntity[PriPerFinCoordinator]):
    """An entity belonging to a profile device."""

    _attr_has_entity_name = True

    def __init__(self, coordinator: PriPerFinCoordinator, key: str) -> None:
        super().__init__(coordinator)
        profile = coordinator.data["profile"]
        self._profile_id: str = profile["id"]
        self._attr_unique_id = f"{self._profile_id}_{key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, self._profile_id)},
            name=f"PriPerFin {profile['name']}",
            manufacturer=MANUFACTURER,
            model="Profile",
            sw_version=coordinator.data.get("appVersion") or None,
            configuration_url=coordinator.client.base_url,
        )

    @property
    def currency(self) -> str:
        """The currency for money sensors: options override, server setting, then HA's."""
        return (
            self.coordinator.config_entry.options.get(CONF_CURRENCY)
            or self.coordinator.data.get("currency")
            or self.hass.config.currency
        )
