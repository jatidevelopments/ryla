# Manual Model Setup on RunPod Pod

Since automated SSH has limitations, here's a step-by-step manual guide.

## Step 1: Connect to Pod

**Option A: Via RunPod Console Web Terminal**
- Go to your pod in RunPod Console
- Click "Connect" → "Web Terminal"
- Terminal opens in browser

**Option B: Via SSH (Direct TCP)**
```bash
ssh -i ~/.ssh/id_ed25519 -p 33304 root@108.254.205.44
```

## Step 2: Check Network Volume

Run these commands on the pod:

```bash
# Check if workspace exists
ls -lah /workspace/

# Check if models directory exists
ls -lah /workspace/models/

# Check disk usage
df -h | grep workspace
```

**Expected:** Network volume `ryla-models-dream-companion` should be mounted at `/workspace/models`

## Step 3: Create Directory Structure

```bash
# Create directories for models
mkdir -p /workspace/models/checkpoints
mkdir -p /workspace/models/pulid
mkdir -p /workspace/models/controlnet
mkdir -p /workspace/models/ipadapter

# Verify
ls -lah /workspace/models/
```

## Step 4: Download Models

### Required for MVP: FLUX.1-schnell (~6GB)

**Option A: Using huggingface-cli (Recommended)**

```bash
# Install if needed
pip install huggingface-hub

# Download FLUX.1-schnell
cd /workspace/models/checkpoints
huggingface-cli download black-forest-labs/FLUX.1-schnell \
  --include '*.safetensors' \
  --local-dir .

# This will download:
# - flux1-schnell.safetensors (~6GB)
```

**Option B: Using wget (if you have direct URL)**

```bash
cd /workspace/models/checkpoints
wget -O flux1-schnell.safetensors <DIRECT_DOWNLOAD_URL>
```

**Option C: Using ComfyUI Manager (if ComfyUI is installed)**
- Open ComfyUI web interface (port 8188)
- Go to Manager → Install Custom Nodes
- Search for "FLUX.1-schnell" or use download URL
- Models will be saved to `/workspace/models/checkpoints/`

### Required for MVP: Z-Image-Turbo (~6GB)

```bash
cd /workspace/models/checkpoints

# Download from HuggingFace
huggingface-cli download black-forest-labs/FLUX.1-schnell \
  --include '*.safetensors' \
  --local-dir . \
  --local-dir-use-symlinks False

# OR download Z-Image-Turbo specifically if available
# (Check HuggingFace for latest model name)
```

## Step 5: Verify Models

```bash
# Check file sizes
ls -lh /workspace/models/checkpoints/

# Expected output:
# -rw-r--r-- 1 root root  6G ... flux1-schnell.safetensors
# -rw-r--r-- 1 root root  6G ... z-image-turbo.safetensors (or similar)

# Check total space
du -sh /workspace/models/checkpoints/
```

## Step 6: Verify Serverless Endpoints

1. **Go to RunPod Console → Endpoints**
2. **Check each endpoint:**
   - `ryla-prod-guarded-flux-dev-endpoint`
   - `ryla-prod-guarded-z-image-turbo-endpoint`
3. **Verify:**
   - Network Volume = `ryla-models-dream-companion`
   - Mount Path = `/workspace/models`

## Troubleshooting

### Network Volume Not Found
- Go to RunPod Console → Pod → Settings
- Check "Network Volumes" section
- Ensure `ryla-models-dream-companion` is attached
- Mount path should be `/workspace/models`
- Restart pod if volume was just attached

### Models Not Downloading
- Check internet connection: `ping -c 3 8.8.8.8`
- Check disk space: `df -h`
- Try downloading to `/tmp` first, then move: `mv /tmp/flux1-schnell.safetensors /workspace/models/checkpoints/`

### HuggingFace Download Fails
- May need HuggingFace token for gated models
- Create token at: https://huggingface.co/settings/tokens
- Login: `huggingface-cli login`
- Then retry download

## Next Steps

After models are downloaded:
1. Test a base image generation job via API
2. Verify images are generated and stored in Supabase
3. Check serverless endpoint logs for any errors

