#!/usr/bin/env bash
set -euo pipefail

# ====================================================================
# PAPAYA DATA ENGINEER: Database Backup & Snapshot Script
# Supports both SQLite local file snapshot and PostgreSQL pg_dump.
# ====================================================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../../../" && pwd)"
BACKUP_DIR="${ROOT_DIR}/data/backups"
TIMESTAMP="$(date +'%Y%m%d_%H%M%S')"

mkdir -p "${BACKUP_DIR}"

echo "===================================================================="
echo "💾 PAPAYA DATA ENGINEER: Initiating Database Backup..."
echo "===================================================================="

# Load environment variables if .env exists
if [ -f "${ROOT_DIR}/.env" ]; then
  # shellcheck disable=SC1091
  source "${ROOT_DIR}/.env" || true
fi

DB_URL="${DATABASE_URL:-file:./data/papaya_claims.db}"

if [[ "${DB_URL}" == file:* ]]; then
  RAW_PATH="${DB_URL#file:}"
  # Normalize relative path (e.g. ../../data/papaya_claims.db or ./data/papaya_claims.db)
  CLEAN_REL_PATH=$(echo "${RAW_PATH}" | sed -E 's|^(\.\./)+||; s|^\./||')
  SQLITE_PATH="${ROOT_DIR}/${CLEAN_REL_PATH}"

  BACKUP_FILE="${BACKUP_DIR}/papaya_sqlite_${TIMESTAMP}.db"
  echo "📦 Database Type: SQLite"
  echo "🔍 Source Path: ${SQLITE_PATH}"

  if [ -f "${SQLITE_PATH}" ]; then
    cp "${SQLITE_PATH}" "${BACKUP_FILE}"
    echo "✅ SQLite snapshot successfully created: ${BACKUP_FILE}"
  else
    echo "⚠️ Source SQLite database file not found at ${SQLITE_PATH}. Nothing to backup."
  fi

elif [[ "${DB_URL}" == postgresql:* ]] || [[ "${DB_URL}" == postgres:* ]]; then
  BACKUP_FILE="${BACKUP_DIR}/papaya_postgres_${TIMESTAMP}.sql"
  echo "📦 Database Type: PostgreSQL"
  echo "🔍 Target File: ${BACKUP_FILE}"

  if command -v pg_dump >/dev/null 2>&1; then
    pg_dump "${DB_URL}" > "${BACKUP_FILE}"
    echo "✅ PostgreSQL dump successfully created: ${BACKUP_FILE}"
  else
    echo "⚠️ pg_dump command not found on host. Backup skipped."
  fi
else
  echo "❌ Unsupported DATABASE_URL protocol: ${DB_URL}"
  exit 1
fi

echo "===================================================================="
echo "🎉 Backup operation completed at $(date)"
echo "===================================================================="
