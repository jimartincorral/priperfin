"""Config flow tests for PriPerFin."""

from unittest.mock import patch

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.priperfin.api import CannotConnect, InvalidAuth
from custom_components.priperfin.const import CONF_TOKEN, CONF_URL, DOMAIN

SUMMARY = {
    "profile": {"id": "profile-1", "name": "Jose"},
    "currency": "EUR",
    "appVersion": "1.28.0",
    "generatedAt": "2026-10-09T12:00:00.000Z",
    "uncategorizedCount": 3,
    "pendingSuggestions": 1,
    "month": {"year": 2026, "month": 10, "income": 3000, "expenses": 1200, "net": 1800},
    "accounts": [{"id": "a1", "name": "Checking", "type": "DEBIT", "balance": 1500}],
    "totalBalance": 1500,
    "budgets": {"budgetedCategories": 2, "overBudgetCount": 1, "remaining": 80},
    "goals": {"count": 1, "totalSaved": 100, "totalLeft": 900, "behindCount": 0},
    "bank": {"connectionCount": 0, "lastSyncAt": None, "expired": False, "daysUntilExpiry": None},
    "lastImport": None,
}
USER_INPUT = {CONF_URL: "http://addon:3000", CONF_TOKEN: "pfp_test"}


async def test_user_flow_creates_entry(hass: HomeAssistant) -> None:
    """A valid address and token create one entry per profile."""
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    with (
        patch(
            "custom_components.priperfin.config_flow.PriPerFinClient.async_get_summary",
            return_value=SUMMARY,
        ),
        patch("custom_components.priperfin.async_setup_entry", return_value=True),
    ):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
        await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "PriPerFin Jose"
    assert result["data"] == USER_INPUT
    assert result["result"].unique_id == "profile-1"


async def test_user_flow_errors(hass: HomeAssistant) -> None:
    """Connection and auth failures are reported on the form."""
    for error, expected in ((CannotConnect("x"), "cannot_connect"), (InvalidAuth("x"), "invalid_auth")):
        result = await hass.config_entries.flow.async_init(
            DOMAIN, context={"source": config_entries.SOURCE_USER}
        )
        with patch(
            "custom_components.priperfin.config_flow.PriPerFinClient.async_get_summary",
            side_effect=error,
        ):
            result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
        assert result["type"] is FlowResultType.FORM
        assert result["errors"] == {"base": expected}


async def test_user_flow_already_configured(hass: HomeAssistant) -> None:
    """The same profile cannot be added twice."""
    MockConfigEntry(domain=DOMAIN, unique_id="profile-1", data=USER_INPUT).add_to_hass(hass)
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    with patch(
        "custom_components.priperfin.config_flow.PriPerFinClient.async_get_summary",
        return_value=SUMMARY,
    ):
        result = await hass.config_entries.flow.async_configure(result["flow_id"], USER_INPUT)
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"
