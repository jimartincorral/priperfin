"""Sensors for a PriPerFin profile."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import datetime
from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.const import UnitOfTime
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.util import dt as dt_util

from . import PriPerFinConfigEntry
from .coordinator import PriPerFinCoordinator
from .entity import PriPerFinEntity


@dataclass(frozen=True, kw_only=True)
class PriPerFinSensorDescription(SensorEntityDescription):
    """Describes one summary field."""

    value_fn: Callable[[dict[str, Any]], Any]
    monetary: bool = False


def _timestamp(value: str | None) -> datetime | None:
    if not value:
        return None
    parsed = dt_util.parse_datetime(value)
    return dt_util.as_utc(parsed) if parsed else None


SENSORS: tuple[PriPerFinSensorDescription, ...] = (
    PriPerFinSensorDescription(
        key="uncategorized_transactions",
        translation_key="uncategorized_transactions",
        icon="mdi:help-circle-outline",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d["uncategorizedCount"],
    ),
    PriPerFinSensorDescription(
        key="pending_suggestions",
        translation_key="pending_suggestions",
        icon="mdi:lightbulb-on-outline",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d["pendingSuggestions"],
    ),
    PriPerFinSensorDescription(
        key="month_income",
        translation_key="month_income",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["month"]["income"],
    ),
    PriPerFinSensorDescription(
        key="month_expenses",
        translation_key="month_expenses",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["month"]["expenses"],
    ),
    PriPerFinSensorDescription(
        key="month_net",
        translation_key="month_net",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["month"]["net"],
    ),
    PriPerFinSensorDescription(
        key="total_balance",
        translation_key="total_balance",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["totalBalance"],
    ),
    PriPerFinSensorDescription(
        key="categories_over_budget",
        translation_key="categories_over_budget",
        icon="mdi:alert-circle-outline",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d["budgets"]["overBudgetCount"],
    ),
    PriPerFinSensorDescription(
        key="budget_remaining",
        translation_key="budget_remaining",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["budgets"]["remaining"],
    ),
    PriPerFinSensorDescription(
        key="goals_saved",
        translation_key="goals_saved",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["goals"]["totalSaved"],
    ),
    PriPerFinSensorDescription(
        key="goals_left",
        translation_key="goals_left",
        device_class=SensorDeviceClass.MONETARY,
        state_class=SensorStateClass.TOTAL,
        monetary=True,
        value_fn=lambda d: d["goals"]["totalLeft"],
    ),
    PriPerFinSensorDescription(
        key="goals_behind",
        translation_key="goals_behind",
        icon="mdi:flag-variant-outline",
        state_class=SensorStateClass.MEASUREMENT,
        value_fn=lambda d: d["goals"]["behindCount"],
    ),
    PriPerFinSensorDescription(
        key="bank_last_sync",
        translation_key="bank_last_sync",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _timestamp(d["bank"]["lastSyncAt"]),
    ),
    PriPerFinSensorDescription(
        key="bank_days_until_expiry",
        translation_key="bank_days_until_expiry",
        icon="mdi:calendar-clock",
        native_unit_of_measurement=UnitOfTime.DAYS,
        value_fn=lambda d: d["bank"]["daysUntilExpiry"],
    ),
    PriPerFinSensorDescription(
        key="last_import",
        translation_key="last_import",
        device_class=SensorDeviceClass.TIMESTAMP,
        value_fn=lambda d: _timestamp((d.get("lastImport") or {}).get("at")),
    ),
)


async def async_setup_entry(
    hass: HomeAssistant, entry: PriPerFinConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Create the fixed sensors plus one balance sensor per account."""
    coordinator = entry.runtime_data
    async_add_entities(PriPerFinSensor(coordinator, description) for description in SENSORS)

    known: set[str] = set()

    @callback
    def _sync_accounts() -> None:
        new = [
            PriPerFinAccountBalanceSensor(coordinator, account)
            for account in coordinator.data.get("accounts", [])
            if account["id"] not in known
        ]
        for entity in new:
            known.add(entity.account_id)
        if new:
            async_add_entities(new)

    _sync_accounts()
    entry.async_on_unload(coordinator.async_add_listener(_sync_accounts))


class PriPerFinSensor(PriPerFinEntity, SensorEntity):
    """A sensor backed by one summary field."""

    entity_description: PriPerFinSensorDescription

    def __init__(self, coordinator: PriPerFinCoordinator, description: PriPerFinSensorDescription) -> None:
        super().__init__(coordinator, description.key)
        self.entity_description = description

    @property
    def native_unit_of_measurement(self) -> str | None:
        if self.entity_description.monetary:
            return self.currency
        return self.entity_description.native_unit_of_measurement

    @property
    def native_value(self) -> Any:
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        if self.entity_description.key == "last_import":
            last = self.coordinator.data.get("lastImport") or {}
            return {
                "new_count": last.get("newCount"),
                "uncategorized_count": last.get("uncategorizedCount"),
            }
        if self.entity_description.key == "bank_last_sync":
            bank = self.coordinator.data["bank"]
            return {"connections": bank["connectionCount"]}
        return None


class PriPerFinAccountBalanceSensor(PriPerFinEntity, SensorEntity):
    """The balance of one PriPerFin account."""

    _attr_device_class = SensorDeviceClass.MONETARY
    _attr_state_class = SensorStateClass.TOTAL
    _attr_icon = "mdi:bank-outline"

    def __init__(self, coordinator: PriPerFinCoordinator, account: dict[str, Any]) -> None:
        super().__init__(coordinator, f"account_{account['id']}")
        self.account_id: str = account["id"]
        self._attr_translation_key = "account_balance"
        self._attr_translation_placeholders = {"account": account["name"]}

    def _account(self) -> dict[str, Any] | None:
        for account in self.coordinator.data.get("accounts", []):
            if account["id"] == self.account_id:
                return account
        return None

    @property
    def available(self) -> bool:
        return super().available and self._account() is not None

    @property
    def native_unit_of_measurement(self) -> str | None:
        return self.currency

    @property
    def native_value(self) -> float | None:
        account = self._account()
        return account["balance"] if account else None

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        account = self._account()
        return {"account_type": account["type"]} if account else None
