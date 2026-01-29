# Workflow Deployment Tool

One-command deployment tool for ComfyUI workflows to Modal/RunPod serverless.

## Features

- ✅ **Automatic Dependency Detection** - Analyzes workflow JSON and extracts custom nodes and models
- ✅ **Automatic Code Generation** - Generates Modal Python or RunPod Dockerfile with all dependencies
- ✅ **Zero Manual Setup** - No need to manually research nodes or write deployment code
- ✅ **Workflow Isolation** - Each workflow gets its own isolated endpoint

## Usage

### Analyze Workflow

Analyze a workflow JSON file to see dependencies:

```bash
pnpm workflow-deploy analyze workflow.json --name="My Workflow"
```

Output:
- Lists all custom nodes and their sources (Manager/GitHub)
- Lists all models and their types
- Shows missing dependencies (not in registry)
- Saves analysis JSON file

### Generate Deployment Code

Generate deployment code without deploying:

```bash
# Generate Modal Python code
pnpm workflow-deploy generate workflow.json --platform=modal --name="my-workflow"

# Generate RunPod Dockerfile
pnpm workflow-deploy generate workflow.json --platform=runpod --name="my-workflow"
```

Options:
- `--platform`: `modal` or `runpod` (default: `modal`)
- `--name`: Workflow name (used for function/app name)
- `--output`: Output directory (default: `./scripts/generated/workflows`)
- `--gpu`: GPU type for Modal (default: `A100`)
- `--timeout`: Timeout in seconds (default: `1800`)
- `--volume`: Volume name for Modal (default: `ryla-models`)

### Deploy Workflow

Analyze, generate, and deploy workflow (Modal only for now):

```bash
pnpm workflow-deploy deploy workflow.json --platform=modal --name="my-workflow"
```

**Note**: Automatic deployment coming soon. For now, use `generate` command and deploy manually.

## Examples

### Example 1: Analyze a Workflow

```bash
pnpm workflow-deploy analyze workflows/my-workflow.json
```

Output:
```
📊 Analyzing workflow: workflows/my-workflow.json

✅ Workflow Analysis:
   ID: workflow_abc123
   Name: My Workflow
   Type: image
   Custom Nodes: 3
   Models: 2

📦 Custom Nodes:
   ✅ ClownsharKSampler_Beta → Manager: res4lyf
   ✅ FluxResolutionNode → Manager: controlaltai-nodes
   ✅ PulidFluxModelLoader → GitHub: https://github.com/cubiq/ComfyUI_PuLID.git (main)

🖼️  Models:
   ✅ flux1-dev.safetensors → HuggingFace (checkpoint)
   ✅ pulid_flux_v0.9.1.safetensors → HuggingFace (pulid)

💾 Analysis saved to: workflows/my-workflow_analysis.json
```

### Example 2: Generate Modal Code

```bash
pnpm workflow-deploy generate workflow.json \
  --platform=modal \
  --name="z-image-workflow" \
  --gpu="A100" \
  --timeout="1800"
```

This generates:
- `scripts/generated/workflows/z_image_workflow_modal.py`

Then deploy:
```bash
modal deploy scripts/generated/workflows/z_image_workflow_modal.py
```

### Example 3: Generate RunPod Dockerfile

```bash
pnpm workflow-deploy generate workflow.json \
  --platform=runpod \
  --name="my-workflow"
```

This generates:
- `scripts/generated/workflows/my_workflow_Dockerfile`

Then:
1. Build image: `docker build -f scripts/generated/workflows/my_workflow_Dockerfile -t your-registry/my-workflow:latest .`
2. Push image: `docker push your-registry/my-workflow:latest`
3. Create RunPod endpoint with the image

## How It Works

1. **Workflow Analysis**: Parses workflow JSON and extracts:
   - Custom node types (`class_type` values)
   - Model filenames from node inputs
   - Workflow type (image, video, face-swap, etc.)

2. **Dependency Mapping**: Maps extracted dependencies to:
   - ComfyUI Manager packages (for Manager-registered nodes)
   - GitHub repositories (for custom nodes)
   - Model sources (HuggingFace, Civitai, etc.)

3. **Code Generation**: Generates deployment code with:
   - All required custom nodes installed
   - Model setup instructions
   - Workflow execution logic

4. **Deployment**: (Coming soon) Automatically deploys to platform

## Workflow Isolation

Each workflow gets its own:
- **Modal**: Separate function/endpoint
- **RunPod**: Separate Dockerfile/endpoint

This ensures:
- Updates to one workflow don't affect others
- Different workflows can use different node versions
- Independent scaling and deployment

## Limitations

- **Missing Dependencies**: Nodes/models not in registry need manual setup
- **Version Pinning**: Currently uses latest versions (version pinning coming soon)
- **Model Download**: Models not in registry need manual download
- **Automatic Deployment**: Modal deployment requires manual `modal deploy` command (automatic coming soon)

## Related Documentation

- [IN-028: Zero-Setup Workflow-to-Serverless Deployment](../../../docs/initiatives/IN-028-workflow-to-serverless-deployment.md)
- [ComfyUI Launcher Analysis](../../../docs/research/infrastructure/COMFYUI-LAUNCHER-ANALYSIS.md)
- [IN-008: ComfyUI Dependency Management](../../../docs/initiatives/IN-008-comfyui-dependency-management.md)
