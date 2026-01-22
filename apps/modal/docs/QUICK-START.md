# Quick Start - Testing Modal MVP Models

## Prerequisites

1. **Modal CLI installed and authenticated**
   ```bash
   modal --version
   modal profile current  # Should show your workspace
   ```

2. **HuggingFace Token (for Flux Dev - optional)**
   - Get token: https://huggingface.co/settings/tokens
   - Create Modal secret:
     ```bash
     modal secret create huggingface HF_TOKEN=<your-token>
     ```

## Deployment

### Option 1: Deploy Without Flux Dev (Quick Test)

This will deploy with Flux Schnell, InstantID, and LoRA support, but skip Flux Dev:

```bash
modal deploy apps/modal/comfyui_ryla.py
```

**Note**: Flux Dev endpoints (`/flux-dev`, `/flux-instantid`, `/flux-lora`) will not work without the HF token.

### Option 2: Deploy With Flux Dev (Full MVP)

1. Create HuggingFace secret:
   ```bash
   modal secret create huggingface HF_TOKEN=<your-hf-token>
   ```

2. Update `comfyui_ryla.py` to uncomment Flux Dev download:
   - Find the commented `hf_download_flux_dev` section
   - Uncomment it and add the secret

3. Deploy:
   ```bash
   modal deploy apps/modal/comfyui_ryla.py
   ```

## Testing

### Test Flux Schnell (No Token Required)

```bash
python apps/modal/ryla_client.py flux \
  --prompt "A beautiful landscape with mountains" \
  --output test_flux_schnell.jpg
```

### Test Flux Dev (Requires HF Token)

```bash
python apps/modal/ryla_client.py flux-dev \
  --prompt "A beautiful landscape" \
  --output test_flux_dev.jpg
```

### Test Performance

```bash
python apps/modal/test_performance.py
```

### Test Success Rate

```bash
python apps/modal/test_flux_dev_success_rate.py
```

## Troubleshooting

### "Secret not found"
- Create the secret: `modal secret create huggingface HF_TOKEN=<token>`
- Or skip Flux Dev and test other endpoints first

### "404 Not Found"
- App not deployed yet: Run `modal deploy apps/modal/comfyui_ryla.py`
- Check endpoint URL matches workspace name

### "401 Unauthorized" (Flux Dev)
- HF token invalid or missing
- Verify token at https://huggingface.co/settings/tokens
- Recreate Modal secret with correct token
