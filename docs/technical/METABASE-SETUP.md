# Metabase Setup (IN-041)

Metabase is RYLA’s BI/analytics layer. It connects to **our PostgreSQL database** as a data source so you can build dashboards and run ad‑hoc queries. Optionally, the Metabase MCP server lets Cursor (and other MCP clients) call Metabase from the IDE.

## Overview

- **Metabase** = BI app (run via Docker or hosted). It does **not** replace Postgres; it connects to Postgres as a **data source**.
- **Postgres**: RYLA’s existing database. Use a dedicated DB user for Metabase (e.g. read-only) and store the connection string in Infisical.
- **Metabase MCP** (optional): Lets AI agents in Cursor list dashboards, run saved questions, execute queries, etc. Requires a running Metabase instance and API key.

## 1. Run Metabase (e.g. Docker)

Example with Docker:

```bash
# Example: run Metabase (uses built-in H2 app DB by default)
docker run -d -p 3000:3000 --name metabase metabase/metabase
```

Or use the Nx app (runs the same script):

```bash
pnpm nx serve metabase
```

Open `http://localhost:3040` (default port 3040 to avoid clash with web app on 3000), complete Metabase’s first-time setup (admin user), then add a data source.

## 2. Add RYLA Postgres as a data source

1. In Metabase: **Settings → Admin → Databases → Add database**.
2. Choose **PostgreSQL**.
3. Connection details: use the same host/port/database as RYLA, with a **dedicated user** (e.g. `metabase_readonly`). Get the connection string from Infisical (e.g. `DATABASE_URL` for Metabase, or build from `POSTGRES_HOST`, `POSTGRES_USER`, etc.).
4. Save. Metabase will sync metadata; you can then create questions and dashboards.

**Security**: Prefer a read-only or limited DB user for Metabase so it cannot modify or delete production data.

## 3. Create a Metabase API key (MCP + dashboard script)

You need an API key for the Metabase MCP (Cursor) and for the dashboard setup script.

1. In Metabase: **Settings → Admin → Authentication → API Keys** (or **Settings → Account → API Keys** depending on version).
2. Create an API key; copy it.
3. Store in Infisical (path `/mcp` so MCP and scripts can use it):
   ```bash
   infisical secrets set METABASE_URL=http://localhost:3040 --path=/mcp --env=dev
   infisical secrets set METABASE_API_KEY='your-key-here' --path=/mcp --env=dev
   ```
   See [config/infisical-secrets-template.md](../../config/infisical-secrets-template.md). Then run the dashboard setup script (see [METABASE-DASHBOARDS.md](./METABASE-DASHBOARDS.md)).

## 4. Optional: Metabase MCP in Cursor

To use Metabase from Cursor (list dashboards, run questions, etc.):

1. **Secrets in Infisical**: `METABASE_URL`, `METABASE_API_KEY` (e.g. under `/mcp` or `/apps/metabase`).
2. **Run MCP with Infisical** (example):

   ```bash
   infisical run --path=/mcp --env=dev -- npx @cognitionai/metabase-mcp-server
   ```

3. **Cursor `.cursor/mcp.json`** – add under `mcpServers`:

   ```json
   "metabase": {
     "_comment": "Metabase MCP (IN-041) - METABASE_URL, METABASE_API_KEY from Infisical /mcp",
     "command": "infisical",
     "args": [
       "run", "--path=/mcp", "--env=dev", "--",
       "npx", "@cognitionai/metabase-mcp-server"
     ]
   }
   ```

4. Restart Cursor. Use MCP tools such as `list_dashboards`, `execute_card`, `list_databases`, etc.

The Metabase MCP is **not** an Nx app; run it via the command above (or the Cursor config). No separate Nx project for MCP.

## 5. Infisical secrets (summary)

| Secret / env                          | Path (example)             | Purpose                                                                                         |
| ------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------- |
| `METABASE_URL`                        | `/mcp` or `/apps/metabase` | Metabase instance URL for MCP                                                                   |
| `METABASE_API_KEY`                    | `/mcp` or `/apps/metabase` | Metabase API key for MCP                                                                        |
| Postgres URL for Metabase data source | `/apps/metabase` or shared | Used only in Metabase UI when adding DB (or in Metabase’s own env if you configure it that way) |

Metabase itself does **not** read Infisical by default; you either paste the Postgres connection into Metabase’s “Add database” form (from Infisical) or run Metabase in a environment where those env vars are set (e.g. Docker env or Infisical-exported env).

## 6. Fly.io production deployment

Metabase is deployed to Fly.io as part of the auto-deploy workflow when `apps/metabase/` or the dashboard setup scripts change.

- **App name**: `ryla-metabase-prod` (production), `ryla-metabase-staging` (staging).
- **URL**: `https://ryla-metabase-<env>.fly.dev` (e.g. `https://ryla-metabase-prod.fly.dev`).

**One-time setup from your terminal** (CI does not create the app; run once per environment):

```bash
# Production
flyctl apps create ryla-metabase-prod --yes
flyctl volumes create metabase_data --region fra --size 1 --app ryla-metabase-prod

# Staging (when needed)
flyctl apps create ryla-metabase-staging --yes
flyctl volumes create metabase_data --region fra --size 1 --app ryla-metabase-staging
```

The volume is mounted at `/metabase-data` for the H2 database. After this, the deploy workflow will deploy and run the dashboard setup.

CI uses the Fly org `my-dream-companion` by default. If your app is in a different org, set the GitHub secret `FLY_ORG` (e.g. `my-dream-companion`) so deploy and app checks use the correct org.

**After first deploy:**

1. Open `https://ryla-metabase-prod.fly.dev`, complete Metabase first-time setup (admin user).
2. Add RYLA Postgres as a data source (use production DB connection from Infisical; prefer a read-only user).
3. Create an API key in Metabase (Settings → Admin → API Keys) and set it in Infisical so the deploy pipeline can run the dashboard setup script:
   ```bash
   infisical secrets set METABASE_URL=https://ryla-metabase-prod.fly.dev --path=/mcp --env=prod
   infisical secrets set METABASE_API_KEY='your-key' --path=/mcp --env=prod
   ```
   For staging use `--env=staging` and the staging Metabase URL.

On each deploy that touches Metabase, the workflow runs `scripts/setup/metabase-setup-dashboards.ts` against the deployed instance (if `METABASE_API_KEY` is set in Infisical for that environment).

## Initiative

See [IN-041: Metabase Integration](../initiatives/IN-041-metabase-integration.md).

## References

- [Metabase Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker)
- [CognitionAI Metabase MCP Server](https://github.com/CognitionAI/metabase-mcp-server)
