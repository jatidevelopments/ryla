# Modal.com Deployment

> **Last Updated**: 2026-02-04

---

## Overview

RYLA runs serverless ComfyUI on Modal.com. **Production uses split apps** (one Modal app per workflow group). This directory holds deployment and ops docs.

---

## Production deployment (split apps)

Deploy from repo root or from `apps/modal`:

```bash
cd apps/modal
./deploy.sh              # Deploy all split apps
./deploy.sh flux         # Deploy one app (flux | instantid | qwen-image | qwen-edit | z-image | wan26 | seedvr2 | lora | ...)
```

**App list**: 7 main apps — `ryla-flux`, `ryla-instantid`, `ryla-qwen-image`, `ryla-qwen-edit`, `ryla-z-image`, `ryla-wan26`, `ryla-seedvr2`.  
**Endpoint → app mapping**: [apps/modal/ENDPOINT-APP-MAPPING.md](../../../apps/modal/ENDPOINT-APP-MAPPING.md).

Do **not** use `modal deploy apps/modal/app.py` for production; that is the legacy single app.

---

## Documentation index

| Doc | Purpose |
|-----|--------|
| [MODAL-AUDIT.md](./MODAL-AUDIT.md) | Audit of endpoints, scripts, tests, and repo consistency |
| [BEST-PRACTICES.md](./BEST-PRACTICES.md) | Modal.com best practices |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues and fixes |

### Other

- **Cursor rule**: [.cursor/rules/mcp-modal.mdc](../../../.cursor/rules/mcp-modal.mdc)
- **Modal utils**: [scripts/workflow-deployer/modal-utils.ts](../../../scripts/workflow-deployer/modal-utils.ts)
- **App README**: [apps/modal/README.md](../../../apps/modal/README.md)

---

## Common commands

```bash
# Deploy (use deploy.sh; see above)
cd apps/modal && ./deploy.sh

# View logs (always use a timeout)
timeout 30 modal app logs ryla-flux || true
pnpm workflow:deploy logs ryla-flux --timeout=30

# Status / list
pnpm workflow:deploy status ryla-flux
modal app list
```

---

## Important

### Timeouts

`modal app logs` can hang. Always use a timeout:

```bash
timeout 30 modal app logs <app-name> || echo "Timeout"
```

### Cold starts

First request per app can take 2–5 minutes (container + ComfyUI + models). Plan for this in clients.

### Image builds

- Build incrementally (cache layers).
- Copy files explicitly (e.g. `.copy_local_file()`).

---

## Related

- [Modal Best Practices](./BEST-PRACTICES.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Workflow deployer](../../../scripts/workflow-deployer/README.md)
