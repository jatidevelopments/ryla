#!/usr/bin/env bash
# Fetch recent logs from all deployed Modal split apps (for error review).
# Usage: ./fetch-app-logs.sh [seconds per app]
# Example: ./fetch-app-logs.sh 15
# Logs stream; each app is tailed for N seconds then killed. On macOS, 'timeout' is not used.

set -e
SECS="${1:-15}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPS="ryla-flux ryla-instantid ryla-qwen-image ryla-qwen-edit ryla-z-image ryla-wan26 ryla-seedvr2"

echo "Fetching Modal app logs (${SECS}s per app). Stop with Ctrl+C if needed."
echo ""

for app in $APPS; do
  echo "========== $app =========="
  ( modal app logs "$app" 2>&1 & PID=$!; sleep "$SECS"; kill $PID 2>/dev/null ) || true
  echo ""
done

echo "Done. See docs/ops/deployment/modal/MODAL-LOGS-REVIEW.md for error summary."
