#!/usr/bin/env python3
"""Extract and save the generated image from Modal output"""
import json
import base64
import sys
from pathlib import Path

# The base64 image data from the Modal output
# This would normally come from the API response
# For now, we'll run the generation and save it

if __name__ == "__main__":
    # Import modal and generate
    import modal
    from comfyui_danrisi import app, generate_image, test_workflow
    
    print("🎨 Generating AI influencer image...")
    
    result = generate_image.remote(
        workflow_json=None,
        prompt="A stunning AI influencer, photorealistic, professional portrait, modern fashion, high quality, beautiful face, perfect lighting, studio quality, elegant pose",
        negative_prompt="blurry, low quality, distorted, ugly, deformed, bad anatomy, bad proportions, watermark, text",
        width=1024,
        height=1024,
        steps=20,
        cfg=1.0,
        seed=None,
    )
    
    if result.get("status") == "success" and "images" in result:
        image_data = base64.b64decode(result["images"][0]["image"])
        output_path = Path(__file__).parent.parent.parent / "ai_influencer.png"
        with open(output_path, "wb") as f:
            f.write(image_data)
        print(f"✅ Image saved to: {output_path.absolute()}")
        print(f"📁 File size: {len(image_data) / 1024:.2f} KB")
    else:
        print("❌ Error:", result.get("error", "Unknown error"))
        sys.exit(1)
