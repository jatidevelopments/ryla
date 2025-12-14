# ComfyUI Model Downloader

Automated script to download and verify all required models for ComfyUI image generation workflows in the RYLA project.

## Features

- ✅ **Verified URLs**: All model URLs are verified against HuggingFace repositories
- ✅ **Progress Bars**: Visual download progress with file sizes
- ✅ **Retry Logic**: Automatic retries with exponential backoff
- ✅ **Size Verification**: Checks file sizes to ensure complete downloads
- ✅ **Auto-Detection**: Automatically finds ComfyUI installation directory
- ✅ **Error Handling**: Comprehensive error handling and reporting

## Quick Start

### 1. Install Dependencies

```bash
pip install -r scripts/requirements.txt
```

Or manually:
```bash
pip install requests tqdm
```

### 2. Run the Script

**Auto-detect ComfyUI directory:**
```bash
python scripts/download-comfyui-models.py
```

**Specify ComfyUI directory:**
```bash
python scripts/download-comfyui-models.py --comfyui-dir /workspace/ComfyUI
```

**Skip URL verification (faster, but less safe):**
```bash
python scripts/download-comfyui-models.py --skip-verify
```

## Models Downloaded

### Checkpoints (Base Models)
- **Z-Image-Turbo** (~12GB) - Fast 6B parameter model
- **Flux Dev (Uncensored)** (~23GB) - Primary NSFW model (manual download)
- **PuLID** (~1.5GB) - Face consistency model

### VAE Models
- **Flux VAE** (~335MB) - VAE encoder/decoder

### ControlNet Models
- **ControlNet OpenPose** (~1.6GB) - Pose control
- **Z-Image ControlNet** (~12GB) - ControlNet for Z-Image

### IPAdapter Models (Face Swap)
- **IPAdapter FaceID Plus** (~1.2GB) - Face swap v1
- **IPAdapter FaceID Plus V2** (~1.2GB) - Face swap v2 (recommended)
- **CLIP Vision** (~200MB) - CLIP encoder for IPAdapter

## Manual Downloads

Some models require manual download:

### Flux Dev (Uncensored)
- **CivitAI**: Search for "FLUX.1-dev uncensored"
- **HuggingFace CLI**:
  ```bash
  huggingface-cli download black-forest-labs/FLUX.1-dev --local-dir /workspace/ComfyUI/models/checkpoints
  ```

## Usage in JupyterLab

1. **Open JupyterLab Terminal**:
   - Access: `https://p1bm9m74jjzdb7-8888.proxy.runpod.net/lab`
   - Open a new terminal

2. **Clone Repository** (if not already):
   ```bash
   git clone <your-repo-url>
   cd RYLA
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r scripts/requirements.txt
   ```

4. **Run Script**:
   ```bash
   python scripts/download-comfyui-models.py
   ```

## Usage via SSH

1. **Connect via SSH**:
   ```bash
   ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
   ```

2. **Clone Repository** (if not already):
   ```bash
   git clone <your-repo-url>
   cd RYLA
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r scripts/requirements.txt
   ```

4. **Run Script**:
   ```bash
   python scripts/download-comfyui-models.py
   ```

## Command-Line Options

```
--comfyui-dir PATH    Path to ComfyUI installation directory
--skip-verify         Skip URL verification before downloading
--max-retries N       Maximum number of download retries (default: 3)
-h, --help           Show help message
```

## Model Verification

The script verifies:
- ✅ URL accessibility
- ✅ File size matches expected size
- ✅ Complete download (no corruption)

## Troubleshooting

### "ComfyUI directory not found"
- Specify the directory explicitly: `--comfyui-dir /workspace/ComfyUI`
- Ensure ComfyUI is installed and `models/` directory exists

### "URL not accessible"
- Check internet connection
- Verify HuggingFace is accessible
- Try again (may be temporary network issue)

### "Size mismatch"
- File may have been updated on HuggingFace
- Re-download the file
- Check disk space

### "Download failed"
- Check internet connection
- Verify disk space
- Try increasing `--max-retries`

## File Structure

After running the script, your ComfyUI models directory should look like:

```
ComfyUI/models/
├── checkpoints/
│   ├── z-image-turbo.safetensors
│   ├── flux1-dev-uncensored.safetensors (manual)
│   └── pulid.safetensors
├── vae/
│   └── flux-vae.safetensors
├── controlnet/
│   ├── controlnet-openpose.pth
│   └── z-image-controlnet.safetensors
├── ipadapter/
│   ├── ip-adapter-faceid-plus.bin
│   └── ip-adapter-faceid-plusv2.bin
└── clip_vision/
    └── clip-vision.safetensors
```

## Next Steps

After downloading models:

1. **Refresh ComfyUI**: Reload the browser page
2. **Verify Models**: Check that models appear in ComfyUI Model Library
3. **Test Workflows**: Follow `docs/technical/COMFYUI-TESTING-GUIDE.md`

## References

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [HuggingFace Models](https://huggingface.co/)
- [RYLA ComfyUI Testing Guide](../docs/technical/COMFYUI-TESTING-GUIDE.md)

## License

Part of the RYLA project. See main repository LICENSE file.

