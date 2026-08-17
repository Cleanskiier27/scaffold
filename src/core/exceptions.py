"""
core/exceptions.py — Domain-specific exceptions for LunaRecycle-OS.

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
# Not Found & Validation
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


class ValidationError(DomainError):
    """Raised when input data fails domain-level validation."""

    def __init__(self, message: str, *, field: str | None = None) -> None:
        super().__init__(message, code="VALIDATION_ERROR")
        self.field = field


class ConflictError(DomainError):
    """Raised when an operation would violate a uniqueness or state constraint."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="CONFLICT")


class ExternalServiceError(DomainError):
    """Raised when a dependency fails."""

    def __init__(self, service: str, reason: str) -> None:
        super().__init__(f"{service} unavailable: {reason}", code="EXTERNAL_SERVICE_ERROR")
        self.service = service
        self.reason = reason


# ─────────────────────────────────────────────────────────────
# LunaRecycle Physics & Simulation Errors
# ─────────────────────────────────────────────────────────────

class SimulationError(DomainError):
    """Base exception for lunar waste simulation errors."""

    def __init__(self, message: str, *, stage: str | None = None) -> None:
        super().__init__(message, code="SIMULATION_ERROR")
        self.stage = stage


class InvalidWasteStreamError(ValidationError):
    """Raised when waste composition is invalid or unprocessable."""

    def __init__(self, message: str, *, waste_type: str | None = None) -> None:
        super().__init__(message, field=waste_type)
        self.code = "INVALID_WASTE_STREAM"


class ThermalConstraintViolationError(SimulationError):
    """Raised when thermal limits or melt temperatures violate safe bounds."""

    def __init__(self, message: str, *, temperature_c: float | None = None) -> None:
        super().__init__(message, stage="THERMAL_ANALYSIS")
        self.temperature_c = temperature_c
        self.code = "THERMAL_CONSTRAINT_VIOLATION"


# ─────────────────────────────────────────────────────────────
# NASA Application & Resume Scanner Errors
# ─────────────────────────────────────────────────────────────

class ResumeParsingError(DomainError):
    """Raised when resume text extraction or section normalization fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="RESUME_PARSING_ERROR")


class SubmissionGenerationError(DomainError):
    """Raised when formatting or assembling submission package fails."""

    def __init__(self, message: str) -> None:
        super().__init__(message, code="SUBMISSION_GENERATION_ERROR")
