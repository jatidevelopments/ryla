"""
CivitAI Model Catalog and Download Utility.

Provides functions for downloading models from CivitAI and a catalog of
curated models for RYLA's image generation endpoints.
"""

import os
import urllib.request
from pathlib import Path
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class ModelType(Enum):
    CHECKPOINT = "checkpoint"
    LORA = "lora"
    WORKFLOW = "workflow"


class BaseModel(Enum):
    SDXL = "sdxl"
    FLUX = "flux"
    Z_IMAGE_TURBO = "zit"
    Z_IMAGE_BASE = "zib"
    WAN = "wan"
    LTX = "ltx"
    QWEN = "qwen"


@dataclass
class CivitAIModel:
    """Represents a CivitAI model."""
    id: str
    name: str
    model_type: ModelType
    base_model: BaseModel
    civitai_url: str
    download_url: Optional[str] = None  # Direct download URL
    filename: Optional[str] = None
    is_nsfw: bool = False
    trigger_word: Optional[str] = None
    recommended_strength: float = 0.8
    description: str = ""


# =============================================================================
# CURATED MODEL CATALOG
# =============================================================================

# =============================================================================
# Z-IMAGE TURBO MODELS (from CivitAI list)
# =============================================================================

Z_IMAGE_LORAS = {
    "realistic-snapshot-zit": CivitAIModel(
        id="civitai-realistic-snapshot-zit",
        name="Realistic Snapshot (Z-Image-Turbo) v5",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2268008/realistic-snapshot-z-image-turbo",
        download_url="https://civitai.com/api/download/models/2555248",  # v5
        filename="realistic-snapshot-zit.safetensors",
        is_nsfw=False,
        trigger_word="realistic snapshot",
        recommended_strength=0.85,
        description="Enhances realism for Z-Image-Turbo",
    ),
    "instagramification": CivitAIModel(
        id="civitai-instagramification",
        name="Instagramification (Z-turbo pruned)",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/1379962/instagramification",
        download_url="https://civitai.com/api/download/models/1548658",
        filename="instagramification.safetensors",
        is_nsfw=False,
        trigger_word="instagram style",
        recommended_strength=0.8,
        description="Instagram influencer style enhancement",
    ),
    "cinematic-kodak-zit": CivitAIModel(
        id="civitai-cinematic-kodak-zit",
        name="Cinematic Kodak Film Still ZIT",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/235495/cinematic-kodak-motion-picture-film-still-style-xl-f1d-illu-pony-zit",
        download_url="https://civitai.com/api/download/models/2253716",
        filename="cinematic-kodak-zit.safetensors",
        is_nsfw=False,
        trigger_word="kodak film still",
        recommended_strength=0.75,
        description="Cinematic Kodak motion picture film look",
    ),
    "rembrandt-lighting-zit": CivitAIModel(
        id="civitai-rembrandt-lighting-zit",
        name="Rembrandt Low Key Lighting ZIT",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/280454/rembrandt-low-key-lighting-style-xl-sd15-f1d-illu-pony-zit",
        download_url="https://civitai.com/api/download/models/2249268",
        filename="rembrandt-lighting-zit.safetensors",
        is_nsfw=False,
        trigger_word="rembrandt lighting",
        recommended_strength=0.7,
        description="Professional Rembrandt-style dramatic lighting",
    ),
    "candid-instax-zit": CivitAIModel(
        id="civitai-candid-instax-zit",
        name="Candid Instax Photo ZIT",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/1683324/candid-instax-photo",
        download_url="https://civitai.com/api/download/models/1887346",
        filename="candid-instax-zit.safetensors",
        is_nsfw=False,
        trigger_word="instax photo",
        recommended_strength=0.8,
        description="Candid Polaroid/Instax photo style",
    ),
    "expressions-zit": CivitAIModel(
        id="civitai-expressions-zit",
        name="Facial Expressions ZIT",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/541620/facial-expressions-realistic-anime-detailed-emotions-style-xl-sd15-f1d-illu-pony-zit",
        download_url="https://civitai.com/api/download/models/2249270",
        filename="expressions-zit.safetensors",
        is_nsfw=False,
        trigger_word="",
        recommended_strength=0.6,
        description="Enhanced facial expressions and emotions",
    ),
    "dark-beast-zit": CivitAIModel(
        id="civitai-dark-beast-zit",
        name="Dark Beast Z / DBZ",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2242173/dark-beast-z-or-dbz-or-updated-jan-26-26or-latest-dbziturbofinal-iv",
        download_url="https://civitai.com/api/download/models/2546952",
        filename="dark-beast-zit.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="Dark artistic style for ZIT",
    ),
    "famegrid-zit": CivitAIModel(
        id="civitai-famegrid-zit",
        name="Famegrid 2nd Gen Z-Image Spicy",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2088956/famegrid-2nd-gen-z-image-qwen",
        download_url="https://civitai.com/api/download/models/2337520",
        filename="famegrid-zit.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="Famegrid influencer style",
    ),
}

