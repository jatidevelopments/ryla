# IN-028: Model Loading Issue Analysis

> **Date**: 2026-01-27  
> **Status**: 🔍 **INVESTIGATING**

---

## Current Status

### ✅ Completed Fixes

1. **Model Download Order** - Models now download in `@modal.enter()` BEFORE ComfyUI starts
2. **Model Verification** - Added verification to check models exist before starting ComfyUI
3. **Model Copying** - Models are copied (not symlinked) to ComfyUI directories

### ⚠️ Current Issue

**Error**: `Workflow failed at node unknown (unknown): Workflow execution failed`

**Symptoms**:
- Endpoint responds (health check passes)
- Models are downloaded during image build ✅
- Models are downloaded at runtime in `@modal.enter()` ✅
- Model verification runs before ComfyUI starts ✅
- But workflow execution fails with generic error

**Workflow Details**:
- Uses `CLIPLoader` with `type: "lumina2"` parameter
- `CLIPLoader` is NOT detected as a custom node (treated as built-in)
- Custom nodes detected: `BetaSamplingScheduler`, `Sigmas Rescale`, `ClownsharKSampler_Beta` (all from RES4LYF)

---

## Hypothesis

The `CLIPLoader` with `type: "lumina2"` may require a **custom CLIPLoader implementation** that:
1. Is not detected by the workflow analyzer (because `CLIPLoader` is a built-in class name)
2. Might be provided by RES4LYF or another custom node
3. Needs to be explicitly installed/loaded

---

## Next Steps

1. **Check if RES4LYF provides custom CLIPLoader**:
   - Search RES4LYF repository for CLIPLoader implementations
   - Check if `lumina2` type is supported

2. **Improve error reporting**:
   - Add better error messages from ComfyUI execution
   - Query ComfyUI's `/object_info` to see available CLIPLoader nodes
   - Check if `lumina2` type is in the available options

3. **Verify model discovery**:
   - Add debug endpoint to query ComfyUI's model lists
   - Verify `qwen_3_4b.safetensors` appears in CLIPLoader's model list

4. **Check custom node loading**:
   - Verify RES4LYF nodes are loading correctly
   - Check if CLIPLoader is being overridden by a custom node

---

## Related Files

- `scripts/workflow-deployer/generate-modal-code.ts` - Code generator
- `scripts/workflow-deployer/test-denrisi-workflow.json` - Test workflow
- `scripts/generated/workflows/z_image_danrisi_modal.py` - Generated deployment code

---

**Last Updated**: 2026-01-27
