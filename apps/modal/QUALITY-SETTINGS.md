# Modal Endpoint Quality Settings

Best practices for hyper-realistic AI influencer image generation.

## Quality Keywords

### Positive Prompt Suffix

Add these keywords to improve realism:

```
masterpiece, best quality, ultra quality, 8k, high quality, photorealistic, hyper realistic, realistic skin texture, detailed skin, sharp focus, DSLR, depth of field, intricate natural lighting, professional photography
```

### Negative Prompt (Always Include)

```
ugly, deformed, disfigured, poor anatomy, bad anatomy, poorly drawn hands, poorly drawn feet, poorly drawn face, extra limbs, mutated hands, fused fingers, too many fingers, blurry, low quality, jpeg artifacts, low contrast, watermark, signature, out of frame, cut off, painting, cartoon, anime, 3d render, illustration, CGI, low resolution, amateur, bad lighting
```

## Endpoint-Specific Settings

### Face Consistency Endpoints

| Endpoint | Parameter | Recommended | Default | Notes |
|----------|-----------|-------------|---------|-------|
| `/sdxl-instantid` | `instantid_strength` | 0.85-0.95 | 0.8 | Higher = more face similarity |
| `/sdxl-instantid` | `steps` | 25-30 | 20 | More steps = better quality |
| `/flux-pulid` | `pulid_weight` | 0.9-0.95 | 0.8 | Higher = more face similarity |
| `/flux-pulid` | `steps` | 25 | 20 | More steps = better quality |
| `/flux-ipadapter-faceid` | `ipadapter_strength` | 0.8-0.9 | 0.8 | Keep moderate for style flexibility |

### Text-to-Image Endpoints

| Endpoint | Parameter | Recommended | Default | Notes |
|----------|-----------|-------------|---------|-------|
| `/flux` | `steps` | 20 | 4 (Schnell) | Schnell is fast but lower quality |
| `/flux-dev` | `steps` | 20-25 | 20 | Higher for more detail |
| `/qwen-image-2512` | `steps` | 50 | 50 | Already optimal |
| `/qwen-image-2512-fast` | `steps` | 4 | 4 | Uses Lightning LoRA |
| `/z-image-simple` | - | - | - | Uses diffusers defaults |

### LoRA Endpoints

| Endpoint | Parameter | Recommended | Default | Notes |
|----------|-----------|-------------|---------|-------|
| `/flux-dev-lora` | `lora_strength` | 0.8-1.0 | 0.8 | Depends on LoRA training |
| `/qwen-image-2512-lora` | `lora_strength` | 1.0 | 1.0 | Qwen LoRAs work best at 1.0 |

## Prompt Structure (Best Practice)

Structure prompts in this order for best results:

1. **Subject**: Who/what (e.g., "beautiful young woman with long brown hair")
2. **Clothing**: What they're wearing (e.g., "elegant red dress")
3. **Pose/Expression**: Body language (e.g., "confident smile, looking at camera")
4. **Environment**: Where (e.g., "cozy coffee shop, warm ambient lighting")
5. **Lighting**: Light quality (e.g., "soft diffused lighting, golden hour")
6. **Camera/Style**: Photography style (e.g., "professional portrait, bokeh, shallow depth of field")
7. **Quality keywords**: Add suffix above

### Example Prompt

```
beautiful young woman with long brown hair and green eyes, wearing an elegant red silk dress, confident warm smile looking at camera, sitting in a cozy upscale coffee shop, warm ambient lighting with bokeh background, professional portrait photography, shallow depth of field, masterpiece, best quality, ultra quality, 8k, photorealistic, hyper realistic, detailed skin, sharp focus
```

## API Usage Examples

### Python - Quality Face Consistency

```python
import requests

response = requests.post(
    "https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid",
    json={
        "prompt": "same woman as a medieval queen, throne room, royal crown, elegant robes, masterpiece, best quality, photorealistic, detailed skin",
        "negative_prompt": "ugly, deformed, blurry, low quality, cartoon, anime, painting",
        "reference_image": "data:image/jpeg;base64,...",
        "width": 1024,
        "height": 1024,
        "steps": 25,  # Higher than default
        "instantid_strength": 0.9,  # Higher for better face match
        "seed": 42
    }
)
```

### TypeScript - Quality Parameters

```typescript
const response = await modalClient.callEndpoint('/sdxl-instantid', {
  prompt: `${basePrompt}, ${QUALITY_POSITIVE}`,
  negative_prompt: QUALITY_NEGATIVE,
  reference_image: imageBase64,
  steps: 25,
  instantid_strength: 0.9,
});
```

## Quality Checklist

Before generating influencer content:

- [ ] Include quality keywords in positive prompt
- [ ] Always include negative prompt
- [ ] Use higher face consistency weights (0.9+)
- [ ] Use 25+ steps for face consistency endpoints
- [ ] Structure prompt properly (subject → environment → quality)
- [ ] Use consistent seed for reproducibility during testing

## Common Quality Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Plastic/fake skin | Missing quality keywords | Add "realistic skin texture, detailed skin" |
| Distorted hands | Model limitation | Add "poorly drawn hands" to negative |
| Blurry output | Too few steps | Increase steps to 25+ |
| Face doesn't match | Low weight | Increase instantid_strength/pulid_weight to 0.9+ |
| Cartoon-like | No negative prompt | Add "cartoon, anime, illustration" to negative |
| Bad lighting | Generic prompt | Specify lighting type: "soft diffused", "golden hour" |

## Recommended Defaults

For production, update handler defaults:

```python
# instantid.py - line 134
"weight": item.get("instantid_strength", 0.9),  # was 0.8

# pulid_flux.py - line 135  
"weight": item.get("pulid_weight", 0.9),  # was 0.8

# All handlers - add default negative prompt
DEFAULT_NEGATIVE = "ugly, deformed, blurry, low quality, cartoon, anime, bad anatomy, poorly drawn hands"
```

## New Quality Endpoints (after deployment)

### `/flux-dev-realism` - Photorealistic Generation

Uses the Canopus UltraRealism LoRA for improved photorealism.

```python
response = requests.post(
    "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev-realism",
    json={
        "prompt": "beautiful young woman in a coffee shop, warm lighting, detailed skin",
        "realism_strength": 0.85,  # 0.5-1.0, default 0.85
        "width": 1024,
        "height": 1024,
        "steps": 25,
        "seed": 42
    }
)
```

The endpoint automatically:
- Uses the pre-installed `flux-realism-lora.safetensors`
- Adds "Ultra realistic" trigger word if not present
- Applies 0.85 LoRA strength by default

### FaceDetailer Post-Processing

After deploying, the FaceDetailer handler can be used to enhance faces:

```python
from handlers.face_detailer import apply_facedetailer

# After generating an image
enhanced_bytes = apply_facedetailer(
    comfyui_instance,
    image_bytes,
    prompt="detailed realistic face, natural skin texture",
    denoise=0.35  # 0.3-0.5, lower = more faithful
)
```

## Deployment Required

To use these new features, redeploy the Flux app:

```bash
cd apps/modal && ./deploy.sh flux
```

This will:
1. Install ComfyUI-Impact-Pack (FaceDetailer)
2. Download SAM + YOLO face detection models
3. Download Canopus UltraRealism LoRA
4. Register `/flux-dev-realism` endpoint
