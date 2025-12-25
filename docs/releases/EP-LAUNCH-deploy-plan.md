# EP-LAUNCH: Deployment Plan

## Overview
This document outlines the deployment process for the Ryla Web Application (`apps/web`). We use [Fly.io](https://fly.io) for hosting the containerized Next.js application.

## Prerequisites
- [x] Fly.io CLI installed (`brew install flyctl`)
- [x] Fly.io account (`fly auth login`)
- [x] Docker installed (for local build verification)
- [x] `apps/web/Dockerfile` verified
- [x] `apps/web/fly.toml` configured

## 1. Environment Variables
Ensure these secrets are set in Fly.io before deployment:

```bash
# Production Secrets
fly secrets set NEXT_PUBLIC_SUPABASE_URL=... \
                NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
                --app ryla-web
```

> [!CAUTION]
> Never commit `.env` files. Use `fly secrets set` for sensitive data.

## 2. Deployment Command
Run the following from the root of the workspace:
```bash
# Deploy web app
fly deploy --config apps/web/fly.toml --dockerfile apps/web/Dockerfile
```

## 3. Verification Steps
After deployment:
1. Visit `https://ryla-web.fly.dev`
2. specific check: Ensure "Sign Up" flow loads.
3. specific check: Ensure static assets (images/fonts) load correctly.

## 4. Rollback Plan
If validation fails:
```bash
# Check status
fly status --app ryla-web

# Revert to previous version (find version ID via 'fly releases')
# fly deploy --image registry.fly.io/ryla-web:previous-tag
```
