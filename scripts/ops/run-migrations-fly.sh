#!/bin/bash
# Run database migrations on Fly.io production database
# Usage: ./scripts/ops/run-migrations-fly.sh

set -e

echo "🔄 Running migrations on Fly.io production database..."
echo ""

# Get database connection details from Fly.io
echo "Getting database connection details..."
echo "Note: You may need to set DATABASE_URL manually if this fails"
echo ""

# Try to get connection string from Fly.io secrets
# If that doesn't work, use flyctl proxy method
echo "Option 1: Using flyctl proxy (recommended)"
echo "  1. Run: flyctl proxy 5432 -a ryla-db-prod"
echo "  2. In another terminal, get connection details and run:"
echo "     DATABASE_URL=\"postgresql://user:pass@localhost:5432/ryla\" pnpm db:migrate"
echo ""
echo "Option 2: Get connection string from Fly.io"
echo "  flyctl postgres connect -a ryla-db-prod"
echo ""
echo "Option 3: Run migrations via API app SSH"
echo "  flyctl ssh console -a ryla-api-prod"
echo "  # Then migrations will run automatically on next deployment"
