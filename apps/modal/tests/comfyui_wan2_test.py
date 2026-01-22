"""
Simple Wan2.1 Video Test - Following Modal.com Documentation Pattern

This is a minimal test implementation for Wan2.1 text-to-video generation.

Quickstart:
1. Deploy: modal deploy apps/modal/comfyui_wan2_test.py
2. Test: python apps/modal/comfyclient_wan2.py --prompt "A beautiful landscape"
"""

import json
import subprocess
import uuid
from pathlib import Path
from typing import Dict

import modal
import modal.experimental

# Build Modal Image with ComfyUI
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git")
    .uv_pip_install("fastapi[standard]==0.115.4")
    .uv_pip_install("comfy-cli==1.5.3")
    .run_commands(
        "comfy --skip-prompt install --fast-deps --nvidia --version 0.3.71"
    )
)

# Download Wan2.1 models using HuggingFace Hub
def hf_download():
    from huggingface_hub import hf_hub_download

    # Download Wan2.1 T2V model (1.3B - smaller, faster for testing)
    wan_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        cache_dir="/cache",
    )

    # Download CLIP model (text encoder)
    clip_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        cache_dir="/cache",
    )

    # Download VAE model
    vae_model = hf_hub_download(
        repo_id="Comfy-Org/Wan_2.1_ComfyUI_repackaged",
        filename="split_files/vae/wan_2.1_vae.safetensors",
        cache_dir="/cache",
    )

    # Symlink models to the right ComfyUI directories
    comfy_dir = Path("/root/comfy/ComfyUI")
    
    # Diffusion model
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/diffusion_models && ln -s {wan_model} {comfy_dir}/models/diffusion_models/wan2.1_t2v_1.3B_fp16.safetensors",
        shell=True,
        check=True,
    )
    
    # CLIP model (text encoder - goes in text_encoders directory for Wan)
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/text_encoders && ln -s {clip_model} {comfy_dir}/models/text_encoders/umt5_xxl_fp8_e4m3fn_scaled.safetensors",
        shell=True,
        check=True,
    )
    
    # VAE model
    subprocess.run(
        f"mkdir -p {comfy_dir}/models/vae && ln -s {vae_model} {comfy_dir}/models/vae/wan_2.1_vae.safetensors",
        shell=True,
        check=True,
    )


vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

image = (
    image.uv_pip_install("huggingface-hub==0.36.0")
    .env({"HF_XET_HIGH_PERFORMANCE": "1"})
    .run_function(
        hf_download,
        volumes={"/cache": vol},
    )
)

# Add workflow JSON file
workflow_path = Path(__file__).parent / "workflow_wan2_api.json"
if workflow_path.exists():
    image = image.add_local_file(workflow_path, "/root/workflow_api.json")
else:
    # Create a simple Wan2.1 workflow if file doesn't exist
    simple_workflow = {
        "37": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "wan2.1_t2v_1.3B_fp16.safetensors",
                "weight_dtype": "default",
            },
        },
        "38": {
            "class_type": "CLIPLoader",
            "inputs": {
                "clip_name": "umt5_xxl_fp8_e4m3fn_scaled.safetensors",
                "type": "wan",
                "device": "default",
            },
        },
        "39": {
            "class_type": "VAELoader",
            "inputs": {
                "vae_name": "wan_2.1_vae.safetensors",
            },
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "A beautiful landscape",
                "clip": ["38", 0],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "",
                "clip": ["38", 0],
            },
        },
        "40": {
            "class_type": "EmptyHunyuanLatentVideo",
            "inputs": {
                "width": 832,
                "height": 480,
                "length": 33,  # 33 frames at 16fps = ~2 seconds
                "batch_size": 1,
            },
        },
        "48": {
            "class_type": "ModelSamplingSD3",
            "inputs": {
                "shift": 8,
                "model": ["37", 0],
            },
        },
        "3": {
            "class_type": "KSampler",
            "inputs": {
                "seed": 42,
                "steps": 30,
                "cfg": 6,
                "sampler_name": "uni_pc",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["48", 0],
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["40", 0],
            },
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["3", 0],
                "vae": ["39", 0],
            },
        },
        "28": {
            "class_type": "SaveAnimatedWEBP",
            "inputs": {
                "filename_prefix": "wan2_test",
                "fps": 16,
                "lossless": False,
                "quality": 90,
                "method": "default",
                "images": ["8", 0],
            },
        },
    }
    
    # Save workflow to temp location for image build
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(simple_workflow, f)
        temp_workflow = f.name
    
    image = image.add_local_file(temp_workflow, "/root/workflow_api.json")

app = modal.App(name="ryla-comfyui-wan2-test", image=image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu="L40S",
    volumes={"/cache": vol},
)
@modal.concurrent(max_inputs=5)  # run 5 inputs per container
class ComfyUI:
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        cmd = f"comfy launch --background -- --port {self.port}"
        subprocess.run(cmd, shell=True, check=True)
        print(f"✅ ComfyUI server launched on port {self.port}")

    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        # Check server health
        self.poll_server_health()

        # Run the workflow
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout 1200 --verbose"
        subprocess.run(cmd, shell=True, check=True)

        # Get output video
        output_dir = "/root/comfy/ComfyUI/output"

        # Find the output video based on workflow
        workflow = json.loads(Path(workflow_path).read_text())
        file_prefix = [
            node.get("inputs")
            for node in workflow.values()
            if node.get("class_type") == "SaveAnimatedWEBP"
        ][0]["filename_prefix"]

        # Return the video as bytes
        for f in Path(output_dir).iterdir():
            if f.name.startswith(file_prefix) and f.suffix in [".webp", ".WEBP"]:
                return f.read_bytes()

    @modal.fastapi_endpoint(method="POST")
    def api(self, item: Dict):
        """API endpoint for text-to-video generation."""
        from fastapi import Response

        workflow_data = json.loads(
            Path("/root/workflow_api.json").read_text()
        )

        # Insert the prompt
        workflow_data["6"]["inputs"]["text"] = item["prompt"]

        # Give the output video a unique id per client request
        client_id = uuid.uuid4().hex
        workflow_data["28"]["inputs"]["filename_prefix"] = client_id

        # Save this updated workflow to a new file
        new_workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(new_workflow_file).open("w"))

        # Run inference on the currently running container
        video_bytes = self.infer.local(new_workflow_file)

        return Response(video_bytes, media_type="image/webp")  # Animated WEBP

    def poll_server_health(self) -> Dict:
        """Check if ComfyUI server is healthy."""
        import socket
        import urllib.request

        try:
            # Check if the server is up (response should be immediate)
            req = urllib.request.Request(f"http://127.0.0.1:{self.port}/system_stats")
            urllib.request.urlopen(req, timeout=5)
            print("✅ ComfyUI server is healthy")
        except (socket.timeout, urllib.error.URLError) as e:
            # If no response in 5 seconds, stop the container
            print(f"❌ Server health check failed: {str(e)}")
            modal.experimental.stop_fetching_inputs()
            raise Exception("ComfyUI server is not healthy, stopping container")


# Interactive UI (optional - for development)
@app.function(
    max_containers=1,  # limit interactive session to 1 container
    gpu="L40S",
    volumes={"/cache": vol},
)
@modal.concurrent(max_inputs=10)
@modal.web_server(8000, startup_timeout=60)
def ui():
    """Launch ComfyUI UI for interactive use."""
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)
    print("✅ ComfyUI UI available at http://localhost:8000")