# Z-Image Turbo NSFW LoRAs
Z_IMAGE_NSFW_LORAS = {
    "nsfw-master-zit": CivitAIModel(
        id="civitai-nsfw-master-zit",
        name="NSFW Master Flux Z-Image Turbo",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/667086/nsfw-master-flux",
        download_url="https://civitai.com/api/download/models/2160658",
        filename="nsfw-master-zit.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="NSFW enhancement for Z-Image-Turbo",
    ),
    "zimage-turbo-nsfw": CivitAIModel(
        id="civitai-zimage-turbo-nsfw",
        name="ZImage Turbo NSFW by Stable Yogi",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2221503/zimage-turbo-nsfw-by-stable-yogi",
        download_url="https://civitai.com/api/download/models/2496464",
        filename="zimage-turbo-nsfw.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.85,
        description="NSFW enhancement for Z-Image-Turbo by Stable Yogi",
    ),
    "zit-mystic-xxx": CivitAIModel(
        id="civitai-zit-mystic-xxx",
        name="Zit Mystic XXX",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2206377/zit-mystic-xxx",
        download_url="https://civitai.com/api/download/models/2492940",
        filename="zit-mystic-xxx.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="Mystic artistic NSFW style",
    ),
    "turbo-pussy-z": CivitAIModel(
        id="civitai-turbo-pussy-z",
        name="Turbo Pussy Z v2.0",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2178383/turbo-pussy-z",
        download_url="https://civitai.com/api/download/models/2476204",
        filename="turbo-pussy-z.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.75,
        description="Adult anatomy enhancement",
    ),
    "feet-zit": CivitAIModel(
        id="civitai-feet-zit",
        name="Feet ZIT v2.1",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/200251/feet-xl-sd-15-f1d-pony-illustrious-zit",
        download_url="https://civitai.com/api/download/models/2249288",
        filename="feet-zit.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.7,
        description="Feet detail enhancement",
    ),
}

# Z-Image Turbo Checkpoints
Z_IMAGE_CHECKPOINTS = {
    "gonzalomo-zpop": CivitAIModel(
        id="civitai-gonzalomo-zpop",
        name="GonzaLomo ZPop v3.0 AIO",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2192562/gonzalomo-zpop",
        download_url="https://civitai.com/api/download/models/2467988",
        filename="gonzalomo-zpop.safetensors",
        is_nsfw=False,
        description="High-quality Z-Image-Turbo checkpoint",
    ),
    "jib-mix-zit": CivitAIModel(
        id="civitai-jib-mix-zit",
        name="Jib Mix ZIT v2.0",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2231351/jib-mix-zit",
        download_url="https://civitai.com/api/download/models/2505452",
        filename="jib-mix-zit.safetensors",
        is_nsfw=False,
        description="Jib Mix for Z-Image-Turbo",
    ),
    "diving-zit-asian": CivitAIModel(
        id="civitai-diving-zit-asian",
        name="Diving Z-Image Turbo Real Asian",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2276359/diving-z-image-turbo-real-asian",
        download_url="https://civitai.com/api/download/models/2555320",
        filename="diving-zit-asian.safetensors",
        is_nsfw=False,
        description="Optimized for Asian features",
    ),
}

# =============================================================================
# SFW Realism Models (SDXL)
# =============================================================================

