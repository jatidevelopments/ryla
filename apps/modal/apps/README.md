# Modal Individual Apps

This directory contains isolated Modal apps, one per workflow/model.

## Structure

```
apps/modal/apps/
├── flux/          # Flux Schnell & Flux Dev
├── instantid/     # InstantID face consistency
├── wan2/          # Wan2.1 text-to-video
├── seedvr2/       # SeedVR2 upscaling
└── z-image/       # Z-Image-Turbo workflows
```

## App Structure

Each app follows this structure:

```
{app-name}/
├── app.py         # Modal app definition
├── handler.py     # Workflow handler logic
├── image.py       # App-specific image (extends shared/image_base.py)
└── README.md      # App-specific documentation (optional)
```

## Deployment

### Deploy All Apps

```bash
cd apps/modal
./deploy.sh
```

### Deploy Single App

```bash
cd apps/modal
./deploy.sh flux
```

Or directly:

```bash
modal deploy apps/modal/apps/flux/app.py
```

## Benefits

1. **Agent Isolation**: Each app has isolated files for parallel agent work
2. **Independent Deployment**: Deploy one app without affecting others
3. **Faster Iteration**: Deploy only what changed
4. **Parallel Testing**: Test multiple apps simultaneously
5. **Clear Boundaries**: Each workflow has clear file ownership

## Shared Code

Shared code is in `apps/modal/shared/`:
- `config.py` - Shared configuration
- `image_base.py` - Base image with ComfyUI
- `utils/` - Shared utilities

**Note**: Shared code is read-only for agents. Changes require coordination.

## Agent Assignment

Each app is assigned to a specific agent:

- **Flux Agent**: `apps/flux/**`
- **InstantID Agent**: `apps/instantid/**`
- **Wan2 Agent**: `apps/wan2/**`
- **SeedVR2 Agent**: `apps/seedvr2/**`
- **Z-Image Agent**: `apps/z-image/**`

Agents can work in parallel without file conflicts.

## Related Documentation

- [App Organization Strategy](../docs/APP-ORGANIZATION-STRATEGY.md)
- [Multi-Agent Migration Plan](../docs/MULTI-AGENT-MIGRATION-PLAN.md)
- [IN-031: Agentic Workflow Deployment](../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)
- [IN-027: Multi-Agent Orchestration](../../../docs/initiatives/IN-027-multi-agent-orchestration-system.md)
