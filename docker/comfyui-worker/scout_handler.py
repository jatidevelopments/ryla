
import os
import json
import subprocess

def handler(job):
    """
    Diagnostic handler to scout for files on the volume.
    """
    search_path = "/runpod-volume"
    target_files = [
        "z_image_turbo_bf16.safetensors",
        "qwen_3_4b.safetensors",
        "flux1-dev.safetensors",
        "ae.safetensors"
    ]
    
    results = {}
    
    print(f"--- Starting File Scout at {search_path} ---")
    
    # 1. List top level of volume
    try:
        results["volume_root"] = os.listdir(search_path)
    except Exception as e:
        results["volume_root_error"] = str(e)
        
    # 2. List /runpod-volume/models
    models_path = os.path.join(search_path, "models")
    try:
        results["models_dir"] = os.listdir(models_path)
    except Exception as e:
        results["models_dir_error"] = str(e)

    # 3. Find target files
    for target in target_files:
        print(f"Searching for {target}...")
        try:
            # Use find command for speed and depth
            cmd = ["find", search_path, "-name", target]
            output = subprocess.check_output(cmd, stderr=subprocess.STDOUT).decode().strip()
            results[target] = output.split('\n') if output else []
        except Exception as e:
            results[f"{target}_error"] = str(e)

    # 4. Check /comfyui and /workspace
    results["comfyui_dirs"] = os.listdir("/comfyui") if os.path.exists("/comfyui") else "NOT_FOUND"
    results["workspace_dirs"] = os.listdir("/workspace") if os.path.exists("/workspace") else "NOT_FOUND"

    return {
        "status": "success",
        "results": results
    }

if __name__ == "__main__":
    import runpod
    runpod.serverless.start({"handler": handler})