# SFW Realism Models (High Priority)
SFW_REALISM_MODELS = {
    "intorealism-ultra": CivitAIModel(
        id="civitai-intorealism-ultra",
        name="IntoRealism Ultra",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.SDXL,
        civitai_url="https://civitai.com/models/1950841/intorealism-ultra",
        filename="intorealism-ultra.safetensors",
        is_nsfw=False,
        description="Ultra-realistic SDXL checkpoint for photorealistic generation",
    ),
    "intorealism-xl": CivitAIModel(
        id="civitai-intorealism-xl",
        name="IntoRealism XL",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.SDXL,
        civitai_url="https://civitai.com/models/1609320/intorealism-xl",
        filename="intorealism-xl.safetensors",
        is_nsfw=False,
        description="High-quality realistic SDXL checkpoint",
    ),
    "realistic-snapshot-zit": CivitAIModel(
        id="civitai-realistic-snapshot-zit",
        name="Realistic Snapshot (Z-Image-Turbo)",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2268008/realistic-snapshot-z-image-turbo",
        filename="realistic-snapshot-zit.safetensors",
        is_nsfw=False,
        trigger_word="realistic snapshot",
        recommended_strength=0.85,
        description="Enhances realism for Z-Image-Turbo",
    ),
    "instagramification": CivitAIModel(
        id="civitai-instagramification",
        name="Instagramification",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/1379962/instagramification",
        filename="instagramification.safetensors",
        is_nsfw=False,
        trigger_word="instagram style",
        recommended_strength=0.8,
        description="Instagram influencer style enhancement",
    ),
    "cinematic-kodak": CivitAIModel(
        id="civitai-cinematic-kodak",
        name="Cinematic Kodak Film Still",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/235495/cinematic-kodak-motion-picture-film-still-style-xl-f1d-illu-pony-zit",
        filename="cinematic-kodak.safetensors",
        is_nsfw=False,
        trigger_word="kodak film still",
        recommended_strength=0.75,
        description="Cinematic Kodak motion picture film look",
    ),
    "rembrandt-lighting": CivitAIModel(
        id="civitai-rembrandt-lighting",
        name="Rembrandt Low Key Lighting",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/280454/rembrandt-low-key-lighting-style-xl-sd15-f1d-illu-pony-zit",
        filename="rembrandt-lighting.safetensors",
        is_nsfw=False,
        trigger_word="rembrandt lighting",
        recommended_strength=0.7,
        description="Professional Rembrandt-style dramatic lighting",
    ),
    "candid-instax": CivitAIModel(
        id="civitai-candid-instax",
        name="Candid Instax Photo",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/1683324/candid-instax-photo",
        filename="candid-instax.safetensors",
        is_nsfw=False,
        trigger_word="instax photo",
        recommended_strength=0.8,
        description="Candid Polaroid/Instax photo style",
    ),
    "expressions-zit": CivitAIModel(
        id="civitai-expressions-zit",
        name="Facial Expressions",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/541620/facial-expressions-realistic-anime-detailed-emotions-style-xl-sd15-f1d-illu-pony-zit",
        filename="expressions-zit.safetensors",
        is_nsfw=False,
        trigger_word="",  # Uses expression keywords directly
        recommended_strength=0.6,
        description="Enhanced facial expressions and emotions",
    ),
}

# NSFW Models (Only loaded when NSFW flag is True)
NSFW_MODELS = {
    "nsfw-master-flux": CivitAIModel(
        id="civitai-nsfw-master-flux",
        name="NSFW Master Flux",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/667086/nsfw-master-flux",
        filename="nsfw-master-flux.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="NSFW enhancement for Z-Image-Turbo",
    ),
    "zimage-turbo-nsfw": CivitAIModel(
        id="civitai-zimage-turbo-nsfw",
        name="ZImage Turbo NSFW",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2221503/zimage-turbo-nsfw-by-stable-yogi",
        filename="zimage-turbo-nsfw.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.85,
        description="NSFW enhancement for Z-Image-Turbo by Stable Yogi",
    ),
    "amateur-nudes": CivitAIModel(
        id="civitai-amateur-nudes",
        name="Amateur Nudes",
        model_type=ModelType.LORA,
        base_model=BaseModel.Z_IMAGE_BASE,
        civitai_url="https://civitai.com/models/764517/amateur-nudes-flux-wan-22-zit-zib",
        filename="amateur-nudes.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.75,
        description="Natural amateur style",
    ),
    "beyond-reality": CivitAIModel(
        id="civitai-beyond-reality",
        name="Beyond Reality",
        model_type=ModelType.LORA,
        base_model=BaseModel.SDXL,
        civitai_url="https://civitai.com/models/1090420/beyond-reality",
        filename="beyond-reality.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="Enhanced realism for adult content",
    ),
    "qwen-4-play": CivitAIModel(
        id="civitai-qwen-4-play",
        name="QWEN 4 PLAY",
        model_type=ModelType.LORA,
        base_model=BaseModel.QWEN,
        civitai_url="https://civitai.com/models/2004155/qwen-4-play-aio-nsfw-qwen-lora-by-dr34msc4pe",
        filename="qwen-4-play.safetensors",
        is_nsfw=True,
        trigger_word="",
        recommended_strength=0.8,
        description="NSFW enhancement for Qwen models",
    ),
}

