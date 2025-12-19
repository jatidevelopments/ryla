# SSH Access & Model Setup for RunPod Pod

## Step 1: Add SSH Key to RunPod Pod

1. **Copy your Ed25519 public key:**
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEcPDH+9ZAdRYPZGSJvoHX5196rwT70zi959i7cWkGaT runpod-comfyui-20251211
   ```

2. **In RunPod Console:**
   - Go to your pod → Settings → SSH Keys
   - Click "Add SSH Key"
   - Paste the public key above
   - Save

## Step 2: Connect to Pod

**Option A: Via RunPod SSH Gateway (Recommended)**
```bash
ssh -i ~/.ssh/id_ed25519 eaf4zqggefl79a-64411d44@ssh.runpod.io
```

**Option B: Direct TCP (Supports SCP/SFTP)**
```bash
ssh -i ~/.ssh/id_ed25519 -p 33304 root@108.254.205.44
```

## Step 3: Verify Network Volume Mount

Once connected, check if network volume is mounted:

```bash
# Check mount points
df -h | grep workspace

# Check models directory
ls -lah /workspace/models/

# If not found, check root
ls -lah / | grep -E "(workspace|models|volume)"
```

**Expected location:** `/workspace/models/` (network volume `ryla-models-dream-companion`)

## Step 4: Run Setup Script

```bash
# Upload and run setup script
# (or copy-paste the script content from scripts/setup-models-on-runpod.sh)

# Make executable
chmod +x setup-models-on-runpod.sh

# Run it
./setup-models-on-runpod.sh
```

## Step 5: Download Models

### Required for MVP (Base Image Generation)

**1. FLUX.1-schnell Model (~6GB)**
```bash
cd /workspace/models/checkpoints

# Option A: Using huggingface-cli (if installed)
huggingface-cli download black-forest-labs/FLUX.1-schnell \
  --include '*.safetensors' \
  --local-dir .

# Option B: Using wget (if you have direct URL)
wget -O flux1-schnell.safetensors <DIRECT_DOWNLOAD_URL>

# Option C: Using ComfyUI Manager (if ComfyUI web UI is available)
# Open ComfyUI → Manager → Download Models
```

**2. Z-Image-Turbo Model (~6GB)**
```bash
cd /workspace/models/checkpoints

# Download from HuggingFace or direct URL
# Model name: z-image-turbo.safetensors
```

### Optional (For Face Swap / Character Sheet)

**3. PuLID Model (~2GB)**
```bash
cd /workspace/models/pulid
# Download pulid_model.safetensors
```

**4. ControlNet Models**
```bash
cd /workspace/models/controlnet
# Download controlnet-openpose.safetensors
```

**5. IPAdapter FaceID**
```bash
cd /workspace/models/ipadapter
# Download ip-adapter-faceid.safetensors
```

## Step 6: Verify Models

```bash
# Check file sizes
ls -lh /workspace/models/checkpoints/

# Expected output:
# -rw-r--r-- 1 root root  6G ... flux1-schnell.safetensors
# -rw-r--r-- 1 root root  6G ... z-image-turbo.safetensors

# Check total space used
du -sh /workspace/models/checkpoints/
```

## Step 7: Verify Serverless Endpoints Can Access

The serverless endpoints (`ryla-prod-guarded-flux-dev-endpoint` and `ryla-prod-guarded-z-image-turbo-endpoint`) should automatically have access to models on the network volume once it's attached and models are in place.

**Verify endpoint has volume attached:**
- Go to RunPod Console → Endpoints
- Check each endpoint → Network Volume should show `ryla-models-dream-companion`
- Mount path should be `/workspace/models`

## Troubleshooting

### SSH Connection Fails
- Verify SSH key is added in RunPod Console
- Check key permissions: `chmod 600 ~/.ssh/id_ed25519`
- Try both connection methods (gateway vs direct TCP)

### Network Volume Not Found
- Verify volume is attached to pod in RunPod Console
- Check mount path (usually `/workspace/models` or `/workspace`)
- Restart pod if volume was just attached

### Models Not Found by Serverless
- Verify network volume is attached to serverless endpoint
- Check mount path matches handler expectations (`/workspace/models`)
- Verify models are in correct subdirectory (`checkpoints/`)

## Next Steps

After models are downloaded:
1. Test base image generation via serverless endpoint
2. Verify images are generated correctly
3. Check Supabase storage integration
4. Test face swap workflow (if PuLID/IPAdapter models are added)

