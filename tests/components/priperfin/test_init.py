"""Setup, entity and event tests for PriPerFin."""

from copy import deepcopy
from datetime import timedelta
from unittest.mock import patch

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_capture_events,
    async_fire_time_changed,
)

from custom_components.priperfin.const import CONF_TOKEN, CONF_URL, DOMAIN, EVENT_IMPORT

from .test_config_flow import SUMMARY, USER_INPUT

SUMMARY_PATH = "custom_components.priperfin.api.PriPerFinClient.async_get_summary"


async def _setup(hass: HomeAssistant, summary: dict) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, unique_id="profile-1", data=USER_INPUT, title="PriPerFin Jose")
    entry.add_to_hass(hass)
    with patch(SUMMARY_PATH, return_value=summary):
        assert await hass.config_entries.async_setup(entry.entry_id)
        await hass.async_block_till_done()
    return entry


async def test_entities_from_summary(hass: HomeAssistant) -> None:
    """Sensors mirror the summary, money sensors carry the currency, accounts get a sensor each."""
    await _setup(hass, SUMMARY)

    uncategorized = hass.states.get("sensor.priperfin_jose_uncategorized_transactions")
    assert uncategorized is not None
    assert uncategorized.state == "3"

    income = hass.states.get("sensor.priperfin_jose_income_this_month")
    assert income.state == "3000"
    assert income.attributes["unit_of_measurement"] == "EUR"
    assert income.attributes["device_class"] == "monetary"

    over = hass.states.get("sensor.priperfin_jose_categories_over_budget")
    assert over.state == "1"

    account = hass.states.get("sensor.priperfin_jose_checking_balance")
    assert account is not None
    assert account.state == "1500"
    assert account.attributes["account_type"] == "DEBIT"

    # No bank connection: the consent sensors are unavailable rather than misleading.
    assert hass.states.get("binary_sensor.priperfin_jose_bank_consent_expired").state == "unavailable"
    assert hass.states.get("sensor.priperfin_jose_last_import").state == "unknown"


async def test_import_event_fires_on_marker_change(hass: HomeAssistant) -> None:
    """A changed lastImport marker fires priperfin_import once; the first poll never does."""
    first = deepcopy(SUMMARY)
    first["lastImport"] = {"at": "2026-10-09T06:00:00.000Z", "newCount": 2, "uncategorizedCount": 1}
    events = async_capture_events(hass, EVENT_IMPORT)
    await _setup(hass, first)
    assert events == []  # startup records the marker without replaying it

    second = deepcopy(first)
    second["lastImport"] = {"at": "2026-10-09T07:30:00.000Z", "newCount": 5, "uncategorizedCount": 4}
    with patch(SUMMARY_PATH, return_value=second):
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=61))
        await hass.async_block_till_done()

    assert len(events) == 1
    assert events[0].data == {
        "profile_id": "profile-1",
        "profile_name": "Jose",
        "at": "2026-10-09T07:30:00.000Z",
        "new_count": 5,
        "uncategorized_count": 4,
    }
    last_import = hass.states.get("sensor.priperfin_jose_last_import")
    assert last_import.state == "2026-10-09T07:30:00+00:00"
    assert last_import.attributes["new_count"] == 5

    # Same marker again: no second event.
    with patch(SUMMARY_PATH, return_value=second):
        async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=122))
        await hass.async_block_till_done()
    assert len(events) == 1


async def test_unload(hass: HomeAssistant) -> None:
    """The entry unloads cleanly."""
    entry = await _setup(hass, SUMMARY)
    assert await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert hass.states.get("sensor.priperfin_jose_uncategorized_transactions").state == "unavailable"
