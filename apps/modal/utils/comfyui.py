"""
ComfyUI server management utilities.

Handles ComfyUI server launch, health checks, and workflow execution.
"""

import subprocess
import time
import json
import requests
import urllib.request
import urllib.error
import socket
from pathlib import Path
from typing import Optional, Dict


def launch_comfy_server(port: int = 8000, timeout: int = 60) -> None:
    """
    Launch ComfyUI server in background.
    
    Args:
        port: Port number for ComfyUI server (default: 8000)
        timeout: Timeout in seconds for server startup (default: 60)
    """
    cmd = f"comfy launch --background -- --port {port}"
    result = subprocess.run(cmd, shell=True, check=False, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️  ComfyUI launch command returned {result.returncode}")
        print(f"   stdout: {result.stdout}")
        print(f"   stderr: {result.stderr}")
        # Don't raise - let health check handle it
    else:
        print(f"✅ ComfyUI server launch command executed")
    
    # Wait for server to be ready
    if not check_comfy_health(port, timeout):
        print(f"⚠️  ComfyUI server health check failed, but continuing...")
        # Don't raise exception - server might start later


def check_comfy_health(port: int = 8000, timeout: int = 60) -> bool:
    """
    Check if ComfyUI server is healthy.
    
    Args:
        port: Port number for ComfyUI server (default: 8000)
        timeout: Timeout in seconds (default: 60)
    
    Returns:
        True if server is healthy, False otherwise
    """
    url = f"http://localhost:{port}/system_stats"
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print("✅ ComfyUI server is healthy")
                return True
        except requests.exceptions.RequestException:
            pass
        
        time.sleep(1)
    
    print("⚠️  ComfyUI server health check timeout")
    return False


def poll_server_health(port: int = 8000) -> dict:
    """
    Poll ComfyUI server health (raises exception if unhealthy).
    
    Args:
        port: Port number for ComfyUI server (default: 8000)
    
    Returns:
        Health status dictionary
    
    Raises:
        Exception: If server is not healthy
    """
    import socket
    import urllib.error
    
    try:
        req = urllib.request.Request(f"http://127.0.0.1:{port}/system_stats")
        urllib.request.urlopen(req, timeout=5)
        print("✅ ComfyUI server is healthy")
        return {"status": "healthy"}
    except (socket.timeout, urllib.error.URLError) as e:
        print(f"❌ Server health check failed: {str(e)}")
        import modal
        modal.experimental.stop_fetching_inputs()
        raise Exception("ComfyUI server is not healthy, stopping container")


def execute_workflow(workflow_path: str, timeout: int = 1200) -> bytes:
    """
    Execute a ComfyUI workflow and return output file bytes.
    
    Args:
        workflow_path: Path to workflow JSON file
        timeout: Timeout in seconds for workflow execution (default: 1200)
    
    Returns:
        Bytes of the output file (image or video)
    
    Raises:
        Exception: If workflow execution fails or no output found
    """
    
    # Run the workflow
    cmd = f"comfy run --workflow {workflow_path} --wait --timeout {timeout} --verbose"
    subprocess.run(cmd, shell=True, check=True)
    
    # Get output directory
    output_dir = Path("/root/comfy/ComfyUI/output")
    
    # Find the output file based on workflow
    workflow = json.loads(Path(workflow_path).read_text())
    
    # Check for SaveImage (images) or SaveAnimatedWEBP (videos)
    save_node = None
    for node in workflow.values():
        if node.get("class_type") in ["SaveImage", "SaveAnimatedWEBP"]:
            save_node = node
            break
    
    if not save_node:
        raise Exception("No SaveImage or SaveAnimatedWEBP node found in workflow")
    
    file_prefix = save_node.get("inputs", {}).get("filename_prefix", "output")
    
    # Return the file as bytes
    for f in output_dir.iterdir():
        if f.name.startswith(file_prefix):
            return f.read_bytes()
    
    raise Exception(f"No output file found with prefix '{file_prefix}' in {output_dir}")
