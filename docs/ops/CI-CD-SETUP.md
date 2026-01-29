# CI/CD Pipeline Setup Guide

## Overview

This repository uses GitHub Actions for automated CI/CD with Nx affected detection. The pipeline automatically deploys only changed apps when pushing to `main`.

## Deployment Strategy

RYLA uses a **hybrid deployment strategy** optimized for each app's requirements:

| App       | Platform             | Reason                                             |
| --------- | -------------------- | -------------------------------------------------- |
| `landing` | **Cloudflare Pages** | Edge performance, global CDN, static-first         |
| `funnel`  | **Cloudflare Pages** | Edge performance, global CDN, conversion-optimized |
| `web`     | **Fly.io**           | Server-side features, WebSocket support            |
| `api`     | **Fly.io**           | Backend API, database connections                  |
| `admin`   | **Fly.io**           | Internal tool, server-side features                |

### Why This Split?

**Cloudflare Pages (Landing & Funnel):**

- Global edge network for fastest page loads
- Free tier with generous limits
- Automatic CDN and caching
- Ideal for marketing/conversion pages

**Fly.io (Web, API, Admin):**

- Full server-side rendering support
- WebSocket connections for real-time features
- Database and Redis connections
- Background job processing

## GitHub Actions Workflows

### Active Workflows

| Workflow                           | Purpose                    | Trigger                       |
| ---------------------------------- | -------------------------- | ----------------------------- |
| `deploy-auto.yml`                  | Main deployment (all apps) | Push to main/staging          |
| `deploy-modal.yml`                 | ComfyUI to Modal.com       | Push to main (modal paths)    |
| `cron-credit-refresh.yml`          | Daily credit refresh       | Daily at midnight UTC         |
| `publish-runpod-handlers-ghcr.yml` | Docker images for RunPod   | Push to main (handlers paths) |
| `test-serverless.yml`              | Serverless endpoint tests  | PR, push to main              |

### Disabled Workflows

| Workflow                            | Reason                                                  |
| ----------------------------------- | ------------------------------------------------------- |
| `automated-commit-sop.yml.disabled` | AI-powered CI (disabled pending Cursor API integration) |

### Removed Workflows

| Workflow                      | Reason                                                                 |
| ----------------------------- | ---------------------------------------------------------------------- |
| `test.yml`                    | Broken (used npm instead of pnpm), redundant with automated-commit-sop |
| `deploy-admin.yml`            | Redundant (admin deploys via deploy-auto.yml)                          |
| `deploy-cloudflare-pages.yml` | Merged into deploy-auto.yml                                            |

## Workflow: `deploy-auto.yml`

**Trigger:** Push to `main` or `staging` branch

**Process:**

1. **Detect Changes**: Uses git diff to detect which apps changed
2. **Conditional Deploy**: Only deploys apps that have changes
3. **Platform Routing**: Routes to Cloudflare Pages or Fly.io based on app
4. **Build Args**: Automatically includes build-time env vars for Next.js apps

### Apps and Build Requirements

| App       | Platform         | Build Args Needed? | Build Args                                                                                       |
| --------- | ---------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| `web`     | Fly.io           | ✅ Yes             | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_SUPABASE_*` |
| `api`     | Fly.io           | ❌ No              | None (runtime only)                                                                              |
| `admin`   | Fly.io           | ✅ Yes             | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_POSTHOG_*`, `NEXT_PUBLIC_SUPABASE_*` |
| `funnel`  | Cloudflare Pages | ✅ Yes             | `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, etc.                  |
| `landing` | Cloudflare Pages | ✅ Yes             | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_CDN_URL`, `NEXT_PUBLIC_DEBUG_CDN`                           |

## Required GitHub Secrets

### Infrastructure

| Secret                  | Purpose                                    |
| ----------------------- | ------------------------------------------ |
| `FLY_API_TOKEN`         | Fly.io API token for deployments           |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API token for Pages deployments |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID                      |
| `INFISICAL_TOKEN`       | Infisical secrets management               |

### Web App Build Args

- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., `https://end.ryla.ai`)
- `NEXT_PUBLIC_SITE_URL` - Web app URL (e.g., `https://app.ryla.ai`)
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog analytics key
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (e.g., `https://us.i.posthog.com`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

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

### 2. Cloudflare Pages Setup

1. Create Cloudflare Pages projects:

   - `ryla-landing` for landing app
   - `ryla-funnel` for funnel app

2. Configure build settings in Cloudflare:
   - Build command: (handled by GitHub Actions)
   - Build output: `dist/apps/{app}/.next`

### 3. Fly.io Setup

Apps are already configured with `fly.toml` files in each app directory.

### 4. Test the Workflow

1. Make a change to an app (e.g., `apps/web`)
2. Push to `main` branch
3. Check GitHub Actions tab
4. Verify only the changed app deploys

## How It Works

### Change Detection

The workflow uses git diff to detect which apps changed:

```bash
git diff --name-only $BASE..$HEAD
```

This compares the current commit with the base commit and checks for changes in `apps/{app}/` directories.

### Conditional Deployment

Each app has a separate job that only runs if that app is affected:

```yaml
if: needs.detect-changes.outputs.web == 'true'
```

### Platform Routing

- **Cloudflare Pages** (landing, funnel): Uses `cloudflare/pages-action@v1`
- **Fly.io** (web, api, admin): Uses `flyctl deploy`

### Build Args for Next.js

Next.js apps require `NEXT_PUBLIC_*` variables at build time because they're embedded in the JavaScript bundle.

**Fly.io apps:** Passed as `--build-arg` flags
**Cloudflare Pages apps:** Set as environment variables during build

## Manual Deployment

### Using GitHub Actions (workflow_dispatch)

1. Go to Actions tab
2. Select "Auto Deploy (Nx Affected)"
3. Click "Run workflow"
4. Select environment (staging/production)

### Using CLI

```bash
# Fly.io apps
pnpm deploy:web
pnpm deploy:api
pnpm deploy:admin

# Cloudflare Pages (via Wrangler)
pnpm nx build landing --configuration=production
wrangler pages publish dist/apps/landing/.next --project-name=ryla-landing
```

## Troubleshooting

### App Not Deploying

1. Check if the app has changes in the commit
2. Verify the app name matches exactly (case-sensitive)
3. Check GitHub Actions logs for the "Detect changed apps" step

### Build Args Missing

1. Verify the secret exists in GitHub Settings
2. For Fly.io: Check the Dockerfile has `ARG` declarations
3. For Cloudflare: Check env vars are passed to build step

### Cloudflare Pages Build Failing

1. Check if the build output path is correct
2. Verify `pnpm nx build {app}` works locally
3. Check Cloudflare Pages project exists

### Fly.io Deploy Failing

1. Check `FLY_API_TOKEN` is valid
2. Verify the app exists in Fly.io
3. Check the Dockerfile builds correctly locally

## Best Practices

1. **Always test locally first** - Build with the same args locally
2. **Use feature branches** - Only merge to `main` when ready
3. **Monitor deployments** - Check health checks after deploy
4. **Keep secrets updated** - Update GitHub secrets when env vars change
5. **Review affected apps** - Check the detection step output

## Related Documentation

- [Deployment Quick Start](./QUICK-START-DEPLOYMENT.md)
- [Fly.io Setup](./FLY-IO-DEPLOYMENT-GUIDE.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
- [Infisical Setup](./INFISICAL-SETUP-CHECKLIST.md)
- [Domain Registry](./DOMAIN-REGISTRY.md)
