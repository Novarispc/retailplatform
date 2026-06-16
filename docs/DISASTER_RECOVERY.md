# Disaster Recovery Runbook — Nova Retail

## Objectives

| Metric | Target |
| --- | --- |
| RPO (max data loss) | ≤ 24h (daily backups); ≤ 1h with managed PITR |
| RTO (max downtime) | ≤ 1h (restore from latest dump) |

## What to back up

1. **PostgreSQL** — the source of truth (orders, payments, inventory, users, loyalty). Daily logical dumps + (in prod) managed point-in-time recovery.
2. **Object storage (S3/MinIO)** — product/media assets. Enable bucket versioning + cross-region replication in prod.
3. **Secrets** — `.env` / secret manager. Store the key inventory (Razorpay, Stripe, Anthropic, AUTH_SECRET) in a password manager; never in git.

Redis is a cache (rate limiting) — **not** backed up; it rebuilds on restart.

## Backups (local / single-node)

```bash
bash scripts/backup.sh          # → ./backups/retail_<timestamp>.sql.gz, prunes >14 days
bash scripts/restore.sh ./backups/retail_<timestamp>.sql.gz
```

Schedule daily via cron:

```
0 3 * * *  cd /srv/nova && bash scripts/backup.sh >> /var/log/nova-backup.log 2>&1
```

## Backups (managed / production)

Prefer a managed Postgres (RDS / Cloud SQL / Neon) with automated daily snapshots + PITR. Keep `scripts/backup.sh` as a portable secondary that ships dumps off-host (e.g. to S3 with lifecycle rules).

## Restore procedure

1. Provision a clean Postgres reachable at `DATABASE_URL`.
2. Apply schema: `npm run db:deploy` (runs all migrations).
3. Restore data: `bash scripts/restore.sh <latest backup>` (dumps use `--clean --if-exists`, safe to re-run).
4. Verify: `curl -s localhost:3000/api/v1/health` → `{"status":"healthy"}`.
5. Smoke test: load `/`, place a mock order, confirm in `/admin/orders`.

## Rollback (bad deploy)

- **App:** redeploy the previous image tag (immutable Docker images). The `/api/v1/health` probe gates traffic.
- **Migration:** forward-fix preferred. If a migration corrupted data, restore the pre-deploy backup, then redeploy the prior app version. Never edit an applied migration — add a new one.

## Monitoring & alerting

- **Uptime:** poll `GET /api/v1/health` every 30s; page on two consecutive 503s.
- **Errors:** set `SENTRY_DSN` to capture exceptions (env-gated, no-op when unset).
- **Logs:** structured JSON via Pino (`LOG_LEVEL`); ship to your aggregator.
- **Product analytics:** set `NEXT_PUBLIC_POSTHOG_KEY` for funnels/retention.

## Quarterly DR drill

Restore the latest backup into a scratch database, run the verification steps, and record actual RTO. Update this runbook with findings.
