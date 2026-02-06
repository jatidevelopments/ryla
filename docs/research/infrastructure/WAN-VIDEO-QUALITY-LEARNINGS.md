# WAN Video Generation – Quality Learnings

Why **WAN 2.6 I2V** (`wan26_i2v_5s.webp`) delivers the best quality and what we can reuse.

## Why WAN 2.6 I2V Looks Best

1. **Native ComfyUI I2V path**
   - Uses the **WanImageToVideo** node: one node turns the start image into latent + conditioning.
   - No extra CLIP/vision encode step; the model’s own I2V logic handles the reference image.
   - Pipeline: `LoadImage` → `WanImageToVideo` (image → conditioning + latent) → `KSampler` → `VAEDecode` → `SaveAnimatedWEBP`.

2. **Full-precision UNET**
   - Model: **UNETLoader** with `wan2.6_t2v_1.3B_fp16.safetensors` (or similar full safetensors).
   - No quantization (no GGUF), so no extra artifacts from weight compression.

3. **Proven sampling settings**
   - **KSampler**: `uni_pc`, `simple` scheduler, `denoise=1`.
   - Typical defaults: 832×480, 30 steps, cfg 6.0, 16 fps.
   - Same stack used in many reference workflows.

4. **Standard decode**
   - **VAEDecode** (ComfyUI built-in), no custom tiling or wrapper nodes.

## Comparison with WAN 2.2 I2V

| Aspect            | WAN 2.6 I2V              | WAN 2.2 I2V (GGUF)              |
|------------------|--------------------------|----------------------------------|
| Model format     | Full safetensors         | GGUF (e.g. Q5_K_S)              |
| I2V conditioning | WanImageToVideo (native) | WanVideoWrapper + CLIP Vision   |
| Sampler          | KSampler                 | WanVideoSampler                 |
| VAE decode       | VAEDecode                | WanVideoDecode                  |
| Quality ceiling  | Higher (no quant)        | Good but limited by quant + path|

So the “best quality” comes from: native I2V node + full-precision model + standard sampler/decode.

## What to Reuse for Other Endpoints

- **Resolution / length**: 832×480, 16 fps, 33–80 frames is a good default.
- **Steps / CFG**: 30 steps, cfg 6.0 is a solid baseline for WAN 2.6.
- **I2V design**: Prefer a single “image → conditioning + latent” node (e.g. WanImageToVideo) where the model supports it; avoid splitting into multiple custom encode steps if not needed.
- **Decode**: Prefer standard VAEDecode when the model allows it.

## Face Swap Architecture

Video face swap endpoints delegate the face swapping to the Qwen app to avoid OOM:
1. Generate video using WAN 2.6 or WAN 2.2 I2V
2. Encode WebP as base64 data URL
3. POST to Qwen app's `/batch-video-faceswap` endpoint
4. Return final MP4 with swapped face

This separation allows the heavy video models to use full GPU memory without competing with ReActor.

## References

- **Endpoint Documentation**: `apps/modal/docs/VIDEO-FACESWAP-ENDPOINTS.md`
- **Integration Status**: `apps/modal/docs/MODAL-ENDPOINT-INTEGRATION-STATUS.md`
- WAN 2.6 I2V handler: `apps/modal/handlers/wan26.py` – `build_wan26_i2v_workflow`, WanImageToVideo + KSampler.
- WAN 2.2 I2V handler: `apps/modal/handlers/wan22_i2v.py` – WanVideoWrapper (GGUF) pipeline.
- Qwen Face Swap handler: `apps/modal/handlers/qwen_image.py` – `/batch-video-faceswap` endpoint.
- Test outputs: `apps/modal/test-output/wan26_i2v_5s.webp` (reference), `wan22_i2v_5s.webp`.
- Test script: `apps/modal/scripts/test-video-faceswap.py`

---

**Last Updated**: 2026-02-05
