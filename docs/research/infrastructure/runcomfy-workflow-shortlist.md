# RunComfy Workflow Shortlist for RYLA (IN-038)

Auto-generated from catalog by `scripts/runcomfy-tag-workflows-for-ryla.ts`.

## Summary by category

| Category         | Count | RYLA priority |
| ---------------- | ----- | ------------- |
| other            | 104   | P2            |
| video_t2v        | 77    | P0            |
| t2i              | 57    | P0            |
| upscale          | 11    | P1            |
| image_edit       | 9     | P0            |
| face_consistency | 9     | P0            |
| lora             | 9     | P0            |
| video_i2v        | 7     | P0            |
| face_swap        | 7     | P1            |

## P0 / P1 workflows (candidates for RYLA)

- **AnimateDiff + Batch Prompt Schedule | Text to Video** — `comfyui-animatediff-prompt-travel-prompt-schedule-workflow-text2video` [video_t2v] P0
- **AnimateDiff + Dynamic Prompts | Text to Video** — `comfyui-animatediff-and-dynamic-prompts-workflow-dynamic-animation` [video_t2v] P0
- **AnimateDiff + ControlNet TimeStep KeyFrame | Morphing Animation** — `comfyui-animatediff-and-controlnet-workflow-morphing-animation` [video_t2v] P0
- **ControlNet Tile + 4x UltraSharp | Image/Video Upscaler** — `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp` [upscale] P1
- **SDXL Turbo | Rapid Text to Image** — `text-to-image-with-sdxl-turbo` [t2i] P0
- **Outpainting | Expand Image** — `comfyui-image-outpainting-workflow` [image_edit] P0
- **Portrait Master | Text to Portrait** — `create-stunning-portraits-with-comfyui-portrait-master` [t2i] P0
- **SVD (Stable Video Diffusion) + SD | Text to Video** — `comfyui-stable-video-diffusion-svd-workflow-text2video` [video_t2v] P0
- **SVD + FreeU | Image to Video** — `comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video` [video_i2v] P0
- **SVD + IPAdapter V1 | Image to Video** — `comfyui-ipadapter-and-svd-workflow` [video_t2v] P0
- **Animatediff V2 & V3 | Text to Video** — `comfyui-animatediff-workflow-stable-diffusion-animation` [video_t2v] P0
- **AnimateDiff + Batch Prompt Schedule | Text to Video** — `animatediff-batch-prompt-schedule` [video_t2v] P0
- **AnimateDiff + IPAdapter V1 | Image to Video** — `comfyui-animatediff-and-ipadapter-workflow-stable-diffusion-animation` [video_t2v] P0
- **IPAdapter V1 FaceID Plus | Consistent Characters** — `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus` [face_consistency] P0
- **Face Detailer | Fix Faces** — `face-detailer-comfyui-workflow-fix-face` [upscale] P1
- **Stable Cascade | Text to Image** — `stable-cascade-workflow-in-comfyui` [t2i] P0
- **Face Restore + ControlNet + Reactor | Restore Old Photos** — `restore-old-photos-using-comfyui` [face_swap] P1
- **InstantID | Portraits to Art** — `comfyui-instantid-workflow` [face_consistency] P0
- **InstantID | Face to Sticker** — `create-dynamic-stickers-with-instantid-ipadapter` [face_consistency] P0
- **AnimateLCM | Speed Up Text to Video** — `comfyui-animatelcm-workflow` [video_t2v] P0
- **IPAdapter V1 + AnimateDiff + ControlNet | Motion Art** — `innovative-motion-art-with-ipadapter-in-comfyui` [video_t2v] P0
- **AnimateDiff + AutoMask + ControlNet | Visual Effects (VFX)** — `comfyui-vfx-workflow-mastering-animatediff-automask-controlnet` [video_t2v] P0
- **APISR | Anime Image/Video Upscaler** — `apisr-in-comfyui-anime-image-super-resolution` [upscale] P1
- **AnimateDiff + QR Code ControlNet | Visual Effects (VFX)** — `ai-vfx-using-comfyui-animatediff-workflow-for-visual-effects` [video_t2v] P0
- **CCSR | Consistent Image/Video Upscaler** — `ccsr-in-comfyui-consistent-image-video-upscaling` [upscale] P1
- **AnimateDiff + ControlNet + IPAdapter V1 | Adventure Game Style** — `convert-video-to-adventure-game-style-using-animatediff-controlnet-ipadapter-in-comfyui` [video_t2v] P0
- **AnimateDiff + ControlNet + IPAdapter V1 | Flat Anime St"])</script><script>self.\_\_next_f.push([1,"yle** — `transform-video-into-flat-anime-style-using-animatediff-controlnet-in-comfyui` [video_t2v] P0
- **AnimateDiff + ControlNet + IPAdapter V1 | Japanese Anime Style** — `convert-video-to-japanese-anime-style-using-animatediff-controlnet-ipadapter-in-comfyui` [video_t2v] P0
- **SUPIR | Photo-Realistic Image/Video Upscaler** — `supir-in-comfyui-realistic-image-video-upscaling` [upscale] P1
- **AnimateDiff + ControlNet | Cartoon Style** — `comfyui-animatediff-and-cont"])</script><script>self.__next_f.push([1,"rolnet-workflow-video2video` [video_t2v] P0
- **AnimateDiff + ControlNet | Cartoon Style** — `comfyui-animatediff-and-controlnet-workflow-video2video` [video_t2v] P0
- **AnimateDiff + ControlNet + IPAdapter V1 | Cartoon Style** — `comfyui-animatediff-controlnet-and-ipadapter-workflow-video2video` [video_t2v] P0
- **AnimateDiff + ControlNet | Marble Sculpture Style** — `transform-video-into-marble-sculpture-style-using-animatediff-controlnet-within-comfyui` [video_t2v] P0
- **AnimateDiff + ControlNet | Ceramic Art Style** — `transform-video-into-ceramic-art-style-using-animatediff-controlnet-within-comfyui` [video_t2v] P0
- **IPAdapter Plus (V2) Attention Mask | Image to Video** — `comfyui-ipadapter-plus-attention-mask` [video_i2v] P0
- **IPAdapter Plus (V2) + ControlNet | Image to Video** — `use-ipadapter-plus-with-qrcode-for-dynamic-animation` [video_i2v] P0
- **PuLID | Accurate Face Embedding for Text to Image** — `comfyui-pulid-customized-face-generation` [t2i] P0
- **Stable Diffusion 3 (SD3) | Text to Image** — `leverage-stable-diffusion-3-for-advanced-visuals` [t2i] P0
- **Face to Many | 3D, Emoji, Pixel, Clay, Toy, Video game** — `comfyui-face-to-many` [face_consistency] P0
- **ComfyUI Img2Vid | Morphing Animation** — `comfyui-img2vid-workflow-for-morphing-animation` [video_t2v] P0
- **CogVideoX-5B | Advanced Text-to-Video Model** — `cogvideox5b-text-to-video-model-available-in-comfyui` [video_t2v] P0
- **FLUX NF4 | Speed Up FLUX ImgGen** — `comfyui-flux-nf4-workflow` [t2i] P0
- **FLUX IPAdapter V1 | XLabs** — `comfyui-flux-ipadapter` [t2i] P0
- **Mochi 1 | Genmo Text-to-Video** — `mochi1-genmo-video-generation` [video_t2v] P0
- **FLUX Outpainting** — `flux-outpainting-flawlessly-aligned-with-original-image` [t2i] P0
- **FLUX Controlnet Inpainting** — `flux-controlnet-inpainting-image-repair` [t2i] P0
- **Pyramid Flow | Video Generation** — `pyramid-flow-video-generation` [video_t2v] P0
- **Flu"])</script><script>self.\_\_next_f.push([1,"x & 10 In-Context LoRA Models** — `flux-in-context-lora` [t2i] P0
- **LivePortrait | Animate Portraits | Img2Vid** — `comfyui-liveportrait-workflow-animate-portraits` [video_i2v] P0
- **IC-Light | Video Relighting | AnimateDiff** — `comfyui-ic-light-workflow-for-video-relighting` [video_t2v] P0
- **CogVideoX Tora | Image-to-Video Model** — `cogvideox-tora-image-to-video-model` [video_i2v] P0
- **Hunyuan3D-1 | ComfyUI 3D Pack** — `hunyuan3d-for-3d-asset-generation` [t2i] P0
- **ReActor | Fast Face Swap** — `comfyui-reactor-workflow-fast-face-swap` [face_swap] P1
- **CogvideoX Fun | Video-to-Video Model** — `cogvideox-fun-video-to-video-model` [video_t2v] P0
- **FLUX Inpainting | Seamless Image Editing** — `comfyui-flux-inpainting-workflow` [t2i] P0
- **Flux Consistent Characters | Input Text** — `consistent-characters-with-flux-comfyui-workflow` [face_consistency] P0
- **Flux Consistent Characters | Input Text** — `8k-image-upscaling-supir-4x-foolhardy-remacri` [t2i] P0
- **FLUX | A New Art Image Generation** — `comfyui-flux-a-new-art-image-generation` [t2i] P0
- **Flux Redux | Variation and Restyling** — `flux-tools-flux1-redux-for-image-variation-and-restyling` [t2i] P0
- **AnimateDiff + ControlNet + AutoMask | Comic Style** — `comfyui-animatediff-controlnet-and-auto-mask-workflow-video2video` [video_t2v] P0
- **MimicMotion | Human Motion Video Generation** — `comfyui-mimicmotion-workflow-human-motion-video-generation` [video_t2v] P0
- **FLUX LoRA Training** — `comfyui-flux-lora-training-detailed-guides` [lora] P0
- **FLUX LoRA (RealismLoRA) | Photorealistic Images** — `comfyui-flux-realismlora-workflow-photorealistic-ai-images` [t2i] P0
- **Hunyuan Video | Video to Video** — `hunyuan-video-to-video` [video_t2v] P0
- **Dance Video Transform | Scene Customization & Face Swap** — `dance-video-transform-scene-customization-face-swap` [face_swap] P1
- **Janus-Pro | T2I + I2T Model** — `januspro-text-to-image-image-to-text-model` [t2i] P0
- **LTX Video | Image+Text "])</script><script>self.\_\_next_f.push([1,"to Video** — `ltx-video-text-and-image-text-to-video-Generation` [video_t2v] P0
- **Flux Upscaler - Ultimate 32k | Image Upscaler** — `flux-upscaler-4k-8k-16k-32k-image-upscaler` [t2i] P0
- **Flux Fill | Inpaint and Outpaint** — `Flux-tools-Flux1-fill-for-inpainting-and-outpainting` [image_edit] P0
- **Flux PuLID for Face Swapping** — `realistic-face-swapping-with-flux-pulid` [face_consistency] P0
- **Nvidia Cosmos | Text"])</script><script>self.\_\_next_f.push([1," & Image to Video Creation** — `nvidia-cosmos-text-or-image-to-video-workflow-in-comfyUI-video-generation` [video_i2v] P0
- **Flux Consistent Characters | Input Image** — `flux-consistent-characters-input-image` [t2i] P0
- **Hunyuan Video | Image-Prompt to Video** — `hunyuan-video-image-prompt-to-video` [t2i] P0
- **Hunyuan Video | Text to Video** — `hunyuan-video-video-generation` [video_t2v] P0
- **Hunyuan3D-2 | Leading-edge 3D Assets Generator** — `hunyuan3d-2-workflow-in-comfyui-create-3d-assets-from-images` [t2i] P0
- **ReActor | Fast Face Swap** — `comfyui-reactor-face-swap-professional-ai-face-animation` [face_swap] P1
- **ReActor | Fast Face Swap** — `"])</script><script>self.__next_f.push([1,"comfyui-reactor-face-swap-professional-ai-face-animation` [face_swap] P1
- **DiffuEraser | Video Inpainting** — `diffueraser-workflow-in-comfyui-video-inpainting-with-automated-mask-generation` [image_edit] P0
- **AP Workflow 12.0 | Ready-to-Use Complete AI Media Suite** — `ap-workflow-for-comfyui-ready-to-use-online-solution` [video_t2v] P0
- **Hunyuan LoRA** — `hunyuan-lora-custom-loras` [video_t2v] P0
- ... and 106 more (see JSON).

## Full data

See `runcomfy-workflow-shortlist.json`.
