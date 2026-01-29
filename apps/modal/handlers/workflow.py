"""
Custom workflow handler.

Handles custom workflow JSON execution.
"""

import json
import uuid
from pathlib import Path
from typing import Dict
from fastapi import Response

from utils.cost_tracker import CostTracker, get_cost_summary


class WorkflowHandler:
    """Handler for custom workflows."""
    
    def __init__(self, comfyui_instance):
        self.comfyui = comfyui_instance
    
    def _workflow_impl(self, item: dict) -> Response:
        """Custom workflow implementation."""
        # Start cost tracking
        tracker = CostTracker(gpu_type="L40S")
        tracker.start()
        
        workflow_data = item["workflow"]
        
        # Check if it's UI format (has "nodes" key) or API format (numeric string keys)
        is_ui_format = isinstance(workflow_data, dict) and "nodes" in workflow_data
        
        if is_ui_format:
            # UI format - need to convert or use comfy run
            # Try to convert via converter endpoint first
            port = getattr(self.comfyui, 'port', 8000)
            comfy_url = f"http://127.0.0.1:{port}"
            
            try:
                import urllib.request
                convert_data = json.dumps(workflow_data).encode("utf-8")
                convert_request = urllib.request.Request(
                    f"{comfy_url}/workflow/convert",
                    data=convert_data,
                    headers={"Content-Type": "application/json"},
                )
                convert_response = urllib.request.urlopen(convert_request, timeout=10)
                convert_result = json.loads(convert_response.read().decode("utf-8"))
                workflow_data = convert_result.get("prompt") or convert_result
                print("✅ Converted UI workflow to API format")
            except Exception as e:
                print(f"⚠️  Converter endpoint failed: {e}. Using comfy run with UI format...")
                # Fall through to comfy run which can handle UI format
        
        # Update prompt if provided
        if "prompt" in item:
            # Find CLIPTextEncode nodes and update
            if isinstance(workflow_data, dict):
                for node in workflow_data.values():
                    if isinstance(node, dict) and node.get("class_type") == "CLIPTextEncode":
                        if "text" in node.get("inputs", {}):
                            node["inputs"]["text"] = item["prompt"]
        
        # Save workflow to temp file
        client_id = uuid.uuid4().hex
        workflow_file = f"/tmp/{client_id}.json"
        json.dump(workflow_data, Path(workflow_file).open("w"))
        
        # Execute
        output_bytes = self.comfyui.infer.local(workflow_file)
        
        # Determine content type based on file extension or workflow
        content_type = "application/octet-stream"
        if any(node.get("class_type") == "SaveAnimatedWEBP" for node in workflow_data.values()):
            content_type = "image/webp"
        elif any(node.get("class_type") == "SaveImage" for node in workflow_data.values()):
            content_type = "image/jpeg"
        
        # Calculate cost
        execution_time = tracker.stop()
        cost_metrics = tracker.calculate_cost("workflow", execution_time)
        
        # Log cost
        print(f"💰 {get_cost_summary(cost_metrics)}")
        
        # Return response with cost headers
        response = Response(output_bytes, media_type=content_type)
        response.headers["X-Cost-USD"] = f"{cost_metrics.total_cost:.6f}"
        response.headers["X-Execution-Time-Sec"] = f"{execution_time:.3f}"
        response.headers["X-GPU-Type"] = cost_metrics.gpu_type
        return response


def setup_workflow_endpoints(fastapi, comfyui_instance):
    """
    Register workflow endpoints in FastAPI app.
    
    Args:
        fastapi: FastAPI app instance
        comfyui_instance: ComfyUI class instance
    """
    from fastapi import Request
    from fastapi.responses import Response as FastAPIResponse
    
    handler = WorkflowHandler(comfyui_instance)
    
    @fastapi.post("/workflow")
    async def workflow_route(request: Request):
        item = await request.json()
        result = handler._workflow_impl(item)
        # Preserve cost headers
        response = FastAPIResponse(
            content=result.body,
            media_type=result.media_type,
        )
        for key, value in result.headers.items():
            if key.startswith("X-Cost") or key.startswith("X-Execution") or key.startswith("X-GPU"):
                response.headers[key] = value
        return response
