#!/usr/bin/env bash
# Nova Retail — PostgreSQL backup.
# Dumps the database from the running compose container to ./backups/<timestamp>.sql.gz.
# Usage: bash scripts/backup.sh   (override container/db/user via env vars)
set -euo pipefail

CONTAINER="${PG_CONTAINER:-retail-platform-postgres-1}"
DB="${POSTGRES_DB:-retail}"
USER="${POSTGRES_USER:-retail}"
OUT_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

mkdir -p "$OUT_DIR"
STAMP="$(date +%Y%m%d_%H%M%S)"
OUT="$OUT_DIR/${DB}_${STAMP}.sql.gz"

echo "Backing up '$DB' from container '$CONTAINER' → $OUT"
docker exec "$CONTAINER" pg_dump -U "$USER" -d "$DB" --clean --if-exists | gzip > "$OUT"

echo "Done: $(du -h "$OUT" | cut -f1) $OUT"

# Prune backups older than retention window.
find "$OUT_DIR" -name "${DB}_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -print -delete || true
echo "Pruned backups older than ${RETENTION_DAYS} days."
