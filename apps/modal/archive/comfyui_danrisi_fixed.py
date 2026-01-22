"""
RYLA ComfyUI Denrisi Workflow - Modal Serverless Implementation (FIXED VERSION)

This is a fixed version with:
- Model symlinks
- Custom node installation
- Better error handling
- Extended timeouts
"""

import modal
import json
import subprocess
import base64
import time
import urllib.request
import urllib.error
from pathlib import Path
from typing import Optional, Dict, Any

# Define persistent volume for models
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
        
        # Install ComfyUI Manager
        "cd /root/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager",
        
        # Note: Custom nodes will be installed at runtime
    ])
)

app = modal.App("ryla-comfyui-danrisi")

@app.function(
    image=image,
    volumes={"/root/models": volume},
    gpu="A100",
    timeout=600,
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
    """Generate image from ComfyUI workflow JSON (Denrisi workflow)."""
    
    comfyui_dir = Path("/root/ComfyUI")
    
    try:
        # Check models
        models_dir = Path("/root/models/checkpoints")
        if not models_dir.exists() or not list(models_dir.glob("*.safetensors")):
            return {
                "status": "error",
                "error": "Models not found. Please upload models to volume first.",
            }
        
        # Create symlinks: ComfyUI expects models at /root/ComfyUI/models/{type}/
        comfyui_models_base = comfyui_dir / "models"
        volume_models_base = Path("/root/models")
        
        for model_type in ["checkpoints", "vae", "clip", "loras"]:
            comfyui_type_dir = comfyui_models_base / model_type
            volume_type_dir = volume_models_base / model_type
            comfyui_type_dir.mkdir(parents=True, exist_ok=True)
            if volume_type_dir.exists():
                for model_file in volume_type_dir.glob("*.safetensors"):
                    symlink_path = comfyui_type_dir / model_file.name
                    if not symlink_path.exists():
                        symlink_path.symlink_to(model_file)
        
        # Install custom nodes at runtime
        custom_nodes_dir = comfyui_dir / "custom_nodes"
        
        # Install res4lyf
        res4lyf_dir = custom_nodes_dir / "res4lyf"
        if not res4lyf_dir.exists():
            try:
                subprocess.run(
                    ["git", "clone", "https://github.com/res4lyf/res4lyf.git", str(res4lyf_dir)],
                    check=False,
                    capture_output=True,
                    timeout=60,
                )
                if res4lyf_dir.exists():
                    req_file = res4lyf_dir / "requirements.txt"
                    if req_file.exists():
                        subprocess.run(
                            ["pip", "install", "-r", str(req_file)],
                            check=False,
                            capture_output=True,
                        )
            except Exception:
                pass
        
        # Install controlaltai-nodes
        controlaltai_dir = custom_nodes_dir / "controlaltai-nodes"
        if not controlaltai_dir.exists():
            try:
                subprocess.run(
                    ["git", "clone", "https://github.com/controlaltai/controlaltai-nodes.git", str(controlaltai_dir)],
                    check=False,
                    capture_output=True,
                    timeout=60,
                )
                if controlaltai_dir.exists():
                    req_file = controlaltai_dir / "requirements.txt"
                    if req_file.exists():
                        subprocess.run(
                            ["pip", "install", "-r", str(req_file)],
                            check=False,
                            capture_output=True,
                        )
            except Exception:
                pass
        
        # Start ComfyUI server
        COMFYUI_PORT = 8188
        COMFYUI_URL = f"http://127.0.0.1:{COMFYUI_PORT}"
        
        server_process = subprocess.Popen(
            ["python", "main.py", "--port", str(COMFYUI_PORT), "--listen", "127.0.0.1"],
            cwd=comfyui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
        
        # Wait for server (90s for custom nodes to load)
        max_wait = 90
        wait_interval = 3
        waited = 0
        server_ready = False
        
        while waited < max_wait:
            try:
                response = urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5)
                if response.status == 200:
                    server_ready = True
                    break
            except Exception:
                if server_process.poll() is not None:
                    _, stderr = server_process.communicate()
                    return {
                        "status": "error",
                        "error": f"ComfyUI server died: {stderr.decode('utf-8') if stderr else 'Unknown'}",
                    }
            time.sleep(wait_interval)
            waited += wait_interval
        
        if not server_ready:
            server_process.terminate()
            return {
                "status": "error",
                "error": f"ComfyUI server failed to start within {max_wait}s",
            }
        
        # Save workflow
        workflow_path = Path("/tmp/workflow.json")
        with open(workflow_path, "w") as f:
            json.dump(workflow_json, f, indent=2)
        
        # Modify workflow if parameters provided
        with open(workflow_path, "r") as f:
            workflow = json.load(f)
        
        if prompt or negative_prompt or seed is not None:
            for node_id, node in workflow.items():
                if isinstance(node, dict):
                    if node.get("class_type") == "CLIPTextEncode":
                        if prompt and "text" in node.get("inputs", {}):
                            node["inputs"]["text"] = prompt
                        if negative_prompt and "text" in node.get("inputs", {}):
                            if not prompt or node.get("inputs", {}).get("text") != prompt:
                                node["inputs"]["text"] = negative_prompt
                    if seed is not None and "seed" in node.get("inputs", {}):
                        node["inputs"]["seed"] = seed
        
        # Queue workflow
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
        except urllib.error.HTTPError as e:
            server_process.terminate()
            try:
                error_body = e.read().decode("utf-8")
            except:
                error_body = str(e)
            
            # Check available nodes
            try:
                nodes_response = urllib.request.urlopen(f"{COMFYUI_URL}/object_info", timeout=10)
                nodes_data = json.loads(nodes_response.read().decode("utf-8"))
                available_nodes = list(nodes_data.keys()) if isinstance(nodes_data, dict) else []
                required_nodes = ["ClownsharKSampler_Beta", "Sigmas Rescale", "BetaSamplingScheduler"]
                missing_nodes = [n for n in required_nodes if n not in available_nodes]
            except:
                available_nodes = []
                missing_nodes = []
            
            return {
                "status": "error",
                "error": f"HTTP Error {e.code}: {error_body}",
                "missing_nodes": missing_nodes,
                "available_nodes_sample": available_nodes[:10] if available_nodes else [],
            }
        except Exception as e:
            server_process.terminate()
            import traceback
            return {
                "status": "error",
                "error": f"Failed to queue workflow: {str(e)}",
                "traceback": traceback.format_exc(),
            }
        
        # Poll for completion
        max_poll_time = 300
        poll_interval = 2
        polled = 0
        
        try:
            while polled < max_poll_time:
                history_request = urllib.request.Request(f"{COMFYUI_URL}/history/{prompt_id}")
                history_response = urllib.request.urlopen(history_request, timeout=10)
                history_data = json.loads(history_response.read().decode("utf-8"))
                
                if prompt_id in history_data:
                    output_data = history_data[prompt_id]
                    
                    if "outputs" in output_data:
                        images = []
                        for node_id, node_output in output_data["outputs"].items():
                            if "images" in node_output:
                                for image_info in node_output["images"]:
                                    subfolder = image_info.get('subfolder', '')
                                    image_type = image_info.get('type', 'output')
                                    image_url = f"{COMFYUI_URL}/view?filename={image_info['filename']}&subfolder={subfolder}&type={image_type}"
                                    image_response = urllib.request.urlopen(image_url, timeout=30)
                                    image_data = image_response.read()
                                    image_base64 = base64.b64encode(image_data).decode("utf-8")
                                    images.append({
                                        "filename": image_info["filename"],
                                        "data": image_base64,
                                        "format": "base64",
                                    })
                        
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
                                "error": "Workflow completed but no images found",
                                "prompt_id": prompt_id,
                            }
                
                # Check queue
                queue_request = urllib.request.Request(f"{COMFYUI_URL}/queue")
                queue_response = urllib.request.urlopen(queue_request, timeout=10)
                queue_data = json.loads(queue_response.read().decode("utf-8"))
                
                still_queued = False
                for queue_item in queue_data.get("queue_running", []) + queue_data.get("queue_pending", []):
                    if isinstance(queue_item, list) and len(queue_item) > 1:
                        if queue_item[1] == prompt_id:
                            still_queued = True
                            break
                
                if not still_queued and prompt_id not in history_data:
                    server_process.terminate()
                    return {
                        "status": "error",
                        "error": "Workflow not found in queue or history",
                        "prompt_id": prompt_id,
                    }
                
                time.sleep(poll_interval)
                polled += poll_interval
            
            server_process.terminate()
            return {
                "status": "error",
                "error": f"Workflow execution timed out after {max_poll_time}s",
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

# Keep existing functions
@app.function(volumes={"/root/models": volume})
def list_models() -> Dict[str, Any]:
    """List all models in the volume."""
    from pathlib import Path
    
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
    
    print("\n📦 Models in Modal Volume:")
    print("=" * 50)
    for model_type, model_list in models.items():
        print(f"\n{model_type.upper()}:")
        for model in model_list:
            print(f"  ✅ {model['name']} ({model['size_gb']} GB)")
    
    print(f"\n📊 Total: {result['model_count']} models, {result['total_size_gb']} GB")
    print("=" * 50)
    
    return result

@app.function(
    volumes={"/root/models": volume},
    timeout=3600,
)
def upload_model(
    model_url: str,
    model_path: str,
    model_type: str = "checkpoints",
) -> Dict[str, Any]:
    """Upload/download model to Modal volume."""
    from pathlib import Path
    import urllib.request
    
    full_path = Path("/root/models") / model_path
    full_path.parent.mkdir(parents=True, exist_ok=True)
    
    try:
        print(f"Downloading {model_url} to {full_path}...")
        
        def show_progress(block_num, block_size, total_size):
            if total_size > 0:
                percent = min(100, (block_num * block_size * 100) // total_size)
                if block_num % 100 == 0:
                    print(f"  Progress: {percent}% ({block_num * block_size // 1024 // 1024} MB)")
        
        urllib.request.urlretrieve(model_url, str(full_path), show_progress)
        
        if not full_path.exists():
            return {
                "status": "error",
                "error": f"File not found after download: {full_path}",
            }
        
        file_size = full_path.stat().st_size
        print(f"Downloaded {file_size / 1024 / 1024 / 1024:.2f} GB")
        
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

@app.local_entrypoint()
def test_workflow():
    """Test the Denrisi workflow."""
    test_workflow = {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "z_image_turbo_bf16.safetensors",
                "weight_dtype": "default",
            },
        },
        "2": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "qwen_3_4b.safetensors",
                "type": "lumina2",
                "device": "default",
            },
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "z-image-turbo-vae.safetensors",
            },
        },
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "A beautiful landscape with mountains and a lake, high quality, detailed",
                "clip": ["2", 0],
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "deformed, blurry, bad anatomy, ugly, low quality",
                "clip": ["2", 0],
            },
        },
        "6": {
            "class_type": "ConditioningZeroOut",
            "inputs": {
                "conditioning": ["5", 0],
            },
        },
        "7": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 1,
            },
        },
        "8": {
            "class_type": "BetaSamplingScheduler",
            "inputs": {
                "model": ["1", 0],
                "steps": 20,
                "alpha": 0.4,
                "beta": 0.4,
            },
        },
        "9": {
            "class_type": "Sigmas Rescale",
            "inputs": {
                "sigmas": ["8", 0],
                "start": 0.996,
                "end": 0,
            },
        },
        "10": {
            "class_type": "ClownsharKSampler_Beta",
            "inputs": {
                "eta": 0.5,
                "sampler_name": "linear/ralston_2s",
                "scheduler": "beta",
                "steps": 20,
                "steps_to_run": -1,
                "denoise": 1.0,
                "cfg": 1.0,
                "seed": 42,
                "sampler_mode": "standard",
                "bongmath": True,
                "model": ["1", 0],
                "positive": ["4", 0],
                "negative": ["6", 0],
                "latent_image": ["7", 0],
                "sigmas": ["9", 0],
            },
        },
        "11": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["10", 0],
                "vae": ["3", 0],
            },
        },
        "12": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": "ryla_test",
                "images": ["11", 0],
            },
        },
    }
    
    print("🧪 Testing Denrisi Workflow on Modal")
    print("=" * 50)
    print("Prompt: A beautiful landscape with mountains and a lake")
    print("Size: 1024x1024")
    print("Steps: 20")
    print("CFG: 1.0")
    print("=" * 50)
    print("\n⏳ Generating image (this may take 1-2 minutes)...\n")
    
    result = generate_image.remote(
        workflow_json=test_workflow,
        prompt="A beautiful landscape with mountains and a lake, high quality, detailed",
        width=1024,
        height=1024,
        steps=20,
        cfg=1.0,
        seed=42,
    )
    
    print("\n📊 Result:")
    print(json.dumps(result, indent=2))
    
    if result.get("status") == "success":
        print("\n✅ Workflow test successful!")
        if "images" in result:
            print(f"📸 Generated {len(result['images'])} image(s)")
            for i, img in enumerate(result["images"]):
                print(f"   Image {i+1}: {img.get('filename', 'unknown')}")
    else:
        print("\n❌ Workflow test failed!")
        if "error" in result:
            print(f"   Error: {result['error']}")
        if "missing_nodes" in result:
            print(f"   Missing nodes: {result['missing_nodes']}")
