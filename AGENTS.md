# RYLA MVP - Agent Instructions

## ⚠️ Pipeline Enforcement (MANDATORY)

Every task MUST follow:

1. **State phase**: "Working in PHASE X on EP-XXX, ST-XXX"
2. **Check inputs**: List what you have. Missing → STOP and ask.
3. **Plan**: Outline steps + files before coding.
4. **Small patches**: No giant rewrites.
5. **Self-review**: Check for bugs, types, spec mismatch.
6. **AC status**: Output `[ACCEPTANCE CRITERIA STATUS]` block with ✅/⚠️/❌
7. **Next step**: Suggest concrete next action.

**If inputs missing → STOP and ask. Never guess.**

## Tech Stack

- Frontend: Next.js + React + TypeScript + Tailwind
- Backend: Next.js API routes
- DB: Supabase (Postgres)
- Tests: Vitest + Playwright
- Analytics: PostHog
- CI/CD: GitHub Actions

## Nx Monorepo

```
apps/
  web/       # Next.js web app
  api/       # Node.js API
  admin/     # Admin dashboard
libs/
  shared/    # @ryla/shared
  business/  # @ryla/business
  data/      # @ryla/data
  ui/        # @ryla/ui
  analytics/ # @ryla/analytics
```

## Architecture

- Apps → Business → Data → DB
- Import via `@ryla/<lib>`
- Never skip layers

## 10-Phase Pipeline

P1→P2→P3→P4→P5→P6→P7→P8→P9→P10

| Phase | Key Output              |
| ----- | ----------------------- |
| P1    | Problem + MVP objective |
| P2    | Epics + AC              |
| P3    | Architecture + API      |
| P4    | Screens + events        |
| P5    | File plan + tasks       |
| P6    | Code + AC status        |
| P7    | Tests                   |
| P8    | Integration             |
| P9    | Deploy config           |
| P10   | Validation + learnings  |

See `docs/process/10-PHASE-PIPELINE.md` for full INPUTS/OUTPUTS.

## Business Metrics (A-E)

- A: Activation
- B: Retention
- C: Core Value
- D: Conversion
- E: CAC

## Naming

- Epics: `EP-XXX`
- Stories: `ST-XXX`
- Tasks: `TSK-XXX`
- Branches: `epic/ep-001-scope`
- Commits: `feat(ep-001 st-010): description`

## Commands

```bash
pnpm nx serve web
pnpm nx serve api
pnpm nx build <app>
pnpm nx test <lib>
pnpm nx affected --target=test
```

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
