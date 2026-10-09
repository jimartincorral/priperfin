"""Binary sensors for a PriPerFin profile."""

from __future__ import annotations

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from . import PriPerFinConfigEntry
from .coordinator import PriPerFinCoordinator
from .entity import PriPerFinEntity


async def async_setup_entry(
    hass: HomeAssistant, entry: PriPerFinConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the binary sensors."""
    async_add_entities([BankConsentExpiredSensor(entry.runtime_data)])


class BankConsentExpiredSensor(PriPerFinEntity, BinarySensorEntity):
    """On when any bank connection's consent has expired."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM
    _attr_translation_key = "bank_consent_expired"

    def __init__(self, coordinator: PriPerFinCoordinator) -> None:
        super().__init__(coordinator, "bank_consent_expired")

    @property
    def available(self) -> bool:
        return super().available and self.coordinator.data["bank"]["connectionCount"] > 0

    @property
    def is_on(self) -> bool:
        return bool(self.coordinator.data["bank"]["expired"])
