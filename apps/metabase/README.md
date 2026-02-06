# Metabase (IN-041)

Nx app that **starts Metabase** via Docker so RYLA has a BI layer over Postgres. Production deploy: Fly.io (org `my-dream-companion`). Metabase itself is the Docker image; this app is the single command to run it.

## Run

```bash
pnpm nx serve metabase
```

Then open http://localhost:3040, complete first-time setup, and add RYLA Postgres as a data source (connection string from Infisical). Create an API key if you want to use the Metabase MCP in Cursor.

## MCP (optional)

The Metabase MCP server is **not** an Nx app. Run it when needed with Infisical:

```bash
infisical run --path=/mcp --env=dev -- npx @cognitionai/metabase-mcp-server
```

Add that (or the equivalent `command` + `args`) to `.cursor/mcp.json` for Cursor. See [METABASE-SETUP.md](../../docs/technical/METABASE-SETUP.md).

## Docs

- [METABASE-SETUP.md](../../docs/technical/METABASE-SETUP.md)
- [IN-041](../../docs/initiatives/IN-041-metabase-integration.md)
