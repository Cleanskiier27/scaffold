"""
core/exceptions.py — Domain-specific exceptions.

Rules:
- All exceptions raised by core logic are defined here.
- Use named, typed exceptions — never raise bare Exception.
- HTTP status codes do NOT belong here. Map exceptions to HTTP
  codes at the API layer boundary.
"""

from __future__ import annotations


# ─────────────────────────────────────────────────────────────
# Base
# ─────────────────────────────────────────────────────────────

class DomainError(Exception):
    """
    Base class for all domain exceptions.

    Catching DomainError catches all application-layer errors.
    Use more specific subclasses for precise handling.
    """

    def __init__(self, message: str, *, code: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.code = code or self.__class__.__name__

    def __str__(self) -> str:
        return f"[{self.code}] {self.message}"


# ─────────────────────────────────────────────────────────────
# Not Found
# ─────────────────────────────────────────────────────────────

class NotFoundError(DomainError):
    """Raised when a requested resource does not exist."""

    def __init__(self, resource: str, identifier: str | None = None) -> None:
        msg = f"{resource} not found"
        if identifier:
            msg = f"{resource} '{identifier}' not found"
        super().__init__(msg, code="NOT_FOUND")
        self.resource = resource
        self.identifier = identifier


# ─────────────────────────────────────────────────────────────
# Validation
# ─────────────────────────────────────────────────────────────

class ValidationError(DomainError):
    """Raised when input data fails domain-level validation."""

    def __init__(self, message: str, *, field: str | None = None) -> None:
        super().__init__(message, code="VALIDATION_ERROR")
        self.field = field


# ─────────────────────────────────────────────────────────────
# Authorization
# ─────────────────────────────────────────────────────────────

class AuthorizationError(DomainError):
    """Raised when a caller lacks permission to perform an action."""

    def __init__(self, action: str, resource: str | None = None) -> None:
        msg = f"Not authorized to perform '{action}'"
        if resource:
            msg = f"Not authorized to perform '{action}' on {resource}"
        super().__init__(msg, code="AUTHORIZATION_ERROR")
        self.action = action
        self.resource = resource


# ─────────────────────────────────────────────────────────────
# Conflict
# ─────────────────────────────────────────────────────────────

class ConflictError(DomainError):
    """Raised when an operation would violate a uniqueness or state constraint."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="CONFLICT")


# ─────────────────────────────────────────────────────────────
# External Service
# ─────────────────────────────────────────────────────────────

class ExternalServiceError(DomainError):
    """Raised when a dependency (database, API, queue) fails."""

    def __init__(self, service: str, reason: str) -> None:
        super().__init__(f"{service} unavailable: {reason}", code="EXTERNAL_SERVICE_ERROR")
        self.service = service
        self.reason = reason
