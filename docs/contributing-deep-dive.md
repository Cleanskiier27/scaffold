# Contributing Deep Dive

> *"Good craft is invisible. Great craft makes others believe they could have done it."*

This document goes beyond the surface-level instructions in [CONTRIBUTING.md](../CONTRIBUTING.md) and provides the reasoning, context, and mechanics behind how this project works day to day. Read it once. Refer back when something feels unclear.

---

## The Philosophy

This project makes one bet: that **explicit structure scales better than informal agreement**. Every convention here — commit format, branch naming, review process — exists because the alternative caused real problems. If you find a rule that no longer serves its purpose, open an issue and propose a change. Rules that can't defend themselves don't deserve to stay.

---

## The Lifecycle of a Contribution

```
Idea
  │
  ├─→ Search existing issues
  │       └─→ Found duplicate? Comment & close yours.
  │       └─→ No duplicate? Open an issue using the template.
  │
  ├─→ Issue discussion (may take a few days for significant changes)
  │
  ├─→ Fork → Branch → Write code
  │       └─→ Keep changes focused. One PR, one concern.
  │
  ├─→ Run pre-commit, run tests, update docs
  │
  ├─→ Open PR (linked to issue, following the template)
  │
  ├─→ Code review (address all comments, push commits — don't force-push)
  │
  ├─→ Two approvals + all checks pass
  │
  └─→ Maintainer squash-merges into main
```

---

## Branching in Practice

Branch names are machine-readable signals. The CI system and some bots use them to infer intent.

```bash
# Create a feature branch
git checkout main
git pull origin main
git checkout -b feat/oauth2-pkce-flow

# Keep your branch up to date during long-running work
git fetch origin
git rebase origin/main    # preferred over merge — keeps history linear
```

**Never commit directly to `main`.** It is a protected branch. Pushes without a PR are rejected.

**Never force-push a branch that has an open PR.** Reviewers lose their diff context. If you need to rebase, communicate it in the PR and force-push only after the reviewer acknowledges it.

---

## Commit Hygiene

A good commit is a logical unit of change that can be understood in isolation.

### What belongs in one commit?

- A single conceptual change (add a feature, fix a bug, update a config)
- The tests for that change
- The documentation update for that change

### What does NOT belong in one commit?

- Unrelated formatting fixes mixed with logic changes
- "WIP" or "fix typo" commits that survive into the PR (squash them locally before pushing)
- Changes to 15 files when 3 would have sufficed

### Amending and squashing locally

```bash
# Amend the last commit (before pushing)
git commit --amend --no-edit

# Interactive rebase to squash commits before pushing
git rebase -i HEAD~3     # squash last 3 commits
```

Once a branch is pushed and has a PR, do not rebase without communicating it to reviewers.

---

## Writing Good Commit Messages

```
feat(auth): add OAuth2 PKCE flow for public clients

Public clients cannot securely store a client secret, so the
authorization code flow without PKCE is not safe for them.
This commit adds PKCE support (RFC 7636) using S256 challenge method.

Closes #142
```

**Subject line rules:**
- `type(scope): verb in imperative mood + what`
- 72 characters max
- No period at the end
- "add X", "fix Y", "remove Z" — not "added", "fixes", "removing"

**Body rules:**
- Explain *why*, not *what* (the diff shows what)
- Wrap at 72 characters
- Separate subject from body with a blank line

**Footer rules:**
- `Closes #issue` — triggers auto-close on merge
- `BREAKING CHANGE: <description>` — required for breaking changes

---

## Code Review: Giving Feedback

Reviews are conversations, not verdicts. The goal is a better codebase, not a performance of authority.

**Do:**
- Comment on the code, not the person
- Ask questions before assuming intent (`"Why did you choose X here?"`)
- Distinguish between blocking issues and suggestions (`"nit:"`, `"optional:"`, `"consider:"`)
- Approve when your concerns are resolved — don't ghost

**Don't:**
- Use reviews to enforce personal style preferences not covered by the linter
- Leave vague feedback (`"This is wrong"`) without explanation
- Approve while leaving unresolved blocking comments

---

## Code Review: Receiving Feedback

**Do:**
- Read every comment before responding to any
- Address all comments — if you disagree, explain why; don't silently skip
- Mark resolved conversations after pushing a fix
- Thank reviewers for thorough reviews (it takes time)

**Don't:**
- Take feedback personally — the reviewer is improving the product, not judging you
- Make changes beyond the PR's scope in response to feedback (open a new issue/PR)
- Ask for re-review until all comments are addressed

---

## Testing Philosophy

Tests are not a tax on development — they are the specification of the system. A test suite that passes is a claim about what the code does.

### What to test

- **Every public interface.** If it's callable from outside the module, it has a test.
- **Every error path.** "Happy path only" tests are a liability.
- **Every regression.** When a bug is fixed, a test is added that would have caught it.

### What not to test

- Private implementation details that will change
- Framework behavior (test your code, not the framework)
- Trivial getters/setters with no logic

### Test naming convention

```python
def test_<unit>_<scenario>_<expected_result>():
    # Example:
    # test_login_with_invalid_credentials_raises_auth_error
```

---

## Working with Pre-commit

Pre-commit hooks run automatically on `git commit`. If a hook modifies a file (e.g., the formatter), the commit is aborted so you can review the change. Add the modified files and commit again.

```bash
# Run all hooks manually (before your first push, or to diagnose issues)
pre-commit run --all-files

# Run a specific hook
pre-commit run black --all-files

# Temporarily skip hooks (for emergencies only — do not make this a habit)
git commit --no-verify -m "emergency: hotfix for production outage"
```

When skipping hooks, leave a comment in the PR explaining why.

---

## Release Process

Releases are cut by maintainers. Contributors don't need to manage releases, but understanding the process helps with CHANGELOG entries.

1. Maintainer creates a `release/x.y.z` branch
2. CHANGELOG is updated — `[Unreleased]` entries move to `[x.y.z]`
3. Version bump in `pyproject.toml` (or equivalent)
4. PR opened from `release/x.y.z` → `main`, reviewed, merged
5. Tag pushed: `git tag -s vx.y.z && git push origin vx.y.z`
6. CI builds and publishes the release automatically

**Semantic Versioning:**
- `MAJOR` — breaking change (`BREAKING CHANGE:` in commit footer)
- `MINOR` — new feature, backward compatible
- `PATCH` — bug fix, backward compatible

---

## Asking for Help

You don't have to know everything before contributing. If you're stuck:

1. Check the [docs](https://your-org.github.io/project-name) first
2. Search [existing issues and discussions](https://github.com/your-org/project-name/issues)
3. Open a [Discussion](https://github.com/your-org/project-name/discussions) for open-ended questions
4. Comment on the relevant issue if it's specific to your contribution

The only bad question is the one that slows you down for days when a two-minute conversation would have unstuck you.

---

*You made it to the end. Go build something.*
