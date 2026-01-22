"""
Simple Flux Schnell Test - Following Modal.com Documentation

This is a minimal test implementation following the Modal.com guide:
https://modal.com/docs/examples/comfyui

Quickstart:
1. Deploy: modal deploy apps/modal/comfyui_flux_test.py
2. Test: python apps/modal/comfyclient_flux.py --prompt "A beautiful landscape"
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

# Download Flux Schnell model using HuggingFace Hub
def hf_download():
    from huggingface_hub import hf_hub_download

    flux_model = hf_hub_download(
        repo_id="Comfy-Org/flux1-schnell",
        filename="flux1-schnell-fp8.safetensors",
        cache_dir="/cache",
    )

    # Symlink the model to the right ComfyUI directory
    subprocess.run(
        f"ln -s {flux_model} /root/comfy/ComfyUI/models/checkpoints/flux1-schnell-fp8.safetensors",
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
workflow_path = Path(__file__).parent / "workflow_flux_api.json"
if workflow_path.exists():
    image = image.add_local_file(workflow_path, "/root/workflow_api.json")
else:
    # Create a simple Flux workflow if file doesn't exist
    # This matches the workflow_flux_api.json structure
    simple_workflow = {
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "A beautiful landscape",
                "clip": ["4", 1],  # CheckpointLoaderSimple output 1 = clip
            },
        },
        "4": {
            "class_type": "CheckpointLoaderSimple",
            "inputs": {
                "ckpt_name": "flux1-schnell-fp8.safetensors",
            },
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {
                "filename_prefix": "flux_test",
                "images": ["10", 0],
            },
        },
        "10": {
            "class_type": "VAEDecode",
            "inputs": {
                "samples": ["5", 0],
                "vae": ["4", 2],  # CheckpointLoaderSimple output 2 = vae
            },
        },
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "seed": 42,
                "steps": 4,
                "cfg": 1.0,
                "sampler_name": "euler",
                "scheduler": "simple",  # Use "simple" for Flux
                "denoise": 1.0,
                "model": ["4", 0],  # CheckpointLoaderSimple output 0 = model
                "positive": ["6", 0],
                "negative": ["7", 0],
                "latent_image": ["3", 0],
            },
        },
        "7": {
            "class_type": "CLIPTextEncode",
            "inputs": {
                "text": "",
                "clip": ["4", 1],  # CheckpointLoaderSimple output 1 = clip
            },
        },
        "3": {
            "class_type": "EmptySD3LatentImage",  # Use EmptySD3LatentImage for Flux
            "inputs": {
                "width": 1024,
                "height": 1024,
                "batch_size": 1,
            },
        },
    }
    
    # Save workflow to temp location for image build
    import tempfile
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        json.dump(simple_workflow, f)
        temp_workflow = f.name
    
    image = image.add_local_file(temp_workflow, "/root/workflow_api.json")

app = modal.App(name="ryla-comfyui-flux-test", image=image)


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

        # Get output image
        output_dir = "/root/comfy/ComfyUI/output"

        # Find the output image based on workflow
        workflow = json.loads(Path(workflow_path).read_text())
        file_prefix = [
            node.get("inputs")
            for node in workflow.values()
            if node.get("class_type") == "SaveImage"
        ][0]["filename_prefix"]

        # Return the image as bytes
        for f in Path(output_dir).iterdir():
            if f.name.startswith(file_prefix):
                return f.read_bytes()

    @modal.fastapi_endpoint(method="POST")
    def api(self, item: Dict):
        """API endpoint for text-to-image generation."""
        from fastapi import Response

        workflow_data = json.loads(
            Path("/root/workflow_api.json").read_text()
        )

        # Insert the prompt
        workflow_data["6"]["inputs"]["text"] = item["prompt"]

        # Give the output image a unique id per client request
        client_id = uuid.uuid4().hex
        workflow_data["9"]["inputs"]["filename_prefix"] = client_id

        # Save this updated workflow to a new file
        new_workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(new_workflow_file).open("w"))

        # Run inference on the currently running container
        img_bytes = self.infer.local(new_workflow_file)

        return Response(img_bytes, media_type="image/jpeg")

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
