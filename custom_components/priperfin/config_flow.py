"""Config flow for PriPerFin."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigEntry,
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlow,
)
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import (
    NumberSelector,
    NumberSelectorConfig,
    NumberSelectorMode,
    TextSelector,
    TextSelectorConfig,
    TextSelectorType,
)

from .api import CannotConnect, InvalidAuth, PriPerFinClient
from .const import (
    CONF_CURRENCY,
    CONF_SCAN_INTERVAL,
    CONF_TOKEN,
    CONF_URL,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    MAX_SCAN_INTERVAL,
    MIN_SCAN_INTERVAL,
)

USER_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL): TextSelector(TextSelectorConfig(type=TextSelectorType.URL)),
        vol.Required(CONF_TOKEN): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD)),
    }
)


async def _validate(hass: HomeAssistant, url: str, token: str) -> dict[str, Any]:
    """Fetch the summary once; raises CannotConnect / InvalidAuth."""
    client = PriPerFinClient(async_get_clientsession(hass), url, token)
    return await client.async_get_summary()


class PriPerFinConfigFlow(ConfigFlow, domain=DOMAIN):
    """One config entry per PriPerFin profile."""

    VERSION = 1

    def __init__(self) -> None:
        self._reauth_entry: ConfigEntry | None = None

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> PriPerFinOptionsFlow:
        """Options: scan interval and currency override."""
        return PriPerFinOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Ask for the server address and an API token."""
        errors: dict[str, str] = {}
        if user_input is not None:
            url = user_input[CONF_URL].strip().rstrip("/")
            token = user_input[CONF_TOKEN].strip()
            try:
                summary = await _validate(self.hass, url, token)
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except CannotConnect:
                errors["base"] = "cannot_connect"
            else:
                profile = summary["profile"]
                await self.async_set_unique_id(profile["id"])
                self._abort_if_unique_id_configured()
                return self.async_create_entry(
                    title=f"PriPerFin {profile['name']}",
                    data={CONF_URL: url, CONF_TOKEN: token},
                )
        return self.async_show_form(step_id="user", data_schema=USER_SCHEMA, errors=errors)

    async def async_step_reauth(self, entry_data: Mapping[str, Any]) -> ConfigFlowResult:
        """The token was revoked: ask for a new one."""
        self._reauth_entry = self.hass.config_entries.async_get_entry(self.context["entry_id"])
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Validate the new token against the stored address."""
        errors: dict[str, str] = {}
        assert self._reauth_entry is not None
        url = self._reauth_entry.data[CONF_URL]
        if user_input is not None:
            token = user_input[CONF_TOKEN].strip()
            try:
                summary = await _validate(self.hass, url, token)
            except InvalidAuth:
                errors["base"] = "invalid_auth"
            except CannotConnect:
                errors["base"] = "cannot_connect"
            else:
                if summary["profile"]["id"] != self._reauth_entry.unique_id:
                    errors["base"] = "wrong_profile"
                else:
                    return self.async_update_reload_and_abort(
                        self._reauth_entry,
                        data={**self._reauth_entry.data, CONF_TOKEN: token},
                    )
        return self.async_show_form(
            step_id="reauth_confirm",
            data_schema=vol.Schema(
                {vol.Required(CONF_TOKEN): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD))}
            ),
            description_placeholders={"url": url},
            errors=errors,
        )


class PriPerFinOptionsFlow(OptionsFlow):
    """Scan interval and currency override."""

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        """Show and save the options."""
        if user_input is not None:
            currency = (user_input.get(CONF_CURRENCY) or "").strip().upper()
            data = {CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL])}
            if currency:
                data[CONF_CURRENCY] = currency
            return self.async_create_entry(title="", data=data)

        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(
                    CONF_SCAN_INTERVAL,
                    default=options.get(CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL),
                ): NumberSelector(
                    NumberSelectorConfig(
                        min=MIN_SCAN_INTERVAL,
                        max=MAX_SCAN_INTERVAL,
                        step=1,
                        mode=NumberSelectorMode.BOX,
                        unit_of_measurement="s",
                    )
                ),
                vol.Optional(
                    CONF_CURRENCY,
                    description={"suggested_value": options.get(CONF_CURRENCY, "")},
                ): TextSelector(TextSelectorConfig(type=TextSelectorType.TEXT)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema)
