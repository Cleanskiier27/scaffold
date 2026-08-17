"""
core/services.py — Service orchestration layer.

Rules:
- Services contain business logic. They do NOT contain SQL, HTTP calls,
  or framework-specific code.
- Dependencies are injected via __init__ (constructor injection).
  Never import concrete adapters here — depend on abstractions (protocols).
- Services raise domain exceptions from core/exceptions.py, never
  HTTP errors or ORM errors.
"""

from __future__ import annotations

from typing import Protocol, runtime_checkable
from uuid import UUID

from src.core.exceptions import ConflictError, NotFoundError
from src.core.models import ExampleEntity


# ─────────────────────────────────────────────────────────────
# Repository Protocol (abstraction)
# Concrete implementations live in src/adapters/
# ─────────────────────────────────────────────────────────────

@runtime_checkable
class ExampleRepository(Protocol):
    """
    Abstract interface for ExampleEntity persistence.
    The service depends on this protocol, not on a concrete class.
    Swap in any implementation (PostgreSQL, SQLite, in-memory for tests).
    """

    def get_by_id(self, entity_id: UUID) -> ExampleEntity | None:
        ...

    def get_by_name(self, name: str) -> ExampleEntity | None:
        ...

    def save(self, entity: ExampleEntity) -> ExampleEntity:
        ...

    def delete(self, entity_id: UUID) -> None:
        ...

    def list_all(self, *, limit: int = 50, offset: int = 0) -> list[ExampleEntity]:
        ...


# ─────────────────────────────────────────────────────────────
# Service
# ─────────────────────────────────────────────────────────────

class ExampleService:
    """
    Orchestrates operations on ExampleEntity.

    Replace 'ExampleService' and 'ExampleEntity' with your domain
    concept (e.g. UserService, OrderService).

    Usage:
        repo = YourConcreteRepository(db)
        service = ExampleService(repository=repo)
        entity = service.create("My Entity")
    """

    def __init__(self, repository: ExampleRepository) -> None:
        self._repo = repository

    def create(self, name: str, **metadata) -> ExampleEntity:
        """
        Create a new entity.

        Raises:
            ConflictError: If an entity with the given name already exists.
        """
        existing = self._repo.get_by_name(name)
        if existing is not None:
            raise ConflictError(f"An entity named '{name}' already exists.")

        entity = ExampleEntity.create(name, **metadata)
        return self._repo.save(entity)

    def get(self, entity_id: UUID) -> ExampleEntity:
        """
        Retrieve an entity by ID.

        Raises:
            NotFoundError: If no entity with the given ID exists.
        """
        entity = self._repo.get_by_id(entity_id)
        if entity is None:
            raise NotFoundError("ExampleEntity", str(entity_id))
        return entity

    def rename(self, entity_id: UUID, new_name: str) -> ExampleEntity:
        """
        Rename an existing entity.

        Raises:
            NotFoundError: If no entity with the given ID exists.
            ConflictError: If the new name is already taken.
        """
        entity = self.get(entity_id)

        if new_name.strip() != entity.name:
            conflict = self._repo.get_by_name(new_name)
            if conflict is not None and conflict.id != entity_id:
                raise ConflictError(f"An entity named '{new_name}' already exists.")

        entity.rename(new_name)
        return self._repo.save(entity)

    def delete(self, entity_id: UUID) -> None:
        """
        Delete an entity.

        Raises:
            NotFoundError: If no entity with the given ID exists.
        """
        self.get(entity_id)  # raises NotFoundError if missing
        self._repo.delete(entity_id)

    def list_all(self, *, limit: int = 50, offset: int = 0) -> list[ExampleEntity]:
        """Return a paginated list of all entities."""
        return self._repo.list_all(limit=limit, offset=offset)
