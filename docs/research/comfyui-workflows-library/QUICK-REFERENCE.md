# ComfyUI Wiki Workflows - Quick Reference for RYLA MVP

> **Quick lookup guide** for workflows relevant to RYLA MVP

---

## 🎯 MVP-Relevant Workflows

### ✅ Priority 1: Core T2I

**Flux Dev T2I** → `flux/text_to_image/flux_dev_t5fp16.json`
- **Why**: RYLA uses Flux Dev as primary model
- **Action**: Use as base workflow reference
- **Status**: ✅ Ready to use

---

### ⚠️ Priority 2: LoRA Patterns

**Wan 2.1 LoRA** → `video/wan2.1_lora/wan2.1_lora_comfyui_native.json`
- **Why**: Reference for LoRA integration patterns
- **Action**: Extract LoRA loading/application pattern
- **Status**: ⚠️ Reference only (different model, but pattern applies)

---

### ⚠️ Priority 3: Post-Processing (Future)

**Flux Inpaint** → `flux/inpaint/inpaint.json`
- **Why**: Useful for quality improvement
- **Action**: Document for Phase 1.5
- **Status**: ⚠️ Not MVP critical

---

## ❌ Not Relevant for MVP

- **Video workflows** (`video/`) - Phase 2+ feature
- **3D workflows** (`3d/`) - Not in scope
- **Audio workflows** (`audio/`) - Not in scope
- **HIDream workflows** - Different model architecture
- **HunyuanVideo** - Different model, Phase 2+

---

## 📋 Workflow Location

All workflows are in: `libs/comfyui-workflows/`

**Recommended workflow**: `flux/text_to_image/flux_dev_t5fp16.json`

---

## 🔗 Full Analysis

See `COMFYUI-WIKI-WORKFLOWS-ANALYSIS.md` for complete analysis.

