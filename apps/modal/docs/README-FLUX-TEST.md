# Flux Schnell Test - Modal.com Documentation Example

This is a simple test implementation following the [Modal.com ComfyUI guide](https://modal.com/docs/examples/comfyui).

## Quick Start

### 1. Deploy the App

```bash
modal deploy apps/modal/comfyui_flux_test.py
```

### 2. Test with Client Script

```bash
# Make client executable
chmod +x apps/modal/comfyclient_flux.py

# Run test
python apps/modal/comfyclient_flux.py --prompt "Surreal dreamscape with floating islands, upside-down waterfalls, and impossible geometric structures, all bathed in a soft, ethereal light"
```

Or specify workspace explicitly:

```bash
python apps/modal/comfyclient_flux.py \
  --modal-workspace $(modal profile current) \
  --prompt "A beautiful landscape"
```

### 3. Test via API Endpoint

After deployment, you can call the API directly:

```bash
curl -X POST \
  "https://$(modal profile current)--ryla-comfyui-flux-test-comfy-ui-api.modal.run" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape"}' \
  --output output.jpg
```

## Interactive UI (Development)

For interactive ComfyUI UI:

```bash
modal serve apps/modal/comfyui_flux_test.py
```

Then open the UI in your browser. **Remember to close the UI tab when done** to stop being charged.

## What This Does

1. **Installs ComfyUI** using `comfy-cli`
2. **Downloads Flux Schnell** model from HuggingFace
3. **Launches ComfyUI server** in background
4. **Exposes API endpoint** for text-to-image generation
5. **Returns generated image** as JPEG

## Performance

- **First inference**: ~1 minute (cold start - container launch + model load)
- **Warm inference**: ~few seconds (model already loaded)
- **GPU**: L40S (good starter GPU for inference)

## Files

- `comfyui_flux_test.py` - Main Modal app (following Modal docs pattern)
- `comfyclient_flux.py` - Simple client script for testing
- `workflow_flux_api.json` - Simple Flux Schnell workflow JSON
- `README-FLUX-TEST.md` - This file

## Differences from Existing Implementation

This is a **simplified test** following Modal's documentation exactly:
- Uses `comfy-cli` for installation (simpler than manual setup)
- Uses `comfy run` command for workflow execution
- Minimal workflow (just Flux Schnell text-to-image)
- No custom nodes (just basic ComfyUI)

Compare with:
- `comfyui_danrisi.py` - Full Z-Image-Turbo workflow with custom nodes
- `comfyui_z_image_turbo.py` - Z-Image-Turbo implementation

## Troubleshooting

### Model Not Found

The model is downloaded automatically on first run. If it fails:

```bash
# Check volume
modal volume list

# Check logs
modal app logs ryla-comfyui-flux-test
```

### Server Health Check Failed

If you see "ComfyUI server is not healthy":
- Check GPU availability: `modal gpu list`
- Check logs: `modal app logs ryla-comfyui-flux-test`
- Try redeploying: `modal deploy apps/modal/comfyui_flux_test.py`

### Workflow Errors

If workflow execution fails:
- Check the workflow JSON is valid
- Verify model is loaded correctly
- Check ComfyUI logs in the container

## Next Steps

Once this simple test works, you can:
1. Add custom nodes (like WAS Node Suite)
2. Create more complex workflows
3. Integrate with your existing RYLA workflow system
4. Add caching and optimization

## References

- [Modal.com ComfyUI Guide](https://modal.com/docs/examples/comfyui)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [Flux Schnell Model](https://huggingface.co/Comfy-Org/flux1-schnell)
