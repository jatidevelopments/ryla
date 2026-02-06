# NEL (Neural Evolution Labs) landing

Company site for Neural Evolution Labs ÖÜ. Static Next.js app deployed to **Cloudflare Pages** (project `ryla-nellab`).

## Local deploy (Wrangler)

**One-time setup:** log in to Cloudflare (uses OAuth, no API token on your machine):

```bash
wrangler login
```

**Build and deploy:**

```bash
pnpm deploy:nellab
```

Or run the script directly from repo root:

```bash
./apps/nellab/scripts/deploy-pages.sh
```

## GitHub Auto Deploy

Pushes to `main` that touch `apps/nellab` trigger a deploy in `.github/workflows/deploy-auto.yml`. The workflow uses **GitHub secrets** (repo or environment):

- `CLOUDFLARE_API_TOKEN` – Cloudflare API token with Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` – Cloudflare account ID

Add these in **Settings → Secrets and variables → Actions** (or in the environment used by the workflow) so CI can deploy without Infisical.

Custom domain: configure `neuralevolutionlabs.com` on the `ryla-nellab` project in the Cloudflare dashboard. See `docs/ops/DOMAIN-REGISTRY.md`.
