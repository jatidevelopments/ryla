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
pip install -r scripts/docs/requirements.txt
```

Or manually:

```bash
pip install requests tqdm
```

### 2. Run the Script

**Auto-detect ComfyUI directory:**

```bash
python scripts/models/download-comfyui-models.py
```

**Specify ComfyUI directory:**

```bash
python scripts/models/download-comfyui-models.py --comfyui-dir /workspace/ComfyUI
```

**Skip URL verification (faster, but less safe):**

```bash
python scripts/models/download-comfyui-models.py --skip-verify
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
   pip install -r scripts/docs/requirements.txt
   ```

4. **Run Script**:
   ```bash
   python scripts/models/download-comfyui-models.py
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
   pip install -r scripts/docs/requirements.txt
   ```

4. **Run Script**:
   ```bash
   python scripts/models/download-comfyui-models.py
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

## Model List Extractor

There are two scripts available to extract the complete list of all available models from ComfyUI Manager:

### TypeScript/Playwright Script (Recommended)

The `extract-comfyui-models-playwright.ts` script uses TypeScript and Playwright for better type safety and integration with the RYLA codebase.

#### Quick Start

1. **Install Dependencies** (if not already installed):

   ```bash
   # Install TypeScript execution and types
   pnpm add -D playwright @types/node tsx

   # Install Playwright browser (required)
   npx playwright install chromium
   ```

   **Note**: If you encounter import errors, you may need to install the `playwright` package separately:

   ```bash
   pnpm add -D playwright
   ```

2. **Run the Script**:

   ```bash
   pnpm tsx scripts/models/extract-comfyui-models-playwright.ts
   ```

3. **With Options**:

   ```bash
   # Run in non-headless mode (see browser)
   pnpm tsx scripts/models/extract-comfyui-models-playwright.ts --no-headless

   # Specify custom URL
   pnpm tsx scripts/models/extract-comfyui-models-playwright.ts --url https://your-comfyui-server.com

   # Custom output directory
   pnpm tsx scripts/models/extract-comfyui-models-playwright.ts --output-dir ./output
   ```

#### Output

The script generates JSON and CSV files:

- **JSON**: `comfyui-models-{timestamp}.json` - Structured data with metadata
- **CSV**: `comfyui-models-{timestamp}.csv` - Spreadsheet format
- **Latest**: Also saves as `comfyui-models-latest.json` and `comfyui-models-latest.csv`

#### Features

- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Automatic Navigation**: Automatically navigates to Model Manager
- ✅ **Smart Scrolling**: Scrolls through entire list to load all 509+ models
- ✅ **Flexible Extraction**: Multiple extraction methods with fallbacks
- ✅ **Progress Tracking**: Shows progress during extraction
- ✅ **Error Handling**: Comprehensive error handling and warnings

#### Command-Line Options

```
--url URL          ComfyUI server URL (default: RunPod server)
--output-dir DIR   Output directory (default: docs/ops/runpod)
--headless         Run browser in headless mode (default: true)
--no-headless      Run browser in visible mode
```

### Python/Playwright Script

The `extract-comfyui-models.py` script is also available for Python users.

#### Quick Start

1. **Install Dependencies**:

   ```bash
   pip install -r scripts/docs/requirements.txt
   playwright install chromium
   ```

2. **Run the Script**:

   ```bash
   python scripts/models/extract-comfyui-models.py
   ```

3. **With Options**:

   ```bash
   # Run in headless mode
   python scripts/models/extract-comfyui-models.py --headless

   # Specify custom URL
   python scripts/models/extract-comfyui-models.py --url https://your-comfyui-server.com

   # Custom output directory
   python scripts/models/extract-comfyui-models.py --output-dir ./output
   ```

#### Output

The script generates three files:

- **JSON**: `comfyui-models-{timestamp}.json` - Structured data with metadata
- **CSV**: `comfyui-models-{timestamp}.csv` - Spreadsheet format
- **Markdown**: `comfyui-models-{timestamp}.md` - Formatted table

#### Features

- ✅ **Automatic Navigation**: Automatically navigates to Model Manager
- ✅ **Smart Scrolling**: Scrolls through entire list to load all models
- ✅ **Multiple Formats**: Exports to JSON, CSV, and Markdown
- ✅ **Error Handling**: Takes screenshots on errors for debugging
- ✅ **Progress Tracking**: Shows progress during extraction

#### Command-Line Options

```
--url URL          ComfyUI server URL (default: RunPod server)
--output-dir DIR   Output directory (default: docs/ops/runpod)
--headless         Run browser in headless mode
--slow-mo MS       Slow down operations by milliseconds
-h, --help         Show help message
```

## References

- [ComfyUI Documentation](https://github.com/comfyanonymous/ComfyUI)
- [HuggingFace Models](https://huggingface.co/)
- [RYLA ComfyUI Testing Guide](../docs/technical/COMFYUI-TESTING-GUIDE.md)
- [ComfyUI Available Models](../docs/ops/runpod/COMFYUI-AVAILABLE-MODELS.md)

## License

Part of the RYLA project. See main repository LICENSE file.
