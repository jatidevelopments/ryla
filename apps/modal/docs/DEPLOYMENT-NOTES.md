# Modal Deployment Notes - EP-058

## HuggingFace Token Required

Flux Dev is a **gated model** on HuggingFace and requires authentication.

### Setup HuggingFace Token

1. **Get your HuggingFace token**:
   - Go to https://huggingface.co/settings/tokens
   - Create a new token with "read" permissions
   - Copy the token

2. **Create Modal Secret**:
   ```bash
   modal secret create huggingface HF_TOKEN=<your-hf-token>
   ```

   Or if you prefer a different secret name:
   ```bash
   modal secret create hf-token HUGGINGFACE_TOKEN=<your-hf-token>
   ```
   
   Then update `comfyui_ryla.py` to use the correct secret name.

### Verify Secret

```bash
modal secret list
```

You should see `huggingface` in the list.

### Deploy

After creating the secret, deploy normally:

```bash
modal deploy apps/modal/comfyui_ryla.py
```

---

## Alternative: Skip Flux Dev for Testing

If you want to test other endpoints first (Flux Schnell, InstantID, LoRA) without Flux Dev:

1. Comment out the `hf_download_flux_dev` function call in the image build
2. Deploy without Flux Dev
3. Test other endpoints
4. Add Flux Dev later with token

---

## Troubleshooting

### Error: "Cannot access gated repo"

**Solution**: Create the HuggingFace token secret as described above.

### Error: "Secret not found"

**Solution**: 
- Verify secret exists: `modal secret list`
- Check secret name matches in code (default: `huggingface`)
- Recreate secret if needed

### Error: "401 Unauthorized"

**Solution**: 
- Verify token is valid: Test at https://huggingface.co/settings/tokens
- Ensure token has "read" permissions
- Recreate Modal secret with correct token
