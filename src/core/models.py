"""
core/models.py — Domain entities and value objects.

Rules:
- No database imports, no HTTP imports, no framework imports.
- Models are plain Python dataclasses or classes.
- Business invariants are enforced in __post_init__ or explicit factory methods.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID, uuid4


def _now() -> datetime:
    """Return the current UTC time. Isolated for testability."""
    return datetime.now(tz=timezone.utc)


# ─────────────────────────────────────────────────────────────
# Example Entity — replace or extend with your domain models
# ─────────────────────────────────────────────────────────────

@dataclass
class ExampleEntity:
    """
    A skeleton domain entity. Replace 'ExampleEntity' with your
    actual domain concept (e.g. User, Order, Project, Task).

    Attributes:
        id: Globally unique identifier.
        name: Human-readable label. Must not be empty.
        created_at: UTC timestamp of creation.
        updated_at: UTC timestamp of last modification.
        metadata: Arbitrary key-value pairs for extension.
    """

    name: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=_now)
    updated_at: datetime = field(default_factory=_now)
    metadata: dict = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.name or not self.name.strip():
            raise ValueError("ExampleEntity.name must not be empty.")

    @classmethod
    def create(cls, name: str, **metadata) -> "ExampleEntity":
        """
        Factory method. Preferred over direct instantiation —
        it makes invariant enforcement explicit and extensible.
        """
        return cls(name=name.strip(), metadata=metadata)

    def rename(self, new_name: str) -> None:
        """
        Mutate the entity name, enforcing the non-empty invariant
        and bumping updated_at.
        """
        if not new_name or not new_name.strip():
            raise ValueError("New name must not be empty.")
        self.name = new_name.strip()
        self.updated_at = _now()

    def __repr__(self) -> str:
        return f"ExampleEntity(id={self.id}, name={self.name!r})"


# ─────────────────────────────────────────────────────────────
# Example Value Object
# ─────────────────────────────────────────────────────────────

@dataclass(frozen=True)
class EmailAddress:
    """
    A value object representing a validated email address.
    Frozen (immutable) — value objects should not change after creation.
    """

    value: str

    def __post_init__(self) -> None:
        if "@" not in self.value or len(self.value) < 5:
            raise ValueError(f"Invalid email address: {self.value!r}")

    def __str__(self) -> str:
        return self.value
