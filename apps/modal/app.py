"""
RYLA ComfyUI Modal App - Main Entry Point

Deploy: modal deploy apps/modal/app.py
"""

import modal
import sys
from pathlib import Path

# Add utils to path for imports
sys.path.insert(0, "/root")
sys.path.insert(0, "/root/utils")

# Import configuration
from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE, COMFYUI_PORT

# Import image build
from image import image

# Import handlers
from handlers.flux import setup_flux_endpoints
from handlers.instantid import setup_instantid_endpoints
from handlers.ipadapter_faceid import setup_ipadapter_faceid_endpoints
from handlers.lora import setup_lora_endpoints
from handlers.wan2 import setup_wan2_endpoints
from handlers.seedvr2 import setup_seedvr2_endpoints
from handlers.workflow import setup_workflow_endpoints
from handlers.z_image import setup_z_image_endpoints

# Import utilities (imported inside methods to avoid circular imports)

# Create Modal app
app = modal.App(name="ryla-comfyui", image=image)


@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    # Note: min_containers=1 removed - the monolithic image is too heavy
    # Use split apps (ryla-flux, ryla-instantid) or modal-playground for testing
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
    secrets=[huggingface_secret],
    timeout=1800,  # 30 minutes for long-running workflows
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    """ComfyUI server class with all workflow endpoints."""
    
    port: int = COMFYUI_PORT

    @modal.enter()
    def launch_comfy_background(self):
        """Launch the ComfyUI server exactly once when the container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
        
        # Wait a bit for server to fully start and load nodes
        import time
        time.sleep(5)
        
        # Verify nodes are loaded
        from utils.comfyui import verify_nodes_available
        instantid_nodes = ["InsightFaceLoader", "InstantIDModelLoader", "InstantIDControlNetLoader", "ApplyInstantID"]
        node_status = verify_nodes_available(instantid_nodes, port=self.port)
        missing = [node for node, available in node_status.items() if not available]
        if missing:
            print(f"⚠️  Warning: InstantID nodes not loaded at startup: {', '.join(missing)}")
        else:
            print(f"✅ All InstantID nodes loaded successfully")
        
        seedvr2_nodes = ["SeedVR2VideoUpscaler", "SeedVR2LoadDiTModel", "SeedVR2LoadVAEModel"]
        seedvr2_status = verify_nodes_available(seedvr2_nodes, port=self.port)
        missing_seedvr2 = [node for node, available in seedvr2_status.items() if not available]
        if missing_seedvr2:
            print(f"⚠️  Warning: SeedVR2 nodes not loaded at startup: {', '.join(missing_seedvr2)}")
        else:
            print(f"✅ All SeedVR2 nodes loaded successfully")

    @modal.method()
    def test_node_imports(self):
        """Test custom node imports to diagnose loading issues."""
        import sys
        import traceback
        import json
        from pathlib import Path
        
        results = {
            "comfyui_path": "/root/comfy/ComfyUI",
            "python_version": sys.version,
            "python_path": sys.path[:10],  # First 10 entries
            "instantid": {},
            "seedvr2": {},
            "dependencies": {},
        }
        
        comfy_dir = Path("/root/comfy/ComfyUI")
        sys.path.insert(0, str(comfy_dir))
        
        print("=" * 60)
        print("TESTING INSTANTID IMPORT")
        print("=" * 60)
        
        # Test InstantID import
        try:
            from custom_nodes.ComfyUI_InstantID import nodes
            results["instantid"]["import_success"] = True
            results["instantid"]["node_classes"] = [x for x in dir(nodes) if not x.startswith('_')][:20]
            print("✅ InstantID import successful")
            print(f"   Found {len(results['instantid']['node_classes'])} attributes")
        except Exception as e:
            results["instantid"]["import_success"] = False
            results["instantid"]["error"] = str(e)
            results["instantid"]["traceback"] = traceback.format_exc()
            print(f"❌ InstantID import failed: {e}")
            print(traceback.format_exc())
        
        print("\n" + "=" * 60)
        print("TESTING SEEDVR2 IMPORT")
        print("=" * 60)
        
        # Test SeedVR2 import
        try:
            # Try different possible import paths
            try:
                from custom_nodes.ComfyUI_SeedVR2_VideoUpscaler import nodes as seedvr2_nodes
            except ImportError:
                # Try alternative import
                import importlib.util
                seedvr2_path = comfy_dir / "custom_nodes" / "ComfyUI-SeedVR2_VideoUpscaler"
                spec = importlib.util.spec_from_file_location("seedvr2_nodes", seedvr2_path / "__init__.py")
                seedvr2_nodes = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(seedvr2_nodes)
            
            results["seedvr2"]["import_success"] = True
            results["seedvr2"]["node_classes"] = [x for x in dir(seedvr2_nodes) if not x.startswith('_')][:20]
            print("✅ SeedVR2 import successful")
            print(f"   Found {len(results['seedvr2']['node_classes'])} attributes")
        except Exception as e:
            results["seedvr2"]["import_success"] = False
            results["seedvr2"]["error"] = str(e)
            results["seedvr2"]["traceback"] = traceback.format_exc()
            print(f"❌ SeedVR2 import failed: {e}")
            print(traceback.format_exc())
        
        print("\n" + "=" * 60)
        print("TESTING DEPENDENCIES")
        print("=" * 60)
        
        # Test dependencies
        for dep in ["insightface", "onnxruntime"]:
            try:
                mod = __import__(dep)
                version = getattr(mod, "__version__", "unknown")
                results["dependencies"][dep] = {
                    "available": True,
                    "version": version
                }
                print(f"✅ {dep} available (version: {version})")
            except ImportError as e:
                results["dependencies"][dep] = {
                    "available": False,
                    "error": str(e)
                }
                print(f"❌ {dep} not available: {e}")
        
        # Check file structure
        instantid_dir = comfy_dir / "custom_nodes" / "ComfyUI_InstantID"
        if instantid_dir.exists():
            results["instantid"]["directory_exists"] = True
            results["instantid"]["files"] = [f.name for f in instantid_dir.glob("*.py")][:20]
            print(f"\n✅ InstantID directory exists with {len(results['instantid']['files'])} Python files")
        else:
            results["instantid"]["directory_exists"] = False
            print("\n❌ InstantID directory not found")
        
        seedvr2_dir = comfy_dir / "custom_nodes" / "ComfyUI-SeedVR2_VideoUpscaler"
        if seedvr2_dir.exists():
            results["seedvr2"]["directory_exists"] = True
            results["seedvr2"]["files"] = [f.name for f in seedvr2_dir.glob("*.py")][:20]
            print(f"✅ SeedVR2 directory exists with {len(results['seedvr2']['files'])} Python files")
        else:
            results["seedvr2"]["directory_exists"] = False
            print("❌ SeedVR2 directory not found")
        
        print("\n" + "=" * 60)
        print("RESULTS SUMMARY")
        print("=" * 60)
        print(json.dumps(results, indent=2, default=str))
        
        return results
    
    @modal.method()
    def infer(self, workflow_path: str = "/root/workflow_api.json"):
        """Run inference on a workflow."""
        # Check server health
        from utils.comfyui import poll_server_health as check_health, execute_workflow
        check_health(self.port)
        
        # Execute workflow using utility
        return execute_workflow(workflow_path)
    
    def poll_server_health(self):
        """Poll server health (for use in handlers)."""
        from utils.comfyui import poll_server_health as check_health
        check_health(self.port)
    
    def _workflow_impl(self, item: dict):
        """Workflow implementation (for use by SeedVR2 handler)."""
        from handlers.workflow import WorkflowHandler
        handler = WorkflowHandler(self)
        return handler._workflow_impl(item)

    @modal.asgi_app()
    def fastapi_app(self):
        """Single FastAPI app with all routes."""
        from fastapi import FastAPI
        from fastapi.responses import JSONResponse
        import traceback
        from pathlib import Path
        
        fastapi = FastAPI(title="RYLA ComfyUI API")
        
        # Global exception handler to ensure all errors return JSON
        @fastapi.exception_handler(Exception)
        async def global_exception_handler(request, exc):
            import traceback
            from fastapi.responses import JSONResponse
            error_msg = str(exc)
            error_trace = traceback.format_exc()
            print(f"❌ Global exception handler caught: {error_msg}")
            print(f"   Traceback: {error_trace}")
            return JSONResponse(
                status_code=500,
                content={
                    "error": error_msg,
                    "details": error_trace,
                    "type": type(exc).__name__,
                    "path": str(request.url.path)
                }
            )
        
        # Store instance reference for handlers
        comfyui_instance = self
        
        # Diagnostic endpoint to check node loading
        @fastapi.get("/diagnostics/nodes")
        async def diagnostics_nodes():
            """Diagnostic endpoint to check custom node loading."""
            diagnostics = {
                "comfyui_path": "/root/comfy/ComfyUI",
                "custom_nodes_dir": "/root/comfy/ComfyUI/custom_nodes",
                "instantid_dir_exists": False,
                "instantid_files": [],
                "instantid_import_error": None,
                "seedvr2_dir_exists": False,
                "seedvr2_files": [],
                "seedvr2_import_error": None,
                "comfyui_loaded_nodes": [],
                "instantid_nodes_available": {},
                "seedvr2_nodes_available": {},
            }
            
            try:
                # Check directories
                comfy_dir = Path("/root/comfy/ComfyUI")
                custom_nodes_dir = comfy_dir / "custom_nodes"
                instantid_dir = custom_nodes_dir / "ComfyUI_InstantID"
                seedvr2_dir = custom_nodes_dir / "ComfyUI-SeedVR2_VideoUpscaler"
                
                diagnostics["custom_nodes_dir_exists"] = custom_nodes_dir.exists()
                diagnostics["instantid_dir_exists"] = instantid_dir.exists()
                diagnostics["seedvr2_dir_exists"] = seedvr2_dir.exists()
                
                # Check InstantID files
                if instantid_dir.exists():
                    diagnostics["instantid_files"] = [f.name for f in instantid_dir.glob("*.py")][:10]
                    
                    # Try to import InstantID nodes
                    try:
                        import sys
                        sys.path.insert(0, str(comfy_dir))
                        from custom_nodes.ComfyUI_InstantID import nodes
                        diagnostics["instantid_import_success"] = True
                    except Exception as e:
                        diagnostics["instantid_import_error"] = str(e)
                        diagnostics["instantid_import_traceback"] = traceback.format_exc()
                
                # Check SeedVR2 files
                if seedvr2_dir.exists():
                    diagnostics["seedvr2_files"] = [f.name for f in seedvr2_dir.glob("*.py")][:10]
                    
                    # Try to import SeedVR2 nodes
                    try:
                        import sys
                        sys.path.insert(0, str(comfy_dir))
                        from custom_nodes.ComfyUI_SeedVR2_VideoUpscaler import nodes as seedvr2_nodes
                        diagnostics["seedvr2_import_success"] = True
                    except Exception as e:
                        diagnostics["seedvr2_import_error"] = str(e)
                        diagnostics["seedvr2_import_traceback"] = traceback.format_exc()
                
                # Check ComfyUI loaded nodes
                port = getattr(self, 'port', 8000)
                try:
                    import requests
                    response = requests.get(f"http://127.0.0.1:{port}/object_info", timeout=5)
                    if response.status_code == 200:
                        object_info = response.json()
                        diagnostics["comfyui_loaded_node_count"] = len(object_info)
                        diagnostics["comfyui_loaded_nodes"] = list(object_info.keys())[:50]  # First 50
                        
                        # Check InstantID nodes
                        instantid_nodes = ["InsightFaceLoader", "InstantIDModelLoader", "InstantIDControlNetLoader", "ApplyInstantID"]
                        diagnostics["instantid_nodes_available"] = {
                            node: node in object_info for node in instantid_nodes
                        }
                        
                        # Check SeedVR2 nodes
                        seedvr2_nodes = ["SeedVR2VideoUpscaler", "SeedVR2LoadDiTModel", "SeedVR2LoadVAEModel"]
                        diagnostics["seedvr2_nodes_available"] = {
                            node: node in object_info for node in seedvr2_nodes
                        }
                except Exception as e:
                    diagnostics["comfyui_check_error"] = str(e)
                
            except Exception as e:
                diagnostics["error"] = str(e)
                diagnostics["traceback"] = traceback.format_exc()
            
            return JSONResponse(content=diagnostics)
        
        # Register all endpoints from handlers
        setup_flux_endpoints(fastapi, comfyui_instance)
        setup_instantid_endpoints(fastapi, comfyui_instance)
        setup_ipadapter_faceid_endpoints(fastapi, comfyui_instance)
        setup_lora_endpoints(fastapi, comfyui_instance)
        setup_wan2_endpoints(fastapi, comfyui_instance)
        setup_seedvr2_endpoints(fastapi, comfyui_instance)
        setup_workflow_endpoints(fastapi, comfyui_instance)
        setup_z_image_endpoints(fastapi, comfyui_instance)
        
        return fastapi


# Interactive UI (optional - for development)
@app.function(
    max_containers=1,
    gpu=GPU_TYPE,
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
)
@modal.concurrent(max_inputs=10)
@modal.web_server(8000, startup_timeout=60)
def ui():
    """Launch ComfyUI UI for interactive use."""
    import subprocess
    subprocess.Popen("comfy launch -- --listen 0.0.0.0 --port 8000", shell=True)
    print("✅ ComfyUI UI available at http://localhost:8000")
