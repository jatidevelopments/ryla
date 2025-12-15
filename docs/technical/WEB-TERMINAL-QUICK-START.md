# Web Terminal Quick Start - Model Download

> **Date**: 2025-12-10  
> **Status**: Web Terminal Enabled ✅  
> **URL**: `https://p1bm9m74jjzdb7-19123.proxy.runpod.net/n0xs5h11wzkx3vw0x366k24mzxwgyavu/`

---

## Quick Commands to Run

Copy and paste these commands into the web terminal one by one:

### Step 1: Find ComfyUI Directory

```bash
find /workspace /root -name "ComfyUI" -type d 2>/dev/null | head -5
```

**Expected**: Should show `/workspace/ComfyUI` or `/root/ComfyUI`

### Step 2: Navigate to ComfyUI Models Directory

```bash
# If found in /workspace
cd /workspace/ComfyUI/models

# OR if found in /root
cd /root/ComfyUI/models

# Verify you're in the right place
pwd
ls -la
```

### Step 3: Create Model Directories

```bash
mkdir -p checkpoints vae controlnet ipadapter clip_vision loras
ls -la
```

### Step 4: Download Models

#### Z-Image-Turbo (Priority 1)

```bash
cd checkpoints
wget --progress=bar:force https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors -O z-image-turbo.safetensors
```

#### Flux VAE

```bash
cd ../vae
wget --progress=bar:force https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/main/vae.safetensors -O flux-vae.safetensors
```

#### ControlNet OpenPose

```bash
cd ../controlnet
wget --progress=bar:force https://huggingface.co/lllyasviel/ControlNet-v1-1/resolve/main/control_v11p_sd15_openpose.pth -O controlnet-openpose.pth
```

#### IPAdapter FaceID Plus V2

```bash
cd ../ipadapter
wget --progress=bar:force https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/ip-adapter-faceid-plusv2_sd15.bin -O ip-adapter-faceid-plusv2.bin
```

#### CLIP Vision

```bash
cd ../clip_vision
wget --progress=bar:force https://huggingface.co/h94/IP-Adapter-FaceID/resolve/main/models/image_encoder/model.safetensors -O clip-vision.safetensors
```

### Step 5: Verify Downloads

```bash
cd /workspace/ComfyUI/models  # or /root/ComfyUI/models
echo "=== Checkpoints ==="
ls -lh checkpoints/
echo "=== VAE ==="
ls -lh vae/
echo "=== ControlNet ==="
ls -lh controlnet/
echo "=== IPAdapter ==="
ls -lh ipadapter/
echo "=== CLIP Vision ==="
ls -lh clip_vision/
```

---

## Alternative: Use Download Script

If you want to use the automated script:

1. **Copy the script content** from `scripts/download-comfyui-models.sh`
2. **Paste into terminal**:
```bash
cat > /tmp/download-models.sh << 'EOF'
# [paste script content here]
EOF
```

3. **Make executable and run**:
```bash
chmod +x /tmp/download-models.sh
/tmp/download-models.sh
```

---

## Important Notes

### Flux Dev (Uncensored)

⚠️ **Manual Download Required** - This model is large (~23GB) and may need to be downloaded from:
- CivitAI: Search for "FLUX.1-dev uncensored"
- Or use HuggingFace CLI: `huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir /workspace/ComfyUI/models/checkpoints`

### Model Sizes

- Z-Image-Turbo: ~12GB
- Flux VAE: ~335MB
- ControlNet OpenPose: ~1.6GB
- IPAdapter FaceID Plus V2: ~1.2GB
- CLIP Vision: ~200MB

**Total**: ~15GB (excluding Flux Dev)

### Download Time

- Fast connection: 10-30 minutes
- Slower connection: 30-60 minutes
- Large models (Z-Image-Turbo, Flux Dev): May take longer

---

## After Download

1. **Refresh ComfyUI** (reload browser page)
2. **Check Model Library** - Models should appear in ComfyUI
3. **Start Testing** - Follow `COMFYUI-TESTING-GUIDE.md`

---

## Troubleshooting

### Download Fails

```bash
# Check internet connection
ping -c 3 8.8.8.8

# Try with resume
wget -c [URL] -O [filename]
```

### Out of Space

```bash
# Check disk space
df -h

# Clean up if needed
du -sh /workspace/ComfyUI/models/*
```

### Models Not Appearing

1. Verify files are in correct directory
2. Check file permissions: `chmod 644 /workspace/ComfyUI/models/checkpoints/*.safetensors`
3. Restart ComfyUI (refresh browser)

---

## Next Steps

After models are downloaded:
1. ✅ Verify in ComfyUI Model Library
2. ⏭️ Test base image generation
3. ⏭️ Test NSFW support (critical)
4. ⏭️ Test face swap
5. ⏭️ Export workflows

---

## References

- Full Download Guide: `docs/technical/SSH-MODEL-DOWNLOAD-GUIDE.md`
- Download Script: `scripts/download-comfyui-models.sh`
- Testing Guide: `docs/technical/COMFYUI-TESTING-GUIDE.md`

