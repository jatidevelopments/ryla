# YouTube Videos Research

Collection of YouTube videos relevant to RYLA project development, with transcripts and summaries.

## Structure

Each video should have its own folder following this structure:

```
youtube-videos/
├── template/              # Template for new videos
│   ├── metadata.md        # Video metadata and summary
│   └── transcript.md      # Full transcript
├── [video-id-1]/          # Individual video folders
│   ├── metadata.md
│   └── transcript.md
└── README.md              # This file
```

## Naming Convention

- Folder names: Use the YouTube video ID (e.g., `vW7ordsP3xA`)
- Files: `metadata.md` and `transcript.md`

## Adding a New Video

1. Create a new folder with the video ID as the name
2. Copy the template files:
   ```bash
   cp -r template/[video-id]/
   ```
3. Fill in `metadata.md` with:
   - Video URL
   - Title
   - Summary
   - Key points
   - Relevance to RYLA
4. Paste the transcript into `transcript.md`
5. Update this README with a link to the new video

## Usage

These videos serve as:

- **Research references** for feature development
- **Learning resources** for team members
- **Documentation** of external knowledge sources
- **Inspiration** for UI/UX patterns and workflows

## Tools

Use the YouTube Tools MCP server to:

- Extract transcripts automatically
- Search for relevant videos
- Get video metadata

## Videos

### Recent Research (Last 1-2 Weeks)

#### [Kling AI Guide: Consistent Characters](./7WcVWq-fcXc/)

- **Published**: Dec 3, 2024
- **Topic**: Creating consistent characters with Kling AI custom model, FreePik, and Flux
- **Relevance**: EP-005 (Content Studio), video generation, character consistency
- **Key Insights**: Multiple workflows compared, FreePik faster for designed characters, training data quality matters

#### [Create Lifelike AI Videos - Consistent Characters](./5ibVBG0TrD8/)

- **Published**: Dec 2, 2024
- **Topic**: Three methods for consistent character videos (Flux PuLID, LoRA training, Kling custom model)
- **Relevance**: EP-005 (Content Studio), model selection, cost optimization
- **Key Insights**: Flux PuLID cheapest ($0.02/gen), LoRA best consistency, cost breakdowns provided

#### [Create Consistent Characters from Input Image with FLUX](./Uls_jXy9RuU/)

- **Published**: Nov 1, 2024
- **Topic**: Advanced ComfyUI workflow using PuLID and ControlNet for character generation
- **Relevance**: EP-005 (Content Studio), technical implementation, character sheet workflow
- **Key Insights**: Automated character sheet generation, PuLID integration, LoRA training setup

#### [Train Cheap LoRA for FLUX](./hIJFub3HvVo/)

- **Published**: Oct 15, 2024
- **Topic**: Cloud-based LoRA training on RunPod (no local GPU needed)
- **Relevance**: EP-005 (Content Studio), cost optimization, training infrastructure
- **Key Insights**: $0.2 per face LoRA, 7 images/700 steps, cloud training workflow

#### [Consistent Face in FLUX using PuLID (No LoRA)](./AvM9IcaGGzQ/)

- **Published**: Oct 11, 2024
- **Topic**: Single-image consistent face generation without LoRA training
- **Relevance**: EP-005 (Content Studio), quick prototyping, low-resource setup
- **Key Insights**: Works on 8GB VRAM, single image input, no training time

### Recent Additions (January 2025)

#### [Hyperrealistic Consistent Characters Workflow](./PhiPASFYBmk/)

- **Published**: Jan 2025
- **Topic**: Complete end-to-end workflow for creating hyperrealistic, consistent characters using free open-source models (Gwen Image Edit, LoRA training, One 2.2 video generation)
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), dataset creation, LoRA training, upscaling, video generation
- **Key Insights**: ✅ Gwen Image Edit as free alternative to censored tools, automated dataset creation with captions, Flux+Yuzo upscaling fixes "plastic" skin, AI Toolkit on RunPod for LoRA training (~$4/LoRA), One 2.2 for unified image+video generation, Light X LoRAs for 4-step speed optimization (53s vs 162s)

### Recent Additions (December 2025)

#### [Seedream 4.5 Deep Dive](./I5wn8WfaT_U/)

- **Published**: Dec 2025
- **Topic**: Comprehensive deep dive into Seedream 4.5 with 7 real-world use cases
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), base image generation, character consistency, text rendering
- **Key Insights**: ✅ Seedream 4.5 has enhanced text rendering (readable text), multi-image editing (up to 10 references), 4K resolution, better prompt adherence, precise image editing. Access via Chat LLM Teams ($10/month) or API. Better than Nano Banana Pro for text rendering and multi-image editing.

#### [Seedream 4.5: Precise Editing](./NPrpg-HxSns/)

