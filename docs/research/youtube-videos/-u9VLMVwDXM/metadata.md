# Z-Image Turbo setup on RunPod + ComfyUI (uncensored/prompt generator workflow)

> **URL**: https://www.youtube.com/watch?v=-u9VLMVwDXM  
> **Video ID**: -u9VLMVwDXM  
> **Date Added**: 2025-12-17  
> **Date Updated**: 2025-12-21  
> **Duration**: 10:12  
> **Channel**: (unknown)

## Assets Extracted

| File | Description |
|------|-------------|
| `download_zimage_danrisi_models_script.sh` | Model download script (~21 GB total) |
| `Z-Image_Danrisi_modified_loaders.json` | ComfyUI workflow with optimized samplers |
| `analysis.md` | Technical analysis and RYLA implications |
| `transcript.md` | Full video transcript |

## Summary

This video is a practical setup walkthrough for **Z-Image-Turbo** using **RunPod + ComfyUI**. The creator positions Z-Image-Turbo as a fast, prompt-faithful model ("generated in seconds") that may look less recognizable than common influencer-gen baselines (Flux/Seedream), and calls out a specific strength: **accurate text rendering on objects** (e.g., readable text on a shirt).

Operationally, the video emphasizes that “setup” is more than a single checkpoint: the workflow relies on **ComfyUI + custom nodes** and an install script that downloads required **models / VAEs / text encoders** so you don’t have to hunt assets manually. The workflow is imported as a JSON into ComfyUI, missing nodes are installed via ComfyUI Manager, then the user runs generation. Turbo is described as the "least powerful" variant; the creator expects Base/Edit variants to outperform it when released.

## Key Points

- Z-Image-Turbo is framed as **very fast** and **high prompt adherence**.
- Claims **strong text rendering** (readable text on objects/clothing).
- Setup path: **RunPod pod template + ComfyUI Manager + workflow JSON + install script** for nodes/models.
- Notes an **“uncensored”** positioning and pairs prompting with a separate prompt generator.
- Turbo quality isn’t always perfect; expectation that **Base/Edit** will be substantially better.

## Relevance to RYLA

- Relates to **EP-005 (Content Studio)** and our model selection strategy: Z-Image-Turbo as a speed/cost lever for base image generation.
- Confirms that the ecosystem’s “standard” usage is **ComfyUI workflow-driven** (assets + nodes), which matters for how we validate/ship our RunPod serverless path.
- Highlights a concrete product value prop we can lean into: **text-on-image** (branded posts, merch, memes).

## Tags

#youtube #research #z-image-turbo #comfyui #runpod #image-generation #prompt-adherence #text-rendering #ep-005
