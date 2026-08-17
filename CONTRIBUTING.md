# Contributing to project-name

> *"The forge doesn't care about your intentions — it cares about your craft."*

First: thank you. Every issue filed, every line reviewed, every test written is an act of care for everyone who comes after you.

This document is your map. Follow it and your contribution will land cleanly. Skip it and the maintainers will send you back here anyway.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Features](#suggesting-features)
  - [Submitting Pull Requests](#submitting-pull-requests)
- [Development Setup](#development-setup)
- [Branching Model](#branching-model)
- [Commit Conventions](#commit-conventions)
- [Code Style](#code-style)
- [Testing](#testing)
- [Review Process](#review-process)
- [Recognition](#recognition)

---

## Code of Conduct

All contributors are bound by the [Code of Conduct](CODE_OF_CONDUCT.md). Violations are handled by the maintainers. This is non-negotiable.

---

## How to Contribute

### Reporting Bugs

1. **Search first.** Check [existing issues](https://github.com/your-org/project-name/issues) to avoid duplicates.
2. **Use the bug template.** Go to *Issues → New Issue → Bug Report*.
3. **Provide a minimal reproduction.** The faster a maintainer can reproduce it, the faster it gets fixed.
4. **Include environment details.** OS, runtime version, relevant config.

### Suggesting Features

1. Open a *Feature Request* using the issue template.
2. Describe the problem you're solving, not just the solution you've imagined.
3. Expect a discussion before any implementation work begins.

### Submitting Pull Requests

1. **Open an issue first** for anything beyond trivial fixes. Code without context is often code that doesn't land.
2. Fork the repo and create a branch from `main` following the [branching model](#branching-model).
3. Make your changes. Write tests. Update docs.
4. Run `pre-commit run --all-files` and ensure all checks pass.
5. Push and open a PR using the pull request template.
6. Link the PR to the relevant issue (`Closes #123`).

---

## Development Setup

```bash
# 1. Fork and clone
git clone https://github.com/your-username/project-name.git
cd project-name

# 2. Install pre-commit hooks (required)
pip install pre-commit
pre-commit install

# 3. Install dependencies
<your install command>

# 4. Verify everything works
<your test command>
```

---

## Branching Model

| Branch pattern | Purpose |
|---|---|
| `main` | Always production-ready. Protected. |
| `feat/<short-description>` | New features |
| `fix/<short-description>` | Bug fixes |
| `docs/<short-description>` | Documentation only |
| `chore/<short-description>` | Tooling, config, maintenance |
| `release/<version>` | Release preparation |

Branch from `main`. PRs target `main`.

---

## Commit Conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

```
<type>(<optional scope>): <short summary>

[optional body]

[optional footer(s)]
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Formatting, whitespace — no logic change |
| `refactor` | Code restructure — no feature or fix |
| `test` | Adding or updating tests |
| `chore` | Build process, tooling, dependency updates |
| `ci` | CI/CD pipeline changes |
| `perf` | Performance improvements |
| `revert` | Reverting a prior commit |

**Examples:**

```
feat(auth): add OAuth2 PKCE flow
fix(api): handle null response from upstream service
docs: clarify installation steps in README
chore(deps): bump lodash from 4.17.20 to 4.17.21
```

Breaking changes must include `BREAKING CHANGE:` in the footer:

```
feat(config)!: rename DATABASE_URL to DB_CONNECTION_STRING

BREAKING CHANGE: DATABASE_URL is no longer recognized. Update all
environment configurations to use DB_CONNECTION_STRING instead.
```

---

## Code Style

- Code style is enforced automatically by pre-commit hooks and CI.
- Run `pre-commit run --all-files` before pushing.
- Do not submit PRs that fail lint or format checks — CI will block the merge.

Specific style guides are documented in [docs/architecture.md](docs/architecture.md).

---

## Testing

- All new features must include tests.
- All bug fixes must include a regression test.
- The test suite must pass before a PR can merge.

```bash
# Run the full test suite
<your test command>

# Run a single test file
<your single test command>
```

Coverage reports are generated in CI. Aim to maintain or improve current coverage.

---

## Review Process

1. A maintainer will review your PR within **5 business days**.
2. Reviews may request changes — this is normal, not rejection.
3. Address all comments or explain why you disagree; don't silently ignore them.
4. Two approvals from maintainers are required to merge.
5. Maintainers may squash commits on merge to keep the history clean.

---

## Recognition

Contributors are acknowledged in the [CHANGELOG](CHANGELOG.md) and, for significant contributions, in the README. The people who built this are part of its story.

---

*The code outlives the coder. Write accordingly.*
