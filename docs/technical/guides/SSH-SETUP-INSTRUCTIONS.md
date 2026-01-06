# SSH Setup Instructions for RunPod ComfyUI Pod

> **Date**: 2025-12-10  
> **Purpose**: Connect to ComfyUI pod via SSH for model downloads

---

## SSH Connection Methods

### Method 1: SSH over Exposed TCP (Recommended - Supports SCP & SFTP)

**Command**:
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

**Advantages**:
- ✅ Supports SCP & SFTP (can transfer files)
- ✅ Direct connection
- ✅ More reliable

### Method 2: Standard SSH (No SCP/SFTP)

**Command**:
```bash
ssh p1bm9m74jjzdb7-6441158a@ssh.runpod.io -i ~/.ssh/id_ed25519
```

**Limitations**:
- ❌ No SCP & SFTP support
- ⚠️ Terminal access only

---

## Step 1: Generate SSH Key (If Needed)

If you don't have `id_ed25519` key:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N "" -C "runpod-$(date +%Y%m%d)"
```

**Note**: Press Enter when prompted (empty passphrase is fine for automated access)

---

## Step 2: Add Public Key to RunPod

### Option A: Via RunPod Console (Recommended)

1. Go to RunPod Console → Settings → SSH Keys
2. Click "Add SSH Key"
3. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
4. Paste into RunPod and save

### Option B: Via API (If available)

Use RunPod API to add SSH key programmatically.

---

## Step 3: Connect via SSH

### Test Connection

```bash
# Method 1 (Recommended)
ssh -o StrictHostKeyChecking=no root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519

# Method 2 (Alternative)
ssh -o StrictHostKeyChecking=no p1bm9m74jjzdb7-6441158a@ssh.runpod.io -i ~/.ssh/id_ed25519
```

**First time connection**: You'll see a prompt asking to accept the host key. Type `yes`.

---

## Step 4: Transfer Download Script (If Using SCP)

Once connected via Method 1, you can transfer files:

```bash
# From your local machine
scp -P 41001 -i ~/.ssh/id_ed25519 scripts/download-comfyui-models.sh root@87.197.126.165:/tmp/
```

---

## Step 5: Run Model Downloads

Once connected via SSH:

```bash
# Navigate to ComfyUI models directory
cd /workspace/ComfyUI/models  # or /root/ComfyUI/models

# Create directories
mkdir -p checkpoints vae controlnet ipadapter clip_vision loras

# Download models (see WEB-TERMINAL-QUICK-START.md for full commands)
cd checkpoints
wget https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/z_image_turbo.safetensors -O z-image-turbo.safetensors
```

---

## Troubleshooting

### Permission Denied

**Error**: `Permission denied (publickey)`

**Solution**:
1. Verify SSH key is added to RunPod account
2. Check key path: `ls -la ~/.ssh/id_ed25519`
3. Try with verbose mode: `ssh -v root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519`

### Connection Timeout

**Error**: `Connection timed out`

**Solution**:
1. Check pod is running (not stopped)
2. Verify IP address: `87.197.126.165:41001`
3. Check firewall/network settings

### Host Key Verification Failed

**Error**: `Host key verification failed`

**Solution**:
```bash
# Remove old host key
ssh-keygen -R 87.197.126.165
ssh-keygen -R [87.197.126.165]:41001

# Or use -o StrictHostKeyChecking=no (first time only)
ssh -o StrictHostKeyChecking=no root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

---

## Quick Reference

**Pod Details**:
- IP: `87.197.126.165`
- Port: `41001`
- User: `root`
- Key: `~/.ssh/id_ed25519`

**Quick Connect**:
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

---

## References

- Pod Info: `docs/technical/COMFYUI-POD-INFO.md`
- Download Guide: `docs/technical/WEB-TERMINAL-QUICK-START.md`
- Download Script: `scripts/download-comfyui-models.sh`

