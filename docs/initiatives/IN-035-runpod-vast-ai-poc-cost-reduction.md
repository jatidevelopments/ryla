# [INITIATIVE] IN-035: RunPod & Vast.ai POC for Cost Reduction

**Status**: Proposed (Future)  
**Created**: 2026-01-31  
**Last Updated**: 2026-01-31  
**Owner**: Infrastructure Team  
**Stakeholders**: Infrastructure Team, Engineering Team

---

## Executive Summary

**One-sentence description**: Run a later-phase POC validating RunPod Serverless and Vast.ai as GPU inference alternatives to Modal.com to quantify cost savings and feasibility without disrupting current production.

**Business Impact**: **E-CAC** (reduce GPU/inference costs), **C-Core Value** (maintain quality), **B-Retention** (reliability)

---

## Why (Business Rationale)

### Problem Statement

RYLA runs AI inference (ComfyUI, Flux, Qwen-Image, video, etc.) on **Modal.com**. Cost scales with usage. **RunPod Serverless** and **Vast.ai** can offer lower GPU pricing. Before committing to a migration, we need evidence that:

1. RunPod and/or Vast.ai can run our workloads (same or adapted code).
2. Cost per job is meaningfully lower at comparable quality and latency.
3. Operational overhead (deploy, monitor, debug) remains acceptable.

### Current State

- **Modal**: Primary inference backend; Python apps, `modal deploy`, FastAPI/ASGI, ComfyUI in containers. Backend uses `RunPodJobRunner` interface with `ModalJobRunnerAdapter`.
- **RunPod**: Adapter and Docker-based handlers exist (`docker/runpod-handlers/`, `generate-runpod-dockerfile.ts`); some handlers use Diffusers, not full ComfyUI parity with Modal.
- **Vast.ai**: IN-030 evaluates Vast; no production integration yet. No “serverless HTTP” product like Modal/RunPod; API for running containers/jobs.

### Desired State

- **POC outcome**: Clear go/no-go and cost/quality comparison for RunPod Serverless and Vast.ai vs Modal for a subset of workloads (e.g. flux-dev, qwen-image).
- **If go**: Path to adopt one or both as additional or alternative backends, using existing `RunPodJobRunner` abstraction so API layer stays unchanged.

### Business Drivers

- **Cost Impact**: Reduce inference cost (target: meaningful % reduction vs Modal at same usage).
- **Risk Mitigation**: Validate alternatives before scaling; avoid single-provider lock-in.
- **User Experience**: No regression in latency or quality; POC must measure both.

---

## How (Approach & Strategy)

### Strategy

**POC-only, later phase.** No production migration in this initiative. Focus on:

1. **RunPod Serverless POC**
   - Deploy 1–2 representative workflows (e.g. flux-dev, qwen-image-2512) as RunPod serverless endpoints (ComfyUI-based where possible to match Modal).
   - Measure: cost per job, latency (cold/warm), success rate, operational effort (deploy, logs, debugging).
   - Document: deploy path, handler contract, and gaps vs Modal.

2. **Vast.ai POC**
   - Run same (or subset of) workflows on Vast.ai (container/API model; no native serverless HTTP).
   - Measure: same as RunPod; note any extra glue (e.g. our own HTTP wrapper, queue, or job polling).
   - Document: image build, run API, cost model, and feasibility for “serverless-like” usage.

3. **Comparison & recommendation**
   - Compare Modal vs RunPod vs Vast on cost, latency, reliability, and ops. Produce a short recommendation (e.g. “RunPod for X, stay on Modal for Y” or “Vast not viable for serverless”).

### Key Principles

- Minimise disruption: POC runs alongside Modal; no production traffic switch until decision.
- Reuse abstraction: New backends implement existing `RunPodJobRunner` (or extended interface) so API and callers stay unchanged.
- Data-driven: Decisions based on measured cost and quality, not assumptions.

### Phases

1. **Scope & design** – Pick 1–2 workflows and success metrics; document runbooks for RunPod and Vast POC.
2. **RunPod POC** – Deploy, run load, collect cost/latency/quality; document findings.
3. **Vast.ai POC** – Same for Vast; document findings and integration effort.
4. **Compare & recommend** – Report + go/no-go and, if go, high-level migration path.

### Dependencies

- Existing code: `RunPodJobRunner` interface, Modal handlers/workflows, RunPod Dockerfile generator, RunPod handlers.
- IN-030 (Vast.ai Alternative Infrastructure Evaluation): can feed into or be folded into this POC.
- Capacity: engineering time for POC execution and documentation (non–business-critical, “later”).

### Constraints

- POC only: no commitment to migrate; no production cutover in this initiative.
- Must not regress production Modal stability or feature work.

---

## When (Timeline & Priority)

### Timeline

