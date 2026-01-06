# Port Configuration

This document outlines the port assignments for all applications in the RYLA monorepo.

## Port Assignments

| App         | Port   | Description                      |
| ----------- | ------ | -------------------------------- |
| **web**     | `3000` | Main web application (Next.js)   |
| **api**     | `3001` | Backend API server (NestJS)      |
| **funnel**  | `3002` | Funnel/onboarding app (Next.js)  |
| **landing** | `3003` | Landing page app (Next.js)       |
| **admin**   | `3004` | Admin dashboard (if implemented) |

## Configuration

### Next.js Apps (web, funnel, landing)

Ports are configured in each app's `project.json` file under the `serve` target:

```json
{
  "serve": {
    "options": {
      "port": 3000 // or 3002, 3003
    }
  }
}
```

### API Server

The API server uses the `APP_PORT` environment variable (defaults to `3000` if not set, but should be `3001`).

Set in `.env`:

```bash
APP_PORT=3001
```

Or in `apps/api/.env`:

```bash
APP_PORT=3001
```

## Running Multiple Apps

To run all apps simultaneously:

```bash
# Terminal 1: Web app
npx nx serve web

# Terminal 2: API
npx nx serve api

# Terminal 3: Funnel
npx nx serve funnel

# Terminal 4: Landing
npx nx serve landing
```

Or use a process manager like `concurrently`:

```bash
npx concurrently \
  "nx serve web" \
  "nx serve api" \
  "nx serve funnel" \
  "nx serve landing"
```

## Port Conflicts

If a port is already in use:

1. **Find the process:**

   ```bash
   lsof -i :3000  # Replace with your port
   ```

2. **Kill the process:**

   ```bash
   kill <PID>
   ```

3. **Or use a different port temporarily:**
   ```bash
   PORT=3005 npx nx serve web
   ```

## Environment Variables

For Next.js apps, you can also override the port using the `PORT` environment variable:

```bash
PORT=3005 npx nx serve web
```

Note: The `PORT` env var takes precedence over the `project.json` configuration.
