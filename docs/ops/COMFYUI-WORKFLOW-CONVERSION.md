# ComfyUI Workflow Conversion (UI JSON → API Prompt JSON)

RYLA’s ComfyUI integration executes workflows via the ComfyUI API endpoint `POST /prompt`.

That endpoint expects an **API prompt JSON** (execution graph) format:

- `{"1": {"class_type": "...", "inputs": {...}}, "2": {...}}`

However, the ComfyUI web UI “Save/Export” option typically produces a **UI workflow JSON** (graph editor) format:

- `{ "nodes": [...], "links": [...], "pos": ..., "widgets_values": ... }`

The UI JSON is great for editing and sharing in the UI, but it is **not directly POSTable** to `/prompt`.

## Option A — Export API format from the ComfyUI UI (recommended)

1. Open ComfyUI.
2. Enable dev options (wording can vary by version):
   - `Settings` → enable **Dev mode / Developer options**
3. Use the workflow menu:
   - `Workflow` → **Save (API Format)** / **Export (API)** (name varies)
4. The file you get is already in API prompt JSON format and can be used directly with `/prompt`.

## Option B — Convert via CLI (server-side converter endpoint)

This repo includes a CLI converter:

```bash
pnpm workflow:convert -- --in path/to/workflow.ui.json --out tmp/workflows/workflow.api.json
```

### Batch convert the entire workflow library

To convert everything under `libs/comfyui-workflows/**.json` into API prompt JSON and write outputs to a mirrored folder:

```bash
pnpm workflow:convert:all
```

Outputs:

- API prompt JSON: `libs/comfyui-workflows-api/**.api.json`
- Manifest: `libs/comfyui-workflows-api/manifest.json`

### Requirements

To convert UI JSON via CLI, your ComfyUI server must provide:

- `POST /workflow/convert` → returns API prompt JSON

This is typically provided by installing a public converter plugin (e.g. `comfyui-workflow-to-api-converter-endpoint`) on the pod.

## Installing the converter endpoint on the RunPod ComfyUI worker image (recommended)

If you deploy ComfyUI using our serverless worker image (`docker/comfyui-worker/Dockerfile`), ensure the converter plugin is installed in the image.

This repo’s Dockerfile includes installation via git clone into:

- `/workspace/ComfyUI/custom_nodes/comfyui-workflow-to-api-converter-endpoint`

After rebuilding and redeploying the worker image, verify the endpoint works:

```bash
curl -sS -X POST "$COMFYUI_POD_URL/workflow/convert" \
  -H "Content-Type: application/json" \
  --data @path/to/workflow.ui.json \
  | head
```

Expected: JSON response that looks like API prompt format (top-level keys are node IDs like `"1"`, `"2"`, etc.)

## Installing the converter endpoint on a persistent GPU pod (SSH/terminal)

If you’re running ComfyUI on a persistent GPU pod (not serverless), install the converter plugin into ComfyUI’s `custom_nodes` folder and restart ComfyUI.

### 1) Install the plugin

Typical ComfyUI path on RunPod images:

- `/workspace/ComfyUI`

Commands:

```bash
# (Optional) ensure git is installed
apt-get update && apt-get install -y git

cd /workspace/ComfyUI/custom_nodes
git clone https://github.com/SethRobinson/comfyui-workflow-to-api-converter-endpoint.git

# If the plugin ships Python deps, install them (safe even if file doesn't exist)
if [ -f comfyui-workflow-to-api-converter-endpoint/requirements.txt ]; then
  pip install -r comfyui-workflow-to-api-converter-endpoint/requirements.txt
fi
```

### 2) Restart ComfyUI

How you restart depends on how you launched it:

- If you started ComfyUI in a terminal (`python main.py`), stop and rerun it.
- If it’s managed by something like `supervisor`/`systemd`, restart that service.

### 3) Verify the endpoint

From the pod (or any machine that can reach the ComfyUI URL):

```bash
curl -sS -X POST "$COMFYUI_POD_URL/workflow/convert" \
  -H "Content-Type: application/json" \
  --data @path/to/workflow.ui.json \
  | head
```

Expected: JSON with top-level node-id keys like `"1"`, `"2"`, etc.

### Environment variables

```bash
COMFYUI_POD_URL=https://<your-pod-host>:8188
```

### Advanced

- Override base URL:

```bash
pnpm workflow:convert -- --in workflow.json --baseUrl http://localhost:8188
```

- Override endpoint path:

```bash
pnpm workflow:convert -- --in workflow.json --endpoint /workflow/convert
```

## Notes

- If the input file is already API prompt JSON, the CLI will **pass-through** and just write it to the output path.
- Even after conversion, the workflow may still fail at runtime if required **models** or **custom nodes** are missing on the pod.
