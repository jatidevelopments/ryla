c# [INITIATIVE] IN-037: Civit.ai Crawler/Scraper for Workflows & Models

**Status**: Proposed  
**Created**: 2026-02-03  
**Last Updated**: 2026-02-03  
**Owner**: Infrastructure / Product Team  
**Stakeholders**: Infrastructure Team, Product Team

---

## Executive Summary

**One-sentence description**: Build an automated crawler/scraper that visits Civit.ai, searches for models and workflows (e.g. ComfyUI workflows), evaluates fit for RYLA’s needs, labels them, and exports results to CSV for discovery and automation.

**Business Impact**: C-Core Value (richer workflow/model pipeline), E-CAC (automated discovery vs manual research), A-Activation (faster onboarding of new capabilities)

---

## Why (Business Rationale)

### Problem Statement

- **Manual discovery**: Finding ComfyUI workflows and suitable models on Civit.ai is manual and time-consuming.
- **No structured inventory**: There is no single list of RYLA-relevant workflows/models with labels and metadata.
- **Repeat work**: Each time we need new workflows or models, we re-search and re-evaluate.
- **No automation**: Discovery cannot be run on a schedule or integrated into pipelines.

### Current State

- Team manually browses [Civit.ai Models](https://civitai.com/models), searches for “workflow” (and related terms) to find ComfyUI workflows.
- No automated way to collect, filter, or label results.
- No CSV or structured output for downstream use (e.g. triage, prioritization, integration with IN-019 / IN-028).

### Desired State

- **Automated crawler**: Script (or small app) that uses Playwright (e.g. via Playwright MCP) to:
  - Open Civit.ai (e.g. `https://civitai.com/models`).
  - Run searches (e.g. “workflow” for ComfyUI workflows, plus model-type searches as needed).
  - Paginate/list results as the site allows.
- **Labeling**: Each item (workflow/model) is labeled for RYLA fit (e.g. relevance, type, tags).
- **CSV export**: Results are written to a CSV (and optionally other formats) with consistent columns (e.g. name, URL, type, labels, notes).
- **Runnable automation**: Script can be run on demand or on a schedule (e.g. cron, CI job) to refresh the list.

### Business Drivers

- **Cost Impact**: Less manual research time (E-CAC).
- **Core Value**: Better pipeline of workflows/models for product features (C-Core Value).
- **Activation**: Faster addition of new workflows/models (A-Activation).
- **Consistency**: Single source of truth (CSV) for discovery and prioritization.

---

## How (Approach & Strategy)

### Strategy

1. **Crawler**: Use Playwright (browser automation) to navigate Civit.ai and perform searches (e.g. “workflow” on models page).
2. **Extraction**: Parse listing pages to collect: title, URL, type (workflow vs model), basic metadata (e.g. download count, date if available).
3. **Labeling**: Apply rules or heuristics (and optionally manual review) to label “RYLA fit” (e.g. workflow vs model, ComfyUI, use-case tags).
4. **Output**: Write to CSV with fixed columns; support appending/overwriting and optional timestamps.
5. **Automation**: Package as a runnable script (e.g. Node/TS or Python) that can be executed locally or in CI/cron.

### Key Principles

- Respect Civit.ai’s robots.txt and terms of service; throttle requests to avoid overloading the site.
- Prefer stable selectors (e.g. data attributes, semantic structure) for scraping to reduce breakage.
- CSV schema designed for downstream use (e.g. filtering in spreadsheets, ingestion by other tools).
- Script is idempotent where possible (e.g. overwrite or dated CSV per run).

### Phases (high level)

1. **Phase 1 – Discovery script**: Playwright script that opens Civit.ai, runs one or more searches (e.g. “workflow”), and extracts listing data to memory/JSON. (Target: 1–2 weeks.)
2. **Phase 2 – Labeling & CSV**: Add labeling logic (rule-based and/or manual review), define CSV schema, and write results to CSV. (Target: ~1 week.)
3. **Phase 3 – Automation**: Document how to run the script (e.g. `pnpm nx run …` or `node scripts/…`), optional scheduling (cron/CI), and refresh strategy. (Target: ~1 week.)

### Dependencies

- Playwright (or Playwright MCP for development/prototyping).
- Civit.ai site structure (listings, search, pagination) — may change; design for easy selector updates.
- Optional: Link to IN-019 (workflow analyzer) and IN-028 (workflow-to-serverless) for future ingestion of discovered workflows.

### Constraints

- Must comply with Civit.ai ToS and polite scraping (rate limits, no aggressive concurrency).
- No authentication assumed initially (public pages only).
- MVP: CSV output; no database or API in scope for this initiative.

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: TBD
- **Target Completion**: TBD
- **Key Milestones**:
  - Phase 1 (discovery script): TBD
  - Phase 2 (labeling + CSV): TBD
  - Phase 3 (automation + docs): TBD

### Priority

**Priority Level**: P2

**Rationale**: Enables better workflow/model discovery and feeds into other initiatives (IN-019, IN-028) but is not blocking current critical path.

### Resource Requirements

- **Team**: Infrastructure or Product (scripting, Playwright).
- **External Dependencies**: Civit.ai availability and structure; Playwright MCP / Playwright runtime.

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Role**: Infrastructure / Product Team  
**Responsibilities**: Scope the crawler, define CSV schema and labeling rules, implement and document the script, set up run/automation.

### Key Stakeholders

| Role           | Involvement | Responsibilities                   |
| -------------- | ----------- | ---------------------------------- |
| Infrastructure | High        | Script implementation, Playwright  |
| Product        | Medium      | RYLA-fit criteria, labels, CSV use |

### Communication Plan

- **Updates**: As needed (e.g. when Phase 1 is done or blockers appear).
- **Audience**: Infrastructure, Product.

---

## Success Criteria

### Primary Success Metrics

| Metric                    | Target                               | Measurement Method                    | Timeline |
| ------------------------- | ------------------------------------ | ------------------------------------- | -------- |
| Crawler runs successfully | Script runs without error            | Run script; check exit code/logs      | Phase 1  |
| Search coverage           | “workflow” search on Civit.ai models | Script executes search and pagination | Phase 1  |
| CSV produced              | At least one CSV with defined schema | Inspect output file                   | Phase 2  |
| Labeling in place         | Each row has RYLA-relevant labels    | Review CSV columns                    | Phase 2  |
| Automation documented     | How to run + optional schedule       | README or ops doc                     | Phase 3  |

### Business Metrics Impact

**Target Metric**: [x] C-Core Value [ ] B-Retention [ ] D-Conversion [x] E-CAC [x] A-Activation

**Expected Impact**:

- **C-Core Value**: Better pipeline of workflows/models for product features.
- **E-CAC**: Less manual time spent on Civit.ai discovery.
- **A-Activation**: Faster inclusion of new workflows/models into the platform.

### Leading Indicators

- Playwright script successfully loads Civit.ai and performs search.
- At least one full run produces a non-empty CSV with expected columns.

### Lagging Indicators

- Team uses the CSV for triage or prioritization of workflows/models.
- New workflows/models are added to RYLA’s pipeline using the crawler output.

---

## Definition of Done

### Initiative Complete When

- [ ] Phase 1: Script runs against Civit.ai (e.g. models page + “workflow” search) and extracts listing data.
- [ ] Phase 2: Labeling logic and CSV export implemented; schema documented.
- [ ] Phase 3: Run instructions and optional automation (cron/CI) documented.
- [ ] At least one successful end-to-end run producing a valid CSV.
- [ ] README or equivalent doc in repo describing purpose, usage, and limitations.

### Not Done Criteria

**This initiative is NOT done if:**

- Script does not run or consistently fails on current Civit.ai structure.
- No CSV is produced or schema is undefined.
- Labeling is not applied (or column missing).
- No documentation on how to run or automate the script.

---

## Related Work

### Epics

| Epic | Name                              | Status   | Link |
| ---- | --------------------------------- | -------- | ---- |
| TBD  | Civit.ai Crawler – Discovery      | Proposed | TBD  |
| TBD  | Civit.ai Crawler – Labeling & CSV | Proposed | TBD  |
| TBD  | Civit.ai Crawler – Automation     | Proposed | TBD  |

### Dependencies

- **Blocked By**: None (optional alignment with IN-019, IN-028 for downstream use).
- **Blocks**: Nothing critical.
- **Related Initiatives**:
  - [IN-019](./IN-019-automated-workflow-analyzer.md) – Automated ComfyUI Workflow Analyzer (discovered workflows could feed analyzer).
  - [IN-028](./IN-028-workflow-to-serverless-deployment.md) – Workflow-to-Serverless (discovered workflows as candidates).
  - [IN-015](./IN-015-comfyui-workflow-api-alternatives.md) – ComfyUI Workflow-to-API evaluation (workflow discovery context).

### Documentation

- Civit.ai: [Models](https://civitai.com/models).
- Playwright MCP: available in project for browser automation.
- CSV schema and labeling rules: to be documented in script repo (e.g. `scripts/civitai-crawler/` or similar).

---

## Risks & Mitigation

| Risk                    | Probability | Impact | Mitigation Strategy                                            |
| ----------------------- | ----------- | ------ | -------------------------------------------------------------- |
| Civit.ai changes DOM/UX | Medium      | Medium | Use stable selectors; encapsulate parsing; document selectors. |
| Rate limiting / ToS     | Low         | High   | Throttle requests; respect robots.txt; avoid heavy load.       |
| “Workflow” search noise | Medium      | Low    | Label by type (workflow vs model); add filters in CSV.         |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed  
**Status**: Not started

### Recent Updates

- **2026-02-03**: Initiative created; scope: Civit.ai crawler, Playwright, “workflow” search, labeling, CSV export, automation.

### Next Steps

1. Confirm CSV schema and RYLA-fit labeling rules with Product.
2. Create epic(s) and stories for Phase 1 (Playwright discovery script).
3. Implement Phase 1: navigate to Civit.ai/models, search “workflow”, extract listing data.
4. Implement Phase 2: labeling and CSV export.
5. Document and add run/automation (Phase 3).

---

## Lessons Learned

[To be filled during/after initiative]

---

## References

- [Civit.ai – Models](https://civitai.com/models)
- Playwright MCP (project MCP server: user-playwright)
- IN-019, IN-028, IN-015 (related initiatives)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-02-03
