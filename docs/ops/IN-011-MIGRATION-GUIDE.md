# IN-011 Database Migration Guide

**Initiative**: IN-011 (Template Gallery & Content Library)  
**Date**: 2026-01-19  
**Migrations**: 0010, 0011, 0012, 0013

## Overview

This guide covers running the 4 new database migrations for the Template Gallery initiative on staging and production environments.

## Migrations to Apply

| Migration | File | Description |
|-----------|------|-------------|
| 0010 | `0010_remove_quality_mode.sql` | Removes qualityMode from templates config JSONB |
| 0011 | `0011_create_template_sets.sql` | Creates template_sets, template_set_members, template_set_likes tables |
| 0012 | `0012_create_categories_tags.sql` | Creates template_categories, template_tags, template_tag_assignments tables |
| 0013 | `0013_create_template_likes_trending.sql` | Creates template_likes table and template_trending materialized view |

## Pre-Migration Checklist

- [ ] Verify all migrations are in `drizzle/migrations/` directory
- [ ] Review migration SQL files for correctness
- [ ] Backup staging database
- [ ] Verify Infisical has correct database credentials for staging
- [ ] Ensure no active deployments are running

## Running Migrations on Staging

### Option 1: Using Infisical (Recommended)

```bash
# From project root
cd /Users/admin/Documents/Projects/RYLA

# Run migrations on staging
infisical run --path=/apps/api --path=/shared --env=staging -- drizzle-kit migrate
```

**What this does:**
- Loads database credentials from Infisical (`/apps/api` and `/shared` paths)
- Uses `staging` environment
- Runs `drizzle-kit migrate` which applies all pending migrations

### Option 2: Manual Environment Variables

If Infisical is not available, set environment variables manually:

```bash
export POSTGRES_HOST="your-staging-host"
export POSTGRES_PORT="5432"
export POSTGRES_USER="your-staging-user"
export POSTGRES_PASSWORD="your-staging-password"
export POSTGRES_DB="ryla"
export POSTGRES_ENVIRONMENT="staging"
export POSTGRES_SSL="true"  # Usually true for remote databases

# Then run migration
pnpm drizzle-kit migrate
```

### Option 3: Via API App (Automatic)

The API app automatically runs migrations on startup via `runMigrations()`. If you deploy the updated API code, migrations will run automatically.

**Note**: This is the safest option as it ensures migrations run in the correct order with the application code.

## Verification Steps

After running migrations, verify they were applied:

### 1. Check Migration Status

```bash
# Connect to staging database
infisical run --path=/apps/api --env=staging -- psql $DATABASE_URL

# Check migration table
SELECT * FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 10;
```

You should see entries for:
- `0010_remove_quality_mode`
- `0011_create_template_sets`
- `0012_create_categories_tags`
- `0013_create_template_likes_trending`

### 2. Verify Tables Created

```sql
-- Check template_sets table exists
SELECT COUNT(*) FROM template_sets;

-- Check template_categories table exists
SELECT COUNT(*) FROM template_categories;

-- Check template_tags table exists
SELECT COUNT(*) FROM template_tags;

-- Check template_likes table exists
SELECT COUNT(*) FROM template_likes;

-- Check template_trending materialized view exists
SELECT COUNT(*) FROM template_trending;
```

### 3. Verify Columns Added

```sql
-- Check templates table has new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND column_name IN ('category_id', 'likes_count');

-- Check qualityMode was removed from config JSONB
SELECT id, config->>'qualityMode' as quality_mode 
FROM templates 
WHERE config ? 'qualityMode' 
LIMIT 5;
-- Should return 0 rows (or only rows that need manual cleanup)
```

### 4. Verify Indexes Created

```sql
-- Check indexes on templates
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'templates' 
AND indexname LIKE '%category%' OR indexname LIKE '%likes%';

-- Should see:
-- templates_category_idx
-- templates_likes_count_idx
```

