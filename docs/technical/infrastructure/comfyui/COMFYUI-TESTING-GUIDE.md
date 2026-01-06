# ComfyUI Testing Guide for RunPod

> **Date**: 2025-12-10  
> **Status**: Ready for Testing  
> **Purpose**: Test Flux Dev and Z-Image-Turbo workflows in ComfyUI before serverless deployment

---

## Quick Start

### Step 1: Access ComfyUI Pod ✅ **DEPLOYED**

**Pod Name**: `ryla_ai_comfy_ui_rd`

**Access ComfyUI**:
- **Port 8188**: ComfyUI interface (Ready) ✅
- Access via RunPod Console → HTTP link for port 8188
- ComfyUI interface will load

**Other Services Available**:
- **Port 8080**: FileBrowser (for file management)
- **Port 8888**: JupyterLab (for Python notebooks)
- **SSH**: Available for terminal access

**See**: `COMFYUI-POD-INFO.md` for full connection details

---

## Step 2: Download Models

### Option A: Via ComfyUI Manager (Easiest)

1. **Install ComfyUI Manager** (if not pre-installed):
   - Go to ComfyUI → Manager
   - Install "ComfyUI Manager" plugin

2. **Download Models via Manager**:
   - Go to Manager → Install Custom Nodes
   - Search for model names
   - Or use direct download URLs

### Option B: Via SSH/Terminal

**SSH into Pod**:
1. Click "Connect" on pod → SSH
2. Navigate to ComfyUI models directory:
   ```bash
   cd /workspace/ComfyUI/models
   ```

**Download Flux Dev**:
```bash
cd checkpoints
# Download from HuggingFace or CivitAI
wget -O flux1-schnell.safetensors <URL>
```

**Download Z-Image-Turbo**:
```bash
cd checkpoints
wget -O z-image-turbo.safetensors <URL>
```

**Download Supporting Models**:
```bash
# PuLID (for face consistency)
cd ../pulid
wget -O pulid_model.safetensors <URL>

# ControlNet (for pose control)
cd ../controlnet
wget -O controlnet-openpose.safetensors <URL>

# IPAdapter FaceID (for face swap)
cd ../ipadapter
wget -O ip-adapter-faceid.safetensors <URL>
```

---

## Step 3: Test Workflows

### Test 1: Flux Dev Base Image Generation

**Goal**: Generate 3 base image variations

**Workflow Steps**:
1. **Load Checkpoint**: Flux Dev model
2. **CLIP Text Encode**: Positive and negative prompts
3. **Empty Latent Image**: 1024x1024, batch size 3
4. **KSampler**: 
   - Steps: 20
   - CFG: 7.0
   - Sampler: euler
   - Scheduler: normal
5. **VAE Decode**: Decode latent to image
6. **Save Image**: Save 3 variations

**Test Prompt**:
```
A beautiful woman, 25 years old, blonde hair, blue eyes, 
professional photography, high quality, detailed, 8k, 
best quality, masterpiece, photographed against a clean 
white background, shot in an amateur photo camera style
```

**Expected Result**: 3 different base image variations

---

### Test 2: Z-Image-Turbo Base Image Generation

**Goal**: Test Z-Image-Turbo speed and quality

**Workflow Steps**:
1. **Load Checkpoint**: Z-Image-Turbo model
2. **CLIP Text Encode**: Positive prompt (no negative needed)
3. **Empty Latent Image**: 1024x1024
4. **KSampler**:
   - Steps: 8-9 (Z-Image-Turbo optimal)
   - CFG: 1.0 (no CFG for Z-Image-Turbo)
   - Sampler: euler
   - Scheduler: normal
5. **VAE Decode**: Decode to image
6. **Save Image**: Save result

**Test Prompt**: Same as Flux Dev test

**Expected Result**: 
- Faster generation (6-7 seconds vs 10-15 seconds)
- High quality image
- Compare with Flux Dev result

---

### Test 3: NSFW Support Testing

**Goal**: Verify NSFW generation works

**For Flux Dev**:
- Use uncensored checkpoint
- Test NSFW prompt
- Should work ✅

**For Z-Image-Turbo**:
- Test NSFW prompt
- Document if it works or fails
- Critical for MVP decision

**Test Prompt** (NSFW):
```
[NSFW content description]
```

**Expected Result**: 
- Flux Dev: Should generate NSFW content ✅
- Z-Image-Turbo: Unknown - document result

---

### Test 4: Face Swap (IPAdapter FaceID)

**Goal**: Test face consistency for immediate generation

**Workflow Steps**:
1. **Load Checkpoint**: Flux Dev
2. **Load Image**: Base image (from Test 1)
3. **IPAdapter FaceID**: Apply face from base image
4. **CLIP Text Encode**: New prompt with different scene
5. **KSampler**: Generate with face consistency
6. **VAE Decode**: Decode to image
7. **Save Image**: Save result

