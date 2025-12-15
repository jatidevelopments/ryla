# Add SSH Key to RunPod

> **Date**: 2025-12-10  
> **Status**: SSH Key Generated ✅  
> **Next Step**: Add public key to RunPod account

---

## Your SSH Public Key

**Copy this key** (already generated):

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEcPDH+9ZAdRYPZGSJvoHX5196rwT70zi959i7cWkGaT runpod-comfyui-20251211
```

---

## How to Add SSH Key to RunPod

### Step 1: Open RunPod Console

1. Go to: https://console.runpod.io/
2. Navigate to: **Settings** → **SSH Keys** (or **Account Settings** → **SSH Keys**)

### Step 2: Add Your Public Key

1. Click **"Add SSH Key"** or **"New SSH Key"**
2. **Paste your public key** (the one shown above)
3. Give it a name: `runpod-comfyui-20251211` (or any name you prefer)
4. Click **"Save"** or **"Add"**

### Step 3: Verify

The key should appear in your list of SSH keys.

---

## After Adding the Key

### Test SSH Connection

```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

**Expected**: You should connect successfully and see the pod's command prompt.

### If Connection Still Fails

1. **Wait 1-2 minutes** - Key propagation can take a moment
2. **Verify key is added** - Check RunPod console
3. **Try again** - Run the SSH command again

---

## Once Connected

You'll be able to:

1. **Download models directly**:
   ```bash
   cd /workspace/ComfyUI/models
   wget [model-url]
   ```

2. **Transfer files via SCP**:
   ```bash
   # From your local machine
   scp -P 41001 -i ~/.ssh/id_ed25519 file.txt root@87.197.126.165:/tmp/
   ```

3. **Run the download script**:
   ```bash
   # Copy script to pod
   scp -P 41001 -i ~/.ssh/id_ed25519 scripts/download-comfyui-models.sh root@87.197.126.165:/tmp/
   
   # SSH into pod
   ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
   
   # Run script
   chmod +x /tmp/download-comfyui-models.sh
   /tmp/download-comfyui-models.sh
   ```

---

## Quick Reference

**SSH Command**:
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

**SCP Command** (transfer files):
```bash
scp -P 41001 -i ~/.ssh/id_ed25519 <local-file> root@87.197.126.165:<remote-path>
```

---

## Alternative: Use Web Terminal

If you prefer not to set up SSH keys, you can use the **Web Terminal** which is already enabled:

- **URL**: `https://p1bm9m74jjzdb7-19123.proxy.runpod.net/n0xs5h11wzkx3vw0x366k24mzxwgyavu/`
- **No SSH key needed** - Just open in browser
- **Same functionality** - Can run all download commands

See `docs/technical/WEB-TERMINAL-QUICK-START.md` for web terminal commands.

---

## Next Steps

1. ✅ SSH key generated
2. ⏭️ **Add public key to RunPod** (see steps above)
3. ⏭️ Test SSH connection
4. ⏭️ Download models via SSH

---

## References

- SSH Setup: `docs/technical/SSH-SETUP-INSTRUCTIONS.md`
- Web Terminal Guide: `docs/technical/WEB-TERMINAL-QUICK-START.md`
- Download Script: `scripts/download-comfyui-models.sh`

