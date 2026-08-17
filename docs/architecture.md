# Architecture Overview

> *"Structure is not a cage. It is the skeleton that lets the body move."*

This document describes the high-level design of **project-name** — its major components, their responsibilities, and how they connect. It is written for engineers joining the project and for maintainers making structural decisions.

---

## Guiding Principles

The architecture of project-name is governed by four principles:

1. **Explicit over implicit** — Every dependency, configuration, and data flow is declared, not inferred.
2. **Separation of concerns** — Each module owns one thing. Boundaries are enforced, not suggested.
3. **Testability by default** — The design makes units independently testable without global state.
4. **Fail loudly** — Errors surface at the boundary where they originate, not silently downstream.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Clients                             │
│           (CLI / HTTP API / SDK / Web UI)                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Entry Layer                            │
│              src/index.py  ·  src/api/                      │
│   Request routing, auth verification, input validation      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                      Core Domain                            │
│                      src/core/                              │
│    Business logic, domain models, service orchestration     │
└──────────┬─────────────────────────┬────────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────┐       ┌─────────────────────────────────┐
│   src/utils/     │       │         Adapters                │
│  Shared helpers  │       │  src/adapters/ (DB, queue, ext) │
│  (logging, cfg,  │       │  Database · Message Queue       │
│   serialization) │       │  External APIs · File Store     │
└──────────────────┘       └─────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── core/               # Domain layer — pure business logic
│   ├── models.py       # Domain entities and value objects
│   ├── services.py     # Service orchestration
│   └── exceptions.py   # Domain-specific exceptions
│
├── adapters/           # Infrastructure layer — I/O boundary
│   ├── db.py           # Database client and query logic
│   ├── cache.py        # Cache adapter
│   └── external.py     # Third-party API clients
│
├── api/                # Presentation layer (HTTP/CLI)
│   ├── routes.py       # Route definitions
│   ├── schemas.py      # Request/response serialization
│   └── middleware.py   # Cross-cutting concerns (auth, logging)
│
├── utils/              # Shared utilities
│   ├── config.py       # Configuration loading
│   ├── logging.py      # Structured logging setup
│   └── helpers.py      # General-purpose helpers
│
└── index.py            # Application entry point
```

---

## Component Responsibilities

### Core Domain (`src/core/`)

The core contains all business logic and **must not** import from `adapters/` or `api/`. This enforces the dependency rule: dependencies point inward. The core is pure Python — no framework, no database, no HTTP.

- **`models.py`** — Domain entities. These are plain data classes or dataclasses. They know about business rules but nothing about persistence.
- **`services.py`** — Orchestrates domain operations. Accepts dependencies via constructor injection. Returns domain objects, not database rows.
- **`exceptions.py`** — Named, typed exceptions for every failure mode the domain can produce.

### Adapters (`src/adapters/`)

Adapters translate between the core domain and external systems. They implement interfaces defined by the core (Dependency Inversion Principle).

- **`db.py`** — All database interactions. Uses a connection pool. Returns domain objects or raises domain exceptions.
- **`cache.py`** — Cache read/write abstraction. Swappable (Redis, Memcached, in-memory for tests).
- **`external.py`** — HTTP clients for third-party APIs. Each client is a class; each method corresponds to one API call.

### API Layer (`src/api/`)

The presentation layer handles I/O concerns: HTTP routing, authentication, request parsing, response serialization. It delegates all business logic to the core.

- **`routes.py`** — Route definitions. Thin controllers — they parse input, call a service, and serialize output.
- **`schemas.py`** — Pydantic (or equivalent) models for request/response validation and serialization.
- **`middleware.py`** — Authentication, rate limiting, structured logging, error formatting.

### Utilities (`src/utils/`)

Shared, stateless helpers used across all layers. No business logic lives here.

- **`config.py`** — Loads configuration from environment variables and/or config files. Validates at startup.
- **`logging.py`** — Configures structured JSON logging. One call at startup; no global logger mutation afterward.

---

## Data Flow

A typical request through the system:

```
1. Client sends HTTP request
   ↓
2. api/middleware.py — authenticate, rate-limit, attach request ID
   ↓
3. api/routes.py — validate input via schemas.py
   ↓
4. core/services.py — execute business logic
   ↓
5. adapters/db.py — persist or retrieve data
   ↓
6. core/services.py — return domain result
   ↓
7. api/routes.py — serialize response via schemas.py
   ↓
8. Client receives HTTP response
```

---

## Key Design Decisions

### Why not use a monolithic service class?

Large service classes accumulate state, hide dependencies, and make testing painful. Each service in `core/services.py` is a focused class with constructor-injected dependencies. Swap any dependency for a mock and the logic tests cleanly.

### Why adapters instead of calling the ORM directly from routes?

Direct ORM calls in route handlers couple the presentation layer to the database schema. Adapters provide a stable interface: the route doesn't know or care whether data comes from PostgreSQL, SQLite, or a test fixture.

### Why structured logging?

Free-form log strings are unsearchable at scale. Structured JSON logs (one object per event, with consistent fields) are ingested by any log aggregator and queryable by field. The `logging.py` utility enforces this from startup.

---

## Testing Strategy

| Layer | Test Type | Tools |
|---|---|---|
| Core domain | Unit | pytest, no mocks needed |
| Adapters | Integration | pytest, test database, testcontainers |
| API layer | End-to-end | pytest, httpx / TestClient |
| Whole system | Smoke | Docker Compose, health check endpoints |

- **Core tests** instantiate services directly and pass in plain Python objects. No database, no HTTP, no framework.
- **Adapter tests** use a real (ephemeral) database spun up by testcontainers or a fixture.
- **API tests** use the framework's test client, calling routes and asserting response schemas.

---

## Performance Considerations

- Database queries are batched where possible; N+1 queries are a first-class bug.
- The cache adapter is used for frequently read, rarely changed data. Cache invalidation is explicit, not time-based by default.
- All I/O is async where the runtime supports it. Blocking calls in async context are forbidden.

---

## Future Directions

- [ ] GraphQL or tRPC layer over the API for typed client generation
- [ ] Event sourcing for the audit log
- [ ] gRPC adapter for service-to-service communication
- [ ] OpenTelemetry integration for distributed tracing

---

*Architecture is a living decision record. When you change the structure, update this document.*
