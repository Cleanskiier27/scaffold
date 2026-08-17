"""
utils/config.py — Configuration loading and validation for LunaRecycle-OS.

Reads from environment variables with safe defaults for local development.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from enum import Enum


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


def _optional(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


@dataclass(frozen=True)
class Config:
    """
    Application configuration for LunaRecycle-OS.
    """

    # ── Application ─────────────────────────────────────────
    env: Environment = field(
        default_factory=lambda: Environment(
            _optional("PROJECT_ENV", "development")
        )
    )
    log_level: str = field(
        default_factory=lambda: _optional("LOG_LEVEL", "INFO").upper()
    )
    secret_key: str = field(
        default_factory=lambda: _optional("SECRET_KEY", "lunarecycle-mission-secret-key")
    )

    # ── Server ───────────────────────────────────────────────
    host: str = field(default_factory=lambda: _optional("HOST", "127.0.0.1"))
    port: int = field(
        default_factory=lambda: int(_optional("PORT", "8080"))
    )

    @property
    def is_production(self) -> bool:
        return self.env == Environment.PRODUCTION

    @property
    def is_development(self) -> bool:
        return self.env == Environment.DEVELOPMENT

    @property
    def is_test(self) -> bool:
        return self.env == Environment.TEST


_config: Config | None = None


def get_config() -> Config:
    """Return the loaded Config singleton. Call load_config() first."""
    global _config
    if _config is None:
        _config = Config()
    return _config


def load_config() -> Config:
    """
    Load configuration from the environment.
    """
    global _config
    _config = Config()
    return _config
