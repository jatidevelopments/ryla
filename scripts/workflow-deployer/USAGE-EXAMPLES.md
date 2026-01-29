# Workflow Deployment Tool - Usage Examples

## Quick Start

### 1. Analyze a Workflow

```bash
# Basic analysis
pnpm workflow:deploy analyze workflow.json

# With custom name
pnpm workflow:deploy analyze workflow.json --name="My Workflow"

# With auto-discovery of unknown nodes
pnpm workflow:deploy analyze workflow.json --discover
```

### 2. Generate Deployment Code

```bash
# Generate Modal Python code
pnpm workflow:deploy generate workflow.json --platform=modal --name="my-workflow"

# Generate RunPod Dockerfile
pnpm workflow:deploy generate workflow.json --platform=runpod --name="my-workflow"

# With custom options
pnpm workflow:deploy generate workflow.json \
  --platform=modal \
  --name="z-image-workflow" \
  --gpu="A100" \
  --timeout="1800" \
  --volume="ryla-models"
```

### 3. Deploy Workflow

```bash
# Analyze, generate, and prepare for deployment
pnpm workflow:deploy deploy workflow.json --platform=modal --name="my-workflow"
```

## Real-World Examples

### Example 1: Denrisi Workflow

```bash
# 1. Analyze
pnpm workflow:deploy analyze scripts/workflow-deployer/test-denrisi-workflow.json --name="Z-Image Danrisi"

# Output:
# ✅ Workflow Analysis:
#    ID: workflow_navk65
#    Name: Z-Image Danrisi
#    Type: image
#    Custom Nodes: 3
#    Models: 3
#
# 📦 Custom Nodes:
#    ✅ BetaSamplingScheduler → Manager: res4lyf
#    ✅ Sigmas Rescale → Manager: res4lyf
#    ✅ ClownsharKSampler_Beta → Manager: res4lyf
#
# 🖼️  Models:
#    ✅ z_image_turbo_bf16.safetensors → HuggingFace (checkpoint)
#    ✅ qwen_3_4b.safetensors → HuggingFace (checkpoint)
#    ✅ z-image-turbo-vae.safetensors → HuggingFace (checkpoint)

# 2. Generate Modal code
pnpm workflow:deploy generate scripts/workflow-deployer/test-denrisi-workflow.json \
  --platform=modal \
  --name="z-image-danrisi"

# 3. Deploy
modal deploy scripts/generated/workflows/z_image_danrisi_modal.py
```

### Example 2: Workflow with Unknown Nodes

```bash
# Analyze with auto-discovery
pnpm workflow:deploy analyze workflow.json --discover

# This will:
# 1. Analyze workflow
# 2. Query ComfyUI Manager registry for unknown nodes
# 3. Search GitHub for custom node repositories
# 4. Update analysis with discovered sources
```

### Example 3: Multiple Workflows

```bash
# Generate code for multiple workflows
for workflow in workflows/*.json; do
  pnpm workflow:deploy generate "$workflow" \
    --platform=modal \
    --name="$(basename "$workflow" .json)"
done
```

## Common Workflows

### Workflow from ComfyUI Community

1. **Download workflow JSON** from ComfyUI community
2. **Analyze it**:
   ```bash
   pnpm workflow:deploy analyze downloaded-workflow.json --discover
   ```
3. **Generate deployment code**:
   ```bash
   pnpm workflow:deploy generate downloaded-workflow.json --platform=modal
   ```
4. **Deploy**:
   ```bash
   modal deploy scripts/generated/workflows/downloaded_workflow_modal.py
   ```

### Workflow from ComfyUI UI

1. **Export workflow** from ComfyUI UI (API format or full export)
2. **Save as JSON file**
3. **Analyze and deploy**:
   ```bash
   pnpm workflow:deploy deploy exported-workflow.json --platform=modal
   ```

## Troubleshooting

### Missing Nodes

If you see "Missing Nodes (not in registry)":

1. **Try auto-discovery**:
   ```bash
   pnpm workflow:deploy analyze workflow.json --discover
   ```

2. **Manually add to registry**:
   - Edit `scripts/setup/node-package-mapper.ts`
   - Add mapping: `'NodeType': 'package-name'`
   - Or add to `scripts/setup/comfyui-registry.ts`

### Missing Models

If you see "Missing Models (not in registry)":

1. **Manually download models** to network volume
2. **Add to registry**:
   - Edit `scripts/setup/comfyui-registry.ts`
   - Add model source (HuggingFace, Civitai, etc.)

### Generated Code Doesn't Work

1. **Check for missing dependencies** in analysis
2. **Verify custom nodes are installed correctly**
3. **Check ComfyUI server logs** for errors
4. **Test workflow in ComfyUI UI first** to ensure it works

## Best Practices

1. **Always analyze first** before generating code
2. **Use --discover flag** for unknown workflows
3. **Test generated code** in staging before production
4. **Keep registry updated** with commonly used nodes/models
5. **Version pin dependencies** when possible

## Related Documentation

- [Workflow Deployment README](./README.md)
- [IN-028 Implementation Status](../../../docs/initiatives/IN-028-IMPLEMENTATION-STATUS.md)
- [ComfyUI Dependency Management](../../../docs/initiatives/IN-008-comfyui-dependency-management.md)
