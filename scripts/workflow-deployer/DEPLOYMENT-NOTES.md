# Deployment Notes

## Generated Code Requirements

### Modal Deployment

The generated Modal Python code requires:

1. **ComfyUI Utils Module**: The code uses `utils.comfyui` for server management. You have two options:

   **Option A: Copy utils file** (Recommended)
   ```bash
   # Before deploying, copy the utils file to the generated workflow directory
   cp apps/modal/utils/comfyui.py scripts/generated/workflows/utils/
   mkdir -p scripts/generated/workflows/utils
   cp apps/modal/utils/comfyui.py scripts/generated/workflows/utils/
   ```
   
   Then update the generated code to include:
   ```python
   image = image.copy_local_file(
       "scripts/generated/workflows/utils/comfyui.py",
       "/root/utils/comfyui.py"
   )
   ```

   **Option B: Use inline implementation** (Simpler but less maintainable)
   - The generated code includes a fallback that launches ComfyUI directly
   - This works but doesn't have all the health checks and error handling

2. **ComfyUI CLI**: The code uses `comfy launch` command, which requires:
   ```bash
   pip install comfy-cli
   ```
   This should already be in the base image.

3. **Models**: Models should be in the Modal volume (`ryla-models` by default).

### RunPod Deployment

The generated Dockerfile requires:

1. **Base Image**: Uses `runpod/worker-comfyui:5.6.0-base`
2. **Custom Nodes**: Installed via `comfy-node-install`
3. **Models**: Models should be in the network volume and will be symlinked automatically

## Common Issues

### Modal: "ModuleNotFoundError: No module named 'utils'"

**Solution**: Copy the utils file before deploying:
```bash
mkdir -p scripts/generated/workflows/utils
cp apps/modal/utils/comfyui.py scripts/generated/workflows/utils/
```

Then update the generated code to include the file copy.

### Modal: "ComfyUI server failed to start"

**Solution**: Check that:
1. ComfyUI is installed correctly
2. Custom nodes are installed correctly
3. Port 8000 is available
4. Check Modal logs for detailed error messages

### RunPod: "Node not found"

**Solution**: 
1. Verify custom nodes are installed: Check Dockerfile has `comfy-node-install` commands
2. Check node names match exactly (case-sensitive)
3. Verify ComfyUI Manager registry has the node

## Best Practices

1. **Test locally first**: Test the workflow in ComfyUI UI before deploying
2. **Check dependencies**: Use `analyze` command to verify all dependencies are found
3. **Review generated code**: Always review the generated code before deploying
4. **Start small**: Test with a simple workflow first, then move to complex ones
5. **Monitor logs**: Check Modal/RunPod logs for errors after deployment

## Future Improvements

- [ ] Auto-copy utils file during generation
- [ ] Validate generated code before writing
- [ ] Add health check endpoints
- [ ] Add cost tracking
- [ ] Add error recovery
