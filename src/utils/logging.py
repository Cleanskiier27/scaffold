"""
utils/logging.py — Structured logging configuration.

Call configure_logging() once at application startup.
After that, use standard logging.getLogger(__name__) everywhere.
All output is structured JSON — machine-readable and aggregator-friendly.
"""

from __future__ import annotations

import json
import logging
import sys
import traceback
from datetime import datetime, timezone
from typing import Any


class _JsonFormatter(logging.Formatter):
    """
    Formats log records as single-line JSON objects.

    Standard fields emitted on every record:
      - timestamp (ISO 8601 UTC)
      - level
      - logger
      - message
      - module / function / line

    Extra fields can be added by passing them as keyword arguments
    to the logging call:
        logger.info("User created", extra={"user_id": str(user.id)})
    """

    RESERVED_ATTRS = frozenset({
        "args", "created", "exc_info", "exc_text", "filename",
        "funcName", "levelname", "levelno", "lineno", "message",
        "module", "msecs", "msg", "name", "pathname", "process",
        "processName", "relativeCreated", "stack_info", "thread",
        "threadName",
    })

    def format(self, record: logging.LogRecord) -> str:
        record.message = record.getMessage()

        payload: dict[str, Any] = {
            "timestamp": datetime.fromtimestamp(
                record.created, tz=timezone.utc
            ).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.message,
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Include exception info if present
        if record.exc_info:
            payload["exception"] = {
                "type": record.exc_info[0].__name__ if record.exc_info[0] else None,
                "message": str(record.exc_info[1]),
                "traceback": traceback.format_exception(*record.exc_info),
            }

        # Include any extra fields the caller attached
        for key, value in record.__dict__.items():
            if key not in self.RESERVED_ATTRS and not key.startswith("_"):
                payload[key] = value

        return json.dumps(payload, default=str)


def configure_logging(level: str = "INFO") -> None:
    """
    Configure root logging to emit structured JSON to stdout.

    Call this exactly once at application startup, before any logger is used.

    Args:
        level: Log level string ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL").
    """
    root = logging.getLogger()
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove any default handlers (avoids duplicate output)
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(_JsonFormatter())
    root.addHandler(handler)

    # Quiet noisy third-party loggers
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("asyncio").setLevel(logging.WARNING)
