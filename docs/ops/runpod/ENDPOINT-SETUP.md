# RunPod Serverless Endpoints Setup Notes (ryla-prod-guarded)

## Current State

We created serverless templates + endpoints via RunPod MCP:

- Flux template: `jx2h981xwv`
- Z-Image template: `x1ua87uhrs`
- Flux endpoint: `jpcxjab2zpro19`
- Z-Image endpoint: `xqs8k7yhabwh0k`

These are also recorded in `docs/ops/runpod/RESOURCES.md`.

## Network Volume Attachment (IMPORTANT)

Our handlers expect models at:

- `/workspace/models/checkpoints/flux1-schnell.safetensors` (required)
- Z-Image-Turbo: Loaded from HuggingFace repo `Tongyi-MAI/Z-Image-Turbo` (no local file needed)

We already have a network volume:

- Name: `ryla-models-dream-companion`
- ID: `xeqfzsy4k7`
- Data center: `EU-RO-1`

**However**, the current RunPod MCP endpoint tools do **not** expose a `networkVolumeId` field on `create-endpoint` or `update-endpoint`.

### What to do

Attach the network volume to both endpoints **manually in the RunPod Console**:

1. RunPod Console → Serverless → Endpoints
2. Open endpoint:
   - `ryla-prod-guarded-flux-dev-endpoint -fb` (id: `jpcxjab2zpro19`)
   - `ryla-prod-guarded-z-image-turbo-endpoint -fb` (id: `xqs8k7yhabwh0k`)
3. Set **Network Volume** to `ryla-models-dream-companion` (`xeqfzsy4k7`)
4. Click **Save Endpoint**

#### Why you don’t see “Mount path”

For our setup, the network volume mount path is **defined by the template** and is not exposed as an editable field in the endpoint UI. Our templates mount volumes at `/workspace` (RunPod default for template volume mount paths). See RunPod docs on template volume mount paths: `https://docs.runpod.io/pods/templates/manage-templates`.

#### Where to put the files

Because the volume is mounted at `/workspace`, our handlers look for models under:

- `/workspace/models/checkpoints/flux1-schnell.safetensors` (required)
- Z-Image-Turbo: Loaded from HuggingFace repo `Tongyi-MAI/Z-Image-Turbo` (no local file needed)

So you need to create `/workspace/models/checkpoints/` on the **network volume** and place the files there.

After attaching, download required models onto the volume per `docs/technical/RUNPOD-SERVERLESS-DEPLOYMENT.md`.
