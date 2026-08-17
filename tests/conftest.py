"""
tests/conftest.py — Shared pytest fixtures and configuration.

Fixtures defined here are available to all test files without import.
Add session-scoped fixtures (e.g., database connection, test client) here.
"""

from __future__ import annotations

import os

import pytest


# ─────────────────────────────────────────────────────────────
# Environment setup
# Force test environment so config.py loads correctly.
# ─────────────────────────────────────────────────────────────

def pytest_configure(config: pytest.Config) -> None:
    """Set required environment variables before any test runs."""
    os.environ.setdefault("PROJECT_ENV", "test")
    os.environ.setdefault("LOG_LEVEL", "WARNING")
    os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production")
    os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")


# ─────────────────────────────────────────────────────────────
# Markers
# ─────────────────────────────────────────────────────────────

def pytest_collection_modifyitems(
    config: pytest.Config,
    items: list[pytest.Item],
) -> None:
    """Auto-mark tests based on their path."""
    for item in items:
        if "integration" in str(item.fspath):
            item.add_marker(pytest.mark.integration)
        elif "unit" in str(item.fspath):
            item.add_marker(pytest.mark.unit)


# ─────────────────────────────────────────────────────────────
# Add shared fixtures below as your project grows.
# Examples:
#
# @pytest.fixture(scope="session")
# def db_engine():
#     engine = create_engine("sqlite:///./test.db")
#     Base.metadata.create_all(engine)
#     yield engine
#     Base.metadata.drop_all(engine)
#
# @pytest.fixture
# def client(app):
#     with TestClient(app) as c:
#         yield c
# ─────────────────────────────────────────────────────────────
