"""
RunPod Serverless Handler for Z-Image-Turbo
Fast image generation with 8-9 steps
"""
import runpod
import torch
from diffusers import DiffusionPipeline
from PIL import Image
import io
import base64
from typing import Dict, List, Any

# Model path (mounted from network volume)
MODEL_PATH = "/workspace/models/checkpoints/z-image-turbo.safetensors"

# Global pipeline cache
pipeline = None


def load_pipeline():
    """Load Z-Image-Turbo pipeline (cached between requests)"""
    global pipeline
    if pipeline is None:
        print("Loading Z-Image-Turbo pipeline...")
        pipeline = DiffusionPipeline.from_pretrained(
            MODEL_PATH,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        print("Pipeline loaded successfully")
    return pipeline


def upload_to_supabase(images: List[Image.Image]) -> List[str]:
    """
    Upload images to Supabase Storage
    TODO: Implement Supabase upload logic
    For now, returns placeholder URLs
    """
    # Placeholder - implement actual Supabase upload
    image_urls = []
    for i, img in enumerate(images):
        # Convert to base64 for now (replace with actual upload)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        image_urls.append(f"data:image/png;base64,{img_base64}")
    return image_urls


def generate_base_image(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate 3 base image variations (fast)"""
    prompt = input_data["prompt"]
    nsfw = input_data.get("nsfw", False)
    seed = input_data.get("seed", -1)
    
    pipe = load_pipeline()
    
    # Test NSFW support
    nsfw_supported = False
    if nsfw:
        # Try NSFW generation
        # Log result for testing
        print(f"NSFW generation requested - testing support...")
        # TODO: Test if uncensored checkpoint available
        nsfw_supported = False  # Will be updated after testing
    
    images = []
    for i in range(3):
        generator = torch.Generator(device="cuda")
        if seed != -1:
            generator.manual_seed(seed + i)
        else:
            generator.seed()
        
        # Z-Image-Turbo uses 8-9 steps, no CFG
        result = pipe(
            prompt=prompt,
            num_inference_steps=8,  # Z-Image-Turbo optimal steps
            guidance_scale=1.0,  # No CFG for Z-Image-Turbo
            generator=generator,
        )
        images.append(result.images[0])
    
    image_urls = upload_to_supabase(images)
    
    return {
        "images": image_urls,
        "status": "completed",
        "count": len(images),
        "nsfw_supported": nsfw_supported,  # Log for testing
        "model": "z-image-turbo"
    }


def generate_final(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generate final image with LoRA (if supported)"""
    prompt = input_data["prompt"]
    lora_path = input_data.get("lora_path")
    nsfw = input_data.get("nsfw", False)
    seed = input_data.get("seed", -1)
    
    pipe = load_pipeline()
    
    # TODO: Load LoRA from lora_path (if Z-Image-Turbo LoRA training works)
    # TODO: Apply LoRA to pipeline
    
    generator = torch.Generator(device="cuda")
    if seed != -1:
        generator.manual_seed(seed)
    else:
        generator.seed()
    
    result = pipe(
        prompt=prompt,
        num_inference_steps=8,
        guidance_scale=1.0,
        generator=generator,
    )
    
    image_url = upload_to_supabase([result.images[0]])
    
    return {
        "image_url": image_url[0],
        "status": "completed",
        "model": "z-image-turbo"
    }


def handler(job: Dict[str, Any]) -> Dict[str, Any]:
    """Main handler function for RunPod serverless"""
    try:
        input_data = job.get("input", {})
        task_type = input_data.get("task_type", "base_image")
        
        print(f"Processing task: {task_type} with Z-Image-Turbo")
        
        if task_type == "base_image":
            return generate_base_image(input_data)
        elif task_type == "final_gen":
            return generate_final(input_data)
        else:
            return {"error": f"Unknown task_type: {task_type}. Z-Image-Turbo supports: base_image, final_gen"}
    
    except Exception as e:
        print(f"Error processing job: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"error": str(e)}


# Start RunPod serverless
if __name__ == "__main__":
    runpod.serverless.start({"handler": handler})

