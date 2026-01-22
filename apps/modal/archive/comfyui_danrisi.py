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
    .apt_install([
        "git", 
        "wget", 
        "curl",
        # OpenGL libraries required by RES4LYF nodes
        "libgl1",  # OpenGL library (libGL.so.1)
        "libglib2.0-0",  # GLib library
    ])
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
        "typer",  # Required for ComfyUI Manager CLI
        "GitPython",  # Required for ComfyUI Manager CLI (import git)
        "pyyaml",  # Required for extra_model_paths.yaml
    ])
    .run_commands([
        # Clone ComfyUI
        "git clone https://github.com/comfyanonymous/ComfyUI.git /root/ComfyUI",
        "cd /root/ComfyUI && pip install -r requirements.txt",
        
        # Install ComfyUI Manager (for easier node management)
        "cd /root/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager",
        # Install Manager's dependencies (required for CLI)
        "cd /root/ComfyUI/custom_nodes/ComfyUI-Manager && (pip install -r requirements.txt || true) || echo 'Manager requirements: skipped'",
        # Install custom nodes during image build (so they're available at ComfyUI startup)
        # Use Manager CLI to install nodes (same as RunPod's comfy-node-install)
        "cd /root/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install https://github.com/ClownsharkBatwing/RES4LYF || echo 'RES4LYF: will install at runtime'",
        "cd /root/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install controlaltai-nodes || echo 'controlaltai-nodes: will install at runtime'",
        
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
        # Create symlinks: ComfyUI expects models at /root/ComfyUI/models/{type}/
        # Models are in /root/models/{type}/ (Modal volume mount)
        comfyui_models_base = comfyui_dir / "models"
        volume_models_base = Path("/root/models")
        
        # Skip extra_model_paths.yaml for now - use symlinks only
        # ComfyUI should find models via symlinks in the standard models/ directory
        
        # Create symlinks using absolute paths
        # UNETLoader scans 'diffusion_models/' or 'checkpoints/', CLIPLoader scans 'clip/' or 'text_encoders/'
        print("Creating model symlinks with absolute paths...")
        
        # Map model types to their ComfyUI directory names
        # UNETLoader can use both 'checkpoints' and 'diffusion_models'
        model_type_mapping = {
            "checkpoints": ["checkpoints", "diffusion_models"],  # UNETLoader scans both
            "vae": ["vae"],
            "clip": ["clip", "text_encoders"],  # CLIPLoader scans both
            "loras": ["loras"],
        }
        
        for volume_type, comfyui_types in model_type_mapping.items():
            volume_type_dir = volume_models_base / volume_type
            
            if volume_type_dir.exists():
                model_files = list(volume_type_dir.glob("*.safetensors"))
                
                for comfyui_type in comfyui_types:
                    comfyui_type_dir = comfyui_models_base / comfyui_type
                    comfyui_type_dir.mkdir(parents=True, exist_ok=True)
                    
                    for model_file in model_files:
                        symlink_path = comfyui_type_dir / model_file.name
                        
                        # Remove existing symlink if broken
                        if symlink_path.exists() or symlink_path.is_symlink():
                            try:
                                if symlink_path.is_symlink() and not symlink_path.exists():
                                    symlink_path.unlink()
                                elif symlink_path.exists() and not symlink_path.is_symlink():
                                    continue  # File exists, skip
                            except:
                                pass
                        
                        if not symlink_path.exists():
                            try:
                                source_abs = str(model_file.resolve())
                                symlink_path.symlink_to(source_abs)
                                
                                # Verify symlink works
                                if symlink_path.exists() and symlink_path.is_file():
                                    size_gb = symlink_path.stat().st_size / 1024 / 1024 / 1024
                                    print(f"✅ Linked {comfyui_type}/{model_file.name} ({size_gb:.2f} GB)")
                                else:
                                    print(f"⚠️ Symlink created but not accessible: {comfyui_type}/{model_file.name}")
                            except Exception as e:
                                print(f"⚠️ Could not link {model_file.name} to {comfyui_type}: {e}")
        
        # Give ComfyUI a moment to see the symlinks
        import time
        print("Waiting 2 seconds for file system to sync...")
        time.sleep(2)
        
        # Verify models are accessible
        checkpoints_dir = volume_models_base / "checkpoints"
        available_models = list(checkpoints_dir.glob("*.safetensors"))
        if not available_models:
            return {
                "status": "error",
                "error": f"No models found in {checkpoints_dir}. Please upload models to volume first.",
                "details": f"Checked: {checkpoints_dir}, Volume: {volume_models_base}",
            }
        
        print(f"✅ Found {len(available_models)} checkpoint model(s) in volume")
        
        # Install custom nodes using ComfyUI Manager CLI BEFORE starting server
        # ComfyUI needs nodes installed before it scans for them at startup
        # This handles subdirectory structures and dependency resolution correctly
        custom_nodes_dir = comfyui_dir / "custom_nodes"
        manager_dir = custom_nodes_dir / "ComfyUI-Manager"
        
        # Check for install.py or cm-cli.py (Manager has both)
        manager_install = manager_dir / "install.py"
        if not manager_install.exists():
            manager_install = manager_dir / "cm-cli.py"
        
        if manager_install.exists():
            print(f"Installing custom nodes via ComfyUI Manager CLI: {manager_install}")
            print("(Same method as RunPod's comfy-node-install)")
            
            # Install RES4LYF using Manager's CLI with direct URL
            # "res4lyf" is not in Manager's registry, so use direct GitHub URL
            # This is the same method RunPod uses internally
            try:
                print("Installing RES4LYF via direct URL (Manager handles subdirectories)...")
                result = subprocess.run(
                    ["python", str(manager_install), "install", "https://github.com/ClownsharkBatwing/RES4LYF"],
                    cwd=str(comfyui_dir),
                    check=False,
                    capture_output=True,
                    timeout=180,
                )
                stdout = result.stdout.decode("utf-8") if result.stdout else ""
                stderr = result.stderr.decode("utf-8") if result.stderr else ""
                
                if result.returncode == 0:
                    print("✅ RES4LYF installed via ComfyUI Manager")
                else:
                    print(f"⚠️ ComfyUI Manager install returned code {result.returncode}")
                    if stdout:
                        print(f"   Output: {stdout[:500]}")
                    if stderr:
                        print(f"   Errors: {stderr[:500]}")
            except Exception as e:
                print(f"⚠️ Error installing via ComfyUI Manager: {e}")
            
            # Install controlaltai-nodes
            try:
                result = subprocess.run(
                    ["python", str(manager_install), "install", "controlaltai-nodes"],
                    cwd=str(comfyui_dir),
                    check=False,
                    capture_output=True,
                    timeout=120,
                )
                if result.returncode == 0:
                    print("✅ controlaltai-nodes installed via ComfyUI Manager")
            except Exception as e:
                print(f"⚠️ Error installing controlaltai-nodes: {e}")
            
            # Verify nodes are installed and inspect node files to find class names
            res4lyf_dir = custom_nodes_dir / "RES4LYF"
            if res4lyf_dir.exists():
                print(f"✅ RES4LYF directory found at {res4lyf_dir}")
                # Check for beta subdirectory (where nodes are)
                beta_dir = res4lyf_dir / "beta"
                if beta_dir.exists():
                    print(f"✅ RES4LYF/beta directory found")
                    beta_files = list(beta_dir.glob("*.py"))
                    if beta_files:
                        print(f"   Found {len(beta_files)} Python files in beta/")
                        
                        # Inspect node files to find actual class names
                        print("   Inspecting node files for class names...")
                        node_classes = {}
                        for py_file in beta_files:
                            if py_file.stem == "__init__":
                                continue
                            try:
                                content = py_file.read_text(encoding="utf-8", errors="ignore")
                                # Look for class definitions
                                import re
                                class_matches = re.findall(r'class\s+(\w+).*?:', content)
                                if class_matches:
                                    node_classes[py_file.name] = class_matches
                                    # Check if this might be "Sigmas Rescale"
                                    if "rescale" in content.lower() or "sigma" in content.lower():
                                        print(f"   📄 {py_file.name}: {class_matches}")
                            except Exception as e:
                                print(f"   ⚠️ Could not read {py_file.name}: {e}")
                        
                        if node_classes:
                            print(f"   Found classes in {len(node_classes)} files")
                            # Look for "Sigmas Rescale" or similar
                            for filename, classes in node_classes.items():
                                for cls in classes:
                                    if "rescale" in cls.lower() or ("sigma" in cls.lower() and "rescale" in filename.lower()):
                                        print(f"   🎯 Potential match: {filename} -> {cls}")
                        
                        # Also check if there's an __init__.py that registers nodes
                        init_file = beta_dir / "__init__.py"
                        if init_file.exists():
                            try:
                                init_content = init_file.read_text(encoding="utf-8", errors="ignore")
                                if "NODE_CLASS_MAPPINGS" in init_content or "NODE_DISPLAY_NAME_MAPPINGS" in init_content:
                                    print(f"   ✅ Found node registration in {init_file.name}")
                                    # Extract node mappings
                                    import re
                                    mappings = re.findall(r'["\']([^"\']+)["\']', init_content)
                                    if mappings:
                                        print(f"   Node names found: {mappings[:10]}")
                            except Exception as e:
                                print(f"   ⚠️ Could not read __init__.py: {e}")
                else:
                    print(f"⚠️ RES4LYF/beta directory not found - checking structure...")
                    print(f"   Contents: {list(res4lyf_dir.iterdir())[:5]}")
        else:
            print(f"⚠️ ComfyUI Manager CLI not found at {manager_install}")
        
        # Start ComfyUI server in background process
        # Server will scan custom_nodes at startup, so nodes must be installed first
        # ComfyUI runs on port 8188 by default
        COMFYUI_PORT = 8188
        COMFYUI_URL = f"http://127.0.0.1:{COMFYUI_PORT}"
        
        import urllib.request
        
        # Verify symlinks are accessible before starting server
        print("Verifying model symlinks are accessible...")
        for model_type in ["checkpoints", "vae", "clip"]:
            type_dir = comfyui_models_base / model_type
            model_files = list(type_dir.glob("*.safetensors"))
            for model_file in model_files:
                if model_file.is_symlink():
                    try:
                        target = model_file.readlink()
                        if target.exists():
                            print(f"   ✅ {model_type}/{model_file.name} -> {target} (accessible)")
                        else:
                            print(f"   ⚠️ {model_type}/{model_file.name} -> {target} (broken symlink)")
                    except Exception as e:
                        print(f"   ⚠️ {model_type}/{model_file.name} - error checking: {e}")
                elif model_file.exists():
                    print(f"   ✅ {model_type}/{model_file.name} (file exists)")
        
        # Start ComfyUI server in background
        # Capture both stdout and stderr to check for node loading errors
        server_process = subprocess.Popen(
            ["python", "main.py", "--port", str(COMFYUI_PORT), "--listen", "127.0.0.1"],
            cwd=comfyui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Combine stderr into stdout for easier reading
            text=True,
            bufsize=1,  # Line buffered
        )
        
        # Read initial server output to check for errors
        import threading
        import queue
        
        server_logs = queue.Queue()
        def capture_logs():
            try:
                for line in iter(server_process.stdout.readline, ''):
                    if not line:
                        break
                    line = line.strip()
                    server_logs.put(("output", line))
                    # Print important messages
                    if any(keyword in line.lower() for keyword in ["error", "traceback", "exception", "failed", "cannot"]):
                        print(f"⚠️ Server: {line[:300]}")
                    elif "importing" in line.lower() or "loaded" in line.lower() or "ready" in line.lower():
                        print(f"ℹ️  Server: {line[:200]}")
            except Exception as e:
                server_logs.put(("error", f"Log capture error: {e}"))
        
        log_thread = threading.Thread(target=capture_logs, daemon=True)
        log_thread.start()
        
        # Wait for server to be ready (max 120 seconds - longer for first startup)
        max_wait = 120
        wait_interval = 2
        waited = 0
        server_ready = False
        last_error = None
        
        while waited < max_wait:
            try:
                response = urllib.request.urlopen(f"{COMFYUI_URL}/system_stats", timeout=5)
                if response.status == 200:
                    server_ready = True
                    break
            except Exception as e:
                last_error = str(e)
                # Check if server process is still running
                if server_process.poll() is not None:
                    # Server crashed, collect error output from logs
                    error_msg = f"Server process exited with code {server_process.returncode}"
                    # Get recent error logs
                    recent_errors = [log for log_type, log in server_logs[-50:] if "error" in log.lower() or "traceback" in log.lower() or log_type == "stderr"]
                    if recent_errors:
                        error_msg += f"\n\nRecent errors:\n" + "\n".join(recent_errors[-20:])
                    # Also try to read remaining stderr
                    try:
                        remaining_stderr = server_process.stderr.read(5000).decode('utf-8', errors='ignore') if server_process.stderr else ""
                        if remaining_stderr:
                            error_msg += f"\n\nRemaining stderr:\n{remaining_stderr}"
                    except:
                        pass
                    return {
                        "status": "error",
                        "error": f"ComfyUI server crashed: {error_msg}",
                    }
            time.sleep(wait_interval)
            waited += wait_interval
        
        if not server_ready:
            server_process.terminate()
            stdout, stderr = server_process.communicate()
            error_details = ""
            if stderr:
                error_details = f"\nStderr: {stderr.decode('utf-8', errors='ignore')[-1000:]}"
            if stdout:
                error_details += f"\nStdout: {stdout.decode('utf-8', errors='ignore')[-1000:]}"
            return {
                "status": "error",
                "error": f"ComfyUI server failed to start within {max_wait}s. Last error: {last_error}{error_details}",
            }
        
        # Check what nodes are loaded and what models ComfyUI can see
        try:
            object_info_request = urllib.request.Request(f"{COMFYUI_URL}/object_info")
            object_info_response = urllib.request.urlopen(object_info_request, timeout=10)
            object_info = json.loads(object_info_response.read().decode("utf-8"))
            
            # Check if Sigmas Rescale is in the loaded nodes
            all_node_types = list(object_info.keys())
            sigmas_nodes = [n for n in all_node_types if "sigma" in n.lower() or "rescale" in n.lower()]
            print(f"📊 ComfyUI loaded {len(all_node_types)} node types")
            if sigmas_nodes:
                print(f"   Found sigma/rescale related nodes: {sigmas_nodes[:5]}")
            
            # Check UNETLoader node to see what models it can see
            if "UNETLoader" in object_info:
                unet_info = object_info["UNETLoader"]
                if "input" in unet_info and "required" in unet_info["input"]:
                    unet_inputs = unet_info["input"]["required"]
                    if "unet_name" in unet_inputs:
                        unet_name_config = unet_inputs["unet_name"]
                        if isinstance(unet_name_config, list) and len(unet_name_config) > 0:
                            available_models = unet_name_config[0]  # First element is the list of models
                            print(f"📦 UNETLoader sees {len(available_models)} model(s): {available_models[:3] if available_models else 'none'}")
                            if not available_models:
                                print(f"   ⚠️ Model list is empty - ComfyUI didn't find any models")
                                print(f"   Checking if models directory exists and has files...")
                                checkpoints_dir = comfyui_models_base / "checkpoints"
                                if checkpoints_dir.exists():
                                    files = list(checkpoints_dir.iterdir())
                                    print(f"   Files in checkpoints dir: {[f.name for f in files[:5]]}")
                        else:
                            print(f"   ⚠️ UNETLoader unet_name config format unexpected: {unet_name_config}")
            
            # Check CLIPLoader
            if "CLIPLoader" in object_info:
                clip_info = object_info["CLIPLoader"]
                if "input" in clip_info and "required" in clip_info["input"]:
                    clip_inputs = clip_info["input"]["required"]
                    if "clip_name" in clip_inputs:
                        clip_name_config = clip_inputs["clip_name"]
                        if isinstance(clip_name_config, list) and len(clip_name_config) > 0:
                            available_clips = clip_name_config[0]
                            print(f"📦 CLIPLoader sees {len(available_clips)} model(s): {available_clips[:3] if available_clips else 'none'}")
            
            # Check VAELoader
            if "VAELoader" in object_info:
                vae_info = object_info["VAELoader"]
                if "input" in vae_info and "required" in vae_info["input"]:
                    vae_inputs = vae_info["input"]["required"]
                    if "vae_name" in vae_inputs:
                        vae_name_config = vae_inputs["vae_name"]
                        if isinstance(vae_name_config, list) and len(vae_name_config) > 0:
                            available_vaes = vae_name_config[0]
                            print(f"📦 VAELoader sees {len(available_vaes)} model(s): {available_vaes[:3] if available_vaes else 'none'}")
        except Exception as e:
            print(f"⚠️ Could not check object_info: {e}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()[:500]}")
        
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
                    "error": f"ComfyUI node errors: {json.dumps(response_data['node_errors'], indent=2)}",
                    "details": response_data,
                }
            
            prompt_id = response_data.get("prompt_id")
            if not prompt_id:
                server_process.terminate()
                return {
                    "status": "error",
                    "error": f"ComfyUI did not return prompt_id. Response: {json.dumps(response_data, indent=2)}",
                }
        except urllib.error.HTTPError as e:
            server_process.terminate()
            error_body = e.read().decode("utf-8") if hasattr(e, 'read') else str(e)
            try:
                error_json = json.loads(error_body)
                return {
                    "status": "error",
                    "error": f"ComfyUI HTTP {e.code}: {error_json.get('error', {}).get('message', error_body)}",
                    "details": error_json,
                }
            except:
                return {
                    "status": "error",
                    "error": f"Failed to queue workflow: HTTP {e.code} - {error_body[:500]}",
                }
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
def build_danrisi_workflow(
    prompt: str = "A beautiful landscape with mountains and a lake, high quality, detailed",
    negative_prompt: str = "",
    width: int = 1536,
    height: int = 1536,
    steps: int = 35,
    cfg: float = 1.5,
    seed: int = None,
):
    """Build the Denrisi workflow JSON.
    
    Based on libs/business/src/workflows/z-image-danrisi.ts
    """
    # Build the actual Denrisi workflow JSON
    workflow = {
        # Model Loaders
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
        # Prompt Encoding
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": prompt,
                "clip": ["2", 0],
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt if negative_prompt else "deformed, blurry, bad anatomy, ugly, low quality",
                "clip": ["2", 0],
            },
        },
        "6": {
            "class_type": "ConditioningZeroOut",
            "inputs": {
                "conditioning": ["5", 0],
            },
        },
        # Latent Image
        "7": {
            "class_type": "EmptySD3LatentImage",
            "inputs": {
                "width": width,
                "height": height,
                "batch_size": 1,
            },
        },
        # Sampling (Danrisi optimized)
        "8": {
            "class_type": "BetaSamplingScheduler",
            "inputs": {
                "model": ["1", 0],
                "steps": steps,
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
                "steps": steps,
                "steps_to_run": -1,
                "denoise": 1.0,
                "cfg": cfg,
                "seed": seed if seed is not None else 42,
                "sampler_mode": "standard",
                "bongmath": True,
                "model": ["1", 0],
                "positive": ["4", 0],
                "negative": ["6", 0],
                "latent_image": ["7", 0],
                "sigmas": ["9", 0],
            },
        },
        # Decode and Save
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
    
    return workflow


