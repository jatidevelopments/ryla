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


def verify_nodes_available(required_nodes: list[str], port: int = 8000) -> dict[str, bool]:
    """
    Verify that required ComfyUI nodes are available.
    
    Args:
        required_nodes: List of node class_type names to check
        port: ComfyUI server port (default: 8000)
    
    Returns:
        Dictionary mapping node names to availability (True/False)
    """
    try:
        response = requests.get(f"http://127.0.0.1:{port}/object_info", timeout=10)
        if response.status_code == 200:
            object_info = response.json()
            available_nodes = set(object_info.keys())
            result = {node: node in available_nodes for node in required_nodes}
            
            # Log results
            available_count = sum(1 for v in result.values() if v)
            print(f"📊 Node verification: {available_count}/{len(required_nodes)} nodes available")
            for node, available in result.items():
                status = "✅" if available else "❌"
                print(f"   {status} {node}")
            
            return result
        else:
            print(f"⚠️  Failed to get object_info: HTTP {response.status_code}")
            return {node: False for node in required_nodes}
    except Exception as e:
        print(f"⚠️  Failed to check node availability: {e}")
        return {node: False for node in required_nodes}


def execute_workflow_via_api(workflow: dict, port: int = 8000, timeout: int = 1200) -> bytes:
    """
    Execute a ComfyUI workflow via API endpoint (more reliable than comfy run).
    
    Args:
        workflow: ComfyUI workflow dictionary (API format)
        port: ComfyUI server port (default: 8000)
        timeout: Timeout in seconds (default: 1200)
    
    Returns:
        Bytes of the output file (image or video)
    
    Raises:
        Exception: If workflow execution fails or no output found
    """
    import time
    
    # Queue the workflow
    url = f"http://127.0.0.1:{port}/prompt"
    response = requests.post(url, json={"prompt": workflow}, timeout=30)
    
    if response.status_code != 200:
        error_text = response.text[:500]
        raise Exception(f"Failed to queue workflow: HTTP {response.status_code} - {error_text}")
    
    result = response.json()
    
    # Check for node errors
    if result.get("node_errors"):
        raise Exception(f"ComfyUI node errors: {json.dumps(result['node_errors'], indent=2)}")
    
    prompt_id = result.get("prompt_id")
    if not prompt_id:
        raise Exception(f"No prompt_id returned: {result}")
    
    # Wait for completion
    start_time = time.time()
    history_url = f"http://127.0.0.1:{port}/history/{prompt_id}"
    
    while time.time() - start_time < timeout:
        try:
            history_response = requests.get(history_url, timeout=10)
            if history_response.status_code == 200:
                history_data = history_response.json()
                if prompt_id in history_data:
                    # Workflow completed
                    output_data = history_data[prompt_id]
                    outputs = output_data.get("outputs", {})
                    
                    # Find SaveImage or SaveAnimatedWEBP node
                    for node_id, node_output in outputs.items():
                        images = node_output.get("images", [])
                        if images:
                            # Get the image
                            image_info = images[0]
                            filename = image_info["filename"]
                            subfolder = image_info.get("subfolder", "")
                            image_type = image_info.get("type", "output")
                            
                            # Download the image
                            image_url = f"http://127.0.0.1:{port}/view"
                            params = {
                                "filename": filename,
                                "subfolder": subfolder,
                                "type": image_type
                            }
                            img_response = requests.get(image_url, params=params, timeout=30)
                            if img_response.status_code == 200:
                                return img_response.content
                    
                    raise Exception("No output images found in workflow result")
        except requests.exceptions.RequestException:
            pass
        
        time.sleep(1)
    
    raise Exception(f"Workflow execution timeout after {timeout} seconds")


def execute_workflow(workflow_path: str, timeout: int = 1200) -> bytes:
    """
    Execute a ComfyUI workflow and return output file bytes.
    
    Uses API endpoint first (more reliable), falls back to comfy run.
    
    Args:
        workflow_path: Path to workflow JSON file (API format)
        timeout: Timeout in seconds for workflow execution (default: 1200)
    
    Returns:
        Bytes of the output file (image or video)
    
    Raises:
        Exception: If workflow execution fails or no output found
    """
    # Load workflow
    workflow = json.loads(Path(workflow_path).read_text())
    
    # Check if it's API format (dict with numeric string keys)
    is_api_format = isinstance(workflow, dict) and all(
        isinstance(k, str) and k.isdigit() for k in workflow.keys()
    )
    
    if not is_api_format:
        # Try comfy run (supports both formats but less reliable)
        cmd = f"comfy run --workflow {workflow_path} --wait --timeout {timeout} --verbose"
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=False)
        if result.returncode != 0:
            error_msg = f"Workflow execution failed (exit code {result.returncode})"
            if result.stderr:
                error_msg += f"\nStderr: {result.stderr[:500]}"
            if result.stdout:
                error_msg += f"\nStdout: {result.stdout[:500]}"
            raise Exception(error_msg)
        
        # Get output directory
        output_dir = Path("/root/comfy/ComfyUI/output")
        
        # Find the output file based on workflow
        # Check for SaveImage (images) or SaveAnimatedWEBP (videos)
        save_node = None
        if isinstance(workflow, dict):
            for node in workflow.values():
                if isinstance(node, dict) and node.get("class_type") in ["SaveImage", "SaveAnimatedWEBP"]:
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
    else:
        # Use API endpoint (more reliable for API format)
        try:
            return execute_workflow_via_api(workflow, port=8000, timeout=timeout)
        except Exception as e:
            # Fallback to comfy run if API fails
            print(f"⚠️  API execution failed: {e}. Falling back to comfy run...")
            cmd = f"comfy run --workflow {workflow_path} --wait --timeout {timeout} --verbose"
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=False)
            if result.returncode != 0:
                error_msg = f"Workflow execution failed (exit code {result.returncode})"
                if result.stderr:
                    error_msg += f"\nStderr: {result.stderr[:500]}"
                if result.stdout:
                    error_msg += f"\nStdout: {result.stdout[:500]}"
                raise Exception(error_msg)
            
            # Get output directory
            output_dir = Path("/root/comfy/ComfyUI/output")
            
            # Find the output file
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
