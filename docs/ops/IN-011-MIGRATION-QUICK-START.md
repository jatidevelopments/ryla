# IN-011 Migration Quick Start

**Quick reference for running Template Gallery migrations**

## Prerequisites

- [ ] Infisical CLI installed and authenticated
- [ ] Access to staging/production database credentials in Infisical
- [ ] All migration files present in `drizzle/migrations/`

## Quick Commands

### Staging

```bash
# Option 1: Use the script (recommended)
./scripts/ops/run-in-011-migrations.sh staging

# Option 2: Manual command
infisical run --path=/apps/api --path=/shared --env=staging -- drizzle-kit migrate
```

### Production

```bash
# Option 1: Use the script (recommended)
./scripts/ops/run-in-011-migrations.sh prod

# Option 2: Manual command
infisical run --path=/apps/api --path=/shared --env=prod -- drizzle-kit migrate
```

## Verify Migrations Applied

```bash
# Connect to database
infisical run --path=/apps/api --env=staging -- psql $DATABASE_URL

# Check migration status
SELECT * FROM drizzle.__drizzle_migrations 
WHERE name LIKE '%0010%' OR name LIKE '%0011%' OR name LIKE '%0012%' OR name LIKE '%0013%'
ORDER BY created_at DESC;
```

## What Gets Created

- ✅ `template_sets` table
- ✅ `template_set_members` table  
- ✅ `template_set_likes` table
- ✅ `template_categories` table (with seed data)
- ✅ `template_tags` table
- ✅ `template_tag_assignments` table
- ✅ `template_likes` table
- ✅ `template_trending` materialized view
- ✅ `templates.category_id` column
- ✅ `templates.likes_count` column
- ✅ Removes `qualityMode` from `templates.config` JSONB

## Full Documentation

See `docs/ops/IN-011-MIGRATION-GUIDE.md` for:
- Detailed verification steps
- Rollback procedures
- Troubleshooting
- Post-migration tasks