@app.local_entrypoint()
def test_workflow(
    prompt: str = "A beautiful landscape with mountains and a lake, high quality, detailed",
    negative_prompt: str = "",
    width: int = 1536,  # Increased for better quality
    height: int = 1536,  # Increased for better quality
    steps: int = 35,  # Increased from 20 to 35 for better refinement
    cfg: float = 1.5,  # Increased from 1.0 to 1.5 for better prompt adherence
    seed: int = None,
    high_quality: bool = True,  # Enable high quality mode
):
    """Test the Denrisi workflow with a custom prompt.
    
    Quality improvements:
    - Higher resolution (1536x1536 default, up to 2048x2048)
    - More steps (35 default for better refinement)
    - Higher CFG (1.5 default for better prompt adherence)
    - Enhanced prompts with quality keywords
    """
    # Enhance prompt with quality keywords if high_quality mode is enabled
    enhanced_prompt = prompt
    if high_quality:
        quality_keywords = "masterpiece, best quality, ultra detailed, 8k, professional photography, sharp focus, perfect composition"
        if quality_keywords.lower() not in prompt.lower():
            enhanced_prompt = f"{prompt}, {quality_keywords}"
    
    enhanced_negative = negative_prompt
    if high_quality and not negative_prompt:
        enhanced_negative = "blurry, low quality, distorted, ugly, deformed, bad anatomy, bad proportions, watermark, text, jpeg artifacts, compression artifacts"
    elif high_quality:
        # Add more quality-related negatives if not already present
        quality_negatives = "jpeg artifacts, compression artifacts, lowres, worst quality, normal quality"
        if quality_negatives.lower() not in negative_prompt.lower():
            enhanced_negative = f"{negative_prompt}, {quality_negatives}"
    
    print("🧪 Testing Denrisi Workflow on Modal")
    print("=" * 50)
    print(f"Prompt: {enhanced_prompt[:100]}...")
    if enhanced_negative:
        print(f"Negative: {enhanced_negative[:100]}...")
    print(f"Size: {width}x{height}")
    print(f"Steps: {steps} {'(High Quality)' if high_quality else ''}")
    print(f"CFG: {cfg} {'(High Quality)' if high_quality else ''}")
    if seed is not None:
        print(f"Seed: {seed}")
    print("=" * 50)
    print("\n⏳ Generating image (this may take 2-3 minutes for high quality)...\n")
    
    # Build workflow with parameters
    workflow_json = build_danrisi_workflow(
        prompt=enhanced_prompt,
        negative_prompt=enhanced_negative if enhanced_negative else "",
        width=width,
        height=height,
        steps=steps,
        cfg=cfg,
        seed=seed,
    )
    
    result = generate_image.remote(
        workflow_json=workflow_json,
        prompt=enhanced_prompt,
        negative_prompt=enhanced_negative if enhanced_negative else None,
        width=width,
        height=height,
        steps=steps,
        cfg=cfg,
        seed=seed,
    )
    
    print("\n📊 Result:")
    print(json.dumps(result, indent=2))
    
    if result.get("status") == "success":
        print("\n✅ Workflow test successful!")
        if "images" in result:
            print(f"📸 Generated {len(result['images'])} image(s)")
            for i, img in enumerate(result["images"]):
                print(f"   Image {i+1}: {img.get('filename', 'unknown')}")
            
            # Save the first image to a file
            try:
                import base64
                from pathlib import Path
                # The image data structure: {"data": "base64...", "format": "base64", "filename": "..."}
                img_obj = result["images"][0]
                if isinstance(img_obj, dict):
                    # Try "data" first (our format), then "image" (alternative format)
                    if "data" in img_obj:
                        image_data = base64.b64decode(img_obj["data"])
                    elif "image" in img_obj:
                        image_data = base64.b64decode(img_obj["image"])
                    else:
                        raise ValueError(f"Image dict missing 'data' or 'image' key. Keys: {list(img_obj.keys())}")
                elif isinstance(img_obj, str):
                    # If it's just a base64 string
                    image_data = base64.b64decode(img_obj)
                else:
                    raise ValueError(f"Unexpected image format: {type(img_obj)}")
                
                # Save to current working directory (project root)
                output_filename = f"ai_influencer_ultra.png" if high_quality else f"ai_influencer.png"
                output_path = Path(output_filename).resolve()
                with open(output_path, "wb") as f:
                    f.write(image_data)
                print(f"💾 Image saved to: {output_path}")
                print(f"📁 File size: {len(image_data) / (1024*1024):.2f} MB")
            except Exception as e:
                print(f"⚠️ Could not save image: {e}")
                import traceback
                print(f"   Traceback: {traceback.format_exc()[:300]}")
    else:
        print("\n❌ Workflow test failed!")
        if "error" in result:
            print(f"   Error: {result['error']}")


