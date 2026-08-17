"""
src/index.py — Application entry point.

This file wires together configuration, logging, and the application.
Replace the placeholder content with your actual application startup.
"""

from __future__ import annotations

import logging
import sys

from src.utils.config import load_config
from src.utils.logging import configure_logging


def main() -> int:
    """
    Application entry point.

    Returns:
        Exit code (0 = success, non-zero = failure).
    """
    # 1. Load and validate configuration (raises on missing required vars)
    config = load_config()

    # 2. Configure structured logging
    configure_logging(level=config.log_level)
    logger = logging.getLogger(__name__)

    logger.info(
        "Application starting",
        extra={
            "env": config.env.value,
            "host": config.host,
            "port": config.port,
        },
    )

    # ─────────────────────────────────────────────────────────
    # TODO: Replace this block with your actual application.
    #
    # Example patterns:
    #   - ASGI app:  uvicorn.run(app, host=config.host, port=config.port)
    #   - CLI tool:  run_cli(sys.argv[1:])
    #   - Worker:    run_worker(config)
    # ─────────────────────────────────────────────────────────

    logger.info("Application ready. Replace src/index.py with your startup logic.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
