# ComfyUI Infrastructure Documentation

Documentation for ComfyUI setup, deployment, and usage in RYLA.

---

## Quick Links

### Setup & Deployment

- **[ComfyUI Serverless Setup Guide](./COMFYUI-SERVERLESS-SETUP-GUIDE.md)** ⭐ **START HERE**
  - Deploy ComfyUI serverless endpoints from RunPod Hub
  - Submit workflows via API
  - Scale automatically
  - Based on [RunPod official tutorial](https://docs.runpod.io/tutorials/serverless/comfyui)

- **[ComfyUI Pod Info](./COMFYUI-POD-INFO.md)**
  - Information about dedicated ComfyUI pod (for testing)
  - Access URLs, ports, SSH details

- **[ComfyUI Testing Guide](./COMFYUI-TESTING-GUIDE.md)**
  - Test workflows in ComfyUI pod before serverless deployment
  - Validate workflow JSON
  - Debug issues

### Implementation

- **[ComfyUI RunPod Implementation Plan](./COMFYUI-RUNPOD-IMPLEMENTATION-PLAN.md)**
  - Overall implementation strategy
  - Phase-by-phase plan
  - Architecture decisions

### Development Tools

- **[ComfyUI-Copilot](./COMFYUI-COPILOT.md)** 🤖 **NEW**
  - AI-powered workflow generation and debugging
  - Natural language workflow creation
  - Automated error detection and fixes
  - Parameter tuning and optimization
  - Node and model discovery

---

## Architecture Decision

**Current Approach**: Use **RunPod Serverless Endpoints** for ComfyUI (per [ADR-006](../../../decisions/ADR-006-runpod-serverless-over-dedicated-pods.md))

**Why Serverless**:
- ✅ Automatic scaling
- ✅ Pay per use (no idle costs)
- ✅ Operational simplicity
- ✅ Better reliability

**Cold Start Mitigation**:
- Use network volumes for model storage
- Models persist across workers
- Reduces cold start time significantly

---

## Workflow Builders

RYLA has TypeScript workflow builders in `libs/business/src/workflows/`:

- `z-image-danrisi.ts` - Z-Image-Turbo workflow with LoRA support
- `flux-pulid.ts` - Flux Dev with PuLID face consistency
- `z-image-pulid.ts` - Z-Image-Turbo with PuLID

**Usage**:
```typescript
import { buildZImageDanrisiWorkflow } from '@ryla/business/workflows';

const workflow = buildZImageDanrisiWorkflow({
  prompt: "Your prompt here",
  width: 1024,
  height: 1024,
  lora: { name: "character.safetensors", strength: 1.0 }
});
```

---

## Research & Alternatives

- **[ComfyUI Open-Source Alternatives](../../research/infrastructure/COMFYUI-OPEN-SOURCE-ALTERNATIVES.md)** 🔍
  - Comparison of open-source alternatives to ComfyUI (Fooocus, InvokeAI, etc.)
  - UX comparison and workflow flexibility analysis
  - How alternatives fit into RYLA's architecture

- **[ComfyUI Platform Market Research](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md)**
  - Cloud hosting platforms comparison (RunComfy, ViewComfy, Modal, etc.)
  - Cost analysis and serverless capabilities
  - Platform evaluation for RYLA's infrastructure

## Related Documentation

- [RunPod Setup Guide](../runpod/RUNPOD-SETUP.md)
- [RunPod Serverless Deployment](../runpod/RUNPOD-SERVERLESS-DEPLOYMENT.md)
- [ComfyUI Workflow Conversion](../../../ops/COMFYUI-WORKFLOW-CONVERSION.md)
- [Serverless Test Results](../../../ops/runpod/COMFYUI-SERVERLESS-TEST-RESULTS.md)

---

**Last Updated**: 2026-01-27
