# Next Steps - Modal Setup

## ✅ What I've Done Automatically

1. ✅ **Completed ComfyUI API Integration**
   - Full workflow execution via ComfyUI API
   - Queue workflow, poll for completion, download images
   - Based on your existing ComfyUI API client patterns

2. ✅ **Created Helper Scripts**
   - `setup.sh` - Automated setup script
   - `upload_models.py` - Model upload helper
   - `requirements.txt` - Dependencies

3. ✅ **Created GitHub Actions Workflow**
   - `.github/workflows/deploy-modal.yml`
   - Automatic deployment on push
   - Uses GitHub Secrets for Modal tokens

4. ✅ **Updated Modal App**
   - Complete ComfyUI API integration
   - Server startup and management
   - Image generation and base64 encoding

---

## 🔑 What I Need From You

### 1. Modal Authentication Tokens (REQUIRED)

**Run this command and share the output:**
```bash
modal token new
```

This will give you:
- `MODAL_TOKEN_ID`
- `MODAL_TOKEN_SECRET`

**Then add to GitHub Secrets:**
1. Go to: GitHub repo → Settings → Secrets and variables → Actions
2. Add:
   - `MODAL_TOKEN_ID` = (your token ID)
   - `MODAL_TOKEN_SECRET` = (your token secret)

**Or if you want to test locally first:**
```bash
export MODAL_TOKEN_ID="your-token-id"
export MODAL_TOKEN_SECRET="your-token-secret"
```

---

### 2. Model Locations (REQUIRED)

**Where are your Z-Image-Turbo models?**

**Option A: HuggingFace (Recommended)**
If models are on HuggingFace, I can download them automatically. Share:
- Repository name (e.g., `Tongyi-MAI/Z-Image-Turbo`)
- Model filenames:
  - `z_image_turbo_bf16.safetensors`
  - `qwen_3_4b.safetensors`
  - `z-image-turbo-vae.safetensors`

**Option B: RunPod Network Volume**
If models are on RunPod, I can help you download them. Share:
- RunPod network volume name
- Model paths in the volume

**Option C: Direct URLs**
If you have direct download URLs, share them.

**Option D: Local Files**
If you have models locally, we can upload them.

---

### 3. Test Prompt (Optional)

A test prompt to validate everything works:
- Example: "A beautiful landscape with mountains"
- Or use your existing test prompts

---

## 🚀 Quick Start (After You Provide Tokens)

### Step 1: Authenticate
```bash
modal token new  # Share output with me
```

### Step 2: Run Setup Script
```bash
chmod +x apps/modal/setup.sh
./apps/modal/setup.sh
```

### Step 3: Upload Models
```bash
# Option A: From HuggingFace
python apps/modal/upload_models.py \
  --from-huggingface "Tongyi-MAI/Z-Image-Turbo" \
  --model-name "z_image_turbo_bf16.safetensors" \
  --model-type "checkpoints"

# Option B: From URL
python apps/modal/upload_models.py \
  --model-url "https://..." \
  --model-path "checkpoints/z_image_turbo_bf16.safetensors"
```

### Step 4: Test
```bash
# List models
modal run apps/modal/comfyui_danrisi.py::list_models

# Test workflow
modal run apps/modal/comfyui_danrisi.py::test_workflow
```

---

## 📋 Checklist

- [ ] Modal tokens obtained (`modal token new`)
- [ ] GitHub Secrets added (for CI/CD)
- [ ] Models uploaded to volume
- [ ] Deployment tested
- [ ] GitHub Actions workflow tested

---

## 🆘 If You Get Stuck

1. **Check Modal authentication:**
   ```bash
   modal app list
   ```

2. **Check models in volume:**
   ```bash
   modal run apps/modal/comfyui_danrisi.py::list_models
   ```

3. **View app logs:**
   ```bash
   modal app logs ryla-comfyui-danrisi
   ```

4. **Redeploy:**
   ```bash
   modal deploy apps/modal/comfyui_danrisi.py
   ```

---

## 📝 Summary

**I've done:**
- ✅ Complete ComfyUI API integration
- ✅ Helper scripts for setup and model upload
- ✅ GitHub Actions workflow
- ✅ Full workflow execution logic

**I need from you:**
1. Modal tokens (`modal token new`)
2. Model locations (HuggingFace repo, URLs, or RunPod volume)
3. (Optional) Test prompt

**Once you provide these, I can:**
- Upload models automatically
- Test the full workflow
- Verify everything works end-to-end
