# GitHub Secrets to Set for CI/CD

**URL**: https://github.com/jatidevelopments/ryla/settings/secrets/actions

Click "New repository secret" for each one below.

## Web App Build Args

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_API_URL` | `https://end.ryla.ai` |
| `NEXT_PUBLIC_SITE_URL` | `https://app.ryla.ai` |
| `NEXT_PUBLIC_POSTHOG_KEY` | `phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU` |
| `NEXT_PUBLIC_POSTHOG_HOST` | `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wkmhcjjphidaaxsulhrw.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA` |

## Funnel App Build Args

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_CDN_URL` | `https://rylaai.b-cdn.net` |
| `NEXT_PUBLIC_DEBUG_CDN` | `true` |
| `NEXT_PUBLIC_SITE_URL_FUNNEL` | `https://goviral.ryla.ai` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://end.ryla.ai` |
| `NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT` | `/` |

## Landing App Build Args

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_SITE_URL_LANDING` | `https://www.ryla.ai` |

## Required for All Apps

| Secret Name | How to Get |
|------------|------------|
| `FLY_API_TOKEN` | Run: `fly tokens create org deploy --org YOUR_ORG_NAME`<br>Or: `fly tokens create deploy --app ryla-web-prod`<br><br>**Note**: `fly auth token` is deprecated. Use `fly tokens create` instead. |

## Quick Copy-Paste Commands

After setting secrets, verify with:

```bash
gh secret list --repo jatidevelopments/ryla
```

## Notes

- All `NEXT_PUBLIC_*` variables are build-time only (embedded in JavaScript bundle)
- `FLY_API_TOKEN` is used for deployments
- Secrets are encrypted by GitHub and only accessible to workflows
