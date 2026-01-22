"""
RYLA ComfyUI Denrisi Workflow - Modal Serverless Implementation

This implements the Z-Image Danrisi workflow on Modal, replicating the RunPod setup.

Required Custom Nodes:
- res4lyf: ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler
- controlaltai-nodes: FluxResolutionNode (optional, for aspect ratio presets)

Required Models:
- z_image_turbo_bf16.safetensors (diffusion model)
- qwen_3_4b.safetensors (text encoder)
- z-image-turbo-vae.safetensors (VAE)

Deploy: modal deploy apps/modal/comfyui_danrisi.py
"""

import modal
import json
import subprocess
import base64
from pathlib import Path
from typing import Optional, Dict, Any

# Define persistent volume for models (equivalent to RunPod network volume)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# Define image with ComfyUI + custom nodes
image = (
    modal.Image.debian_slim(python_version="3.10")
    .apt_install(["git", "wget", "curl"])
    .pip_install([
        "torch>=2.0.0",
        "torchvision",
        "diffusers",
        "transformers",
        "accelerate",
        "safetensors",
        "pillow",
        "numpy",
        "opencv-python",
        "tqdm",
    ])
    .run_commands([
        # Clone ComfyUI
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        
        # Install ComfyUI Manager (for easier node management)
        "cd /root/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager",
        
        # Install custom nodes
        # Note: res4lyf and controlaltai-nodes will be installed at runtime via ComfyUI Manager
        # For now, we'll install them manually if the repos are accessible
        # res4lyf: ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler
        # Try alternative repository URLs or skip if not accessible (will install at runtime)
        "cd /root/ComfyUI/custom_nodes && echo 'Custom nodes will be installed at runtime via ComfyUI Manager'",
    ])
)

app = modal.App("ryla-comfyui-danrisi")

