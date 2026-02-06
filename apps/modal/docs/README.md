# Modal docs

Documentation for `apps/modal/`.

## Living docs (keep updated)

| Doc | Purpose |
|-----|--------|
| [ENDPOINTS-REFERENCE.md](./ENDPOINTS-REFERENCE.md) | Request/response for each endpoint |
| [APP-ORGANIZATION-STRATEGY.md](./APP-ORGANIZATION-STRATEGY.md) | Why split apps and how they’re organized |
| [TESTING-GUIDE.md](./status/TESTING-GUIDE.md) | How to test split apps |

Root **[../README.md](../README.md)** and **[../STRUCTURE.md](../STRUCTURE.md)** describe deploy and folder layout.

## Ops / deployment

Deployment and audit live under the repo ops docs:

- [docs/ops/deployment/modal/](../../../docs/ops/deployment/modal/README.md) – Quick start, production deploy, timeouts
- [MODAL-AUDIT.md](../../../docs/ops/deployment/modal/MODAL-AUDIT.md) – Endpoints, scripts, tests audit

## status/

`status/` holds:

- **Benchmark and test results**: e.g. `BENCHMARK-RESULTS.md`, `BENCHMARK-RESULTS.json`, test result JSON/MD.
- **Historical status**: Many one-off migration/deployment/status reports. Use for reference; prefer updating `ENDPOINT-APP-MAPPING.md` and the living docs above for current state.

## Other

- [DEPLOYMENT.md](./DEPLOYMENT.md), [QUICK-START.md](./QUICK-START.md) – Legacy deployment/quick start
- [BEST-PRACTICES.md](./BEST-PRACTICES.md) – Referenced from ops docs; may live in `docs/ops/deployment/modal/` as well
- Model/GPU: [specs/modal/GPU-REQUIREMENTS.md](../../../docs/specs/modal/GPU-REQUIREMENTS.md) if present