@app.local_entrypoint()
def generate_profile_set(
    base_prompt: str = "A stunning AI influencer, photorealistic, professional portrait, modern fashion, high quality, beautiful face, perfect lighting, studio quality, elegant pose",
    negative_prompt: str = "deformed, blurry, bad anatomy, ugly, low quality, distorted, bad proportions, watermark, text",
    width: int = 1536,
    height: int = 1536,
    steps: int = 35,
    cfg: float = 1.5,
    num_variations: int = 5,
):
    """Generate multiple variations of an AI influencer for a profile set.
    
    Creates num_variations different images with varied seeds and prompts to create
    a diverse set of profile images.
    """
    import random
    import time
    from pathlib import Path
    
    # Variation prompts to create diversity
    variation_styles = [
        "elegant and sophisticated",
        "confident and charismatic", 
        "warm and approachable",
        "mysterious and intriguing",
        "vibrant and energetic",
    ]
    
    variation_settings = [
        {"pose": "professional headshot", "lighting": "studio lighting"},
        {"pose": "casual portrait", "lighting": "natural lighting"},
        {"pose": "fashion forward", "lighting": "dramatic lighting"},
        {"pose": "editorial style", "lighting": "soft lighting"},
        {"pose": "lifestyle portrait", "lighting": "golden hour lighting"},
    ]
    
    print("🎨 Generating AI Influencer Profile Set")
    print("=" * 60)
    print(f"Base Prompt: {base_prompt[:80]}...")
    print(f"Variations: {num_variations}")
    print(f"Size: {width}x{height}")
    print(f"Steps: {steps}, CFG: {cfg}")
    print("=" * 60)
    print()
    
    generated_images = []
    
    for i in range(num_variations):
        print(f"\n🔄 Generating Variation {i+1}/{num_variations}...")
        print("-" * 60)
        
        # Create variation-specific prompt
        style = variation_styles[i % len(variation_styles)]
        settings = variation_settings[i % len(variation_settings)]
        
        variation_prompt = f"{base_prompt}, {style}, {settings['pose']}, {settings['lighting']}, unique appearance, distinct features"
        
        # Use different seed for each variation to ensure diversity
        variation_seed = random.randint(1, 2**32 - 1)
        
        print(f"   Style: {style}")
        print(f"   Pose: {settings['pose']}")
        print(f"   Lighting: {settings['lighting']}")
        
        # Build workflow for this variation
        workflow_json = build_danrisi_workflow(
            prompt=variation_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
            cfg=cfg,
            seed=variation_seed,
        )
        
        # Generate the image
        result = generate_image.remote(
            workflow_json=workflow_json,
            prompt=variation_prompt,
            negative_prompt=negative_prompt,
            width=width,
            height=height,
            steps=steps,
            cfg=cfg,
            seed=variation_seed,
        )
        
        if result.get("status") == "success" and "images" in result and result["images"]:
            try:
                import base64
                img_obj = result["images"][0]
                
                if isinstance(img_obj, dict) and "data" in img_obj:
                    image_data = base64.b64decode(img_obj["data"])
                    
                    # Save with variation number
                    output_filename = f"ai_influencer_profile_{i+1:02d}.png"
                    output_path = Path(output_filename).resolve()
                    
                    with open(output_path, "wb") as f:
                        f.write(image_data)
                    
                    file_size_mb = len(image_data) / (1024*1024)
                    print(f"   ✅ Variation {i+1} saved: {output_filename} ({file_size_mb:.2f} MB)")
                    
                    generated_images.append({
                        "number": i+1,
                        "filename": output_filename,
                        "path": str(output_path),
                        "size_mb": file_size_mb,
                        "style": style,
                    })
                else:
                    print(f"   ⚠️ Variation {i+1}: Could not extract image data")
            except Exception as e:
                print(f"   ❌ Variation {i+1} failed: {e}")
        else:
            error_msg = result.get("error", "Unknown error")
            print(f"   ❌ Variation {i+1} generation failed: {error_msg}")
        
        # Small delay between generations to avoid rate limiting
        if i < num_variations - 1:
            time.sleep(2)
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Profile Set Generation Summary")
    print("=" * 60)
    print(f"✅ Successfully generated: {len(generated_images)}/{num_variations} variations")
    print()
    
    if generated_images:
        print("Generated Images:")
        for img in generated_images:
            print(f"  {img['number']:2d}. {img['filename']:35s} ({img['size_mb']:.2f} MB) - {img['style']}")
        print()
        print(f"💾 All images saved to: {Path.cwd()}")
    else:
        print("⚠️ No images were successfully generated.")
    
    return generated_images