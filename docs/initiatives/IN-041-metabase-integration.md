# [INITIATIVE] IN-041: Metabase Integration (BI, Postgres & MCP)

**Status**: Proposed  
**Created**: 2026-02-06  
**Last Updated**: 2026-02-06  
**Owner**: Engineering Team  
**Stakeholders**: Product, Infrastructure

---

## Executive Summary

**One-sentence description**: Set up Metabase as RYLA’s analytics and BI layer, connected to our PostgreSQL database, with optional Metabase MCP in Cursor for querying and exploring from the IDE.

**Business Impact**: E-CAC (developer and PM efficiency), C-Core Value (data-driven decisions), B-Retention (internal dashboards).

---

## Why (Business Rationale)

### Problem Statement
- No standard BI/analytics UI over RYLA’s Postgres data for product and ops.
- Developers and PMs lack a single place to run ad‑hoc queries and build dashboards without touching the API or raw SQL in the repo.

### Current State
- Postgres is used by the API; no Metabase (or similar) instance.
- No Metabase MCP in Cursor for exploring data from the IDE.

### Desired State
- Metabase running (Docker or hosted), connected to RYLA Postgres (read-only or scoped user).
- Documented setup and, where applicable, a setup script (e.g. Docker Compose or runbook).
- Optional Metabase MCP in Cursor (e.g. `@cognitionai/metabase-mcp-server`) so agents can list dashboards, run saved questions, execute queries via MCP tools.

### Business Drivers
- **E-CAC**: Faster analytics and debugging via Metabase + optional MCP.
- **C-Core Value**: Dashboards and metrics over core product data.
- **Risk Mitigation**: Metabase connects to Postgres with a dedicated DB user; secrets in Infisical.

---

## How (Approach & Strategy)

### Strategy
1. **Metabase as Nx app**: Metabase runs as the Nx app `metabase` (`pnpm nx serve metabase`), which starts the Metabase Docker container via `scripts/setup/setup-metabase.sh`; add RYLA Postgres as a **data source** (connection string from Infisical). Do not use RYLA Postgres as Metabase’s application database unless explicitly desired.
2. **Connection to Postgres**: Use a dedicated DB user for Metabase (e.g. read-only or limited role). Store `DATABASE_URL` (or Metabase-specific env) in Infisical under a path such as `/apps/metabase` or `/shared` as appropriate.
3. **Optional MCP**: Metabase MCP is **not** an Nx app. Run `npx @cognitionai/metabase-mcp-server` with Infisical; document the command and Cursor `.cursor/mcp.json` snippet in the technical doc.
4. **Documentation**: Technical doc covering Metabase (Nx app + Docker), Postgres data source, env vars, and MCP config.

### Key Principles
- Metabase connects to **our** Postgres as a data source; it does not replace Postgres.
- Credentials in Infisical only; no secrets in repo.
- MCP is optional; Metabase is useful even without MCP.

### Phases
1. **Phase 1: Initiative & docs** – This initiative doc, technical doc (`docs/technical/METABASE-SETUP.md`), and setup script or runbook.
2. **Phase 2: Metabase + Postgres** – Run Metabase (e.g. Docker), add RYLA Postgres as data source, create Metabase API key for MCP (if used).
3. **Phase 3: MCP (optional)** – Configure Metabase MCP in Cursor (Infisical env), validate tools (e.g. list_dashboards, execute_card).

### Dependencies
- RYLA Postgres (existing).
- Infisical for `DATABASE_URL` (or Metabase data source URL) and, for MCP, `METABASE_URL` and `METABASE_API_KEY`.
- Docker (if using Docker-based Metabase).

### Constraints
- Metabase must not run destructive operations on production data; use read-only or restricted DB user where possible.
- Keep Metabase and MCP docs in sync with actual connection and env setup.

---

## When (Timeline & Priority)

### Timeline
- **Start Date**: 2026-02-06
- **Target Completion**: Phase 1–2 within 2 weeks; Phase 3 as needed.

