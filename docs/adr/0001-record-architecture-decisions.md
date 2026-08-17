# ADR-0001: Record Architecture Decisions

**Date:** 2026-08-17  
**Status:** Accepted  
**Deciders:** Maintainer team

---

## Context

As the project grows, decisions about structure, technology, and conventions will be made and then forgotten. New contributors encounter the results of those decisions without understanding the reasoning behind them. This creates friction, cargo-culting, and reversal of deliberate choices.

## Decision

We will use Architecture Decision Records (ADRs) to document significant architectural and structural decisions. Each ADR lives in `docs/adr/` and is numbered sequentially. ADRs are immutable once accepted — they are a historical record, not a living document. Superseded decisions get a new ADR that references the old one.

## Format

```
# ADR-NNNN: Title

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-NNNN
**Deciders:** Names or team

---

## Context
[What situation prompted this decision?]

## Decision
[What was decided?]

## Consequences
[What becomes easier or harder as a result?]
```

## Consequences

- Decisions are traceable and explained
- Onboarding new contributors becomes faster
- Revisiting decisions requires explicit acknowledgment (a new ADR), not silent changes
- Adds a small overhead to major decisions — accepted as worthwhile