# Checkpoints (high-quality base models)
CHECKPOINT_MODELS = {
    "gonzalomo-zpop": CivitAIModel(
        id="civitai-gonzalomo-zpop",
        name="GonzaLomo ZPop",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2192562/gonzalomo-zpop",
        filename="gonzalomo-zpop.safetensors",
        is_nsfw=False,
        description="High-quality Z-Image-Turbo checkpoint",
    ),
    "jib-mix-zit": CivitAIModel(
        id="civitai-jib-mix-zit",
        name="Jib Mix ZIT",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2231351/jib-mix-zit",
        filename="jib-mix-zit.safetensors",
        is_nsfw=False,
        description="Jib Mix for Z-Image-Turbo",
    ),
    "diving-zit-asian": CivitAIModel(
        id="civitai-diving-zit-asian",
        name="Diving Z-Image Turbo Real Asian",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.Z_IMAGE_TURBO,
        civitai_url="https://civitai.com/models/2276359/diving-z-image-turbo-real-asian",
        filename="diving-zit-asian.safetensors",
        is_nsfw=False,
        description="Optimized for Asian features",
    ),
    "mop-mix-omnia": CivitAIModel(
        id="civitai-mop-mix-omnia",
        name="MoP Mix Omnia",
        model_type=ModelType.CHECKPOINT,
        base_model=BaseModel.SDXL,
        civitai_url="https://civitai.com/models/2128936/mop-mix",
        filename="mop-mix-omnia.safetensors",
        is_nsfw=False,
        description="Mix of Perfection - versatile SDXL checkpoint",
    ),
}

# All models combined
ALL_MODELS = {
    **Z_IMAGE_LORAS,
    **Z_IMAGE_NSFW_LORAS,
    **Z_IMAGE_CHECKPOINTS,
    **SFW_REALISM_MODELS,
    **NSFW_MODELS,
    **CHECKPOINT_MODELS,
}


def get_zimage_loras(nsfw: bool = False) -> list[CivitAIModel]:
    """Get Z-Image Turbo LoRAs."""
    loras = [m for m in Z_IMAGE_LORAS.values() if not m.is_nsfw]
    if nsfw:
        loras.extend(Z_IMAGE_NSFW_LORAS.values())
    return loras


def get_zimage_checkpoints() -> list[CivitAIModel]:
    """Get Z-Image Turbo checkpoints."""
    return list(Z_IMAGE_CHECKPOINTS.values())


def get_model(model_id: str) -> Optional[CivitAIModel]:
    """Get a model by ID."""
    return ALL_MODELS.get(model_id)


def get_sfw_loras() -> list[CivitAIModel]:
    """Get all SFW LoRAs."""
    return [m for m in SFW_REALISM_MODELS.values() if m.model_type == ModelType.LORA]


def get_nsfw_loras() -> list[CivitAIModel]:
    """Get all NSFW LoRAs."""
    return [m for m in NSFW_MODELS.values() if m.model_type == ModelType.LORA]


def get_loras_for_mode(nsfw: bool = False) -> list[CivitAIModel]:
    """Get LoRAs appropriate for the given mode."""
    loras = get_sfw_loras()
    if nsfw:
        loras.extend(get_nsfw_loras())
    return loras


# =============================================================================
# DOWNLOAD UTILITIES
# =============================================================================

