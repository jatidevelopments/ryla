# Domain Registry

Production domain mapping for RYLA services.

## Production Domains

| Domain                       | Service          | App             | Purpose                                                          |
| ---------------------------- | ---------------- | --------------- | ---------------------------------------------------------------- |
| `www.ryla.ai`                | Landing Page     | `apps/landing`  | Main marketing site                                              |
| `ryla.ai`                    | Landing Page     | `apps/landing`  | Root domain (redirects to www)                                   |
| `goviral.ryla.ai`            | Funnel           | `apps/funnel`   | Payment & conversion funnel                                      |
| `app.ryla.ai`                | Web App          | `apps/web`      | Main application                                                 |
| `end.ryla.ai`                | Backend API      | `apps/api`      | Backend API endpoints                                            |
| `admin.ryla.ai`              | Admin Dashboard  | `apps/admin`    | Admin back-office application                                    |
| `ryla-metabase-prod.fly.dev` | Metabase (BI)    | `apps/metabase` | BI dashboards (IN-041); optional custom domain e.g. `bi.ryla.ai` |
| `neuralevolutionlabs.com`    | NEL Company Site | `apps/nellab`   | Neural Evolution Labs ÖÜ company landing (IN-040)                |

## Notes

- All domains use HTTPS
- DNS configuration managed via domain registrar
- SSL certificates auto-provisioned by hosting provider
- Environment variables should reference these domains in production
- **Nellab** (`neuralevolutionlabs.com`): Deployed to Cloudflare Pages (project `ryla-nellab`). Auto-deploys on push to `main` when `apps/nellab` changes (see `.github/workflows/deploy-auto.yml`). Create the Pages project in the Cloudflare dashboard and attach the custom domain.
