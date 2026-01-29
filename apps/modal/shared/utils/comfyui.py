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
    import os
    from pathlib import Path
    
    # Check custom nodes directory
    comfy_dir = Path("/root/comfy/ComfyUI")
    custom_nodes_dir = comfy_dir / "custom_nodes"
    
    print(f"📦 Checking custom nodes directory: {custom_nodes_dir}")
    if custom_nodes_dir.exists():
        node_dirs = [d for d in custom_nodes_dir.iterdir() if d.is_dir()]
        print(f"   Found {len(node_dirs)} custom node directories:")
        for node_dir in node_dirs[:10]:  # Show first 10
            print(f"     - {node_dir.name}")
        
        # Check InstantID specifically
        instantid_dir = custom_nodes_dir / "ComfyUI_InstantID"
        if instantid_dir.exists():
            print(f"   ✅ InstantID directory exists: {instantid_dir}")
            node_files = list(instantid_dir.glob("*.py"))
            print(f"      Found {len(node_files)} Python files")
            if (instantid_dir / "nodes.py").exists() or (instantid_dir / "__init__.py").exists():
                print(f"      ✅ Has nodes.py or __init__.py")
        else:
            print(f"   ❌ InstantID directory not found: {instantid_dir}")
        
        # Check SeedVR2
        seedvr2_dir = custom_nodes_dir / "ComfyUI-SeedVR2_VideoUpscaler"
        if seedvr2_dir.exists():
            print(f"   ✅ SeedVR2 directory exists: {seedvr2_dir}")
        else:
            print(f"   ❌ SeedVR2 directory not found: {seedvr2_dir}")
    
    # Launch ComfyUI with output capture
    print(f"🚀 Launching ComfyUI server on port {port}...")
    cmd = f"cd {comfy_dir} && comfy launch --background -- --port {port} 2>&1 | tee /tmp/comfyui_startup.log"
    result = subprocess.run(cmd, shell=True, check=False, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"⚠️  ComfyUI launch command returned {result.returncode}")
        print(f"   stdout: {result.stdout[:500]}")
        print(f"   stderr: {result.stderr[:500]}")
    else:
        print(f"✅ ComfyUI server launch command executed")
    
    # Wait for server to be ready
    if not check_comfy_health(port, timeout):
        print(f"⚠️  ComfyUI server health check failed, but continuing...")
        # Try to read startup log if available
        startup_log = Path("/tmp/comfyui_startup.log")
        if startup_log.exists():
            log_content = startup_log.read_text()
            if "error" in log_content.lower() or "exception" in log_content.lower():
                print(f"   ⚠️  Found errors in startup log:")
                for line in log_content.split('\n')[-20:]:
                    if "error" in line.lower() or "exception" in line.lower() or "traceback" in line.lower():
                        print(f"      {line[:200]}")
    else:
        # Server is healthy, check loaded nodes
        print(f"✅ ComfyUI server is healthy")
        try:
            import requests
            response = requests.get(f"http://127.0.0.1:{port}/object_info", timeout=5)
            if response.status_code == 200:
                object_info = response.json()
                node_count = len(object_info)
                print(f"   📊 ComfyUI loaded {node_count} node types")
                
                # Check for InstantID nodes
                instantid_nodes = ["InsightFaceLoader", "InstantIDModelLoader", "InstantIDControlNetLoader", "ApplyInstantID"]
                found_nodes = [node for node in instantid_nodes if node in object_info]
                if found_nodes:
                    print(f"   ✅ Found InstantID nodes: {', '.join(found_nodes)}")
                else:
                    print(f"   ❌ InstantID nodes not found in loaded nodes")
                
                # Check for SeedVR2 nodes
                seedvr2_nodes = ["SeedVR2VideoUpscaler", "SeedVR2LoadDiTModel", "SeedVR2LoadVAEModel"]
                found_seedvr2 = [node for node in seedvr2_nodes if node in object_info]
                if found_seedvr2:
                    print(f"   ✅ Found SeedVR2 nodes: {', '.join(found_seedvr2)}")
                else:
                    print(f"   ❌ SeedVR2 nodes not found in loaded nodes")
        except Exception as e:
            print(f"   ⚠️  Could not check loaded nodes: {e}")


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
        error_details = json.dumps(result['node_errors'], indent=2)
        print(f"❌ ComfyUI node errors: {error_details}")
        raise Exception(f"ComfyUI node errors: {error_details}")
    
    # Check for error in response
    if result.get("error"):
        error_info = result.get("error", {})
        error_msg = error_info.get("message", str(error_info))
        error_type = error_info.get("type", "unknown")
        error_details = error_info.get("details", "")
        full_error = f"{error_type}: {error_msg}"
        if error_details:
            full_error += f" - {error_details}"
        print(f"❌ ComfyUI workflow error: {full_error}")
        raise Exception(f"ComfyUI workflow error: {full_error}")
    
    prompt_id = result.get("prompt_id")
    if not prompt_id:
        raise Exception(f"No prompt_id returned: {result}")
    
    print(f"📊 Workflow queued with prompt_id: {prompt_id}")
    
    # Wait for completion
    start_time = time.time()
    history_url = f"http://127.0.0.1:{port}/history/{prompt_id}"
    
    while time.time() - start_time < timeout:
        try:
            history_response = requests.get(history_url, timeout=10)
            if history_response.status_code == 200:
                history_data = history_response.json()
                if prompt_id in history_data:
                    # Workflow completed (or failed)
                    output_data = history_data[prompt_id]
                    print(f"📊 Workflow found in history, checking status...")
                    
                    # Log output_data structure for debugging (full, no truncation for errors)
                    # Always log full structure when there's an error to debug KSampler issues
                    output_str = json.dumps(output_data, indent=2, default=str)
                    print(f"📊 Full output_data structure (for error debugging):")
                    print(output_str)
                    
                    # Check for errors first - ComfyUI stores errors in status and messages
                    status = output_data.get("status", {})
                    messages = output_data.get("messages", [])
                    
                    # Log full messages array for debugging (especially useful for KSampler errors)
                    print(f"📊 Messages array ({len(messages)} messages):")
                    for i, msg in enumerate(messages):
                        if isinstance(msg, list) and len(msg) >= 2:
                            msg_type = msg[0]
                            print(f"   Message {i}: type={msg_type}")
                            if msg_type == "execution_error":
                                print(f"      Full execution_error message: {json.dumps(msg, indent=2, default=str)}")
                    
                    # Check messages array for execution_error (most reliable error source)
                    for msg in messages:
                        if isinstance(msg, list) and len(msg) >= 2:
                            msg_type = msg[0]
                            msg_data = msg[1] if len(msg) > 1 else {}
                            if msg_type == "execution_error":
                                # Log the raw msg_data structure for debugging
                                print(f"🔍 Raw execution_error msg_data structure:")
                                print(json.dumps(msg_data, indent=2, default=str))
                                
                                # Extract error info - ComfyUI may nest it differently
                                error_info = msg_data.get("error", {}) if isinstance(msg_data, dict) else msg_data
                                
                                # If error_info is not a dict, try to extract from msg_data directly
                                if not isinstance(error_info, dict):
                                    error_info = msg_data if isinstance(msg_data, dict) else {}
                                
                                # Extract node_id and node_type - check multiple possible locations
                                node_id = (
                                    error_info.get("node_id") or 
                                    msg_data.get("node_id") or 
                                    "unknown"
                                )
                                node_type = (
                                    error_info.get("node_type") or 
                                    msg_data.get("node_type") or 
                                    "unknown"
                                )
                                
                                print(f"🔍 Extracted node_id: {node_id}, node_type: {node_type}")
                                error_msg = error_info.get("message", error_info.get("error", "Workflow execution failed")) if isinstance(error_info, dict) else str(error_info)
                                error_details = error_info.get("details", "") if isinstance(error_info, dict) else ""
                                error_trace = error_info.get("traceback", []) if isinstance(error_info, dict) else []
                                exception_type = error_info.get("exception_type", "") if isinstance(error_info, dict) else ""
                                exception_message = error_info.get("exception_message", "") if isinstance(error_info, dict) else ""
                                current_inputs = error_info.get("current_inputs", {}) if isinstance(error_info, dict) else {}
                                
                                # Format traceback (can be list or string)
                                traceback_str = ""
                                if error_trace:
                                    if isinstance(error_trace, list):
                                        traceback_str = "\n".join(str(line) for line in error_trace)
                                    else:
                                        traceback_str = str(error_trace)
                                
                                full_error = f"Workflow failed at node {node_id} ({node_type}): {error_msg}"
                                if exception_type:
                                    full_error += f"\nException Type: {exception_type}"
                                if exception_message:
                                    full_error += f"\nException Message: {exception_message}"
                                if error_details:
                                    full_error += f"\nDetails: {error_details}"
                                if traceback_str:
                                    full_error += f"\nTraceback:\n{traceback_str}"
                                if current_inputs:
                                    # Log current_inputs for debugging (especially useful for KSampler)
                                    inputs_str = json.dumps(current_inputs, indent=2, default=str)
                                    full_error += f"\nCurrent Inputs: {inputs_str}"
                                
                                # Special handling for KSampler errors (common failure point)
                                if node_type == "KSampler":
                                    print(f"🔍 KSampler error detected - detailed debugging:")
                                    print(f"   Node ID: {node_id}")
                                    print(f"   Error Message: {error_msg}")
                                    if exception_type:
                                        print(f"   Exception Type: {exception_type}")
                                    if exception_message:
                                        print(f"   Exception Message: {exception_message}")
                                    if current_inputs:
                                        print(f"   KSampler Inputs:")
                                        for input_key, input_value in current_inputs.items():
                                            # Log input type and shape if tensor
                                            if isinstance(input_value, list) and len(input_value) >= 2:
                                                # ComfyUI connection format: [node_id, output_index]
                                                print(f"      {input_key}: {input_value} (connection to node {input_value[0]}, output {input_value[1]})")
                                            else:
                                                print(f"      {input_key}: {input_value}")
                                    if error_details:
                                        print(f"   Details: {error_details}")
                                    if traceback_str:
                                        print(f"   Full Traceback:\n{traceback_str}")
                                
                                # Log full error message data without truncation
                                print(f"❌ Execution error found in messages:")
                                print(f"   Node ID: {node_id}")
                                print(f"   Node Type: {node_type}")
                                print(f"   Error Message: {error_msg}")
                                if exception_type:
                                    print(f"   Exception Type: {exception_type}")
                                if exception_message:
                                    print(f"   Exception Message: {exception_message}")
                                if error_details:
                                    print(f"   Details: {error_details}")
                                if traceback_str:
                                    print(f"   Traceback:\n{traceback_str}")
                                if current_inputs:
                                    print(f"   Current Inputs: {json.dumps(current_inputs, indent=2, default=str)}")
                                
                                # Log full msg_data for complete context
                                print(f"❌ Full error message data (no truncation):")
                                print(json.dumps(msg_data, indent=2, default=str))
                                
                                raise Exception(full_error)
                    
                    print(f"📊 Status: {json.dumps(status, indent=2) if status else 'None'}")
                    
                    if status:
                        status_str = status.get("status_str", "")
                        # Check if workflow failed (multiple ways ComfyUI indicates failure)
                        if status.get("failed") or status_str == "error" or status_str == "error_occurred":
                            print(f"🔍 Status indicates error - detailed debugging:")
                            print(f"   Full status object: {json.dumps(status, indent=2, default=str)}")
                            
                            error_info = status.get("error", {})
                            print(f"🔍 Error info from status: {json.dumps(error_info, indent=2, default=str)}")
                            
                            # Try multiple ways to extract node_id and node_type
                            node_id = None
                            if isinstance(error_info, dict):
                                node_id = error_info.get("node_id") or error_info.get("node")
                            if not node_id:
                                node_id = status.get("node_id")
                            node_id = node_id or "unknown"
                            
                            node_type = None
                            if isinstance(error_info, dict):
                                node_type = error_info.get("node_type") or error_info.get("type")
                            if not node_type:
                                node_type = status.get("node_type")
                            node_type = node_type or "unknown"
                            
                            print(f"🔍 Extracted from status - node_id: {node_id}, node_type: {node_type}")
                            
                            # Try multiple ways to extract error message
                            error_msg = None
                            if isinstance(error_info, dict):
                                error_msg = error_info.get("message") or error_info.get("error")
                            if not error_msg:
                                error_msg = status.get("message")
                            if not error_msg:
                                error_msg = str(error_info) if error_info else json.dumps(status) if status else "Workflow execution failed"
                            error_msg = error_msg or "Workflow execution failed"
                            
                            error_details = error_info.get("details", "")
                            error_trace = error_info.get("traceback", [])
                            exception_type = error_info.get("exception_type", "")
                            exception_message = error_info.get("exception_message", "")
                            current_inputs = error_info.get("current_inputs", {})
                            
                            # Format traceback (can be list or string)
                            traceback_str = ""
                            if error_trace:
                                if isinstance(error_trace, list):
                                    traceback_str = "\n".join(str(line) for line in error_trace)
                                else:
                                    traceback_str = str(error_trace)
                            
                            full_error = f"Workflow failed at node {node_id} ({node_type}): {error_msg}"
                            if exception_type:
                                full_error += f"\nException Type: {exception_type}"
                            if exception_message:
                                full_error += f"\nException Message: {exception_message}"
                            if error_details:
                                full_error += f"\nDetails: {error_details}"
                            if traceback_str:
                                full_error += f"\nTraceback:\n{traceback_str}"
                            if current_inputs:
                                inputs_str = json.dumps(current_inputs, indent=2, default=str)
                                full_error += f"\nCurrent Inputs: {inputs_str}"
                            
                            # Log full status for debugging (no truncation)
                            print(f"❌ Full status (no truncation):")
                            print(json.dumps(status, indent=2, default=str))
                            print(f"❌ Full error_info (no truncation):")
                            print(json.dumps(error_info, indent=2, default=str))
                            print(f"❌ {full_error}")
                            raise Exception(full_error)
                    
                    # Also check for errors in the output_data itself (some ComfyUI versions store errors here)
                    if output_data.get("error"):
                        error_info = output_data.get("error", {})
                        if isinstance(error_info, dict):
                            error_msg = error_info.get("message", str(error_info))
                            node_id = error_info.get("node_id", "unknown")
                            node_type = error_info.get("node_type", "unknown")
                            full_error = f"Workflow error at node {node_id} ({node_type}): {error_msg}"
                            print(f"❌ {full_error}")
                            raise Exception(full_error)
                        else:
                            print(f"❌ Workflow error: {error_info}")
                            raise Exception(f"Workflow error: {error_info}")
                    
                    outputs = output_data.get("outputs", {})
                    
                    # Debug: Log output structure
                    print(f"📊 Workflow outputs: {json.dumps(list(outputs.keys()), indent=2)}")
                    if outputs:
                        print(f"📊 First output structure: {json.dumps(list(outputs.values())[0] if outputs else {}, indent=2)[:500]}")
                    
                    # Find SaveImage or SaveAnimatedWEBP node
                    for node_id, node_output in outputs.items():
                        images = node_output.get("images", [])
                        if images:
                            # Get the image
                            image_info = images[0]
                            filename = image_info["filename"]
                            subfolder = image_info.get("subfolder", "")
                            image_type = image_info.get("type", "output")
                            
                            print(f"✅ Found image: {filename} (subfolder: {subfolder}, type: {image_type})")
                            
                            # Download the image
                            image_url = f"http://127.0.0.1:{port}/view"
                            params = {
                                "filename": filename,
                                "subfolder": subfolder,
                                "type": image_type
                            }
                            img_response = requests.get(image_url, params=params, timeout=30)
                            if img_response.status_code == 200:
                                print(f"✅ Image downloaded successfully ({len(img_response.content)} bytes)")
                                return img_response.content
                            else:
                                print(f"⚠️  Image download failed: HTTP {img_response.status_code}")
                    
                    # If no images but no error, check if there are node errors
                    if output_data.get("node_errors"):
                        node_errors = output_data["node_errors"]
                        error_details = json.dumps(node_errors, indent=2)
                        print(f"❌ Node errors: {error_details}")
                        raise Exception(f"Node errors in workflow: {error_details}")
                    
                    # Check if workflow is still running (status might indicate pending)
                    if status:
                        status_str = status.get("status_str", "")
                        if status_str in ["pending", "running", "executing"]:
                            # Workflow still running, wait a bit more
                            print(f"⏳ Workflow still {status_str}, waiting...")
                            time.sleep(2)
                            continue
                    
                    # Debug: Log full output_data structure
                    print(f"⚠️  No images found. Full output_data structure:")
                    print(f"   Keys: {list(output_data.keys())}")
                    print(f"   Status: {json.dumps(status, indent=2) if status else 'None'}")
                    print(f"   Outputs keys: {list(outputs.keys()) if outputs else 'None'}")
                    if outputs:
                        for node_id, node_output in outputs.items():
                            print(f"   Node {node_id}: {list(node_output.keys())}")
                    
                    # If we have status but no outputs, the workflow likely failed silently
                    if status and not status.get("completed") and not status.get("failed"):
                        raise Exception(f"Workflow completed but no outputs found. Status: {json.dumps(status, indent=2)}")
                    
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
