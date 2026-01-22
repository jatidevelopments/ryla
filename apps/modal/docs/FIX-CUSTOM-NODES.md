# Fix: Custom Nodes Installation Issue

## Problem
The `res4lyf` repository doesn't exist on GitHub (404 error). The custom nodes required for the Denrisi workflow (`ClownsharKSampler_Beta`, `Sigmas Rescale`, `BetaSamplingScheduler`) are not being installed.

## Root Cause
- RunPod uses `comfy-node-install res4lyf` which is a wrapper around ComfyUI Manager
- The `res4lyf/res4lyf` GitHub repository doesn't exist (404)
- Direct git clone fails silently
- ComfyUI Manager has a registry of nodes that may include `res4lyf` under a different name or source

## Solution Options

### Option 1: Use ComfyUI Manager's install.py (Recommended)
```python
# In generate_image function, before starting server:
manager_install = custom_nodes_dir / "ComfyUI-Manager" / "install.py"
if manager_install.exists():
    subprocess.run(
        ["python", str(manager_install), "res4lyf", "controlaltai-nodes"],
        cwd=str(custom_nodes_dir),
        check=False,
        timeout=120,
    )
```

### Option 2: Find the actual repository URL
The `res4lyf` nodes might be:
- In a different repository
- Part of a different package name
- Available via ComfyUI Manager's registry with a different identifier

### Option 3: Use alternative nodes
If `res4lyf` nodes are not available, we may need to:
- Use standard ComfyUI samplers instead of `ClownsharKSampler_Beta`
- Modify the workflow to not require `Sigmas Rescale` and `BetaSamplingScheduler`
- Use a different workflow variant

## Next Steps
1. Check ComfyUI Manager's registry for `res4lyf` or alternative names
2. Try installing via ComfyUI Manager's install.py script
3. If that fails, check if the nodes are available under a different name
4. Consider using a workflow variant that doesn't require these custom nodes
