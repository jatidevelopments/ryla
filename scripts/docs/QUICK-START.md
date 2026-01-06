# Quick Start: Download ComfyUI Models

## 🚀 Fastest Way (JupyterLab Terminal)

1. **Open JupyterLab**: `https://p1bm9m74jjzdb7-8888.proxy.runpod.net/lab`

2. **Open Terminal** in JupyterLab

3. **Run these commands**:
   ```bash
   # Install dependencies
   pip install requests tqdm
   
   # Download models (auto-detects ComfyUI)
   python scripts/download-comfyui-models.py
   ```

That's it! The script will:
- ✅ Auto-detect ComfyUI installation
- ✅ Verify all URLs
- ✅ Download with progress bars
- ✅ Verify file integrity

## 📋 What Gets Downloaded

| Model | Size | Purpose |
|-------|------|---------|
| Z-Image-Turbo | ~12GB | Fast base image generation |
| Flux VAE | ~335MB | Image encoding/decoding |
| ControlNet OpenPose | ~1.6GB | Pose control |
| IPAdapter FaceID V2 | ~1.2GB | Face swap |
| CLIP Vision | ~200MB | Face recognition |
| PuLID | ~1.5GB | Face consistency |

**Total**: ~28GB (excluding Flux Dev which requires manual download)

## ⚠️ Manual Download Required

**Flux Dev (Uncensored)** - ~23GB
- Download from CivitAI: Search "FLUX.1-dev uncensored"
- Or use HuggingFace CLI:
  ```bash
  huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir /workspace/ComfyUI/models/checkpoints
  ```

## 🔍 Verify Models Downloaded

After running the script:
1. Refresh ComfyUI browser page
2. Check Model Library - all models should appear
3. Ready to test workflows!

## 📚 Full Documentation

See `scripts/README.md` for complete documentation.

