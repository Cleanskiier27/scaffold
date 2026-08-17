"""
utils/config.py — Configuration loading and validation.

Reads from environment variables (with optional .env file support).
Validates all required values at startup — fail fast, fail loud.
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


def _require(key: str) -> str:
    """Return the value of an environment variable or raise at startup."""
    value = os.environ.get(key)
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            f"Check your .env file or deployment configuration."
        )
    return value


def _optional(key: str, default: str = "") -> str:
    return os.environ.get(key, default)


@dataclass(frozen=True)
class Config:
    """
    Application configuration. Immutable after loading.

    All values come from environment variables. Never hard-code
    secrets or environment-specific values in source files.
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
    secret_key: str = field(default_factory=lambda: _require("SECRET_KEY"))

    # ── Database ─────────────────────────────────────────────
    database_url: str = field(
        default_factory=lambda: _require("DATABASE_URL")
    )
    db_pool_size: int = field(
        default_factory=lambda: int(_optional("DB_POOL_SIZE", "10"))
    )
    db_pool_timeout: int = field(
        default_factory=lambda: int(_optional("DB_POOL_TIMEOUT", "30"))
    )

    # ── Server ───────────────────────────────────────────────
    host: str = field(default_factory=lambda: _optional("HOST", "0.0.0.0"))
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


# ─────────────────────────────────────────────────────────────
# Singleton accessor
# Load once at application startup; import the instance elsewhere.
# ─────────────────────────────────────────────────────────────

_config: Config | None = None


def get_config() -> Config:
    """Return the loaded Config singleton. Call load_config() first."""
    global _config
    if _config is None:
        _config = Config()
    return _config


def load_config() -> Config:
    """
    Load and validate configuration from the environment.
    Call this once at application startup (before serving requests).
    Raises EnvironmentError if any required variable is missing.
    """
    global _config
    _config = Config()
    return _config
