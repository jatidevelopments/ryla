"""
Test image utility functions.

This test verifies that image processing utilities work correctly.
"""

import sys
from pathlib import Path
import base64
import tempfile

# Add modal directory to path
modal_dir = Path(__file__).parent.parent
sys.path.insert(0, str(modal_dir))

from utils.image_utils import encode_base64, decode_base64, save_base64_to_file


def test_encode_base64():
    """Test base64 encoding of image file."""
    # Create a temporary image file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        f.write(b'fake_image_data')
        temp_path = f.name
    
    try:
        encoded = encode_base64(temp_path)
        assert encoded.startswith('data:image/')
        assert 'base64,' in encoded
        print("✅ encode_base64 works")
    finally:
        Path(temp_path).unlink()


def test_decode_base64():
    """Test base64 decoding."""
    # Create base64 data URL
    original_data = b'fake_image_data'
    base64_data = base64.b64encode(original_data).decode('utf-8')
    data_url = f"data:image/png;base64,{base64_data}"
    
    decoded = decode_base64(data_url)
    assert decoded == original_data
    print("✅ decode_base64 works")


def test_save_base64_to_file():
    """Test saving base64 image to file."""
    # Create base64 data URL
    original_data = b'fake_image_data'
    base64_data = base64.b64encode(original_data).decode('utf-8')
    data_url = f"data:image/png;base64,{base64_data}"
    
    # Save to temp file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as f:
        temp_path = f.name
    
    try:
        save_base64_to_file(data_url, temp_path)
        assert Path(temp_path).exists()
        with open(temp_path, 'rb') as f:
            saved_data = f.read()
        assert saved_data == original_data
        print("✅ save_base64_to_file works")
    finally:
        Path(temp_path).unlink()


if __name__ == "__main__":
    print("Running image utility tests...\n")
    
    test_encode_base64()
    test_decode_base64()
    test_save_base64_to_file()
    
    print("\n✅ All image utility tests passed!")
