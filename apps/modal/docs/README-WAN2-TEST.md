# Wan2.1 Video Test - Modal.com Documentation Pattern

This is a simple test implementation for Wan2.1 text-to-video generation, following the Modal.com ComfyUI guide pattern.

## Quick Start

### 1. Deploy the App

```bash
modal deploy apps/modal/comfyui_wan2_test.py
```

### 2. Test with Client Script

```bash
# Make client executable
chmod +x apps/modal/comfyclient_wan2.py

# Run test
python apps/modal/comfyclient_wan2.py --prompt "A beautiful landscape with mountains and a lake, cinematic quality"
```

Or specify workspace explicitly:

```bash
python apps/modal/comfyclient_wan2.py \
  --modal-workspace $(modal profile current) \
  --prompt "A majestic old white-robed wizard casting a spell under a starlit sky"
```

### 3. Test via API Endpoint

After deployment, you can call the API directly:

```bash
curl -X POST \
  "https://$(modal profile current)--ryla-comfyui-wan2-test-comfyui-api.modal.run" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful landscape"}' \
  --output output.webp
```

## What This Does

1. **Installs ComfyUI** using `comfy-cli`
2. **Downloads Wan2.1 models** from HuggingFace:
   - `wan2.1_t2v_1.3B_fp16.safetensors` (diffusion model - 1.3B, smaller/faster)
   - `umt5_xxl_fp8_e4m3fn_scaled.safetensors` (CLIP text encoder)
   - `wan_2.1_vae.safetensors` (VAE)
3. **Launches ComfyUI server** in background
4. **Exposes API endpoint** for text-to-video generation
5. **Returns generated video** as Animated WEBP

## Performance

- **First inference**: ~2-3 minutes (cold start + model load + video generation)
- **Warm inference**: ~1-2 minutes (video generation time)
- **GPU**: L40S (good for video generation)
- **Output**: 832x480, 33 frames, 16fps (~2 seconds of video)

## Files

- `comfyui_wan2_test.py` - Main Modal app (following Modal docs pattern)
- `comfyclient_wan2.py` - Simple client script for testing
- `workflow_wan2_api.json` - Simple Wan2.1 text-to-video workflow JSON
- `README-WAN2-TEST.md` - This file

## Differences from Flux Test

1. **Output**: Video (Animated WEBP) instead of static image
2. **Models**: Three separate models (UNet, CLIP, VAE) instead of single checkpoint
3. **Workflow**: Uses `EmptyHunyuanLatentVideo` for video latent space
4. **Sampling**: Uses `ModelSamplingSD3` wrapper
5. **Save**: Uses `SaveAnimatedWEBP` instead of `SaveImage`

## Model Sizes

- **1.3B model**: ~2.6 GB (faster, good for testing)
- **14B model**: ~28 GB (higher quality, slower)

For production, consider using the 14B model for better quality.

## Troubleshooting

### Model Not Found

The models are downloaded automatically on first run. If it fails:

```bash
# Check volume
modal volume list

# Check logs
modal app logs ryla-comfyui-wan2-test
```

### Server Health Check Failed

If you see "ComfyUI server is not healthy":
- Check GPU availability: `modal gpu list`
- Check logs: `modal app logs ryla-comfyui-wan2-test`
- Try redeploying: `modal deploy apps/modal/comfyui_wan2_test.py`

### Workflow Errors

If workflow execution fails:
- Check the workflow JSON is valid
- Verify all three models are loaded correctly
- Check ComfyUI logs in the container
- Ensure `EmptyHunyuanLatentVideo` node is available (comes with ComfyUI)

### Video Quality

For better quality:
- Use 14B model instead of 1.3B
- Increase resolution (e.g., 1280x720)
- Increase number of frames (e.g., 65 frames for ~4 seconds)
- Adjust CFG and steps

## Next Steps

Once this simple test works, you can:
1. Upgrade to 14B model for better quality
2. Add image-to-video support (I2V)
3. Add LoRA support for character consistency
4. Integrate with your existing RYLA workflow system
5. Add caching and optimization

## References

- [Modal.com ComfyUI Guide](https://modal.com/docs/examples/comfyui)
- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [Wan2.1 Model](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged)
- [Wan2.1 Workflows](../../libs/comfyui-workflows/video/wan2.1/)