### Priority
**Priority Level**: P2  

**Rationale**: Improves analytics and developer experience; not blocking current MVP.

### Resource Requirements
- **Team**: Engineering (setup, docs, optional MCP).
- **External**: Metabase OSS (Docker or self-hosted); optional npm package `@cognitionai/metabase-mcp-server`.

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Engineering Team  
**Responsibilities**: Metabase setup, Postgres connection, docs, optional MCP and script.

### Key Stakeholders
| Role        | Involvement | Responsibilities                |
|------------|-------------|----------------------------------|
| Engineering | High        | Setup, Postgres connection, MCP, docs |
| Product     | Low         | Dashboard needs, metrics        |

---

## Success Criteria

### Primary Success Metrics
| Metric                          | Target                    | Measurement Method              |
|---------------------------------|---------------------------|----------------------------------|
| Metabase running                | Instance up, UI reachable | Manual or script run            |
| Postgres connected in Metabase  | Data source added         | Metabase admin UI / MCP tools   |
| Optional MCP in Cursor          | Tools work                | list_dashboards / execute_card |
| Setup repeatable                | Any dev can run it        | README + script / runbook      |

### Business Metrics Impact
**Target Metric**: [x] E-CAC [x] C-Core Value [ ] B-Retention (internal)

### Definition of Done
- [ ] Initiative doc (this file) and README index updated.
- [ ] Technical doc `docs/technical/METABASE-SETUP.md` with Postgres connection and env.
- [ ] Setup script or runbook for Metabase (e.g. Docker) and, if used, MCP.
- [ ] Metabase connected to RYLA Postgres (read-only or scoped user).
- [ ] Optional: Metabase MCP in Cursor with Infisical env; validated.

---

## Related Work

### Epics
| Epic | Name                          | Status   | Link |
|------|-------------------------------|----------|------|
| (TBD) | Metabase setup & Postgres connection | Proposed | To be created if needed |

### Documentation
- [Metabase docs – Running on Docker](https://www.metabase.com/docs/latest/installation-and-operation/running-metabase-on-docker)
- [Metabase – Configuring the application database](https://www.metabase.com/docs/latest/installation-and-operation/configuring-application-database)
- [CognitionAI Metabase MCP Server](https://github.com/CognitionAI/metabase-mcp-server)
- RYLA: [METABASE-SETUP.md](../technical/METABASE-SETUP.md), `scripts/setup/`, Infisical paths for Metabase/Postgres.

---

## MCP Availability (Research Summary)

- **CognitionAI/metabase-mcp-server**: 80+ tools (dashboards, cards, databases, tables, queries, collections). Auth: `METABASE_URL` + `METABASE_API_KEY` (or username/password). Run: `npx @cognitionai/metabase-mcp-server`. Supports `--essential`, `--all`, `--read`, `--write`.
- **Python option**: `metabase-mcp-server` on PyPI (list cards, execute queries, etc.); alternative if we prefer Python.
- Metabase itself does not “auto-connect” to Postgres; you add Postgres as a data source in Metabase admin. RYLA’s Postgres is the **data source** Metabase connects to; Metabase’s own application database can be its default (e.g. H2) or a separate DB.

---

## Progress Tracking

### Current Phase
**Phase**: Phase 1 – Initiative & docs  
**Status**: In progress

### Next Steps
1. ~~Add `docs/technical/METABASE-SETUP.md`.~~ Done.
2. ~~Add setup script `scripts/setup/setup-metabase.sh`.~~ Done.
3. Document Infisical secrets (e.g. `/mcp`: `METABASE_URL`, `METABASE_API_KEY`) and add to Infisical if not present.
4. ~~Optional Nx app for MCP.~~ Not used; MCP is run via npx + Infisical (documented).
5. ~~Update initiatives README index: IN-041 = Metabase.~~ Done.
6. Run Metabase (`pnpm nx serve metabase`), add Postgres data source, create API key; optionally validate MCP.

---

**Template Version**: 1.0