- **Published**: Dec 2025
- **Topic**: Seedream 4.5 improvements focusing on precise image editing and cinematic quality
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), character sheet generation, image editing, skin enhancement
- **Key Insights**: ✅ Seedream 4.5 has higher success rate, better face rendering, incredible textures/grain, precise editing (hairstyle, makeup, age, eye color, beard), cinematic quality, better than Nano Banana Pro for crispness and cinematic feel.

#### [Qwen Image LoRA Workflow with ControlNet](./s1HBkfBMcho/)

- **Published**: Dec 2025
- **Topic**: Advanced Qwen Image workflow with ControlNet, depth maps, face detailer
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), Qwen-Image LoRA training, quality improvements
- **Key Insights**: ✅ Qwen-Image LoRA training works. Excellent skin quality and facial consistency. ControlNet for pose control. Depth maps and face detailer improve quality. Two-pass sampling for higher quality.

#### [Complete LoRA Training Guide](./WUWGZt2UwO0/)

- **Published**: Dec 2025
- **Topic**: Step-by-step LoRA training guide for AI influencers
- **Relevance**: EP-005 (Content Studio), LoRA training, dataset creation, base image generation
- **Key Insights**: ✅ cDream v4 recommended for base images ($0.03/image, excellent quality). Dataset: 70% upper body/face, 20% portrait, 10% full body. fal.ai 1.2.2 trainer is simple and effective. Need 30 images for optimal training.

#### [Nano Banana Pro Overview](./Up1sgf1QTTU/)

- **Published**: Dec 2025
- **Topic**: Nano Banana Pro for consistent characters without LoRA
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), character consistency, base image generation
- **Key Insights**: ⚠️ Nano Banana Pro can generate consistent characters without LoRA, but **no NSFW support** (closed source) and **expensive** ($0.15/image). Good for quick testing via Google Gemini (free, limited). Not cost-effective for production.

#### [Create Realistic Talking AI Avatar](./NpfEKTXBxrY/)

- **Published**: Dec 2025
- **Topic**: Complete workflow for creating realistic, consistent AI influencers
- **Relevance**: EP-001 (Influencer Wizard), EP-005 (Content Studio), base image quality, skin enhancement
- **Key Insights**: ⚠️ **CRITICAL**: Source image quality is most important. Enhance skin BEFORE generating variations (carries through). Use "amateur photo camera style" (not "iPhone"). Clean white background for base images.

#### [Train Z-Image-Turbo LoRA with AI Toolkit](./Kmve1_jiDpQ/)

- **Published**: Dec 2025
- **Topic**: Training Z-Image-Turbo LoRAs using AI Toolkit with training adapter
- **Relevance**: EP-005 (Content Studio), LoRA training infrastructure, RunPod integration
- **Key Insights**: ✅ AI Toolkit recommended for Z-Image-Turbo training. Built-in training adapter prevents distillation breakdown. Works on RunPod. 1.3s per iteration. 17GB VRAM. Supports both Flux and Z-Image.

#### [Z-Image Turbo: LoRA Training & ControlNet](./DYzHAX15QL4/)

- **Published**: Dec 2025
- **Topic**: Z-Image-Turbo tutorial with **proven LoRA training** for character consistency
- **Relevance**: EP-005 (Content Studio), model selection, LoRA training, character consistency
- **Key Insights**: ✅ LoRA training works! 15 images, $2.26, 15-20 min. Character consistency proven. ControlNet works for poses. 6-7s generation time.

#### [Z-Image: The Most Incredible Checkpoint](./dMYRYJS7x8o/)

- **Published**: Dec 2025
- **Topic**: Z-Image-Turbo model review - ultra-fast image generation (10 seconds, 9 steps)
- **Relevance**: EP-005 (Content Studio), model selection, speed optimization
- **Key Insights**: 8-9 steps for high quality, works on 16GB VRAM, potential Flux alternative

#### [Z-Image Turbo Setup Walkthrough (RunPod + ComfyUI)](./-u9VLMVwDXM/)

- **Published**: Unknown (not captured)
- **Topic**: End-to-end Z-Image-Turbo setup via RunPod + ComfyUI workflow JSON + install script (models/VAEs/text encoders/custom nodes)
- **Relevance**: EP-005 (Content Studio), Z-Image serverless validation, ops checklist
- **Key Insights**: Claims strong prompt adherence + fast generation; calls out accurate text rendering; setup requires more than a single checkpoint (encoders/VAEs/nodes).

#### [AI Influencer Monetization Strategies](./UgFIafj-qu0/)

- **Published**: Dec 2025
- **Topic**: Two business models for AI influencer monetization (brand building vs. cash flow)
- **Relevance**: Business model validation, monetization strategies, market opportunity
- **Key Insights**: 90% fail due to character consistency, early adopter window, 7-figure potential

### Earlier Research

#### [Face Swap Techniques Comparison](./vW7ordsP3xA/)

- **Topic**: AI face swap techniques (Hyperlora, Instant ID, Pool ID, ASAP Plus)
- **Relevance**: EP-005 (Content Studio), character generation
- **Key Insights**: Different techniques excel in different scenarios (angles, blocked faces, lighting)
