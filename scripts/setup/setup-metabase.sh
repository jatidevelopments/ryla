#!/usr/bin/env bash
# Start Metabase (IN-041) via Docker for local BI over RYLA Postgres.
# Add RYLA Postgres as a data source in Metabase UI after first start.
# Requires: Docker, Infisical (for DATABASE_URL when adding data source).
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RYLA_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
METABASE_PORT="${METABASE_PORT:-3040}"
CONTAINER_NAME="${METABASE_CONTAINER_NAME:-ryla-metabase}"

echo "[Metabase] RYLA root: $RYLA_ROOT"
echo "[Metabase] Port: $METABASE_PORT"
echo ""

# Already running: just report URL (default port 3040, no env needed)
if docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[Metabase] Already running."
  echo ""
  echo "[Metabase] Metabase is at http://localhost:${METABASE_PORT}"
  echo "[Metabase] 1. Complete first-time setup (admin user)."
  echo "[Metabase] 2. Add RYLA Postgres: Settings → Databases → Add database (use DATABASE_URL from Infisical)."
  echo "[Metabase] 3. Create API key for MCP: Settings → Admin → Authentication → API Keys."
  echo "[Metabase] Docs: docs/technical/METABASE-SETUP.md | Initiative: docs/initiatives/IN-041-metabase-integration.md"
  exit 0
fi

# Exists but stopped (e.g. failed run on wrong port): remove and recreate with current port
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "[Metabase] Container ${CONTAINER_NAME} exists but not running. Removing and recreating on port ${METABASE_PORT}..."
  docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
fi

echo "[Metabase] Creating and starting container ${CONTAINER_NAME} on port ${METABASE_PORT}..."
docker run -d \
  --name "$CONTAINER_NAME" \
  -p "${METABASE_PORT}:3000" \
  metabase/metabase

echo ""
echo "[Metabase] Metabase is at http://localhost:${METABASE_PORT}"
echo "[Metabase] 1. Complete first-time setup (admin user)."
echo "[Metabase] 2. Add RYLA Postgres: Settings → Databases → Add database (use DATABASE_URL from Infisical)."
echo "[Metabase] 3. Create API key for MCP: Settings → Admin → Authentication → API Keys."
echo "[Metabase] Docs: docs/technical/METABASE-SETUP.md | Initiative: docs/initiatives/IN-041-metabase-integration.md"
