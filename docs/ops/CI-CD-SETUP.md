# CI/CD Pipeline Setup Guide

## Overview

This repository uses GitHub Actions for automated CI/CD with Nx affected detection. The pipeline automatically deploys only changed apps when pushing to `main`.

## Architecture

### Workflow: `deploy-auto.yml`

**Trigger:** Push to `main` branch

**Process:**
1. **Detect Changes**: Uses Nx affected to detect which apps changed
2. **Conditional Deploy**: Only deploys apps that have changes
3. **Build Args**: Automatically includes build-time env vars for Next.js apps

### Apps and Build Requirements

| App | Type | Build Args Needed? | Build Args |
|-----|------|-------------------|------------|
| `web` | Next.js | ✅ Yes | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_SUPABASE_*` |
| `api` | NestJS | ❌ No | None (runtime only) |
| `funnel` | Next.js | ✅ Yes | `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, etc. |
| `landing` | Next.js | ✅ Yes | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_DEBUG_CDN` |

## Required GitHub Secrets

### Fly.io
- `FLY_API_TOKEN` - Fly.io API token for deployments

### Web App Build Args
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://end.ryla.ai`)
- `NEXT_PUBLIC_SITE_URL` - Web app URL (e.g., `https://app.ryla.ai`)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (e.g., `https://us.i.posthog.com`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL (if used)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (if used)

### Funnel App Build Args
- `NEXT_PUBLIC_CDN_URL` - CDN URL for assets
- `NEXT_PUBLIC_DEBUG_CDN` - CDN debug flag
- `NEXT_PUBLIC_SITE_URL_FUNNEL` - Funnel app URL (e.g., `https://goviral.ryla.ai`)
- `NEXT_PUBLIC_API_BASE_URL` - API base URL
- `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT` - Payment redirect path
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog key
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Landing App Build Args
- `NEXT_PUBLIC_SITE_URL_LANDING` - Landing page URL (e.g., `https://www.ryla.ai`)
- `NEXT_PUBLIC_CDN_URL` - CDN URL
- `NEXT_PUBLIC_DEBUG_CDN` - CDN debug flag

### Optional
- `SLACK_WEBHOOK_DEPLOYS` - Slack webhook for deployment notifications

## Setup Instructions

### 1. Add GitHub Secrets

Go to: `Settings > Secrets and variables > Actions > New repository secret`

Add all required secrets listed above.

### 2. Verify Nx Configuration

Ensure `nx.json` is properly configured for affected detection:

```bash
pnpm nx affected --base=main~1 --head=main
```

### 3. Test the Workflow

1. Make a change to an app (e.g., `apps/web`)
2. Push to `main` branch
3. Check GitHub Actions tab
4. Verify only the changed app deploys

## How It Works

### Nx Affected Detection

The workflow uses Nx to detect which apps changed:

```bash
pnpm nx affected --base=$BASE --head=$HEAD --plain
```

This compares the current commit with the base commit and returns affected projects.

### Conditional Deployment

Each app has a separate job that only runs if that app is affected:

```yaml
if: needs.detect-changes.outputs.web == 'true'
```

### Build Args for Next.js

Next.js apps require `NEXT_PUBLIC_*` variables at build time because they're embedded in the JavaScript bundle. The workflow automatically passes these as `--build-arg` flags:

```yaml
--build-arg NEXT_PUBLIC_API_URL="${{ secrets.NEXT_PUBLIC_API_URL }}"
```

### Dockerfile Support

The Dockerfiles for Next.js apps accept these build args:

```dockerfile
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
```

## Manual Deployment

You can still deploy manually using the existing workflows:

- `deploy-production.yml` - Manual production deploy (all apps)
- `deploy-staging.yml` - Staging deploy on push to main

Or use the package.json scripts:

```bash
pnpm deploy:landing
pnpm deploy:funnel
```

## Troubleshooting

### App Not Deploying

1. Check if the app is in the affected list:
   ```bash
   pnpm nx affected --base=main~1 --head=main
   ```

2. Verify the app name matches exactly (case-sensitive)

3. Check GitHub Actions logs for the "Detect affected apps" step

### Build Args Missing

1. Verify the secret exists in GitHub Settings
2. Check the Dockerfile has `ARG` declarations
3. Verify the workflow passes the `--build-arg` flag

### Nx Affected Not Working

1. Ensure `fetch-depth: 0` in checkout step (needs full history)
2. Check `nx.json` configuration
3. Verify git history is available

## Best Practices

1. **Always test locally first** - Build with the same args locally
2. **Use feature branches** - Only merge to `main` when ready
3. **Monitor deployments** - Check health checks after deploy
4. **Keep secrets updated** - Update GitHub secrets when env vars change
5. **Review affected apps** - Check the detection step output

## Related Documentation

- [Deployment Quick Start](./DEPLOYMENT-QUICK-START.md)
- [Fly.io Setup](./FLY-IO-SETUP.md)
- [Environment Variables](../requirements/ENV-VARIABLES.md)
