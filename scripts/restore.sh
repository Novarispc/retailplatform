#!/usr/bin/env bash
# Nova Retail — PostgreSQL restore.
# Restores a gzipped dump into the running compose container.
# Usage: bash scripts/restore.sh ./backups/retail_20260614_120000.sql.gz
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: bash scripts/restore.sh <path-to-backup.sql.gz>" >&2
  exit 1
fi

DUMP="$1"
CONTAINER="${PG_CONTAINER:-retail-platform-postgres-1}"
DB="${POSTGRES_DB:-retail}"
USER="${POSTGRES_USER:-retail}"

if [ ! -f "$DUMP" ]; then
  echo "Backup file not found: $DUMP" >&2
  exit 1
fi

echo "⚠️  This OVERWRITES database '$DB'. Press Ctrl-C within 5s to abort."
sleep 5

echo "Restoring $DUMP → '$DB' on container '$CONTAINER'"
gunzip -c "$DUMP" | docker exec -i "$CONTAINER" psql -U "$USER" -d "$DB"
echo "Restore complete."
