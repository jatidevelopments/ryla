# Domain Registry

Production domain mapping for RYLA services.

## Production Domains

| Domain            | Service      | App            | Purpose                        |
| ----------------- | ------------ | -------------- | ------------------------------ |
| `www.ryla.ai`     | Landing Page | `apps/landing` | Main marketing site            |
| `ryla.ai`         | Landing Page | `apps/landing` | Root domain (redirects to www) |
| `goviral.ryla.ai` | Funnel       | `apps/funnel`  | Payment & conversion funnel    |
| `app.ryla.ai`     | Web App      | `apps/web`     | Main application               |
| `end.ryla.ai`     | Backend API  | `apps/api`     | Backend API endpoints          |

## Notes

- All domains use HTTPS
- DNS configuration managed via domain registrar
- SSL certificates auto-provisioned by hosting provider
- Environment variables should reference these domains in production
