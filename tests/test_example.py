"""
tests/test_example.py — Example test suite.

Demonstrates the testing patterns used in this project:
- Unit tests for domain models and services
- Explicit arrange / act / assert structure
- In-memory repository for testing without a database

Replace ExampleEntity / ExampleService with your actual domain.
"""

from __future__ import annotations

import pytest
from uuid import UUID, uuid4

from src.core.exceptions import ConflictError, NotFoundError, ValidationError
from src.core.models import EmailAddress, ExampleEntity
from src.core.services import ExampleRepository, ExampleService


# ─────────────────────────────────────────────────────────────
# In-memory repository (test double — no database required)
# ─────────────────────────────────────────────────────────────

class InMemoryExampleRepository:
    """Implements ExampleRepository using a plain dict."""

    def __init__(self) -> None:
        self._store: dict[UUID, ExampleEntity] = {}

    def get_by_id(self, entity_id: UUID) -> ExampleEntity | None:
        return self._store.get(entity_id)

    def get_by_name(self, name: str) -> ExampleEntity | None:
        return next((e for e in self._store.values() if e.name == name), None)

    def save(self, entity: ExampleEntity) -> ExampleEntity:
        self._store[entity.id] = entity
        return entity

    def delete(self, entity_id: UUID) -> None:
        self._store.pop(entity_id, None)

    def list_all(self, *, limit: int = 50, offset: int = 0) -> list[ExampleEntity]:
        entities = sorted(self._store.values(), key=lambda e: e.created_at)
        return entities[offset : offset + limit]


# ─────────────────────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────────────────────

@pytest.fixture
def repo() -> InMemoryExampleRepository:
    return InMemoryExampleRepository()


@pytest.fixture
def service(repo: InMemoryExampleRepository) -> ExampleService:
    return ExampleService(repository=repo)


# ─────────────────────────────────────────────────────────────
# ExampleEntity — model tests
# ─────────────────────────────────────────────────────────────

class TestExampleEntity:
    def test_create_with_valid_name(self) -> None:
        entity = ExampleEntity.create("My Entity")
        assert entity.name == "My Entity"
        assert isinstance(entity.id, UUID)

    def test_create_strips_whitespace(self) -> None:
        entity = ExampleEntity.create("  Trimmed  ")
        assert entity.name == "Trimmed"

    def test_create_with_empty_name_raises(self) -> None:
        with pytest.raises(ValueError, match="must not be empty"):
            ExampleEntity.create("")

    def test_create_with_whitespace_only_name_raises(self) -> None:
        with pytest.raises(ValueError, match="must not be empty"):
            ExampleEntity.create("   ")

    def test_rename_updates_name_and_timestamp(self) -> None:
        entity = ExampleEntity.create("Original")
        original_updated_at = entity.updated_at

        entity.rename("Renamed")

        assert entity.name == "Renamed"
        assert entity.updated_at >= original_updated_at

    def test_rename_with_empty_name_raises(self) -> None:
        entity = ExampleEntity.create("Original")
        with pytest.raises(ValueError, match="must not be empty"):
            entity.rename("")

    def test_repr_includes_id_and_name(self) -> None:
        entity = ExampleEntity.create("Test")
        repr_str = repr(entity)
        assert "ExampleEntity" in repr_str
        assert "Test" in repr_str


# ─────────────────────────────────────────────────────────────
# EmailAddress — value object tests
# ─────────────────────────────────────────────────────────────

class TestEmailAddress:
    def test_valid_email_address(self) -> None:
        email = EmailAddress("user@example.com")
        assert str(email) == "user@example.com"

    def test_invalid_email_address_raises(self) -> None:
        with pytest.raises(ValueError, match="Invalid email"):
            EmailAddress("not-an-email")

    def test_email_address_is_immutable(self) -> None:
        email = EmailAddress("user@example.com")
        with pytest.raises((AttributeError, TypeError)):
            email.value = "other@example.com"  # type: ignore[misc]


# ─────────────────────────────────────────────────────────────
# ExampleService — service tests
# ─────────────────────────────────────────────────────────────

class TestExampleService:
    def test_create_entity(self, service: ExampleService) -> None:
        entity = service.create("Test Entity")
        assert entity.name == "Test Entity"
        assert isinstance(entity.id, UUID)

    def test_create_duplicate_name_raises_conflict(self, service: ExampleService) -> None:
        service.create("Duplicate")
        with pytest.raises(ConflictError, match="already exists"):
            service.create("Duplicate")

    def test_get_existing_entity(self, service: ExampleService) -> None:
        created = service.create("Findable")
        retrieved = service.get(created.id)
        assert retrieved.id == created.id
        assert retrieved.name == created.name

    def test_get_nonexistent_entity_raises_not_found(self, service: ExampleService) -> None:
        with pytest.raises(NotFoundError, match="not found"):
            service.get(uuid4())

    def test_rename_entity(self, service: ExampleService) -> None:
        entity = service.create("Before")
        renamed = service.rename(entity.id, "After")
        assert renamed.name == "After"

    def test_rename_to_existing_name_raises_conflict(self, service: ExampleService) -> None:
        service.create("Taken")
        entity = service.create("Original")
        with pytest.raises(ConflictError, match="already exists"):
            service.rename(entity.id, "Taken")

    def test_rename_to_same_name_is_idempotent(self, service: ExampleService) -> None:
        entity = service.create("Same")
        result = service.rename(entity.id, "Same")
        assert result.name == "Same"

    def test_delete_entity(self, service: ExampleService) -> None:
        entity = service.create("To Delete")
        service.delete(entity.id)
        with pytest.raises(NotFoundError):
            service.get(entity.id)

    def test_delete_nonexistent_entity_raises_not_found(self, service: ExampleService) -> None:
        with pytest.raises(NotFoundError):
            service.delete(uuid4())

    def test_list_all_returns_all_entities(self, service: ExampleService) -> None:
        service.create("Alpha")
        service.create("Beta")
        service.create("Gamma")
        results = service.list_all()
        assert len(results) == 3

    def test_list_all_pagination(self, service: ExampleService) -> None:
        for i in range(5):
            service.create(f"Entity {i}")
        page_1 = service.list_all(limit=2, offset=0)
        page_2 = service.list_all(limit=2, offset=2)
        assert len(page_1) == 2
        assert len(page_2) == 2
        assert page_1[0].id != page_2[0].id

    def test_list_all_empty(self, service: ExampleService) -> None:
        results = service.list_all()
        assert results == []
