# Backend API Setup Guide

The funnel app uses the RYLA backend API for session and option storage. All data is stored in the main Postgres database.

## Environment Variables

Add these environment variables to your `.env.local` file for local development:

```bash
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai

# Optional: Enable backend API in development (defaults to disabled)
# NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API=false

# Optional: Enable debug logging for backend API operations
NEXT_PUBLIC_DEBUG_FUNNEL_API=false
```

For production deployment, these are already included in the `deploy` command in `package.json`.

### Development Mode

**By default, backend API operations are disabled in development** to prevent test data from being saved to production database.

To enable backend API in development (for testing), set:

```bash
NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API=true
```

### Debug Logging

To enable detailed console logging for all backend API operations, set:

```bash
NEXT_PUBLIC_DEBUG_FUNNEL_API=true
```

When enabled, you'll see detailed logs in the browser console for:
- Session creation and updates
- Option saves (individual and batch)
- Email and waitlist updates
- Step updates
- Operation durations and error details
- Warnings when operations are skipped in development

This is useful for debugging API operations during development. Debug logs will show `⚠️ Backend API disabled in development` messages when operations are skipped.

## Database Setup

The backend API uses the main Postgres database. Tables are created via Drizzle migrations:

- `funnel_sessions` - Stores session data
- `funnel_options` - Stores option data

### Migration

To create the tables, run:

```bash
pnpm db:migrate
```

This will apply the migration `0016_create_funnel_tables.sql` which creates both tables with proper indexes and constraints.

## API Endpoints

All endpoints are under `/funnel/`:

- `POST /funnel/sessions` - Create session
- `PUT /funnel/sessions/:sessionId` - Update session
- `GET /funnel/sessions/:sessionId` - Get session
- `POST /funnel/sessions/:sessionId/options` - Save single option
- `POST /funnel/sessions/:sessionId/options/batch` - Save multiple options
- `GET /funnel/sessions/:sessionId/options` - Get all options

All endpoints support anonymous access (no authentication required).

## Testing

After setup, you can test the integration by:

1. Starting the development server: `npm run dev`
2. Navigating through the funnel
3. Checking the backend API logs to see sessions and options being created

## Troubleshooting

### API errors

- Verify environment variables are set correctly
- Check that the backend API is running and accessible
- Ensure `NEXT_PUBLIC_API_BASE_URL` points to the correct backend
- Check browser console for detailed error messages

### Operations not working in development

- Ensure `NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API=true` is set
- Check that `NODE_ENV` is set to `development`
- Verify backend API is accessible from the frontend

### Database connection issues

- Verify backend API database connection
- Check that migrations have been applied
- Verify tables exist: `SELECT * FROM funnel_sessions LIMIT 1;`
