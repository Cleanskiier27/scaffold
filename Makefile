# Makefile — project-name
# Common development tasks. Run `make help` to see all targets.

.DEFAULT_GOAL := help
.PHONY: help install dev test test-cov lint format type-check pre-commit \
        build clean audit docs

# ─────────────────────────────────────────────
# Colors
# ─────────────────────────────────────────────
CYAN  := \033[0;36m
RESET := \033[0m

# ─────────────────────────────────────────────
# Help
# ─────────────────────────────────────────────
help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2}'

# ─────────────────────────────────────────────
# Setup
# ─────────────────────────────────────────────
install: ## Install all dependencies including dev
	pip install -e ".[dev]"
	pre-commit install

dev: ## Start the application in development mode
	python -m src.index

# ─────────────────────────────────────────────
# Testing
# ─────────────────────────────────────────────
test: ## Run the full test suite
	pytest tests/ -v

test-cov: ## Run tests with coverage report
	pytest tests/ -v --cov=src --cov-report=term-missing --cov-report=html

test-unit: ## Run unit tests only
	pytest tests/ -v -m unit

test-integration: ## Run integration tests only
	pytest tests/ -v -m integration

# ─────────────────────────────────────────────
# Code quality
# ─────────────────────────────────────────────
lint: ## Run all linters
	ruff check src/ tests/
	yamllint .

format: ## Auto-format all code
	black src/ tests/
	isort src/ tests/
	ruff check --fix src/ tests/

type-check: ## Run mypy type checking
	mypy src/

pre-commit: ## Run all pre-commit hooks on all files
	pre-commit run --all-files

# ─────────────────────────────────────────────
# Security
# ─────────────────────────────────────────────
audit: ## Audit dependencies for known vulnerabilities
	pip-audit

secrets-scan: ## Scan repository for leaked secrets
	gitleaks detect --source . --verbose

# ─────────────────────────────────────────────
# Build
# ─────────────────────────────────────────────
build: ## Build distribution packages
	pip install build
	python -m build

# ─────────────────────────────────────────────
# Documentation
# ─────────────────────────────────────────────
docs: ## Serve documentation locally
	mkdocs serve

docs-build: ## Build static documentation
	mkdocs build --strict

# ─────────────────────────────────────────────
# Cleanup
# ─────────────────────────────────────────────
clean: ## Remove all build artifacts and caches
	rm -rf dist/ build/ site/ htmlcov/ .coverage coverage.xml
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .mypy_cache -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean."
