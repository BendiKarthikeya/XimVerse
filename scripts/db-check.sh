#!/usr/bin/env bash
set -euo pipefail

if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  source .env
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set."
  echo "Create .env from .env.example and set DATABASE_URL first."
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed. Install PostgreSQL client first."
  exit 1
fi

db_host="$(echo "$DATABASE_URL" | sed -E 's|^[^@]+@([^:/?]+).*$|\1|')"
db_port="$(echo "$DATABASE_URL" | sed -nE 's|^[^@]+@[^:/?]+:([0-9]+).*$|\1|p')"
db_port="${db_port:-5432}"

echo "Checking DNS for host: $db_host"
if ! dig +short "$db_host" | grep -q .; then
  echo "DNS resolution failed for $db_host"
  echo "Use the exact DB host from Supabase Dashboard > Project Settings > Database"
  exit 1
fi

echo "Checking TCP connectivity to $db_host:$db_port"
if ! nc -z "$db_host" "$db_port" >/dev/null 2>&1; then
  echo "Cannot reach $db_host:$db_port"
  exit 1
fi

echo "Running SQL health query"
PGCONNECT_TIMEOUT=8 psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "select now() as server_time;"

echo "Database connection is working."