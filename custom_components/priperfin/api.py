"""Minimal client for the PriPerFin Home Assistant summary endpoint."""

from __future__ import annotations

import asyncio
from typing import Any

import aiohttp

SUMMARY_PATH = "/api/ha/summary"
TIMEOUT = aiohttp.ClientTimeout(total=20)


class PriPerFinError(Exception):
    """Base error."""


class CannotConnect(PriPerFinError):
    """The server could not be reached or answered unexpectedly."""


class InvalidAuth(PriPerFinError):
    """The API token was rejected."""


class PriPerFinClient:
    """Reads one profile's summary with a long-lived API token."""

    def __init__(self, session: aiohttp.ClientSession, base_url: str, token: str) -> None:
        self._session = session
        self._base_url = base_url.rstrip("/")
        self._token = token

    @property
    def base_url(self) -> str:
        """The server address, without a trailing slash."""
        return self._base_url

    async def async_get_summary(self) -> dict[str, Any]:
        """Fetch /api/ha/summary."""
        try:
            async with self._session.get(
                f"{self._base_url}{SUMMARY_PATH}",
                headers={"Authorization": f"Bearer {self._token}"},
                timeout=TIMEOUT,
            ) as response:
                if response.status in (401, 403):
                    raise InvalidAuth("API token rejected")
                if response.status != 200:
                    raise CannotConnect(f"Unexpected status {response.status}")
                data = await response.json(content_type=None)
        except (aiohttp.ClientError, asyncio.TimeoutError) as err:
            raise CannotConnect(str(err)) from err
        if not isinstance(data, dict) or "profile" not in data:
            raise CannotConnect("Unexpected response body")
        return data