### 5. Verify Seed Data

```sql
-- Check initial categories were seeded
SELECT name, slug FROM template_categories WHERE parent_id IS NULL;
-- Should see: Scene, Style, Mood, Activity

-- Check child categories
SELECT name, slug, parent_id FROM template_categories WHERE parent_id IS NOT NULL;
-- Should see multiple child categories
```

## Rollback Plan

If migrations fail or need to be rolled back:

### Rollback 0013 (Template Likes)

```sql
-- Drop materialized view
DROP MATERIALIZED VIEW IF EXISTS template_trending;

-- Drop table
DROP TABLE IF EXISTS template_likes CASCADE;

-- Remove column from templates
ALTER TABLE templates DROP COLUMN IF EXISTS likes_count;
```

### Rollback 0012 (Categories & Tags)

```sql
-- Drop tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS template_tag_assignments CASCADE;
DROP TABLE IF EXISTS template_tags CASCADE;
DROP TABLE IF EXISTS template_categories CASCADE;

-- Remove column from templates
ALTER TABLE templates DROP COLUMN IF EXISTS category_id;
```

### Rollback 0011 (Template Sets)

```sql
-- Drop tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS template_set_likes CASCADE;
DROP TABLE IF EXISTS template_set_members CASCADE;
DROP TABLE IF EXISTS template_sets CASCADE;
```

### Rollback 0010 (Quality Mode)

```sql
-- Note: This migration only removes data from JSONB, not columns
-- To restore, you would need to manually add qualityMode back to config JSONB
-- This is typically not needed as qualityMode is deprecated
```

## Production Deployment

After staging is verified:

1. **Backup Production Database**
   ```bash
   # Use your production backup tool
   # For Fly.io: flyctl postgres backup create -a ryla-db-prod
   ```

2. **Run Migrations on Production**
   ```bash
   # Option 1: Via Infisical
   infisical run --path=/apps/api --path=/shared --env=prod -- drizzle-kit migrate
   
   # Option 2: Deploy API (migrations run automatically)
   # This is the recommended approach
   ```

3. **Verify Production**
   - Repeat all verification steps above
   - Monitor application logs for errors
   - Check PostHog for template-related events

## Troubleshooting

### Migration Fails with "relation already exists"

This means the migration was partially applied. Check which tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('template_sets', 'template_categories', 'template_tags', 'template_likes');
```

If some tables exist, you may need to manually complete the migration or rollback and retry.

### Migration Fails with "column already exists"

Check if columns were already added:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'templates' 
AND column_name IN ('category_id', 'likes_count');
```

If columns exist, the migration may have been partially applied. Review the migration file and manually complete any missing steps.

### Connection Issues

If you can't connect to the database:

1. Verify Infisical credentials are correct:
   ```bash
   infisical secrets --path=/apps/api --env=staging
   ```

2. Check network connectivity:
   ```bash
   # Test connection
   psql "postgresql://user:pass@host:port/db" -c "SELECT 1;"
   ```

3. Verify SSL settings match your database configuration

## Post-Migration Tasks

After successful migration:

- [ ] Update application code is deployed (if not already)
- [ ] Test template gallery UI on staging
- [ ] Verify template creation works
- [ ] Test template sets creation
- [ ] Verify category filtering works
- [ ] Test likes functionality
- [ ] Monitor error logs for 24 hours
- [ ] Check PostHog analytics for template events

## Support

If you encounter issues:

1. Check migration logs in the API app logs
2. Review `drizzle/__drizzle_migrations` table for applied migrations
3. Check database connection logs
4. Contact the team via Slack #mvp-ryla-dev

## Related Documentation

- Migration Guide: `docs/technical/guides/DRIZZLE-MIGRATION.md`
- Database Schema Guide: `docs/technical/guides/DRIZZLE-SCHEMAS.md`
- Initiative: `docs/initiatives/IN-011-template-gallery-content-library.md`
