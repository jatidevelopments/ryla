# [INITIATIVE] IN-038: RunComfy Workflow Catalog & RYLA Integration

**Status**: Proposed  
**Created**: 2026-02-03  
**Last Updated**: 2026-02-03  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, Product Team

---

## Executive Summary

**One-sentence description**: Build a comprehensive workflow discovery suite for RunComfy’s ComfyUI Workflows catalog, evaluate which workflows fit RYLA’s launch needs, deploy selected workflows as RunComfy APIs, and implement a RunComfy service in RYLA to call those endpoints.

**Business Impact**: C-Core Value (more workflows available), E-CAC (optional cost/reliability vs Modal/RunPod), A-Activation (faster feature rollout), B-Retention (more generation options)

---

## Why (Business Rationale)

### Problem Statement

- **Unknown catalog**: RunComfy’s [ComfyUI Workflows](https://www.runcomfy.com/comfyui-workflows) gallery is not systematically available to us; we don’t have a machine-readable list of all workflows (names, IDs, categories, models).
- **No RYLA–RunComfy bridge**: Even when we choose workflows, we lack a single place in RYLA to discover, deploy, and call RunComfy workflow APIs.
- **Launch alignment**: We need to know which RunComfy workflows map to RYLA’s launch use cases (image, video, face swap, etc.) and expose them via a consistent service.

### Current State

- **IN-015**: RunComfy is evaluated as a fast-path platform; no deep catalog or integration yet.
- **Modal**: Primary ComfyUI execution today (flux, wan2, z-image, etc.).
- **RunComfy**: Used for evaluation only; no workflow catalog dataset and no RunComfy-backed service in RYLA.

### Desired State

- **Workflow catalog**: A full, structured list of RunComfy’s available workflows (from their gallery/API), maintained so we can filter and plan.
- **RYLA–workflow fit**: Clear mapping of which catalog workflows we need for launch and in which order.
- **Deployed as API**: Chosen workflows deployed on RunComfy as serverless APIs (or normal deployments where appropriate).
- **RunComfy service**: A dedicated service in RYLA that knows RunComfy endpoints and can invoke them (with auth, retries, errors), so product code uses “RunComfy” as one provider alongside Modal.

### Business Drivers

- **Revenue / UX**: More generation options and faster rollout of new workflows.
- **Cost / ops**: RunComfy as an additional provider can improve reliability and cost options (see IN-015).
- **Risk**: Explicit catalog and “fit for RYLA” list reduces ad‑hoc choices and duplicate work.
- **Competitive**: Faster path from “workflow exists on RunComfy” to “available in RYLA”.

---

## How (Approach & Strategy)

### Strategy

1. **Discovery (catalog)**  
   Build a “C-suite” (comprehensive suite) that produces a full list of workflows available on RunComfy. Prefer **API-first**: inspect RunComfy’s workflows page and docs for any API that returns the gallery/catalog; capture and persist those responses. If no public API exists, use **Playwright MCP** (with you logged into RunComfy) to load [ComfyUI Workflows](https://www.runcomfy.com/comfyui-workflows), capture network requests, and derive the catalog from API responses (or fallback: structured scrape of the page). Output: **runcomfy-workflow-catalog** (e.g. JSON/DB) with workflow id, name, category, tags, models, links.

2. **Evaluation (fit for RYLA)**  
   From the catalog, decide which workflows are **needed for RYLA launch**: image gen, video, face swap, upscale, etc. Produce a shortlist and a rough order (e.g. “must-have for launch” vs “phase 2”). Document why each chosen workflow fits (use case, model, cost, reliability).

3. **Deployment (RunComfy)**  
   For each chosen workflow: deploy on RunComfy (as **API** where possible, per RunComfy’s “Deploy as API” / serverless deployment). Confirm which are “deploy as API” vs “deploy normally”; document deployment IDs and base URLs (RunComfy base: `https://api.runcomfy.net`, plus deployment-specific endpoints as per [RunComfy Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints)).

4. **Integration (RYLA)**  
   Implement a **RunComfy service** in RYLA (e.g. under `libs/business` or `apps/api`) that:
   - Knows which RunComfy deployments/endpoints we use (config or registry).
   - Exposes a simple interface (e.g. `runWorkflow(type, params)` or per-workflow methods).
   - Handles auth (RunComfy API keys via Infisical), retries, timeouts, and errors.
   - Can be used by existing image/generation flows as an additional provider alongside Modal.

### Key Principles

- **API-first discovery**: Prefer capturing API responses over scraping HTML.
- **One catalog, one evaluation**: Single source of truth for “what’s on RunComfy” and “what we use for RYLA”.
- **Deploy as API where possible**: Use RunComfy’s serverless/API deployment so we get stable endpoints and scaling.
- **Provider abstraction**: RunComfy service should sit behind the same kind of “generation provider” abstraction as Modal (so we can switch or load-balance later).

### Phases

| Phase | Name        | Description                                                                   | Output                                                 |
| ----- | ----------- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| **1** | Discovery   | Build C-suite: API or Playwright-based catalog of all RunComfy workflows      | `runcomfy-workflow-catalog` (dataset + script/tooling) |
| **2** | Evaluation  | Map catalog to RYLA launch needs; shortlist and prioritize                    | Evaluation doc + shortlist (workflows we deploy)       |
| **3** | Deployment  | Deploy shortlisted workflows on RunComfy as API (or normal); record endpoints | Deployment registry (IDs, URLs, auth notes)            |
| **4** | Integration | Implement RunComfy service in RYLA and wire to generation flows               | RunComfy service + config + usage in app               |

### Dependencies

- **IN-015**: ComfyUI Workflow-to-API Platform Evaluation (RunComfy already evaluated as platform).
- **RunComfy account**: API keys and (for discovery) logged-in session if using Playwright.
- **Playwright MCP**: For discovery if catalog is not exposed via a public API (user to log into RunComfy when running discovery).

### Constraints

- Discovery must not violate RunComfy ToS; prefer official API over scraping when available.
- RunComfy API keys must live in Infisical (e.g. `/shared` or app-specific path), never in repo.
- RunComfy service must not replace Modal by default; it is an **additional** provider unless we decide to migrate.

---

## When (Timeline & Priority)

### Timeline

- **Start**: After initiative is approved and RunComfy access/Playwright login is ready.
- **Phase 1 (Discovery)**: 3–5 days (API investigation + Playwright capture if needed + catalog schema and pipeline).
- **Phase 2 (Evaluation)**: 1–2 days (shortlist and doc).
- **Phase 3 (Deployment)**: 2–5 days (per-workflow deploy and registry).
- **Phase 4 (Integration)**: 3–5 days (RunComfy service + wiring).

### Priority

**Priority Level**: P1 (high value, supports launch and IN-015 follow-through).

**Rationale**: Unblocks data-driven choice of RunComfy workflows and gives RYLA a second provider (RunComfy) with a clear integration path.

### Resource Requirements

- **Team**: Infrastructure (discovery, deployment), Backend (RunComfy service and API wiring).
- **External**: RunComfy account, API keys, optional Playwright session (user logs in for discovery).

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team  
**Role**: Infrastructure Lead  
**Responsibilities**: Discovery pipeline, deployment on RunComfy, deployment registry, coordination with Backend for service contract.

### Key Stakeholders

| Role         | Involvement | Responsibilities                                                                  |
| ------------ | ----------- | --------------------------------------------------------------------------------- |
| Backend Team | High        | RunComfy service implementation, auth, error handling, wiring to generation flows |
| Product Team | Medium      | Prioritization of workflows for launch, acceptance of “fit for RYLA” list         |

### Communication Plan

- **Updates**: Async (Slack/PR); short written updates at end of each phase.
- **Audience**: Infrastructure, Backend, Product.

---

## Success Criteria

### Primary Success Metrics

| Metric                 | Target                                                                   | Measurement                          |
| ---------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| **Catalog coverage**   | All workflows on RunComfy workflows page represented                     | Catalog record count + spot checks   |
| **Shortlist**          | Documented list of workflows we deploy for RYLA launch                   | Evaluation doc + deployment registry |
| **Deployed workflows** | Each shortlisted workflow has a RunComfy deployment (API where possible) | Registry with deployment_id and URL  |
| **RunComfy service**   | RYLA can call at least one RunComfy workflow via the new service         | Integration test + usage in one flow |

### Business Metrics Impact

**Target metrics**: [ ] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected impact**:

- **C-Core Value**: More workflows available for generation.
- **E-CAC**: Optional cost/reliability benefit from RunComfy as second provider.
- **B-Retention**: More options and reliability.

### Definition of Done

**Initiative complete when**:

- [ ] Discovery C-suite runs and produces a runcomfy-workflow-catalog (API or Playwright-based).
- [ ] Evaluation doc exists: which workflows fit RYLA launch and in what order.
- [ ] Shortlisted workflows are deployed on RunComfy; deployment registry (IDs, URLs) is documented.
- [ ] RunComfy service is implemented in RYLA with auth (Infisical), retries, and at least one workflow wired into the app.
- [ ] Documentation updated (where to find catalog, how to add workflows, how to use RunComfy service).

**Not done if**:

- [ ] Catalog is incomplete or not reproducible.
- [ ] No clear “fit for RYLA” shortlist.
- [ ] RunComfy service is missing or not used by any real flow.
- [ ] Secrets are not in Infisical.

---

## Discovery (Phase 1) – Detail

### Goal

Produce a **runcomfy-workflow-catalog** that lists all workflows available on RunComfy (from their [ComfyUI Workflows](https://www.runcomfy.com/comfyui-workflows) experience), with stable identifiers and metadata where possible.

### Preferred: API-based

- Check RunComfy docs and the workflows page for any **list/catalog** API (e.g. public gallery, “templates”, or “workflows”).
- If the page loads data via XHR/fetch, capture those request URLs and response shapes (e.g. with Playwright’s **browser_network_requests** after loading the page; filter by JSON or API-like paths).
- Define a small schema (e.g. `id`, `name`, `slug`, `category`, `tags`, `model_refs`, `url`) and persist API responses into the catalog (e.g. JSON file or DB table under `docs/` or a small `tools/runcomfy-discovery`).

### Fallback: Playwright MCP

- **Prerequisite**: You log into RunComfy so the workflows page can load full data if it’s behind auth.
- **Steps**:
  1. Navigate to `https://www.runcomfy.com/comfyui-workflows`.
  2. Optionally scroll or paginate to load all items.
  3. Use **browser_network_requests** (e.g. `includeStatic: false`) to capture requests; save to a file if needed.
  4. Inspect responses for list/gallery payloads; extract workflow list and map to catalog schema.
- **Output**: Same runcomfy-workflow-catalog format so later phases don’t care whether source was API or Playwright.

### C-suite deliverables

- Script or notebook: “run discovery” → fetches or captures data → writes catalog.
- Catalog file/dataset: `runcomfy-workflow-catalog.json` (or equivalent).
- Brief README: how to run discovery, how often to refresh, where RunComfy API/docs were used.

---

## Related Work

### Epics

| Epic  | Name                                  | Status      | Link          |
| ----- | ------------------------------------- | ----------- | ------------- |
| (TBD) | RunComfy workflow discovery & catalog | Not started | To be created |
| (TBD) | RunComfy service implementation       | Not started | To be created |

### Dependencies

- **Blocked by**: RunComfy account and (for Playwright path) user login.
- **Blocks**: Nothing critical; can run in parallel with Modal work.
- **Related initiatives**: IN-015 (ComfyUI Workflow-to-API Platform Evaluation).

### Documentation

- [RunComfy Workflow Catalog](../../research/infrastructure/runcomfy-workflow-catalog.json) – discovered workflow list (IN-038 Phase 1).
- [RunComfy Workflow Discovery](../../research/infrastructure/RUNCOMFY-WORKFLOW-DISCOVERY.md) – how to run/refresh the catalog (Playwright MCP).
- [RunComfy API – Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints) – list/create deployments, base URL `https://api.runcomfy.net`.
- [RunComfy Serverless Introduction](https://docs.runcomfy.com/serverless/introduction).
- [ComfyUI Platform Market Research](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md) – RunComfy overview.
- IN-015: [ComfyUI Workflow-to-API Platform Evaluation](./IN-015-comfyui-workflow-api-alternatives.md).

---

## Risks & Mitigation

| Risk                           | Probability | Impact | Mitigation                                                                             |
| ------------------------------ | ----------- | ------ | -------------------------------------------------------------------------------------- |
| No public catalog API          | High        | Medium | Use Playwright + network capture; document findings for RunComfy.                      |
| Gallery behind login           | Medium      | Low    | User logs in before discovery run (as you indicated).                                  |
| RunComfy API changes           | Medium      | Medium | Pin docs version in initiative; treat catalog as best-effort and refresh periodically. |
| Scope creep on “all workflows” | Medium      | Medium | Phase 1 = catalog; Phase 2 = strict shortlist for RYLA launch only.                    |

---

## Progress Tracking

### Current Phase

**Phase**: Phase 1 – Discovery (catalog)  
**Status**: On Track

### Recent Updates

- **2026-02-03**: Initiative created. Scope: discovery C-suite (API or Playwright), evaluation for RYLA launch, deploy as API on RunComfy, RunComfy service in RYLA.
- **2026-02-03**: Phase 1 discovery completed via Playwright MCP. Catalog: 32 workflows in [runcomfy-workflow-catalog.json](../../research/infrastructure/runcomfy-workflow-catalog.json). Method documented in [RUNCOMFY-WORKFLOW-DISCOVERY.md](../../research/infrastructure/RUNCOMFY-WORKFLOW-DISCOVERY.md). Gallery has no public list API; page requires login; “Load more” used to fetch batches.

### Next Steps

1. (Optional) Click “Load more” until exhausted and re-extract to capture any additional workflows.
2. Phase 2: Evaluate catalog for RYLA launch fit; produce shortlist and deployment plan.
3. Phase 3: Deploy shortlisted workflows on RunComfy as API; record deployment IDs/URLs.
4. Phase 4: Implement RunComfy service in RYLA and wire to generation flows.

---

## References

- [RunComfy ComfyUI Workflows](https://www.runcomfy.com/comfyui-workflows)
- [RunComfy API – Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints)
- [RunComfy Serverless Introduction](https://docs.runcomfy.com/serverless/introduction)
- IN-015: [ComfyUI Workflow-to-API Platform Evaluation](./IN-015-comfyui-workflow-api-alternatives.md)
- Playwright MCP: use `browser_navigate`, `browser_network_requests`, `browser_snapshot` for discovery when API is not available

---

**Template Version**: 1.0  
**Last Template Update**: 2026-02-03
