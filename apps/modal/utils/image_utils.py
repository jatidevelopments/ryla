"""
Image processing utilities.

Handles base64 encoding/decoding, image validation, and format conversion.
"""

import base64
from pathlib import Path
from typing import Optional
from io import BytesIO


def encode_base64(image_path: str) -> str:
    """
    Encode an image file to base64 string.
    
    Args:
        image_path: Path to image file
    
    Returns:
        Base64 encoded string (with data URI prefix)
    
    Raises:
        FileNotFoundError: If image file doesn't exist
    """
    image_path = Path(image_path)
    if not image_path.exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")
    
    with open(image_path, "rb") as f:
        image_bytes = f.read()
    
    # Determine MIME type from extension
    ext = image_path.suffix.lower()
    mime_types = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
    }
    mime_type = mime_types.get(ext, "image/jpeg")
    
    # Encode to base64
    base64_str = base64.b64encode(image_bytes).decode("utf-8")
    
    # Return with data URI prefix
    return f"data:{mime_type};base64,{base64_str}"


def decode_base64(base64_string: str, output_path: Optional[str] = None) -> bytes:
    """
    Decode a base64 string to image bytes.
    
    Args:
        base64_string: Base64 encoded string (with or without data URI prefix)
        output_path: Optional path to save decoded image
    
    Returns:
        Image bytes
    
    Raises:
        ValueError: If base64 string is invalid
    """
    # Remove data URI prefix if present
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]
    
    try:
        image_bytes = base64.b64decode(base64_string)
    except Exception as e:
        raise ValueError(f"Invalid base64 string: {e}")
    
    # Save to file if output path provided
    if output_path:
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "wb") as f:
            f.write(image_bytes)
    
    return image_bytes


def validate_image(image_path: str, max_size_mb: float = 10.0) -> bool:
    """
    Validate an image file.
    
    Args:
        image_path: Path to image file
        max_size_mb: Maximum file size in MB (default: 10.0)
    
    Returns:
        True if image is valid, False otherwise
    """
    image_path = Path(image_path)
    
    # Check if file exists
    if not image_path.exists():
        return False
    
    # Check file size
    file_size_mb = image_path.stat().st_size / (1024 * 1024)
    if file_size_mb > max_size_mb:
        return False
    
    # Check file extension
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    if image_path.suffix.lower() not in valid_extensions:
        return False
    
    return True


def save_base64_to_file(base64_string: str, output_path: str) -> Path:
    """
    Save a base64 encoded image to a file.
    
    Args:
        base64_string: Base64 encoded string (with or without data URI prefix)
        output_path: Path to save the image
    
    Returns:
        Path to saved file
    
    Raises:
        ValueError: If base64 string is invalid
    """
    image_bytes = decode_base64(base64_string)
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "wb") as f:
        f.write(image_bytes)
    
    return output_path
