# ADR-0002: Adopt Conventional Commits

**Date:** 2026-08-17  
**Status:** Accepted  
**Deciders:** Maintainer team

---

## Context

Commit messages in the early project were inconsistent — no format, no enforced scope, no distinction between features, fixes, and chores. This made changelog generation manual, release notes subjective, and `git log` difficult to scan.

## Decision

We adopt [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) as the required commit message format. The format is:

```
<type>(<optional scope>): <summary>

[optional body]

[optional footer(s)]
```

Compliance is enforced via pre-commit hooks (commitlint or equivalent).

## Consequences

- CHANGELOG can be generated automatically from commit history
- Release type (major/minor/patch) can be inferred from commit types
- `git log --oneline` is scannable and meaningful
- Contributors must learn the format — mitigated by documentation and pre-commit feedback
- Squash-merge strategy means individual commits inside a PR don't need to be perfect; the squashed commit does