**Test Prompt**:
```
Woman in a red dress, standing in a garden, 
smiling, professional photography
```

**Expected Result**: 
- Face matches base image (~80% consistency)
- Scene/outfit changed
- Fast generation (<15s)

---

### Test 5: Character Sheet Generation (PuLID + ControlNet)

**Goal**: Generate 7-10 character variations

**Workflow Steps**:
1. **Load Checkpoint**: Flux Dev
2. **Load Image**: Base image
3. **PuLID**: Apply face consistency (strength 0.95)
4. **ControlNet**: Apply pose control (OpenPose)
5. **CLIP Text Encode**: Prompt with angle/pose variation
6. **KSampler**: Generate variation
7. **VAE Decode**: Decode to image
8. **Save Image**: Save variation
9. **Repeat** for different angles/poses

**Test Variations**:
- Front view, standing
- Side view, profile
- 3/4 view, sitting
- Back view, standing
- Action pose
- Close-up portrait

**Expected Result**: 
- 7-10 images with same face
- Different angles and poses
- Consistent quality

---

## Step 4: Export Workflows

**After testing, export workflows**:

1. In ComfyUI, click "Save" (or Ctrl+S)
2. Save workflow JSON files:
   - `workflows/flux-base-image.json`
   - `workflows/z-image-turbo-base-image.json`
   - `workflows/face-swap.json`
   - `workflows/character-sheet.json`

3. These JSONs can be:
   - Used to understand node structure
   - Converted to Python code later
   - Used as reference for serverless handlers

---

## Step 5: Document Results

**Create test results document**:

| Test | Model | Result | Notes |
|------|-------|--------|-------|
| Base Image (3x) | Flux Dev | ✅/❌ | Quality, speed, uniqueness |
| Base Image | Z-Image-Turbo | ✅/❌ | Speed comparison, quality |
| NSFW Support | Flux Dev | ✅/❌ | Should work |
| NSFW Support | Z-Image-Turbo | ✅/❌ | **CRITICAL TEST** |
| Face Swap | Flux Dev + IPAdapter | ✅/❌ | Consistency, speed |
| Character Sheet | Flux Dev + PuLID + ControlNet | ✅/❌ | Consistency, quality |

---

## Model Download URLs

### Flux Dev
- **HuggingFace**: `black-forest-labs/FLUX.1-schnell`
- **CivitAI**: Search "flux dev uncensored" for NSFW version

### Z-Image-Turbo
- **HuggingFace**: `Tongyi-MAI/Z-Image-Turbo`
- **ModelScope**: `Tongyi-MAI/Z-Image-Turbo`

### PuLID
- **HuggingFace**: `yisol/IDM-VTON` (includes PuLID)
- Or search "PuLID ComfyUI"

### ControlNet
- **HuggingFace**: Various ControlNet models
- Search "controlnet openpose" for pose control

### IPAdapter FaceID
- **HuggingFace**: `h94/IP-Adapter-FaceID`
- Or search "IPAdapter FaceID ComfyUI"

---

## Troubleshooting

### ComfyUI Not Loading
- Check pod status (should be "Running")
- Verify port 8188 is open
- Check HTTP link in RunPod console

### Models Not Showing
- Verify models downloaded to correct folder
- Check file paths in ComfyUI settings
- Refresh ComfyUI (Ctrl+R)

### Out of Memory Errors
- Use smaller batch sizes
- Reduce image resolution
- Use RTX 4090 instead of RTX 3090

### Slow Generation
- Normal for first generation (model loading)
- Subsequent generations should be faster
- Z-Image-Turbo should be faster than Flux Dev

---

## Next Steps After Testing

1. **Document Results**: Create test results document
2. **Export Workflows**: Save all tested workflows as JSON
3. **Decide on Models**: Based on test results (NSFW support, quality, speed)
4. **Plan Serverless**: Use test results to inform serverless handler implementation
5. **Optimize Workflows**: Refine prompts and settings based on results

---

## Cost Notes

**ComfyUI Pod**:
- RTX 3090: ~$0.22/hour
- RTX 4090: ~$0.30/hour
- **Recommendation**: Stop pod when not testing (save costs)

**Network Volume**:
- 200GB: ~$0.20/month
- Models persist (one-time download)

---

## References

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [RunPod ComfyUI Guide](https://docs.runpod.io/tutorials/pods/comfyui)
- [FLUX.1-schnell Model](https://huggingface.co/black-forest-labs/FLUX.1-schnell)
- [Z-Image-Turbo Model](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)

---

## Tags

#comfyui #testing #runpod #flux-dev #z-image-turbo #workflows #ep-001 #ep-005

