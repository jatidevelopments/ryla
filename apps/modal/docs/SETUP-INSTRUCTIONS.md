# Modal Setup Instructions for Denrisi Workflow

## What I Need From You

To proceed with the Modal implementation, I need:

### 1. Modal Authentication Tokens

**Option A: Modal Token (Recommended)**
```bash
# Run this command and share the output
modal token new
```

This will give you:
- `MODAL_TOKEN_ID`
- `MODAL_TOKEN_SECRET`

**Option B: Share Modal Credentials**
- Modal account email/username
- Or existing token if you have one

### 2. Model Locations

Where are your Z-Image-Turbo models currently stored?

**Options:**
- ✅ **RunPod Network Volume**: I can help you download from there
- ✅ **HuggingFace**: Share the repo URLs
- ✅ **Local Files**: We can upload them
- ✅ **Cloud Storage**: S3/R2 URLs

**Required Models:**
- `z_image_turbo_bf16.safetensors` (diffusion model)
- `qwen_3_4b.safetensors` (text encoder)
- `z-image-turbo-vae.safetensors` (VAE)

### 3. Workflow JSON

I have the workflow definition from your codebase, but if you have:
- The original JSON workflow file
- Any modifications or customizations
- Specific node versions you're using

Share those if available.

### 4. Test Prompt (Optional)

A test prompt to validate the workflow works:
- Example: "A beautiful landscape with mountains"
- Or use your existing test prompts

---

## What I'll Do Next

Once I have the above, I'll:

1. ✅ **Complete the ComfyUI API Integration**
   - Currently the function is a skeleton
   - Need to implement actual ComfyUI execution via API
   - This requires starting ComfyUI server and using the API client

2. ✅ **Set Up Model Upload Script**
   - Create helper function to upload models to Modal volume
   - Or provide CLI commands to do it

3. ✅ **Create GitHub Actions Workflow**
   - Automatic deployment on push
   - Integration with your existing CI/CD

4. ✅ **Add MCP Tools** (Optional)
   - Wrap Modal CLI in MCP server
   - Enable AI agent management

5. ✅ **Test End-to-End**
   - Deploy to Modal
   - Test with Denrisi workflow
   - Compare with RunPod setup

---

## Quick Start (If You Have Modal Token)

If you already have Modal tokens, you can start testing:

```bash
# 1. Install Modal
pip install modal

# 2. Set tokens
export MODAL_TOKEN_ID="your-token-id"
export MODAL_TOKEN_SECRET="your-token-secret"

# 3. Deploy (skeleton version)
modal deploy apps/modal/comfyui_danrisi.py

# 4. Test
modal run apps/modal/comfyui_danrisi.py::list_models
```

---

## Questions?

If you're unsure about any of the above, just let me know:
- What you have available
- What you need help with
- Any constraints or preferences

I'll adapt the implementation accordingly.
