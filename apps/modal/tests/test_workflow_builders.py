"""
Test workflow builders to ensure they generate valid ComfyUI workflows.

This test verifies that workflow builders create correct JSON structures.
"""

import sys
from pathlib import Path
import json

# Add modal directory to path
modal_dir = Path(__file__).parent.parent
sys.path.insert(0, str(modal_dir))

from handlers.flux import build_flux_workflow, build_flux_dev_workflow
from handlers.instantid import build_flux_instantid_workflow
from handlers.lora import build_flux_lora_workflow
from handlers.wan2 import build_wan2_workflow


def test_flux_workflow():
    """Test Flux Schnell workflow builder."""
    item = {
        "prompt": "A beautiful landscape",
        "width": 1024,
        "height": 1024,
        "seed": 42,
        "steps": 4,
        "cfg": 1.0,
        "negative_prompt": "",
    }
    
    workflow = build_flux_workflow(item)
    
    # Check required nodes
    assert "4" in workflow  # CheckpointLoaderSimple
    assert "6" in workflow  # CLIPTextEncode (positive)
    assert "7" in workflow  # CLIPTextEncode (negative)
    assert "5" in workflow  # KSampler
    assert "9" in workflow  # SaveImage
    
    # Check node types
    assert workflow["4"]["class_type"] == "CheckpointLoaderSimple"
    assert workflow["6"]["class_type"] == "CLIPTextEncode"
    assert workflow["5"]["class_type"] == "KSampler"
    
    print("✅ Flux workflow builder works")


def test_flux_dev_workflow():
    """Test Flux Dev workflow builder."""
    item = {
        "prompt": "A beautiful landscape",
        "width": 1024,
        "height": 1024,
        "seed": 42,
        "steps": 20,
        "cfg": 1.0,
        "negative_prompt": "",
    }
    
    workflow = build_flux_dev_workflow(item)
    
    # Check required nodes
    assert "1" in workflow  # UNETLoader
    assert "2" in workflow  # DualCLIPLoader
    assert "3" in workflow  # VAELoader
    assert "4" in workflow  # CLIPTextEncode (positive)
    assert "5" in workflow  # CLIPTextEncode (negative)
    assert "7" in workflow  # KSampler
    assert "9" in workflow  # SaveImage
    
    # Check node types
    assert workflow["1"]["class_type"] == "UNETLoader"
    assert workflow["2"]["class_type"] == "DualCLIPLoader"
    assert workflow["3"]["class_type"] == "VAELoader"
    
    print("✅ Flux Dev workflow builder works")


def test_wan2_workflow():
    """Test Wan2.1 workflow builder."""
    item = {
        "prompt": "A beautiful landscape",
        "width": 832,
        "height": 480,
        "length": 33,
        "seed": 839327983272663,
        "steps": 30,
        "cfg": 6,
        "fps": 16,
        "quality": 90,
        "negative_prompt": "",
    }
    
    workflow = build_wan2_workflow(item)
    
    # Check required nodes
    assert "37" in workflow  # UNETLoader
    assert "38" in workflow  # CLIPLoader
    assert "39" in workflow  # VAELoader
    assert "40" in workflow  # EmptyHunyuanLatentVideo
    assert "3" in workflow  # KSampler
    assert "28" in workflow  # SaveAnimatedWEBP
    
    # Check node types
    assert workflow["37"]["class_type"] == "UNETLoader"
    assert workflow["40"]["class_type"] == "EmptyHunyuanLatentVideo"
    assert workflow["28"]["class_type"] == "SaveAnimatedWEBP"
    
    print("✅ Wan2 workflow builder works")


def test_workflow_json_valid():
    """Test that workflows are valid JSON."""
    item = {
        "prompt": "Test",
        "width": 1024,
        "height": 1024,
    }
    
    workflows = [
        build_flux_workflow(item),
        build_flux_dev_workflow(item),
        build_wan2_workflow(item),
    ]
    
    for workflow in workflows:
        # Try to serialize to JSON
        json_str = json.dumps(workflow)
        # Try to deserialize
        parsed = json.loads(json_str)
        assert parsed == workflow
    
    print("✅ All workflows are valid JSON")


if __name__ == "__main__":
    print("Running workflow builder tests...\n")
    
    test_flux_workflow()
    test_flux_dev_workflow()
    test_wan2_workflow()
    test_workflow_json_valid()
    
    print("\n✅ All workflow builder tests passed!")
