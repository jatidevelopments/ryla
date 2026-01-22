#!/bin/bash
# Run IN-011 Template Gallery migrations on staging/production
# Usage: ./scripts/ops/run-in-011-migrations.sh [staging|prod]

set -e

ENV=${1:-staging}

if [[ "$ENV" != "staging" && "$ENV" != "prod" ]]; then
  echo "❌ Error: Environment must be 'staging' or 'prod'"
  echo "Usage: $0 [staging|prod]"
  exit 1
fi

echo "🔄 Running IN-011 Template Gallery migrations on $ENV..."
echo ""
echo "Migrations to apply:"
echo "  - 0010_remove_quality_mode.sql"
echo "  - 0011_create_template_sets.sql"
echo "  - 0012_create_categories_tags.sql"
echo "  - 0013_create_template_likes_trending.sql"
echo ""

# Confirm before proceeding
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Migration cancelled"
  exit 1
fi

# Check if migrations directory exists
if [ ! -d "drizzle/migrations" ]; then
  echo "❌ Error: drizzle/migrations directory not found"
  exit 1
fi

# Check if migration files exist
MISSING_MIGRATIONS=0
for migration in "0010_remove_quality_mode.sql" "0011_create_template_sets.sql" "0012_create_categories_tags.sql" "0013_create_template_likes_trending.sql"; do
  if [ ! -f "drizzle/migrations/$migration" ]; then
    echo "⚠️  Warning: Migration file not found: $migration"
    MISSING_MIGRATIONS=1
  fi
done

if [ $MISSING_MIGRATIONS -eq 1 ]; then
  echo "❌ Error: Some migration files are missing"
  exit 1
fi

echo "✅ All migration files found"
echo ""

# Run migrations via Infisical
echo "Running migrations via Infisical..."
infisical run --path=/apps/api --path=/shared --env=$ENV -- drizzle-kit migrate

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migrations completed successfully!"
  echo ""
  echo "Next steps:"
  echo "  1. Verify migrations were applied (see docs/ops/IN-011-MIGRATION-GUIDE.md)"
  echo "  2. Test the template gallery UI"
  echo "  3. Monitor application logs for errors"
else
  echo ""
  echo "❌ Migration failed. Check the error above."
  echo "See docs/ops/IN-011-MIGRATION-GUIDE.md for troubleshooting"
  exit 1
fi
