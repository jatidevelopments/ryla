# Infisical Secrets Template

This document lists all secrets that should be configured in Infisical for the RYLA project.
Use this as a reference when setting up a new environment.

## Folder Structure

```
RYLA Project
├── /mcp
├── /apps/api
├── /apps/web
├── /apps/funnel
├── /apps/landing
├── /shared
└── /test
```

---

## `/mcp` - MCP Server Secrets

Secrets used by MCP servers in Cursor IDE.

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RYLA_API_URL` | RYLA API base URL | `http://localhost:3001` |
| `RYLA_DEV_TOKEN` | Long-lived dev token for RYLA API | `eyJhbGciOiJIUzI1N...` |
| `GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_xxxxxxxxxxxx` |
| `GITHUB_PERSONAL_ACCESS_TOKEN` | Alias for GitHub MCP server | `ghp_xxxxxxxxxxxx` |
| `SLACK_BOT_TOKEN` | Slack Bot OAuth Token | `xoxb-xxxxxxxxxxxx` |
| `SLACK_TEAM_ID` | Slack Team/Workspace ID | `T0123456789` |
| `RUNPOD_API_KEY` | RunPod API Key | `rp_xxxxxxxxxxxx` |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | `xxxxxxxxxxxx` |
| `SNYK_API_KEY` | Snyk API Key | `xxxxxxxxxxxx` |
| `SNYK_ORG_ID` | Snyk Organization ID | `xxxxxxxxxxxx` |
| `POSTHOG_AUTH_HEADER` | PostHog Bearer token | `Bearer phx_xxxx` |
| `PLAYWRIGHT_BASE_URL` | Base URL for Playwright tests | `http://localhost:4200` |

---

## `/apps/api` - Backend API Secrets

Secrets for the NestJS backend API (`apps/api`).

### Application

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `APP_PORT` | API server port | `3001` |
| `APP_HOST` | API server host | `localhost` |
| `APP_ENVIRONMENT` | Environment name | `local`, `staging`, `production` |

### Database (PostgreSQL)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `POSTGRES_HOST` | Database host | `localhost` |
| `POSTGRES_PORT` | Database port | `5432` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `secret` |
| `POSTGRES_DB` | Database name | `ryla` |
| `POSTGRES_ENVIRONMENT` | DB environment | `local` |

### Redis

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `REDIS_URL` | Full Redis URL (preferred) | `redis://user:pass@host:6379` |
| `REDIS_HOST` | Redis host (fallback) | `localhost` |
| `REDIS_PORT` | Redis port (fallback) | `6379` |
| `REDIS_PASSWORD` | Redis password (fallback) | `secret` |

### JWT Authentication

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `JWT_ACCESS_SECRET` | Access token secret (32+ chars) | `your-super-secret-key` |
| `JWT_REFRESH_SECRET` | Refresh token secret (32+ chars) | `your-refresh-secret` |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (seconds) | `3600` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (seconds) | `86400` |
| `JWT_ACTION_FORGOT_PASSWORD_SECRET` | Password reset secret | `forgot-password-secret` |
| `JWT_ACTION_FORGOT_PASSWORD_EXPIRES_IN` | Password reset TTL | `3600` |

### S3 Storage

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `AWS_S3_REGION` | S3 region | `us-east-1` |
| `AWS_S3_ACCESS_KEY` | S3 access key | `AKIA...` |
| `AWS_S3_SECRET_KEY` | S3 secret key | `xxxx` |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | `ryla-images` |
| `AWS_S3_URL_TTL` | Presigned URL TTL (seconds) | `86400` |
| `AWS_S3_ENDPOINT` | Custom endpoint (MinIO/R2) | `http://localhost:9000` |
| `AWS_S3_FORCE_PATH_STYLE` | Path style access | `false` |

### AI/LLM

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RUNPOD_API_KEY` | RunPod API key | `rp_xxx` |
| `RUNPOD_ENDPOINT_FLUX_DEV` | Flux dev endpoint ID | `abc123` |
| `RUNPOD_ENDPOINT_Z_IMAGE_TURBO` | Z-Image Turbo endpoint ID | `xyz789` |
| `OPENROUTER_API_KEY` | OpenRouter API key | `sk-or-xxx` |
| `OPENROUTER_DEFAULT_MODEL` | Default LLM model | `openai/gpt-4o-mini` |
| `GEMINI_API_KEY` | Gemini API key (fallback) | `xxx` |
| `OPENAI_API_KEY` | OpenAI API key (fallback) | `sk-xxx` |

### Payments (Finby)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `FINBY_PROJECT_ID` | Finby project ID | `xxx` |
| `FINBY_SECRET_KEY` | Finby secret key | `xxx` |
| `FINBY_API_VERSION` | Finby API version | `v1` |
| `FINBY_API_KEY` | Finby API key (v1) | `xxx` |
| `FINBY_MERCHANT_ID` | Finby merchant ID | `xxx` |
| `PAYMENT_DEV_BYPASS` | Dev payment bypass | `false` |

### Other

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `BREVO_API_KEY` | Brevo email API key | `xxx` |
| `BREVO_API_URL` | Brevo API URL | `https://api.brevo.com/v3` |
| `SWAGGER_PASSWORD` | Swagger docs password | `admin` |
| `CRON_SECRET` | Cron job auth token | `xxx` |

