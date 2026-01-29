# Modal.com Deployment Documentation

> **Last Updated**: 2026-01-27

---

## Overview

RYLA uses Modal.com for serverless ComfyUI deployments. This directory contains all Modal-related documentation and guides.

---

## Documentation Index

### Guides

- **[Best Practices](./BEST-PRACTICES.md)** - Comprehensive guide to Modal.com best practices
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

### Cursor Rules

- **[Modal Cursor Rule](../../../../.cursor/rules/mcp-modal.mdc)** - AI agent guidelines for Modal.com

### Utilities

- **[Modal Utils](../../../../scripts/workflow-deployer/modal-utils.ts)** - TypeScript utilities for Modal CLI

---

## Quick Start

### Deploy a Workflow

```bash
# 1. Generate deployment code
pnpm workflow:deploy generate workflow.json --platform=modal --name="my-workflow"

# 2. Deploy
modal deploy scripts/generated/workflows/my_workflow_modal.py

# 3. Check status
pnpm workflow:deploy status ryla-my-workflow

# 4. View logs (with timeout)
pnpm workflow:deploy logs ryla-my-workflow --timeout=30
```

### Common Commands

```bash
# Deploy
modal deploy apps/modal/app.py

# View logs (ALWAYS use timeout)
timeout 30 modal app logs <app-name> || echo "Timeout"

# Or use utility
pnpm workflow:deploy logs <app-name> --timeout=30

# Check status
pnpm workflow:deploy status <app-name>

# List apps
modal app list
```

---

## Key Points

### ⚠️ Always Use Timeouts

Modal CLI commands (especially `modal app logs`) can hang indefinitely. Always use timeouts:

```bash
# ❌ Bad
modal app logs my-app

# ✅ Good
timeout 30 modal app logs my-app || echo "Timeout"

# ✅ Best (uses utility)
pnpm workflow:deploy logs my-app --timeout=30
```

### Cold Starts

First request to a Modal function can take 2-5 minutes:
- Container startup: ~30s
- ComfyUI installation: ~1-2 min
- Model loading: ~1-2 min
- Server startup: ~30s

Plan for this delay in your client code.

### Image Building

- Build incrementally (cache layers)
- Copy files explicitly (`.copy_local_file()`)
- Handle missing files gracefully

---

## Related Documentation

- [Modal Best Practices](./BEST-PRACTICES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Cursor Rule](../../../../.cursor/rules/mcp-modal.mdc)
- [Workflow Deployment Tool](../../../../scripts/workflow-deployer/README.md)

---

**Last Updated**: 2026-01-27
