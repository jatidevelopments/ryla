---
name: runpod-setup
description: Sets up RunPod infrastructure for GPU workloads following RYLA safety policies. Use when creating RunPod endpoints, configuring GPU pods, or when the user mentions RunPod infrastructure.
---

# RunPod Setup

Sets up RunPod infrastructure for GPU workloads following RYLA safety policies.

## Quick Start

When setting up RunPod:

1. **Verify Safety Policy** - Review `runpod-safety.mdc` rule
2. **Create Endpoint** - Use RunPod MCP tools (create-only)
3. **Configure Resources** - Set GPU, memory, storage
4. **Document Resources** - Update resources ledger
5. **Test Endpoint** - Verify endpoint works

## Safety Policy

**CRITICAL**: RunPod operations are **create-only** and **confirmation-gated**.

### Allowed Operations

- ✅ Create endpoints
- ✅ List endpoints
- ✅ View endpoint details
- ✅ Check endpoint status

### Forbidden Operations

- ❌ Delete endpoints
- ❌ Modify existing endpoints
- ❌ Scale down resources
- ❌ Any destructive actions

### Confirmation Required

**Before creating any RunPod resource:**
1. Confirm resource type and size
2. Confirm cost implications
3. Confirm purpose and necessity
4. Get explicit user approval

## Using RunPod MCP Tools

### Create Endpoint

**Via MCP (Recommended):**
```
Create a RunPod endpoint named "comfyui-prod" with GPU A100, 80GB memory, and 100GB storage
```

**The agent will:**
1. Confirm resource requirements
2. Create endpoint via MCP
3. Document in resources ledger
4. Provide endpoint URL

### List Endpoints

```
List all RunPod endpoints
```

### Check Status

```
Check status of RunPod endpoint "comfyui-prod"
```

## Endpoint Configuration

### GPU Selection

**Available GPUs:**
- `A100` - 80GB (recommended for ComfyUI)
- `RTX 4090` - 24GB (cost-effective)
- `RTX 3090` - 24GB (budget option)

### Resource Sizing

**Memory:**
- Minimum: 16GB
- Recommended: 32GB+
- ComfyUI: 80GB (A100)

**Storage:**
- Minimum: 50GB
- Recommended: 100GB+
- For models: 200GB+

### Example Configuration

```yaml
name: comfyui-prod
gpu: A100
memory: 80GB
storage: 200GB
region: US
```

## Resources Ledger

### Document All Resources

**Location**: `docs/ops/runpod/RESOURCES.md`

**Format:**
```markdown
## Endpoints

| Name | GPU | Memory | Storage | Purpose | Cost/Month | Status |
|------|-----|--------|---------|---------|------------|--------|
| comfyui-prod | A100 | 80GB | 200GB | ComfyUI generation | $X | Active |
```

### Update After Creation

After creating any resource:
1. Update resources ledger
2. Document purpose
3. Note cost estimate
4. Set status to "Active"

## Cost Management

### Estimate Costs

**Before creating:**
- Check RunPod pricing
- Estimate monthly cost
- Confirm budget approval
- Document in resources ledger

### Monitor Usage

- Review RunPod dashboard regularly
- Track endpoint uptime
- Monitor GPU utilization
- Alert on unexpected costs

## Best Practices

### 1. Always Confirm Before Creating

```typescript
// ✅ Good: Confirm before creating
if (!userConfirmed) {
  throw new Error('User confirmation required for RunPod resource creation');
}

// ❌ Bad: Create without confirmation
await createEndpoint(config);
```

### 2. Document All Resources

```markdown
# ✅ Good: Document in ledger
| comfyui-prod | A100 | 80GB | 200GB | ComfyUI | $X | Active |

# ❌ Bad: No documentation
```

### 3. Use Appropriate GPU

```typescript
// ✅ Good: Match GPU to workload
const gpu = workload === 'comfyui' ? 'A100' : 'RTX 4090';

// ❌ Bad: Always use most expensive
const gpu = 'A100';
```

### 4. Set Resource Limits

```yaml
# ✅ Good: Appropriate limits
memory: 80GB
storage: 200GB

# ❌ Bad: Excessive resources
memory: 500GB
storage: 1000GB
```

### 5. Never Delete Without Approval

```typescript
// ❌ FORBIDDEN: Delete operations
await deleteEndpoint(endpointId);

// ✅ Good: Only create operations
await createEndpoint(config);
```

## Troubleshooting

### Endpoint Not Starting

1. Check GPU availability
2. Verify resource limits
3. Check RunPod status page
4. Review endpoint logs

### High Costs

1. Review endpoint uptime
2. Check for idle endpoints
3. Consider scaling down (with approval)
4. Review resource sizing

### Connection Issues

1. Verify endpoint URL
2. Check network connectivity
3. Review firewall rules
4. Test with curl/Postman

## Related Resources

- **Safety Policy**: `.cursor/rules/runpod-safety.mdc`
- **Resources Ledger**: `docs/ops/runpod/RESOURCES.md`
- **RunPod MCP**: See `mcp-ryla-api` skill for RunPod tools
