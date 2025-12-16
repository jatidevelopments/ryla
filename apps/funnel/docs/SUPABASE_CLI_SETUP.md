# Supabase CLI Migration Setup

## Option 1: Using Access Token (Recommended)

1. Get your Supabase access token:
    - Go to [Supabase Dashboard](https://supabase.com/dashboard)
    - Navigate to Account Settings > Access Tokens
    - Create a new access token or use an existing one

2. Set the access token:

    ```bash
    export SUPABASE_ACCESS_TOKEN=your_access_token_here
    ```

3. Link the project:

    ```bash
    supabase link --project-ref wkmhcjjphidaaxsulhrw
    ```

4. Push the migration:
    ```bash
    supabase db push
    ```

## Option 2: Using Database Connection String

If you have the database password, you can push directly:

```bash
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.wkmhcjjphidaaxsulhrw.supabase.co:5432/postgres"
```

Replace `[YOUR-PASSWORD]` with your database password.

## Option 3: Manual via Dashboard (Quickest)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `wkmhcjjphidaaxsulhrw`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/001_create_funnel_tables.sql`
6. Click **Run**

## Verify Migration

After pushing, verify the tables were created:

1. Go to **Table Editor** in Supabase dashboard
2. You should see:
    - `funnel_sessions`
    - `funnel_options`
