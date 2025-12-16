# Supabase Setup Guide

## Environment Variables

Add these environment variables to your `.env.local` file for local development:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://wkmhcjjphidaaxsulhrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA

# Optional: Enable Supabase in development (defaults to disabled)
# NEXT_PUBLIC_ENABLE_DEV_SUPABASE=false

# Optional: Enable debug logging for Supabase operations
NEXT_PUBLIC_DEBUG_SUPABASE=false
```

For production deployment, these are already included in the `deploy` command in `package.json`.

### Development Mode

**By default, Supabase operations are disabled in development** to prevent test data from being saved to production database.

To enable Supabase in development (for testing), set:

```bash
NEXT_PUBLIC_ENABLE_DEV_SUPABASE=true
```

### Debug Logging

To enable detailed console logging for all Supabase database operations, set:

```bash
NEXT_PUBLIC_DEBUG_SUPABASE=true
```

When enabled, you'll see detailed logs in the browser console for:

- Session creation and updates
- Option saves (individual and batch)
- Email and waitlist updates
- Step updates
- Operation durations and error details
- Warnings when operations are skipped in development

This is useful for debugging database operations during development. Debug logs will show `⚠️ Supabase disabled in development` messages when operations are skipped.

## Database Setup

### Step 1: Access Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `wkmhcjjphidaaxsulhrw`

### Step 2: Run Database Migration

1. Navigate to **SQL Editor** in the Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_create_funnel_tables.sql`
4. Paste into the SQL Editor
5. Click **Run** to execute the migration

### Step 3: Verify Tables Created

After running the migration, verify the tables were created:

1. Go to **Table Editor** in the Supabase dashboard
2. You should see two new tables:
    - `funnel_sessions`
    - `funnel_options`

### Step 4: Verify RLS Policies (Optional)

By default, the tables use the anon key which has limited permissions. If you need to adjust Row Level Security (RLS) policies:

1. Go to **Authentication** > **Policies** in Supabase dashboard
2. Configure RLS policies as needed for your use case

## Tables Structure

### `funnel_sessions`

- `id` (UUID, Primary Key)
- `session_id` (TEXT, Unique) - Client-generated session identifier
- `email` (TEXT, Nullable) - Payment email from step 34
- `on_waitlist` (BOOLEAN, Default: false) - Waitlist status from step 35
- `current_step` (INTEGER, Nullable) - Last step reached
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `funnel_options`

- `id` (UUID, Primary Key)
- `session_id` (TEXT, Foreign Key) - References `funnel_sessions.session_id`
- `option_key` (TEXT) - Field name from FunnelSchema
- `option_value` (JSONB) - Value (supports strings, numbers, booleans, arrays)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- Unique constraint on `(session_id, option_key)`

## Testing

After setup, you can test the integration by:

1. Starting the development server: `npm run dev`
2. Navigating through the funnel
3. Checking the Supabase dashboard to see sessions and options being created

## Troubleshooting

### Tables not appearing

- Ensure the migration ran successfully without errors
- Check the SQL Editor for any error messages
- Verify you're in the correct project

### Connection errors

- Verify environment variables are set correctly
- Check that the Supabase project is active (not paused)
- Ensure the anon key is correct and hasn't been rotated
