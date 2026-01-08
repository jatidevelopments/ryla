# SSH to ryla_dev Pod for Model Downloads

> **Pod**: `ryla_dev` (ID: `1weisiwol9boie`)  
> **Purpose**: Download Z-Image models to network volume  
> **Network Volume**: `xeqfzsy4k7` (ryla-models-dream-companion) mounted at `/workspace`

---

## SSH Connection Details

### Option 1: Direct TCP (Recommended - Supports SCP/SFTP)

**Connection**:

```bash
ssh root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519
```

**Details**:

- **IP**: `213.173.102.157`
- **Port**: `14352`
- **User**: `root`
- **Key**: `~/.ssh/id_ed25519`

### Option 2: RunPod SSH Gateway

```bash
ssh <pod-ssh-id>@ssh.runpod.io -i ~/.ssh/id_ed25519
```

**Note**: Get the SSH ID from RunPod Console → Pod → Connect → SSH

---

## Step 1: Ensure SSH Key is Added to RunPod

1. **Check if you have an SSH key**:

   ```bash
   ls -la ~/.ssh/id_ed25519
   ```

2. **If not, generate one**:

   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "runpod-$(date +%Y%m%d)"
   ```

3. **Add public key to RunPod**:
   - Copy your public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://www.runpod.io/console/user/settings
   - Navigate to **SSH Keys** section
   - Click **"Add SSH Key"**
   - Paste your public key
   - Save

---

## Step 2: Connect via SSH

```bash
# First time - accept host key
ssh -o StrictHostKeyChecking=no root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519
```

**Expected**: You should see the pod's command prompt.

---

## Step 3: Verify Network Volume

Once connected, check the network volume:

```bash
# Check if /workspace exists and has models
ls -la /workspace/models/

# Check volume mount
df -h | grep workspace
```

**Expected**: Network volume should be mounted at `/workspace` with `models/` directory.

---

## Step 4: Download Z-Image Models

Run the download script:

```bash
# Create directories
mkdir -p /workspace/models/{diffusion_models,text_encoders,vae}

# Download UNET (~12.3 GB)
cd /workspace/models/diffusion_models
wget -O z_image_turbo_bf16.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/diffusion_models/z_image_turbo_bf16.safetensors"

# Download CLIP (~8 GB)
cd /workspace/models/text_encoders
wget -O qwen_3_4b.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors"

# Download VAE (~335 MB)
cd /workspace/models/vae
wget -O z-image-turbo-vae.safetensors \
  "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors"
```

**Or use the script**:

```bash
# Transfer script from local machine
scp -P 14352 -i ~/.ssh/id_ed25519 scripts/setup/download-z-image-models.sh root@213.173.102.157:/tmp/

# SSH into pod
ssh root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519

# Run script
chmod +x /tmp/download-z-image-models.sh
/tmp/download-z-image-models.sh
```

---

## Step 5: Verify Downloads

```bash
# Check file sizes
ls -lh /workspace/models/diffusion_models/z_image_turbo_bf16.safetensors
ls -lh /workspace/models/text_encoders/qwen_3_4b.safetensors
ls -lh /workspace/models/vae/z-image-turbo-vae.safetensors
```

**Expected sizes**:

- UNET: ~12.3 GB
- CLIP: ~8 GB
- VAE: ~335 MB

---

## Troubleshooting

### Permission Denied

**Error**: `Permission denied (publickey)`

**Solution**:

1. Verify SSH key is added to RunPod account
2. Check key path: `ls -la ~/.ssh/id_ed25519`
3. Try with verbose: `ssh -v root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519`

### Connection Timeout

**Error**: `Connection timed out`

**Solution**:

1. Check pod is running (not stopped)
2. Verify IP and port are correct
3. Check if pod has public IP enabled

### Host Key Verification

**Error**: `Host key verification failed`

**Solution**:

```bash
# Remove old host key
ssh-keygen -R 213.173.102.157
ssh-keygen -R [213.173.102.157]:14352

# Or use -o StrictHostKeyChecking=no
ssh -o StrictHostKeyChecking=no root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519
```

---

## Quick Reference

**SSH Command**:

```bash
ssh root@213.173.102.157 -p 14352 -i ~/.ssh/id_ed25519
```

**SCP Command** (transfer files):

```bash
scp -P 14352 -i ~/.ssh/id_ed25519 <local-file> root@213.173.102.157:/tmp/
```

**Pod Info**:

- Name: `ryla_dev`
- ID: `1weisiwol9boie`
- Network Volume: `xeqfzsy4k7` (mounted at `/workspace`)
- Public IP: `213.173.102.157`
- SSH Port: `14352`
