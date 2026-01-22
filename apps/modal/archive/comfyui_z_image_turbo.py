"""
RYLA ComfyUI Z-Image-Turbo - Modal Serverless Implementation

Danrisi optimized workflow for Z-Image-Turbo on Modal.com.
Uses optimized sampling: BetaSamplingScheduler + Sigmas Rescale + ClownsharKSampler_Beta.

This implementation uses the Danrisi workflow which provides better quality
than standard KSampler by using optimized beta sampling and sigma rescaling.

Deploy: modal deploy apps/modal/comfyui_z_image_turbo.py
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

# Define persistent volume for models (shared with other workflows)
volume = modal.Volume.from_name("ryla-models", create_if_missing=True)

# Define image with ComfyUI (no custom nodes needed for simple workflow)
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
        
        # Install ComfyUI Manager (required for custom nodes and model loading)
        "cd /root/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager",
        "cd /root/ComfyUI/custom_nodes/ComfyUI-Manager && (pip install -r requirements.txt || true) || echo 'Manager requirements: skipped'",
        
        # Install RES4LYF custom nodes during image build (so they're available at ComfyUI startup)
        "cd /root/ComfyUI/custom_nodes && git clone https://github.com/ClownsharkBatwing/RES4LYF.git RES4LYF || echo 'RES4LYF already exists or clone failed'",
        # Copy beta nodes to root so ComfyUI can find them
        "cd /root/ComfyUI/custom_nodes && if [ -d RES4LYF/beta ]; then cp RES4LYF/beta/*.py . 2>/dev/null || true; fi",
    ])
)

app = modal.App("ryla-comfyui-z-image-turbo")


@app.function(
    image=image,
    volumes={"/root/models": volume},  # Mount volume at /root/models
    gpu="A100",  # Can also use "A10", "H100", etc.
    timeout=600,  # 10 minutes max
)
def generate_image(
    prompt: str,
    negative_prompt: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    steps: int = 20,  # Danrisi workflow uses 20 steps
    cfg: float = 0.5,  # Danrisi workflow uses 0.5 CFG (from original workflow)
    seed: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Generate image using Z-Image-Turbo with Danrisi optimized workflow.
    
    This uses the Danrisi workflow with optimized sampling:
    - UNETLoader (z_image_turbo_bf16.safetensors)
    - CLIPLoader (qwen_3_4b.safetensors) with lumina2 type
    - VAELoader (z-image-turbo-vae.safetensors)
    - BetaSamplingScheduler + Sigmas Rescale + ClownsharKSampler_Beta (from RES4LYF)
    
    Args:
        prompt: Text prompt for image generation
        negative_prompt: Optional negative prompt (default: standard negative)
        width: Image width (default: 1024)
        height: Image height (default: 1024)
        steps: Number of inference steps (default: 20 for Danrisi workflow)
        cfg: CFG scale (default: 0.5 for Danrisi workflow)
        seed: Random seed (optional, uses random if not provided)
    
    Returns:
        Dict with 'status', 'images' (base64), and optional 'error'
    """
    import random
    
    # Default negative prompt if not provided
    if negative_prompt is None:
        negative_prompt = "deformed, blurry, bad anatomy, ugly, low quality"
    
    # Generate seed if not provided
    if seed is None:
        seed = random.randint(0, 2**31 - 1)
    
    # Build simple workflow JSON (standard ComfyUI nodes)
    workflow = {
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
                "text": prompt,
                "clip": ["2", 0],
            },
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": negative_prompt,
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
                "width": width,
                "height": height,
                "batch_size": 1,
            },
        },
        # Danrisi optimized sampling (BetaSamplingScheduler + Sigmas Rescale + ClownsharKSampler_Beta)
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
                "sampler_name": "linear/ralston_2s",  # From original Danrisi workflow
                "scheduler": "beta",
                "steps": steps,
                "steps_to_run": -1,
                "denoise": 1.0,
                "cfg": cfg,
                "seed": seed,
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
                "filename_prefix": "z_image_turbo",
                "images": ["11", 0],
            },
        },
    }
    
    comfyui_dir = Path("/root/ComfyUI")
    COMFYUI_PORT = 8188
    COMFYUI_URL = f"http://127.0.0.1:{COMFYUI_PORT}"
    
    try:
        # Check if models exist in volume
        volume_models_dir = Path("/root/models")
        comfyui_models_dir = comfyui_dir / "models"
        
        if not volume_models_dir.exists():
            return {
                "status": "error",
                "error": f"Volume models directory not found at {volume_models_dir}. Please upload models to volume first.",
            }
        
        # Create ComfyUI models directory structure if it doesn't exist
        comfyui_models_dir.mkdir(parents=True, exist_ok=True)
        
        # Symlink models from volume to ComfyUI's expected location
        # Support both standard structure (checkpoints/clip/vae) and Z-Image structure (diffusion_models/text_encoders/vae)
        model_mappings = {
            "checkpoints": ["checkpoints", "diffusion_models", "unet"],  # Try multiple locations
            "clip": ["clip", "text_encoders"],  # Try multiple locations
            "vae": ["vae"],  # VAE location is consistent
        }
        
        for volume_type, comfyui_types in model_mappings.items():
            volume_type_dir = volume_models_dir / volume_type
            
            if volume_type_dir.exists():
                # Create symlinks in all expected ComfyUI locations
                for comfyui_type in comfyui_types:
                    comfyui_type_dir = comfyui_models_dir / comfyui_type
                    comfyui_type_dir.mkdir(parents=True, exist_ok=True)
                    
                    # Create symlinks for each model file (use absolute paths)
                    # For CLIP models, we might need to copy instead of symlink due to safetensors issues
                    import shutil
                    for model_file in volume_type_dir.glob("*.safetensors"):
                        comfyui_file_path = comfyui_type_dir / model_file.name
                        if comfyui_file_path.exists():
                            # Remove existing symlink/file if it exists
                            if comfyui_file_path.is_symlink() or comfyui_file_path.is_file():
                                comfyui_file_path.unlink()
                        
                        # For CLIP/text_encoders, copy the file instead of symlinking
                        # This avoids safetensors "incomplete metadata" errors with symlinks
                        if comfyui_type in ["clip", "text_encoders"]:
                            print(f"📋 Copying {model_file.name} (CLIP models need to be copied, not symlinked)...")
                            shutil.copy2(model_file, comfyui_file_path)
                            print(f"✅ Copied: {comfyui_type}/{comfyui_file_path.name}")
                        else:
                            # For other models, use symlinks (faster, saves space)
                            comfyui_file_path.symlink_to(model_file.resolve())
                            # Verify symlink works
                            if not comfyui_file_path.exists() or not comfyui_file_path.resolve().exists():
                                print(f"⚠️ Warning: Symlink may not be accessible: {comfyui_file_path}")
                            else:
                                print(f"✅ Created symlink: {comfyui_type}/{comfyui_file_path.name}")
        
        # Verify models are accessible and check file integrity
        checkpoints_dir = comfyui_models_dir / "checkpoints"
        vae_dir = comfyui_models_dir / "vae"
        clip_dir = comfyui_models_dir / "clip"
        
        checkpoints = list(checkpoints_dir.glob("*.safetensors")) if checkpoints_dir.exists() else []
        vaes = list(vae_dir.glob("*.safetensors")) if vae_dir.exists() else []
        clips = list(clip_dir.glob("*.safetensors")) if clip_dir.exists() else []
        
        # Verify file integrity (check if files are readable and have reasonable size)
        def check_file_integrity(file_path):
            try:
                stat = file_path.stat()
                size_gb = stat.st_size / (1024**3)
                # Check if file is readable
                with open(file_path, "rb") as f:
                    header = f.read(100)  # Read first 100 bytes
                return True, size_gb, len(header)
            except Exception as e:
                return False, 0, str(e)
        
        print("🔍 Checking model file integrity...")
        for model_file in checkpoints + vaes + clips:
            is_ok, size_gb, info = check_file_integrity(model_file)
            if is_ok:
                print(f"   ✅ {model_file.name}: {size_gb:.2f} GB, readable")
            else:
                print(f"   ❌ {model_file.name}: ERROR - {info}")
        
        if not checkpoints:
            return {
                "status": "error",
                "error": f"No checkpoint models found in {checkpoints_dir}. Please upload models to volume first.",
            }
        if not vaes:
            return {
                "status": "error",
                "error": f"No VAE models found in {vae_dir}. Please upload models to volume first.",
            }
        if not clips:
            return {
                "status": "error",
                "error": f"No CLIP models found in {clip_dir}. Please upload models to volume first.",
            }
        
        print(f"✅ Models found: {len(checkpoints)} checkpoints, {len(vaes)} VAEs, {len(clips)} CLIPs")
        print(f"   Checkpoints: {[f.name for f in checkpoints]}")
        print(f"   VAEs: {[f.name for f in vaes]}")
        print(f"   CLIPs: {[f.name for f in clips]}")
        
        # Install custom nodes using ComfyUI Manager (like Danrisi workflow)
        # This is needed for Z-Image-Turbo model loading support
        custom_nodes_dir = comfyui_dir / "custom_nodes"
        manager_dir = custom_nodes_dir / "ComfyUI-Manager"
        
        # Check for install.py or cm-cli.py (Manager has both)
        manager_install = manager_dir / "install.py"
        if not manager_install.exists():
            manager_install = manager_dir / "cm-cli.py"
        
        # RES4LYF should already be installed during image build, but verify and fix structure
        res4lyf_dir = custom_nodes_dir / "RES4LYF"
        if res4lyf_dir.exists():
            print(f"✅ RES4LYF directory found (installed during image build)")
        else:
            # Fallback: install at runtime if not in image
            if manager_install.exists():
                print(f"Installing RES4LYF via ComfyUI Manager CLI (runtime fallback)...")
                try:
                    result = subprocess.run(
                        ["python", str(manager_install), "install", "https://github.com/ClownsharkBatwing/RES4LYF"],
                        cwd=str(comfyui_dir),
                        check=False,
                        capture_output=True,
                        timeout=180,
                    )
                    if result.returncode == 0:
                        print("✅ RES4LYF installed via ComfyUI Manager")
                except Exception as e:
                    print(f"⚠️ Error installing RES4LYF: {e}")
        
        # Verify and fix RES4LYF node structure
        if res4lyf_dir.exists():
            print(f"✅ RES4LYF directory found at {res4lyf_dir}")
            beta_dir = res4lyf_dir / "beta"
            if beta_dir.exists():
                print(f"✅ RES4LYF/beta directory found")
                beta_files = list(beta_dir.glob("*.py"))
                if beta_files:
                    print(f"   Found {len(beta_files)} Python files in beta/")
                    
                    # Clean up any previously copied files from custom_nodes/ root
                    # These cause import failures because they depend on beta/ structure
                    import shutil
                    copied_files_to_remove = [
                        "noise_classes.py", "rk_noise_sampler_beta.py", "rk_method_beta.py",
                        "rk_guide_func_beta.py", "deis_coefficients.py", "samplers.py",
                        "rk_sampler_beta.py", "constants.py", "phi_functions.py",
                        "rk_coefficients_beta.py", "samplers_extensions.py"
                    ]
                    removed_count = 0
                    for filename in copied_files_to_remove:
                        copied_file = custom_nodes_dir / filename
                        if copied_file.exists():
                            try:
                                copied_file.unlink()
                                removed_count += 1
                            except Exception as e:
                                print(f"   ⚠️ Could not remove {filename}: {e}")
                    if removed_count > 0:
                        print(f"   ✅ Removed {removed_count} previously copied files from custom_nodes/ root")
                    
                    # DON'T copy files - ComfyUI scans subdirectories automatically
                    # Copying breaks imports because files depend on beta/ directory structure
                    # Just ensure __init__.py exists for proper registration
                    
                    # Check if there's an __init__.py that registers nodes (like Danrisi workflow does)
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
                    
                    # Don't create custom __init__.py - let ComfyUI use the original structure
                    # ComfyUI automatically scans subdirectories, and the beta/__init__.py handles registration
                    # Creating a custom __init__.py in RES4LYF root can break imports
                    res4lyf_init = res4lyf_dir / "__init__.py"
                    if res4lyf_init.exists():
                        # Check if it's our custom one (has our comment) and remove it
                        try:
                            content = res4lyf_init.read_text(encoding="utf-8", errors="ignore")
                            if "RES4LYF nodes - import from beta subdirectory" in content:
                                res4lyf_init.unlink()
                                print(f"   ✅ Removed custom __init__.py from RES4LYF root (using original structure)")
                        except Exception as e:
                            print(f"   ⚠️ Could not check/remove __init__.py: {e}")
        else:
            print(f"⚠️ ComfyUI Manager CLI not found at {manager_install}")
        
        # Start ComfyUI server in background
        # Capture both stdout and stderr to check for node loading errors (same as Danrisi)
        server_process = subprocess.Popen(
            ["python", "main.py", "--port", str(COMFYUI_PORT), "--listen", "127.0.0.1"],
            cwd=comfyui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,  # Combine stderr into stdout for easier reading
            text=True,
            bufsize=1,  # Line buffered
        )
        
        # Read initial server output to check for errors (same as Danrisi)
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
        
        # Wait for server to be ready (max 120 seconds - longer for first startup, same as Danrisi)
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
                    recent_errors = [log for log_type, log in list(server_logs.queue)[-50:] if "error" in log.lower() or "traceback" in log.lower() or log_type == "stderr"]
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
                error_details = f"\nStderr: {stderr.decode('utf-8', errors='ignore')[-1000:] if isinstance(stderr, bytes) else str(stderr)[-1000:]}"
            if stdout:
                error_details += f"\nStdout: {stdout.decode('utf-8', errors='ignore')[-1000:] if isinstance(stdout, bytes) else str(stdout)[-1000:]}"
            return {
                "status": "error",
                "error": f"ComfyUI server failed to start within {max_wait}s. Last error: {last_error}{error_details}",
            }
        
        # Check what nodes are loaded and what models ComfyUI can see (same as Danrisi)
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
                                checkpoints_dir = comfyui_models_dir / "checkpoints"
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
        
        # Queue workflow via ComfyUI HTTP API
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
                    
                    # Debug: print output structure
                    print(f"📊 Output data keys: {list(output_data.keys())}")
                    if "status" in output_data:
                        print(f"📊 Status: {output_data['status']}")
                    if "outputs" in output_data:
                        print(f"📊 Output nodes: {list(output_data['outputs'].keys())}")
                    else:
                        print(f"⚠️ No 'outputs' key in response")
                    
                    # Check for errors in status
                    if output_data.get("status", {}).get("status_str") == "error":
                        server_process.terminate()
                        return {
                            "status": "error",
                            "error": f"Workflow execution error: {output_data.get('status', {})}",
                            "prompt_id": prompt_id,
                        }
                    
                    # Get output images
                    if "outputs" in output_data:
                        images = []
                        for node_id, node_output in output_data["outputs"].items():
                            print(f"📊 Checking node {node_id}: keys = {list(node_output.keys())}")
                            if "images" in node_output:
                                print(f"📸 Found images in node {node_id}: {len(node_output['images'])} images")
                                for image_info in node_output["images"]:
                                    print(f"   Image info: {image_info}")
                                    # Download image
                                    subfolder = image_info.get('subfolder', '')
                                    image_type = image_info.get('type', 'output')
                                    image_url = f"{COMFYUI_URL}/view?filename={image_info['filename']}&subfolder={subfolder}&type={image_type}"
                                    print(f"   Downloading from: {image_url}")
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
                                "seed": seed,
                            }
                        else:
                            # Try alternative: check ComfyUI output directory directly
                            output_dir = comfyui_dir / "output"
                            if output_dir.exists():
                                output_files = list(output_dir.glob("*.png")) + list(output_dir.glob("*.jpg"))
                                if output_files:
                                    print(f"📸 Found {len(output_files)} files in output directory")
                                    # Use the most recent file
                                    latest_file = max(output_files, key=lambda p: p.stat().st_mtime)
                                    with open(latest_file, "rb") as f:
                                        image_data = f.read()
                                    image_base64 = base64.b64encode(image_data).decode("utf-8")
                                    return {
                                        "status": "success",
                                        "images": [{
                                            "filename": latest_file.name,
                                            "data": image_base64,
                                            "format": "base64",
                                        }],
                                        "prompt_id": prompt_id,
                                        "seed": seed,
                                    }
                            
                            # Last resort: check output directory
                            output_dir = comfyui_dir / "output"
                            if output_dir.exists():
                                output_files = sorted(
                                    list(output_dir.glob("*.png")) + list(output_dir.glob("*.jpg")),
                                    key=lambda p: p.stat().st_mtime,
                                    reverse=True
                                )
                                if output_files:
                                    print(f"📸 Found {len(output_files)} files in output directory, using most recent")
                                    latest_file = output_files[0]
                                    with open(latest_file, "rb") as f:
                                        image_data = f.read()
                                    image_base64 = base64.b64encode(image_data).decode("utf-8")
                                    return {
                                        "status": "success",
                                        "images": [{
                                            "filename": latest_file.name,
                                            "data": image_base64,
                                            "format": "base64",
                                        }],
                                        "prompt_id": prompt_id,
                                        "seed": seed,
                                        "note": "Retrieved from output directory (API output was empty)",
                                    }
                            
                            return {
                                "status": "error",
                                "error": "Workflow completed but no images found in output or output directory",
                                "prompt_id": prompt_id,
                                "output_structure": str(output_data.get("outputs", {})),
                                "status_info": output_data.get("status", {}),
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
) -> Dict[str, Any]:
    """
    Upload/download model to Modal volume.
    
    Args:
        model_url: URL to download model from (HuggingFace, etc.)
        model_path: Path within volume (e.g., "clip/qwen_3_4b.safetensors")
    
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
        
        # Verify file integrity by trying to open with safetensors
        try:
            import safetensors
            with safetensors.safe_open(str(full_path), framework="pt") as f:
                keys = f.keys()
                print(f"✅ File verified: {len(list(keys))} tensors found")
        except Exception as e:
            print(f"⚠️ Warning: Could not verify with safetensors: {e}")
        
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
    """Test the Z-Image-Turbo workflow with a simple prompt."""
    print("🧪 Testing Z-Image-Turbo Workflow on Modal")
    print("=" * 50)
    print("Prompt: A beautiful landscape with mountains and a lake")
    print("Size: 1024x1024")
    print("Steps: 20 (Danrisi optimized)")
    print("CFG: 0.5 (Danrisi workflow)")
    print("=" * 50)
    print("\n⏳ Generating image (this may take 30-60 seconds)...\n")
    
    result = generate_image.remote(
        prompt="A beautiful landscape with mountains and a lake, high quality, detailed",
        negative_prompt="deformed, blurry, bad anatomy, ugly, low quality",
        width=1024,
        height=1024,
        steps=20,
        cfg=0.5,
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
                
                # Save image to file if base64 data is present
                if "data" in img:
                    try:
                        import base64
                        image_data = base64.b64decode(img["data"])
                        output_path = Path(f"z_image_turbo_test_{i+1}.png")
                        with open(output_path, "wb") as f:
                            f.write(image_data)
                        print(f"   💾 Saved to: {output_path.absolute()}")
                    except Exception as e:
                        print(f"   ⚠️ Could not save image: {e}")
    else:
        print("\n❌ Workflow test failed!")
        if "error" in result:
            print(f"   Error: {result['error']}")
