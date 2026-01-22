# Image Quality Improvements

## ✅ Applied Quality Enhancements

### 1. **Higher Resolution**
- **Before**: 1024x1024 pixels
- **After**: 1536x1536 pixels (50% more pixels = 2.25x total resolution)
- **Impact**: More detail, sharper images, better for professional use

### 2. **More Steps**
- **Before**: 20 steps
- **After**: 35 steps (75% increase)
- **Impact**: Better refinement, smoother details, more accurate prompt following

### 3. **Higher CFG Scale**
- **Before**: 1.0
- **After**: 1.5 (50% increase)
- **Impact**: Better prompt adherence, stronger subject focus, more defined features

### 4. **Enhanced Prompts**
- **Added quality keywords**: "masterpiece, best quality, ultra detailed, 8k, professional photography, sharp focus, perfect composition"
- **Enhanced negative prompt**: Added "jpeg artifacts, compression artifacts, lowres, worst quality, normal quality"
- **Impact**: Model generates with quality-focused guidance

## Quality Settings Comparison

| Setting | Standard | High Quality | Ultra Quality |
|---------|----------|--------------|---------------|
| **Resolution** | 1024x1024 | 1536x1536 | 2048x2048 |
| **Steps** | 20 | 35 | 50 |
| **CFG Scale** | 1.0 | 1.5 | 2.0 |
| **Generation Time** | ~30-60s | ~60-90s | ~90-120s |
| **File Size** | ~900KB | ~1MB | ~1.5MB |

## Usage

### High Quality (Default)
```bash
modal run apps/modal/comfyui_danrisi.py::test_workflow \
  --prompt "Your prompt here" \
  --width 1536 \
  --height 1536 \
  --steps 35 \
  --cfg 1.5 \
  --high-quality
```

### Ultra Quality (Maximum)
```bash
modal run apps/modal/comfyui_danrisi.py::test_workflow \
  --prompt "Your prompt here" \
  --width 2048 \
  --height 2048 \
  --steps 50 \
  --cfg 2.0 \
  --high-quality
```

### Standard Quality (Faster)
```bash
modal run apps/modal/comfyui_danrisi.py::test_workflow \
  --prompt "Your prompt here" \
  --width 1024 \
  --height 1024 \
  --steps 20 \
  --cfg 1.0
```

## Quality Tips

1. **Resolution**: Higher resolution = more detail, but longer generation time
   - 1024x1024: Fast, good for testing
   - 1536x1536: Balanced quality/speed (recommended)
   - 2048x2048: Maximum quality, slower

2. **Steps**: More steps = better refinement
   - 20 steps: Fast, good quality
   - 35 steps: High quality (recommended)
   - 50 steps: Maximum quality, diminishing returns

3. **CFG Scale**: Higher CFG = stronger prompt adherence
   - 1.0: Natural, less prompt control
   - 1.5: Balanced (recommended)
   - 2.0: Strong prompt control, may look slightly artificial

4. **Prompt Quality**: Use descriptive, quality-focused prompts
   - Include: "masterpiece, best quality, ultra detailed, 8k"
   - Avoid: Generic terms, conflicting instructions

## Performance Impact

- **Standard (1024x1024, 20 steps)**: ~30-60 seconds
- **High Quality (1536x1536, 35 steps)**: ~60-90 seconds
- **Ultra Quality (2048x2048, 50 steps)**: ~90-120 seconds

## Cost Impact

- Higher resolution and more steps = slightly longer GPU time
- Cost increase: ~2x for high quality, ~3x for ultra quality
- Still very affordable: ~$0.01-0.03 per image

## Next Steps

For even better quality, consider:
1. **Upscaling**: Use post-processing upscaler (SeedVR2, Real-ESRGAN)
2. **Refinement**: Use img2img with low denoise for final polish
3. **LoRA**: Add style-specific LoRAs for consistent quality
4. **Ensemble**: Generate multiple images and select best