- **Start**: Backlog / when capacity allows (no fixed date).
- **Target**: POC complete within 4–8 weeks once started.
- **Milestones**: Scope doc → RunPod POC done → Vast POC done → Comparison report & recommendation.

### Priority

**Priority Level**: P2 (later, cost optimisation)

**Rationale**: Cost reduction is valuable but not blocking current product or reliability. Fits when there is slack for infra experimentation.

### Resource Requirements

- **Team**: Infrastructure (and optionally 1 engineer for adapter/handler work).
- **Budget**: POC spend on RunPod + Vast (expected small; can cap).
- **External**: RunPod account, Vast.ai account, same secrets/env approach as today.

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Role**: Infrastructure / Tech Lead  
**Responsibilities**: Scope POC, assign tasks, review cost/quality results, write recommendation.

### Key Stakeholders

| Role            | Involvement | Responsibilities                    |
|-----------------|-------------|-------------------------------------|
| Infrastructure  | High        | Run POC, measure cost/latency, docs |
| Engineering     | Medium      | Adapter/handler changes if needed   |
| Product/Finance | Low         | Consume recommendation for roadmap  |

### Communication Plan

- **Updates**: Async (e.g. Slack #mvp-ryla-dev or #mvp-ryla-log); short written summary at POC end.
- **Audience**: Infra, Engineering, and anyone interested in cost reduction.

---

## Success Criteria

### Primary Success Metrics (POC)

| Metric              | Target                    | Measurement                    |
|---------------------|---------------------------|--------------------------------|
| Cost comparison     | Documented $/job or $/hr   | Modal vs RunPod vs Vast        |
| Latency (p95)       | No major regression        | Cold/warm runs for 1–2 flows   |
| Success rate         | ≥ same as Modal baseline   | Per workflow, per provider     |
| Ops effort           | Documented                 | Deploy, debug, monitor         |

### Business Metrics Impact

**Target Metric**: **E-CAC**

**Expected Impact**: If POC is positive, follow-on work (e.g. migration epic) would target reduced inference cost (e.g. X% savings) with no degradation in C-Core Value or B-Retention.

### Definition of Done (POC)

- [ ] RunPod POC: at least one workflow deployed and measured (cost, latency, success rate).
- [ ] Vast.ai POC: same or subset workflow(s) run and measured.
- [ ] Comparison report: Modal vs RunPod vs Vast (cost, latency, reliability, ops).
- [ ] Recommendation: go/no-go and, if go, suggested next steps (e.g. epic for RunPod migration).
- [ ] Findings and runbooks documented in `docs/` (e.g. technical/infrastructure or initiatives).

### Not Done

- Production traffic moved to RunPod or Vast.
- Full workflow parity across all Modal endpoints.
- Commitment to migrate without explicit go-decision.

---

## Related Work

### Epics

| Epic   | Name                          | Status   | Link |
|--------|-------------------------------|----------|------|
| (TBD)  | RunPod Serverless POC Epic    | Future   | —    |
| (TBD)  | Vast.ai POC Epic              | Future   | —    |

### Dependencies

- **Related initiatives**: IN-030 (Vast.ai Alternative Infrastructure Evaluation) – can be merged into or coordinated with this POC.
- **Blocks**: Any “migrate off Modal” or “multi-provider inference” epic until POC recommendation.
- **Blocked by**: None (can start when prioritised).

### Documentation

- Modal overview: `apps/modal/`, `apps/modal/apps/README.md`
- RunPod: `docker/runpod-handlers/`, `scripts/workflow-deployer/generate-runpod-dockerfile.ts`
- Job runner abstraction: `libs/business/src/services/image-generation.service.ts` (`RunPodJobRunner`), `modal-job-runner.ts`, RunPod adapter in `apps/api`

---

## Risks & Mitigation

| Risk                 | Probability | Impact | Mitigation                          |
|----------------------|------------|--------|-------------------------------------|
| RunPod/Vast too different from Modal | Medium | Medium | POC scoped to 1–2 workflows; document gaps and effort. |
| Cost savings small   | Medium     | Low    | POC answers this; no migration if savings negligible. |
| POC deprioritised    | High       | Low    | Initiative is “later”; OK to delay until capacity exists. |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed (not started)  
**Status**: Backlog

### Next Steps (when started)

1. Define POC scope (workflows, metrics, runbooks).
2. Run RunPod Serverless POC; record cost, latency, success rate, ops.
3. Run Vast.ai POC; same.
4. Write comparison report and recommendation; document in repo.

---

## References

- IN-030: Vast.ai Alternative Infrastructure Evaluation
- Modal apps: `apps/modal/apps/README.md`
- RunPod Serverless: `docker/runpod-handlers/README.md`, RunPod docs
- Way of Work: `.cursor/rules/way-of-work.mdc` (naming, Slack)

---

**Template Version**: 1.0  
**Initiative Type**: POC / cost reduction (later phase)
