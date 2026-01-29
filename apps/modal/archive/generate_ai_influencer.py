#!/usr/bin/env python3
"""
Generate an AI influencer image using the Modal ComfyUI Denrisi workflow
"""
import json
import base64
from pathlib import Path

# Import the generate_image function from the main module
from comfyui_danrisi import generate_image

def main():
    """Generate an AI influencer image"""
    print("🎨 Generating AI influencer image...")
    print("=" * 50)
    print("Prompt: A stunning AI influencer, photorealistic, professional portrait")
    print("Size: 1024x1024")
    print("Steps: 20")
    print("CFG: 1.0")
    print("=" * 50)
    print("\n⏳ Generating image (this may take 1-2 minutes)...\n")
    
    result = generate_image.remote(
        workflow_json=None,  # Will use default Denrisi workflow
        prompt="A stunning AI influencer, photorealistic, professional portrait, modern fashion, high quality, beautiful face, perfect lighting, studio quality, elegant pose",
        negative_prompt="blurry, low quality, distorted, ugly, deformed, bad anatomy, bad proportions, watermark, text",
        width=1024,
        height=1024,
        steps=20,
        cfg=1.0,
        seed=None,
    )
    
    print("\n📊 Result:")
    if result.get("status") == "success":
        print("✅ Image generated successfully!")
        print(f"📸 Generated {len(result.get('images', []))} image(s)")
        
        # Save the image
        if "images" in result and len(result["images"]) > 0:
            image_data = base64.b64decode(result["images"][0]["image"])
            output_path = Path(__file__).parent.parent.parent / "ai_influencer.png"
            with open(output_path, "wb") as f:
                f.write(image_data)
            print(f"💾 Saved to: {output_path.absolute()}")
            print(f"📁 File size: {len(image_data) / 1024:.2f} KB")
    else:
        print("❌ Error:", result.get("error", "Unknown error"))
        if "details" in result:
            print("Details:", json.dumps(result["details"], indent=2)[:1000])
    
    return result

if __name__ == "__main__":
    main()