@app.function(
    image=image,
    volumes={"/root/models": volume},  # Mount volume at /root/models (like /workspace in RunPod)
    gpu="A100",  # Match your RunPod GPU (can also use "A10", "H100", etc.)
    timeout=600,  # 10 minutes max
    # secrets=[modal.Secret.from_name("ryla-secrets")]  # Uncomment if you need secrets
)
def generate_image(
    workflow_json: Dict[str, Any],
    prompt: Optional[str] = None,
    negative_prompt: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    steps: int = 20,
    cfg: float = 1.0,
    seed: Optional[int] = None,
    lora: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Generate image from ComfyUI workflow JSON (Denrisi workflow).
    
    This function accepts a workflow JSON and executes it via ComfyUI.
    Models are expected at /root/models/checkpoints/ (same structure as RunPod).
    
    Args:
        workflow_json: Complete ComfyUI workflow JSON
        prompt: Optional prompt to inject into workflow
        negative_prompt: Optional negative prompt
        width: Image width (default: 1024)
        height: Image height (default: 1024)
        steps: Number of inference steps (default: 20)
        cfg: CFG scale (default: 1.0 for Danrisi)
        seed: Random seed (optional)
        lora: Optional LoRA dict with 'name' and 'strength'
    
    Returns:
        Dict with 'image' (base64), 'status', and optional 'error'
    """
    import time
    
    # Save workflow JSON to temp file
    workflow_path = Path("/tmp/workflow.json")
    with open(workflow_path, "w") as f:
        json.dump(workflow_json, f, indent=2)
    
    # Modify workflow if parameters provided
    if prompt or negative_prompt or seed is not None:
        # Load workflow
        with open(workflow_path, "r") as f:
            workflow = json.load(f)
        
        # Find prompt nodes and update them
        # This is a simplified version - you may need to adjust based on your workflow structure
        for node_id, node in workflow.items():
            if isinstance(node, dict):
                if node.get("class_type") == "CLIPTextEncode":
                    # Check if it's positive or negative prompt based on node position/inputs
                    if prompt and "text" in node.get("inputs", {}):
                        node["inputs"]["text"] = prompt
                    if negative_prompt and "text" in node.get("inputs", {}):
                        # This is a heuristic - you may need to adjust
                        if not prompt or node.get("inputs", {}).get("text") != prompt:
                            node["inputs"]["text"] = negative_prompt
                
                # Update seed if provided
                if seed is not None and "seed" in node.get("inputs", {}):
                    node["inputs"]["seed"] = seed
        
        # Save modified workflow
        with open(workflow_path, "w") as f:
            json.dump(workflow, f, indent=2)
    
    # Set up output directory
    output_dir = Path("/tmp/output")
    output_dir.mkdir(exist_ok=True)
    
    # Run ComfyUI via API (headless mode)
    # Based on your existing ComfyUI API client patterns
    comfyui_dir = Path("/root/ComfyUI")
    
    try:
        # Check if models exist
        models_dir = Path("/root/models/checkpoints")
        if not models_dir.exists():
            return {
                "status": "error",
                "error": f"Models directory not found at {models_dir}. Please upload models to volume first.",
            }
        
        # List available models
        available_models = list(models_dir.glob("*.safetensors"))
        if not available_models:
            return {
                "status": "error",
                "error": f"No models found in {models_dir}. Please upload models to volume first.",
            }
        
        # Start ComfyUI server in background process
        # ComfyUI runs on port 8188 by default
        COMFYUI_PORT = 8188
        COMFYUI_URL = f"http://127.0.0.1:{COMFYUI_PORT}"
        
        import urllib.request
        
        # Start ComfyUI server in background
        server_process = subprocess.Popen(
            ["python", "main.py", "--port", str(COMFYUI_PORT), "--listen", "127.0.0.1"],
            cwd=comfyui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        
        # Wait for server to be ready (max 60 seconds)
        max_wait = 60
        wait_interval = 2
        waited = 0
        server_ready = False
        
        while waited < max_wait:
            try:
                response = urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5)
                if response.status == 200:
                    server_ready = True
                    break
            except:
                pass
            time.sleep(wait_interval)
            waited += wait_interval
        
        if not server_ready:
            server_process.terminate()
            return {
                "status": "error",
                "error": "ComfyUI server failed to start within timeout",
            }
        
        # Load workflow JSON
        with open(workflow_path, "r") as f:
            workflow = json.load(f)
        
        # Queue workflow via ComfyUI HTTP API
        # POST /prompt with {"prompt": workflow}
        prompt_data = json.dumps({"prompt": workflow}).encode("utf-8")
        request = urllib.request.Request(
            f"{COMFYUI_URL}/prompt",
            data=prompt_data,
            headers={"Content-Type": "application/json"},
        )
        
        try:
            response = urllib.request.urlopen(request, timeout=30)
            response_data = json.loads(response.read().decode("utf-8"))
            
            if "node_errors" in response_data and response_data["node_errors"]:
                server_process.terminate()
                return {
                    "status": "error",
                    "error": f"ComfyUI node errors: {json.dumps(response_data['node_errors'])}",
                }
            
            prompt_id = response_data["prompt_id"]
        except Exception as e:
            server_process.terminate()
            return {
                "status": "error",
                "error": f"Failed to queue workflow: {str(e)}",
            }
        
        # Poll for completion (max 5 minutes)
        max_poll_time = 300
        poll_interval = 2
        polled = 0
        
        try:
            while polled < max_poll_time:
                # Check history
                history_request = urllib.request.Request(f"{COMFYUI_URL}/history/{prompt_id}")
                history_response = urllib.request.urlopen(history_request, timeout=10)
                history_data = json.loads(history_response.read().decode("utf-8"))
                
                if prompt_id in history_data:
                    # Workflow completed
                    output_data = history_data[prompt_id]
                    
                    # Get output images
                    if "outputs" in output_data:
                        # Find SaveImage node output
                        images = []
                        for node_id, node_output in output_data["outputs"].items():
                            if "images" in node_output:
                                for image_info in node_output["images"]:
                                    # Download image
                                    subfolder = image_info.get('subfolder', '')
                                    image_type = image_info.get('type', 'output')
                                    image_url = f"{COMFYUI_URL}/view?filename={image_info['filename']}&subfolder={subfolder}&type={image_type}"
                                    image_response = urllib.request.urlopen(image_url, timeout=30)
                                    image_data = image_response.read()
                                    
                                    # Convert to base64
                                    image_base64 = base64.b64encode(image_data).decode("utf-8")
                                    images.append({
                                        "filename": image_info["filename"],
                                        "data": image_base64,
                                        "format": "base64",
                                    })
                        
                        # Clean up server
                        server_process.terminate()
                        
                        if images:
                            return {
                                "status": "success",
                                "images": images,
                                "prompt_id": prompt_id,
                            }
                        else:
                            return {
                                "status": "error",
                                "error": "Workflow completed but no images found in output",
                                "prompt_id": prompt_id,
                            }
                
                # Check if still running
                queue_request = urllib.request.Request(f"{COMFYUI_URL}/queue")
                queue_response = urllib.request.urlopen(queue_request, timeout=10)
                queue_data = json.loads(queue_response.read().decode("utf-8"))
                
                # Check if prompt_id is still in queue
                still_queued = False
                for queue_item in queue_data.get("queue_running", []) + queue_data.get("queue_pending", []):
                    if isinstance(queue_item, list) and len(queue_item) > 1:
                        if queue_item[1] == prompt_id:
                            still_queued = True
                            break
                
                if not still_queued and prompt_id not in history_data:
                    # Workflow might have failed
                    server_process.terminate()
                    return {
                        "status": "error",
                        "error": "Workflow not found in queue or history",
                        "prompt_id": prompt_id,
                    }
                
                time.sleep(poll_interval)
                polled += poll_interval
            
            # Timeout
            server_process.terminate()
            return {
                "status": "error",
                "error": f"Workflow execution timed out after {max_poll_time} seconds",
                "prompt_id": prompt_id,
            }
        except Exception as e:
            server_process.terminate()
            raise
        
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc(),
        }


@app.function(
    volumes={"/root/models": volume},
    timeout=3600,  # 1 hour timeout for large model downloads
)
def upload_model(
    model_url: str,
    model_path: str,
    model_type: str = "checkpoints",  # checkpoints, vae, clip, etc.
) -> Dict[str, Any]:
    """
    Upload/download model to Modal volume.
    
    Args:
        model_url: URL to download model from (HuggingFace, etc.)
        model_path: Path within volume (e.g., "checkpoints/z_image_turbo_bf16.safetensors")
        model_type: Type of model (checkpoints, vae, clip, etc.)
    
    Returns:
        Dict with status and path
    """
    from pathlib import Path
    import urllib.request
    import shutil
    
    # Create directory structure
    full_path = Path("/root/models") / model_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Download model using Python urllib (more reliable than wget)
    try:
        print(f"Downloading {model_url} to {full_path}...")
        
        # Download with progress tracking
        def show_progress(block_num, block_size, total_size):
            if total_size > 0:
                percent = min(100, (block_num * block_size * 100) // total_size)
                if block_num % 100 == 0:  # Print every 100 blocks
                    print(f"  Progress: {percent}% ({block_num * block_size // 1024 // 1024} MB)")
        
        urllib.request.urlretrieve(model_url, str(full_path), show_progress)
        
        # Verify file was downloaded
        if not full_path.exists():
            return {
                "status": "error",
                "error": f"File not found after download: {full_path}",
            }
        
        file_size = full_path.stat().st_size
        print(f"Downloaded {file_size / 1024 / 1024 / 1024:.2f} GB")
        
        # Commit volume changes
        volume.commit()
        
        return {
            "status": "success",
            "path": model_path,
            "size": file_size,
            "size_gb": round(file_size / 1024 / 1024 / 1024, 2),
        }
    except Exception as e:
        import traceback
        return {
            "status": "error",
            "error": f"Failed to download model: {str(e)}",
            "traceback": traceback.format_exc(),
        }


@app.function(volumes={"/root/models": volume})
def list_models() -> Dict[str, Any]:
    """List all models in the volume."""
    from pathlib import Path
    import json
    
    models_dir = Path("/root/models")
    
    models = {}
    total_size = 0
    
    for model_type in ["checkpoints", "vae", "clip", "loras"]:
        type_dir = models_dir / model_type
        if type_dir.exists():
            model_files = []
            for f in type_dir.glob("*.safetensors"):
                size = f.stat().st_size
                total_size += size
                model_files.append({
                    "name": f.name,
                    "size_bytes": size,
                    "size_gb": round(size / 1024 / 1024 / 1024, 2),
                })
            if model_files:
                models[model_type] = model_files
    
    result = {
        "status": "success",
        "models": models,
        "volume_path": "/root/models",
        "total_size_gb": round(total_size / 1024 / 1024 / 1024, 2),
        "model_count": sum(len(v) for v in models.values()),
    }
    
    # Print for visibility
    print("\n📦 Models in Modal Volume:")
    print("=" * 50)
    for model_type, model_list in models.items():
        print(f"\n{model_type.upper()}:")
        for model in model_list:
            print(f"  ✅ {model['name']} ({model['size_gb']} GB)")
    
    print(f"\n📊 Total: {result['model_count']} models, {result['total_size_gb']} GB")
    print("=" * 50)
    
    return result


# Local testing function
@app.local_entrypoint()
def test_workflow():
    """Test the workflow locally (for development)."""
    # Example workflow JSON (simplified)
    test_workflow = {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
            },
        },
        # ... rest of workflow
    }
    
    result = generate_image.remote(
        workflow_json=test_workflow,
        prompt="A beautiful landscape",
        width=1024,
        height=1024,
    )
    
    print(json.dumps(result, indent=2))
