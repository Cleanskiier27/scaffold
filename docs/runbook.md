# Runbook

> *"A runbook is a promise to your future self at 2am."*

This document covers operational procedures for **project-name** in production environments.

---

## Health Checks

| Endpoint | Expected Response | Interval |
|---|---|---|
| `GET /health` | `{"status": "ok"}` — HTTP 200 | 30s |
| `GET /ready` | `{"status": "ready"}` — HTTP 200 | 60s |
| `GET /metrics` | Prometheus text format | 15s |

---

## Deployment

### Standard Deployment

```bash
# Pull the latest release image
docker pull ghcr.io/your-org/project-name:v<VERSION>

# Deploy (adjust to your orchestration platform)
docker compose pull && docker compose up -d

# Verify health
curl -sf http://localhost:8080/health | jq .
```

### Rolling Back

```bash
# Roll back to a specific version
docker pull ghcr.io/your-org/project-name:v<PREVIOUS_VERSION>
docker compose up -d

# Or in Kubernetes
kubectl rollout undo deployment/project-name
kubectl rollout status deployment/project-name
```

---

## Incident Response

### Severity Levels

| Level | Definition | Response Time |
|---|---|---|
| P0 — Critical | Complete outage; all users affected | Immediate |
| P1 — Major | Partial outage; core features broken | < 30 minutes |
| P2 — Minor | Degraded performance; workaround available | < 4 hours |
| P3 — Low | Non-critical issue; no user impact | Next business day |

### P0 / P1 Response Steps

1. **Acknowledge** — Comment on the incident channel. "I'm on it."
2. **Assess** — Check logs, metrics, and recent deployments.
3. **Mitigate** — Roll back the last deployment if it correlates with the incident.
4. **Communicate** — Update the status page every 15 minutes.
5. **Resolve** — Confirm resolution with a health check.
6. **Post-mortem** — Open a post-mortem issue within 48 hours.

---

## Log Access

```bash
# Docker
docker logs project-name --tail 200 --follow

# Docker Compose
docker compose logs -f project-name

# Kubernetes
kubectl logs -f deployment/project-name --tail=200
```

Key log fields to filter on:

| Field | Values | Meaning |
|---|---|---|
| `level` | `ERROR`, `WARN`, `INFO` | Log severity |
| `request_id` | UUID | Trace a single request end-to-end |
| `user_id` | UUID | Filter by user |
| `duration_ms` | Integer | Request latency |

---

## Database Operations

### Manual Migration

```bash
# Run pending migrations
project-name db migrate

# Check migration status
project-name db status

# Roll back one migration
project-name db rollback
```

### Backup

```bash
# Trigger a manual backup
project-name db backup --destination s3://your-bucket/backups/

# List available backups
project-name db backup --list
```

---

## Secrets Rotation

When rotating a secret:

1. Add the new secret to the secret store **alongside** the old one
2. Deploy the application — it will pick up the new value
3. Verify the application is healthy
4. Remove the old secret from the secret store
5. Deploy again (or restart) to flush the old value from memory

Never remove the old secret before the new one is confirmed working.

---

## On-call Contacts

| Role | Contact | Escalation |
|---|---|---|
| Primary on-call | See PagerDuty rotation | — |
| Engineering lead | eng-lead@your-org.com | After 15 min no response |
| Security issues | security@your-org.com | Immediate for P0 |

---

*Keep this runbook updated. An outdated runbook is worse than no runbook.*