def get_civitai_download_url(model_version_id: str, api_key: Optional[str] = None) -> str:
    """
    Get the download URL for a CivitAI model version.
    
    Args:
        model_version_id: The CivitAI model version ID (from URL)
        api_key: Optional CivitAI API key for accessing restricted models
    
    Returns:
        Direct download URL
    """
    base_url = f"https://civitai.com/api/download/models/{model_version_id}"
    if api_key:
        return f"{base_url}?token={api_key}"
    return base_url


def download_civitai_model(
    model: CivitAIModel,
    target_dir: Path,
    api_key: Optional[str] = None,
) -> Optional[Path]:
    """
    Download a CivitAI model to the target directory.
    
    Args:
        model: CivitAIModel to download
        target_dir: Directory to save the model
        api_key: Optional CivitAI API key
    
    Returns:
        Path to downloaded file, or None if failed
    """
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / model.filename
    
    if target_path.exists():
        print(f"   ✅ {model.name} already exists")
        return target_path
    
    if not model.download_url:
        print(f"   ⚠️  No download URL for {model.name} - manual download required from:")
        print(f"      {model.civitai_url}")
        return None
    
    try:
        print(f"   📥 Downloading {model.name}...")
        
        # Build request with headers
        request = urllib.request.Request(model.download_url)
        request.add_header('User-Agent', 'RYLA-Modal/1.0')
        if api_key:
            request.add_header('Authorization', f'Bearer {api_key}')
        
        with urllib.request.urlopen(request, timeout=600) as response:
            with open(target_path, 'wb') as f:
                f.write(response.read())
        
        print(f"   ✅ {model.name} downloaded ({target_path.stat().st_size / 1024 / 1024:.1f} MB)")
        return target_path
        
    except Exception as e:
        print(f"   ❌ Failed to download {model.name}: {e}")
        if target_path.exists():
            target_path.unlink()
        return None


def setup_civitai_models(
    comfy_dir: Path,
    models: list[CivitAIModel],
    api_key: Optional[str] = None,
) -> dict[str, bool]:
    """
    Download and setup multiple CivitAI models.
    
    Args:
        comfy_dir: ComfyUI directory
        models: List of models to download
        api_key: Optional CivitAI API key
    
    Returns:
        Dict mapping model ID to success status
    """
    results = {}
    
    for model in models:
        # Determine target directory based on model type
        if model.model_type == ModelType.CHECKPOINT:
            target_dir = comfy_dir / "models" / "checkpoints"
        elif model.model_type == ModelType.LORA:
            target_dir = comfy_dir / "models" / "loras"
        else:
            continue
        
        result = download_civitai_model(model, target_dir, api_key)
        results[model.id] = result is not None
    
    return results


# =============================================================================
# LORA STACK BUILDER
# =============================================================================

def build_lora_stack(
    base_loras: list[str],
    nsfw: bool = False,
    style: Optional[str] = None,
) -> list[tuple[str, float, Optional[str]]]:
    """
    Build a LoRA stack based on requirements.
    
    Args:
        base_loras: List of base LoRA IDs to include
        nsfw: Whether to include NSFW LoRAs
        style: Optional style preset (e.g., "cinematic", "instagram", "candid")
    
    Returns:
        List of (lora_filename, strength, trigger_word) tuples
    """
    stack = []
    
    # Add base realism LoRAs
    for lora_id in base_loras:
        model = get_model(lora_id)
        if model and model.model_type == ModelType.LORA:
            if not model.is_nsfw or (model.is_nsfw and nsfw):
                stack.append((model.filename, model.recommended_strength, model.trigger_word))
    
    # Add style LoRA if specified
    style_map = {
        "cinematic": "cinematic-kodak",
        "instagram": "instagramification",
        "candid": "candid-instax",
        "dramatic": "rembrandt-lighting",
    }
    
    if style and style in style_map:
        model = get_model(style_map[style])
        if model:
            stack.append((model.filename, model.recommended_strength, model.trigger_word))
    
    # Add NSFW LoRA if flagged
    if nsfw:
        nsfw_model = get_model("zimage-turbo-nsfw")
        if nsfw_model:
            stack.append((nsfw_model.filename, nsfw_model.recommended_strength, None))
    
    return stack