---

## `/apps/web` - Web App Secrets

Secrets for the main web application (`apps/web`).

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_API_BASE_URL` | Alias for API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_CDN_URL` | CDN URL for images | `https://cdn.ryla.ai` |
| `NEXT_PUBLIC_SITE_URL` | Web app URL | `http://localhost:4200` |

---

## `/apps/funnel` - Funnel App Secrets

Secrets for the payment funnel (`apps/funnel`).

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Funnel URL | `http://localhost:4300` |
| `FINBY_API_KEY` | Finby API key | `xxx` |
| `FINBY_MERCHANT_ID` | Finby merchant ID | `xxx` |
| `FINBY_WEBHOOK_SECRET` | Finby webhook secret | `xxx` |
| `FINBY_PROJECT_ID` | Finby project ID | `xxx` |
| `FINBY_SECRET_KEY` | Finby secret key | `xxx` |
| `FINBY_TEST_MODE` | Test mode flag | `false` |

---

## `/apps/landing` - Landing Page Secrets

Secrets for the landing page (`apps/landing`).

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_SITE_URL` | Landing URL | `https://ryla.ai` |

---

## `/shared` - Shared Secrets

Secrets shared across multiple applications.

### Supabase

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbG...` |

### Analytics (PostHog)

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project key | `phc_xxx` |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog host | `https://us.i.posthog.com` |

### Email

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `RESEND_API_KEY` | Resend API key | `re_xxx` |
| `EMAIL_FROM` | Default from address | `noreply@ryla.ai` |
| `BUG_REPORT_NOTIFICATION_EMAIL` | Bug report recipient | `team@ryla.ai` |

---

## `/test` - Test Fixtures

Test accounts and credentials for development/testing.

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `TEST_USER_EMAIL` | Test user email | `mcptest99@ryla.dev` |
| `TEST_USER_PASSWORD` | Test user password | `TestPass123!` |
| `TEST_USER_ID` | Test user UUID | `e57e0a15-cb59-4343-9c40-e31f3331086d` |
| `TEST_USER_PUBLIC_NAME` | Test user public name | `mcptester99` |

---

## Setup Commands

### Initial Setup

```bash
# Login to Infisical
infisical login

# Initialize project (run once per machine)
cd /path/to/RYLA
infisical init

# Create folder structure (admin only)
infisical folders create /mcp --env=dev
infisical folders create /apps/api --env=dev
infisical folders create /apps/web --env=dev
infisical folders create /apps/funnel --env=dev
infisical folders create /apps/landing --env=dev
infisical folders create /shared --env=dev
infisical folders create /test --env=dev
```

### Import Existing .env Files

```bash
# Import API secrets
infisical secrets set --path=/apps/api --env=dev < apps/api/.env

# Import shared secrets
cat config/env.template | grep -v "^#" | grep "=" | \
  while read line; do
    key=$(echo $line | cut -d= -f1)
    value=$(echo $line | cut -d= -f2-)
    if [ -n "$value" ] && [ "$value" != "your-*" ]; then
      infisical secrets set "$key=$value" --path=/shared --env=dev
    fi
  done
```

### Verify Setup

```bash
# List all secrets in a path
infisical secrets --path=/mcp --env=dev

# Test running with secrets
infisical run --path=/apps/api --path=/shared --env=dev -- echo "Secrets loaded successfully"
```

---

## Environment Reference

| Environment | Description | Who Can Access |
|-------------|-------------|----------------|
| `dev` | Local development | All developers |
| `staging` | Staging/preview | Developers, CI/CD |
| `prod` | Production | Admin, CI/CD only |

---

## Related Documentation

- Setup Guide: `docs/technical/INFISICAL-SETUP.md`
- Cursor Rule: `.cursor/rules/infisical.mdc`
- MCP Config: `.cursor/mcp.json.infisical.example`
