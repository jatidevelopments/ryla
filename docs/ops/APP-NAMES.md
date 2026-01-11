# Fly.io App Names Reference

## Production Apps (with `-prod` suffix)

All production apps use the `-prod` suffix for consistency:

- `ryla-landing-prod` - Landing page
- `ryla-funnel-prod` - Payment funnel
- `ryla-web-prod` - Main web app
- `ryla-api-prod` - Backend API

## Region

All apps are deployed in **Frankfurt, Germany** - region code: `fra`

## Domain Mapping

| Domain | App | Status |
|--------|-----|--------|
| `www.ryla.ai` | `ryla-landing-prod` | Configured |
| `ryla.ai` | `ryla-landing-prod` | Configured |
| `goviral.ryla.ai` | `ryla-funnel-prod` | Configured |
| `app.ryla.ai` | `ryla-web-prod` | Configured |
| `end.ryla.ai` | `ryla-api-prod` | Configured |

## Organization

All apps are in the `my-dream-companion` organization.

## View Apps

```bash
flyctl apps list --org my-dream-companion
```

## Managed Services

- PostgreSQL: `ryla-db-prod` (region: `fra`)
- Redis: `ryla-redis-prod` (region: `fra`)
