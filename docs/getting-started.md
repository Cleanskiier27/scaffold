# Getting Started

> *"The first step is always the same: begin."*

This guide takes you from zero to a running instance of **project-name** in under fifteen minutes. It assumes you are comfortable with a terminal and have the prerequisites installed.

---

## Prerequisites

Before anything else, confirm you have the following:

| Requirement | Minimum Version | Install Guide |
|---|---|---|
| Git | 2.40+ | [git-scm.com](https://git-scm.com) |
| Runtime (e.g., Python) | 3.11+ | [python.org](https://python.org) |
| Package Manager | latest | Included with runtime |
| Docker *(optional)* | 24.0+ | [docs.docker.com](https://docs.docker.com) |

Verify your setup:

```bash
git --version
python --version   # or node --version, go version, etc.
```

---

## Installation

### Option 1 — From Source (Recommended for Development)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/project-name.git
cd project-name

# 2. Create a virtual environment (Python example)
python -m venv .venv
source .venv/bin/activate          # macOS/Linux
# .venv\Scripts\activate           # Windows PowerShell

# 3. Install in editable mode with dev dependencies
pip install -e ".[dev]"

# 4. Verify installation
project-name --version
```

### Option 2 — Package Manager

```bash
# pip
pip install project-name

# npm (if applicable)
npm install -g project-name

# Homebrew (if applicable)
brew install your-org/tap/project-name
```

### Option 3 — Docker

```bash
# Pull the latest image
docker pull ghcr.io/your-org/project-name:latest

# Run with default config
docker run --rm ghcr.io/your-org/project-name:latest
```

---

## Configuration

project-name is configured via environment variables and/or a config file.

### Environment Variables

Copy the example file and customize it:

```bash
cp .env.example .env
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `PROJECT_ENV` | No | `development` | Runtime environment |
| `LOG_LEVEL` | No | `INFO` | Logging verbosity |
| `DATABASE_URL` | Yes | — | Database connection string |
| `SECRET_KEY` | Yes | — | Application secret key |

> ⚠️ **Never commit `.env` to version control.** It is listed in `.gitignore`.

### Config File *(if applicable)*

```yaml
# config.yml
environment: development
log_level: INFO
database:
  url: "postgresql://user:pass@localhost:5432/dbname"
```

---

## Running the Project

### Development Mode

```bash
# Start with hot reload
project-name serve --reload

# Or use the Makefile shortcut
make dev
```

### Production Mode

```bash
project-name serve --env production
```

### Docker Compose

```bash
# Start all services
docker compose up --build

# Run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

---

## Running Tests

```bash
# Full test suite
pytest

# With coverage report
pytest --cov=src --cov-report=term-missing

# Single test file
pytest tests/test_core.py

# Single test
pytest tests/test_core.py::TestCore::test_something
```

---

## Setting Up Pre-commit Hooks

Pre-commit hooks enforce code quality automatically before every commit.

```bash
# Install pre-commit (if not already installed)
pip install pre-commit

# Install the hooks defined in .pre-commit-config.yaml
pre-commit install

# Run all hooks manually (useful before your first push)
pre-commit run --all-files
```

Once installed, hooks run automatically on `git commit`. If a hook fails, the commit is blocked and the output tells you exactly what needs fixing.

---

## Project Structure

```
project-name/
├── .github/                    # GitHub automation
│   ├── ISSUE_TEMPLATE/         # Structured issue forms
│   ├── workflows/              # CI/CD pipelines
│   ├── dependabot.yml          # Automated dependency updates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── SECURITY.md
├── docs/                       # Documentation
│   ├── getting-started.md      # ← You are here
│   ├── architecture.md         # System design overview
│   └── contributing-deep-dive.md
├── src/                        # Source code
│   ├── core/                   # Core domain logic
│   ├── utils/                  # Shared utilities
│   └── index.py                # Entry point
├── tests/                      # Test suites
├── .editorconfig               # Editor consistency settings
├── .gitignore
├── .gitleaks.toml              # Secret scanning config
├── .pre-commit-config.yaml     # Pre-commit hook definitions
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Next Steps

| What | Where |
|---|---|
| Understand the system design | [Architecture Overview](architecture.md) |
| Contribute code or fixes | [Contributing Guide](contributing-deep-dive.md) |
| Report a bug | [Bug Report Template](https://github.com/your-org/project-name/issues/new?template=bug_report.yml) |
| Ask a question | [Discussions](https://github.com/your-org/project-name/discussions) |

---

## Troubleshooting

### `command not found: project-name`

Ensure the package is installed and your virtual environment is activated:

```bash
source .venv/bin/activate
which project-name
```

### Port already in use

```bash
# Find the process using the port
lsof -i :8080         # macOS/Linux
netstat -ano | findstr :8080   # Windows

# Kill it or change the port in your config
```

### Permission denied on pre-commit install

```bash
# Make the hook executable
chmod +x .git/hooks/pre-commit
```

If your issue isn't listed here, search [GitHub Issues](https://github.com/your-org/project-name/issues) or open a new one.
