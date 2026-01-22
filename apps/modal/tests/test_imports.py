"""
Test that all imports work correctly after reorganization.

This test verifies that the modular structure is correctly set up.
"""

import sys
from pathlib import Path

# Add modal directory to path
modal_dir = Path(__file__).parent.parent
sys.path.insert(0, str(modal_dir))


def test_config_imports():
    """Test that config module imports correctly."""
    from config import (
        volume,
        hf_cache_vol,
        huggingface_secret,
        GPU_TYPE,
        COMFYUI_PORT,
        GPU_CONFIG,
        MODEL_PATHS,
    )
    assert GPU_TYPE == "L40S"
    assert COMFYUI_PORT == 8000
    assert isinstance(GPU_CONFIG, dict)
    print("✅ Config imports work")


def test_image_imports():
    """Test that image module imports correctly."""
    from image import image
    assert image is not None
    print("✅ Image imports work")


def test_handler_imports():
    """Test that all handlers import correctly."""
    from handlers.flux import FluxHandler, setup_flux_endpoints
    from handlers.instantid import InstantIDHandler, setup_instantid_endpoints
    from handlers.lora import LoRAHandler, setup_lora_endpoints
    from handlers.wan2 import Wan2Handler, setup_wan2_endpoints
    from handlers.seedvr2 import SeedVR2Handler, setup_seedvr2_endpoints
    from handlers.workflow import WorkflowHandler, setup_workflow_endpoints
    
    assert FluxHandler is not None
    assert InstantIDHandler is not None
    assert LoRAHandler is not None
    assert Wan2Handler is not None
    assert SeedVR2Handler is not None
    assert WorkflowHandler is not None
    print("✅ All handler imports work")


def test_utils_imports():
    """Test that all utilities import correctly."""
    from utils.cost_tracker import CostTracker, get_cost_summary
    from utils.comfyui import launch_comfy_server, poll_server_health, execute_workflow
    from utils.image_utils import encode_base64, decode_base64, save_base64_to_file
    
    assert CostTracker is not None
    assert get_cost_summary is not None
    print("✅ All utility imports work")


def test_endpoint_registration():
    """Test that endpoints can be registered."""
    from fastapi import FastAPI
    from handlers.flux import setup_flux_endpoints
    from handlers.instantid import setup_instantid_endpoints
    from handlers.lora import setup_lora_endpoints
    from handlers.wan2 import setup_wan2_endpoints
    from handlers.seedvr2 import setup_seedvr2_endpoints
    from handlers.workflow import setup_workflow_endpoints
    
    # Create mock ComfyUI instance
    class MockComfyUI:
        port = 8000
        def infer(self, workflow_path):
            return b'fake_image_data'
    
    app = FastAPI()
    mock_instance = MockComfyUI()
    
    # Register all endpoints
    setup_flux_endpoints(app, mock_instance)
    setup_instantid_endpoints(app, mock_instance)
    setup_lora_endpoints(app, mock_instance)
    setup_wan2_endpoints(app, mock_instance)
    setup_seedvr2_endpoints(app, mock_instance)
    setup_workflow_endpoints(app, mock_instance)
    
    # Check routes
    routes = [route.path for route in app.routes if hasattr(route, 'path')]
    expected_routes = ['/flux', '/flux-dev', '/flux-instantid', '/flux-lora', '/wan2', '/seedvr2', '/workflow']
    
    for route in expected_routes:
        assert route in routes, f"Route {route} not found"
    
    print(f"✅ All {len(routes)} endpoints registered correctly")


if __name__ == "__main__":
    print("Running import tests...\n")
    
    test_config_imports()
    test_image_imports()
    test_handler_imports()
    test_utils_imports()
    test_endpoint_registration()
    
    print("\n✅ All import tests passed!")
