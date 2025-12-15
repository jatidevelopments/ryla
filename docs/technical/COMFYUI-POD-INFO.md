# ComfyUI Pod Information

> **Date**: 2025-12-10  
> **Status**: Active  
> **Purpose**: Testing machine for ComfyUI workflows

---

## Pod Details

**Name**: `ryla_ai_comfy_ui_rd`

**Configuration**:
- GPU: RTX 4090 (24GB VRAM)
- RAM: 30GB
- vCPU: 6
- Total Disk: 200GB
- Container Disk: Charges apply ($0.10/GB/Mo for running pods)

**Pricing**:
- GPU cost: $0.34/hr
- Running Pod disk cost: $0.028/hr
- Stopped Pod disk cost: $0.014/hr
- **Total running cost**: ~$0.37/hr

---

## Access Methods

### HTTP Services (Proxied Domain)

**Port 8080 - FileBrowser**
- Status: Ready
- URL: `https://p1bm9m74jjzdb7-8080.proxy.runpod.net`
- Access: Via RunPod Console → HTTP link

**Port 8188 - ComfyUI** ⭐ **PRIMARY**
- Status: Ready ✅
- URL: `https://p1bm9m74jjzdb7-8188.proxy.runpod.net`
- Access: Via RunPod Console → HTTP link
- **This is the main ComfyUI interface**

**Port 8888 - JupyterLab**
- Status: Ready
- URL: `https://p1bm9m74jjzdb7-8888.proxy.runpod.net/?token=57noijqpe6621rt0372g`
- Access: Via RunPod Console → HTTP link

### SSH Access

**Standard SSH**:
```bash
ssh p1bm9m74jjzdb7-6441158a@ssh.runpod.io -i ~/.ssh/id_ed25519
```
- Note: No support for SCP & SFTP

**SSH over Exposed TCP** (Supports SCP & SFTP):
```bash
ssh root@87.197.126.165 -p 41001 -i ~/.ssh/id_ed25519
```

**Direct TCP Port**:
- SSH: `87.197.126.165:41001`

### Web Terminal ✅ **ENABLED**

- Status: Running ✅
- Port: 19123
- URL: `https://p1bm9m74jjzdb7-19123.proxy.runpod.net/n0xs5h11wzkx3vw0x366k24mzxwgyavu/`
- Access: Via RunPod Console → "Open web terminal" link
- Connect directly in browser (no SSH key needed)

---

## Quick Access Links

1. **ComfyUI Interface**: ✅ **ACCESSIBLE**
   - URL: `https://p1bm9m74jjzdb7-8188.proxy.runpod.net`
   - Status: Ready and loaded
   - Features: ComfyUI Manager, Model Library, Node Library available

2. **FileBrowser**: Port 8080
   - URL: `https://p1bm9m74jjzdb7-8080.proxy.runpod.net`
   - For file management

3. **JupyterLab**: Port 8888
   - URL: `https://p1bm9m74jjzdb7-8888.proxy.runpod.net/?token=57noijqpe6621rt0372g`
   - For Python notebooks

4. **SSH**: Use commands above

---

## Usage Notes

### Cost Management

**When Testing**:
- Pod running: ~$0.37/hr
- Keep pod running during active testing sessions

**When Not Testing**:
- **STOP POD** to save costs
- Stopped pod: $0.014/hr (disk only)
- Saves ~$0.36/hr when stopped

**Recommendation**: 
- Start pod when beginning testing session
- Stop pod when done for the day
- Restart when needed (takes ~2-3 minutes)

### Model Storage

**Network Volume** (if mounted):
- Models persist on network volume
- Accessible from `/workspace/models` or similar path

**Container Disk**:
- Temporary storage
- Lost when pod is deleted
- Use for temporary files only

---

## Testing Workflow

1. **Start Pod** (if stopped)
2. **Access ComfyUI**: Port 8188
3. **Download Models** (if not already on network volume)
4. **Test Workflows**: Follow `COMFYUI-TESTING-GUIDE.md`
5. **Export Workflows**: Save JSON files to `workflows/` directory
6. **Stop Pod** (when done testing)

---

## Troubleshooting

### ComfyUI Not Loading
- Check pod status (should be "Running")
- Verify port 8188 is accessible
- Try refreshing HTTP link

### SSH Connection Issues
- Verify SSH key is in `~/.ssh/id_ed25519`
- Check IP address: `87.197.126.165:41001`
- Try web terminal as alternative

### Out of Memory
- RTX 4090 has 24GB VRAM (should be enough)
- Reduce batch sizes if needed
- Close other applications

---

## ComfyUI Status

✅ **ComfyUI Interface**: Fully loaded and ready
- URL: `https://p1bm9m74jjzdb7-8188.proxy.runpod.net`
- Status: Ready
- Features Available:
  - ComfyUI Manager (for downloading models)
  - Model Library (checkpoints, loras, vae, controlnet, etc.)
  - Node Library
  - Workflow canvas (ready for building)

## Next Steps

1. ✅ Pod deployed and accessible
2. ✅ ComfyUI interface loaded
3. ⏭️ Check available models in Model Library
4. ⏭️ Download missing models (Flux Dev, Z-Image-Turbo, etc.) via ComfyUI Manager
5. ⏭️ Test base image generation workflows
6. ⏭️ Test NSFW support (critical)
7. ⏭️ Test face swap and character sheets
8. ⏭️ Export workflows as JSON

---

## References

- Testing Guide: `docs/technical/COMFYUI-TESTING-GUIDE.md`
- Deployment Status: `docs/technical/RUNPOD-DEPLOYMENT-STATUS.md`
- RunPod Console: https://www.runpod.io/console

---

## Tags

#comfyui #runpod #testing #pod-info #rtx-4090 #ep-001 #ep-005

