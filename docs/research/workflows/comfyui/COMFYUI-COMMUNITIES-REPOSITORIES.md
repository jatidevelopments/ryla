# ComfyUI Workflow Communities & Repositories Research

> **Date**: 2025-01-17  
> **Focus**: NSFW workflows and LoRA model sharing communities  
> **Purpose**: Identify resources for workflow discovery and LoRA integration

---

## Executive Summary

Multiple platforms and communities exist for sharing ComfyUI workflows, with significant activity around NSFW content and LoRA models. Key platforms include SeaArt, OpenArt, Comfy Studio, GitHub, and community forums.

---

## Platform Categories

### 1. Web-Based Workflow Sharing Platforms

#### **SeaArt** (seaart.ai)
- **Focus**: Workflow sharing with NSFW support
- **Key Features**:
  - Workflow detail pages with instructions
  - Downloadable workflow JSON files
  - Model integration guides
- **Notable Workflows**:
  - `Wan 2.2 General NSFW model` - General NSFW LoRA preset integration
  - `Wan 2.2 I2V General NSFW + DREAMLAY` - Image-to-video with multiple LoRAs (up to 15 slots)
  - `Flux-Kontext - NSFW Wan 2.2 Character LoRA Training Image Generation` - Advanced image consistency with flexible LoRA integration
- **Use Case**: Discovery of production-ready NSFW workflows
- **URL**: https://www.seaart.ai

#### **OpenArt** (openart.ai)
- **Focus**: Community-driven workflow sharing
- **Key Features**:
  - User-uploaded workflows
  - Workflow categorization and search
  - Integration with multiple LoRA models
- **Notable Workflows**:
  - `Qwen Edit Plus & SRPO [NSFW]` - Character outfit changes with consistency LoRA
  - `NSFW Infinite Video With ComfyUI Enhanced Version` - Unlimited video generation with Wan2.2 All-In-One-Mage and Next Scene LoRA
- **Use Case**: Finding specialized workflows for specific tasks
- **URL**: https://openart.ai

#### **Comfy Studio** (studio.comfydeploy.com)
- **Focus**: Community workflow exploration
- **Key Features**:
  - Browse and download workflows
  - Community ratings and reviews
  - Workflow inspiration gallery
- **Use Case**: General workflow discovery and inspiration
- **URL**: https://studio.comfydeploy.com

#### **ComfyOnline** (comfyonline.app)
- **Focus**: Custom nodes and tools
- **Key Features**:
  - Custom node library
  - LoRA management tools
- **Notable Tools**:
  - `ComfyUI_LoRA_Sidebar` - Visual library of LoRA models with search and filtering
- **Use Case**: LoRA management and workflow enhancement
- **URL**: https://www.comfyonline.app

---

### 2. GitHub Repositories

#### **Workflow JSON Libraries (Downloadable Collections)**

**ComfyUI Wiki Workflows** (github.com/comfyui-wiki/workflows)
- **Purpose**: Curated collection of workflow JSON files
- **Features**:
  - Direct JSON file downloads
  - Workflow previews and descriptions
  - Organized by category
  - Drag-and-drop import ready
- **Content**: General workflows, some NSFW
- **Use Case**: Quick access to tested workflows
- **URL**: https://github.com/comfyui-wiki/workflows
- **Download**: Clone repo or download individual JSON files
- **Status**: ✅ **Cloned in RYLA repo at `libs/comfyui-workflows/`**

**Comfy Workflows** (comfyworkflows.com)
- **Purpose**: Community workflow sharing platform
- **Features**:
  - Thousands of downloadable workflows
  - Search and filter functionality
  - Direct JSON download
  - Community ratings
- **Content**: Wide variety including NSFW
- **Use Case**: Discovering and downloading workflows
- **URL**: https://comfyworkflows.com
- **Download**: Direct download from workflow pages

#### **Custom Nodes & Tools**

**ComfyUI_LoRA_Sidebar** (github.com/Kinglord/ComfyUI_LoRA_Sidebar)
- **Purpose**: Visual LoRA library management
- **Features**:
  - Automatic visual library generation
  - Fast search and filtering
  - Filter by base model
  - Drag-and-drop to create/update LoRA nodes
- **Use Case**: Managing large LoRA collections efficiently
- **Status**: Active development

**nsfw_No** (github.com/chaorenai/nsfw_No)
- **Purpose**: NSFW content filtering/replacement
- **Features**:
  - Custom node for filtering NSFW content
  - Batch processing support
  - Content replacement options
- **Use Case**: Content moderation in workflows
- **Status**: Active

#### **Workflow Collections**
- Many developers share workflow JSON files in GitHub repos
- Search: `comfyui workflow` + `nsfw` or `lora`
- Common structure: Organized by model type or use case
- **Download Methods**:
  - Clone entire repository
  - Download individual JSON files via GitHub web interface
  - Use GitHub API for programmatic access

---

### 3. Community Forums & Social Platforms

#### **Reddit**
- **r/ComfyUI** - Main ComfyUI community
- **r/StableDiffusion** - Broader SD community (includes ComfyUI)
- **r/LocalLLaMA** - Model sharing (includes LoRAs)
- **Activity**: Regular workflow sharing, troubleshooting, model recommendations
- **NSFW Content**: Present but typically in dedicated threads/NSFW tags

#### **Discord**
- **ComfyUI Official Discord** - Real-time community support
- **Stable Diffusion Communities** - Multiple large servers
- **NSFW Communities** - Dedicated servers for adult content workflows
- **Use Case**: Real-time help, workflow troubleshooting, model sharing

#### **Civitai**
- **Focus**: Model sharing (checkpoints, LoRAs, embeddings)
- **ComfyUI Support**: Many models include ComfyUI workflow examples
- **NSFW Content**: Extensive NSFW model library
- **Use Case**: Finding LoRA models with workflow examples
- **URL**: https://civitai.com

#### **Hugging Face**
- **Focus**: Model hosting and sharing
- **ComfyUI Workflows**: Some model cards include workflow JSON
- **Use Case**: Official model repositories, LoRA downloads
- **URL**: https://huggingface.co

---

## NSFW-Specific Resources

### Workflow Platforms with NSFW Support

1. **SeaArt** - Explicit NSFW workflow sections
2. **OpenArt** - NSFW workflows with tags
3. **Civitai** - Extensive NSFW model library with workflow examples
4. **Comfy Studio** - Community-shared NSFW workflows

### NSFW Workflow Characteristics

- **Common Models**: 
  - Wan 2.2 (14B variants)
  - Qwen-based models
  - Flux variants
- **LoRA Integration**: 
  - Multiple LoRA slots (up to 15 in some workflows)
  - Character consistency LoRAs
  - Style/preset LoRAs
- **Workflow Types**:
  - Text-to-Image (T2I) with NSFW LoRAs
  - Image-to-Video (I2V) with NSFW content
  - Character editing workflows
  - Infinite video generation

---

## LoRA-Specific Resources

### LoRA Model Repositories

1. **Civitai** - Largest collection of LoRA models
   - Searchable by base model, style, character
   - Includes NSFW LoRAs
   - Model cards with usage examples

2. **Hugging Face** - Official model hosting
   - Search: `lora` + `comfyui`
   - Many include workflow examples

3. **GitHub** - Developer-hosted LoRAs
   - Smaller collections
   - Often specialized use cases

### LoRA Management Tools

1. **ComfyUI_LoRA_Sidebar** - Visual library browser
2. **ComfyUI Manager** - Package/node management (includes LoRA tools)
3. **Custom Scripts** - Many community scripts for LoRA organization

### LoRA Workflow Patterns

- **Single LoRA**: Basic character/style application
- **Multiple LoRAs**: Stacking for complex effects
  - Character LoRA + Style LoRA + Preset LoRA
  - Up to 15 LoRA slots in advanced workflows
- **Consistency LoRAs**: Maintaining character across generations
- **Training LoRAs**: Workflows for creating new LoRAs

---

## Community Workflows Analysis

### Existing Research (Instara Community)

We've already analyzed 16 workflows from the Instara community:

**MVP-Relevant Workflows**:
- `1GIRL (STAND-ALONE) V3` - High-quality female portraits (influencer-style)
  - Uses Qwen-based models + 1GIRL_QWEN_V3 LoRA
  - ~21GB model size
  - High MVP relevance for EP-005

**Future-Relevant Workflows**:
- `InstagirlMix I2V Fast V1` - Image-to-video conversion
- `InfiniteTalk` variants - Audio-driven video generation

See `docs/research/community-workflows/ANALYSIS.md` for full details.

---

## Recommendations for RYLA

### For MVP (EP-005)

1. **Primary Source**: Continue using existing workflows (Z-Image-Turbo, 1GIRL V3)
2. **Local Library**: ✅ ComfyUI Wiki workflows available at `libs/comfyui-workflows/`
3. **Discovery**: Monitor SeaArt and OpenArt for new NSFW workflows
4. **LoRA Integration**: Use Civitai for LoRA model discovery
5. **Community**: Join ComfyUI Discord for real-time support

### For Future Phases

1. **I2V Workflows**: Explore SeaArt's I2V NSFW workflows
2. **LoRA Management**: Consider implementing ComfyUI_LoRA_Sidebar functionality
3. **Workflow Library**: Build internal workflow library from community discoveries
4. **Custom Nodes**: Monitor GitHub for useful custom nodes

---

## Workflow JSON Download Sources

### Direct Download Platforms

1. **ComfyUI Wiki Workflows** (GitHub)
   - **URL**: https://github.com/comfyui-wiki/workflows
   - **Method**: Clone repo or download individual JSON files
   - **Content**: Curated workflows with previews
   - **NSFW**: Limited, mostly general workflows

2. **Comfy Workflows** (comfyworkflows.com)
   - **URL**: https://comfyworkflows.com
   - **Method**: Direct download from workflow detail pages
   - **Content**: Thousands of community workflows
   - **NSFW**: Yes, with tags/filters

3. **SeaArt** (seaart.ai)
   - **URL**: https://www.seaart.ai
   - **Method**: Download button on workflow detail pages
   - **Content**: NSFW-focused workflows
   - **Format**: JSON files ready for import

4. **OpenArt** (openart.ai)
   - **URL**: https://openart.ai
   - **Method**: Download from workflow pages
   - **Content**: User-uploaded workflows including NSFW
   - **Format**: JSON with metadata

5. **Comfy Studio** (studio.comfydeploy.com)
   - **URL**: https://studio.comfydeploy.com/workflows
   - **Method**: Browse and download workflows
   - **Content**: Community-shared workflows
   - **Format**: JSON files

### GitHub Workflow Collections

**Search Strategies**:
- GitHub search: `comfyui workflow filename:*.json`
- Filter by: `language:JSON`, `topic:comfyui`
- Popular repos: Search `stars:>10 comfyui workflow`

**Example Repositories**:
- Individual developers often host workflow collections
- Look for repos with "workflow", "comfyui", "workflows" in name
- Check README files for workflow descriptions

### Download Methods

**Manual Download**:
1. Visit workflow page on platform
2. Click download button (usually labeled "Download Workflow" or "JSON")
3. Save JSON file to local directory
4. Import into ComfyUI via drag-and-drop

**GitHub Clone**:
```bash
# Clone entire workflow repository
git clone https://github.com/comfyui-wiki/workflows.git

# Or download specific file
curl -O https://raw.githubusercontent.com/user/repo/main/workflow.json
```

**Programmatic Download** (Future):
- Some platforms may offer APIs
- GitHub API can be used for repository access
- Web scraping possible but check ToS

---

## Key URLs & Resources

### Workflow Download Platforms
- ComfyUI Wiki Workflows: https://github.com/comfyui-wiki/workflows
- Comfy Workflows: https://comfyworkflows.com
- SeaArt: https://www.seaart.ai
- OpenArt: https://openart.ai
- Comfy Studio: https://studio.comfydeploy.com/workflows
- ComfyOnline: https://www.comfyonline.app

### GitHub Repositories
- ComfyUI_LoRA_Sidebar: https://github.com/Kinglord/ComfyUI_LoRA_Sidebar
- nsfw_No: https://github.com/chaorenai/nsfw_No
- ComfyUI Wiki Workflows: https://github.com/comfyui-wiki/workflows

### Management Tools
- ComfyUI Manager: https://comfyuimanager.com
- ComfyUI Built-in Templates: Access via ComfyUI menu → `Workflow` → `Browse Workflow Templates`

### Communities
- Reddit: r/ComfyUI, r/StableDiffusion
- Discord: ComfyUI Official Server
- YouTube: Multiple tutorials on NSFW workflows and LoRA usage

---

## Search Strategies

### Finding NSFW Workflows
1. Search SeaArt/OpenArt with "NSFW" tag
2. Browse Civitai model pages for workflow examples
3. Check Reddit r/ComfyUI for NSFW workflow threads
4. Join NSFW-focused Discord servers

### Finding LoRA Models
1. Civitai search: `lora` + base model name (e.g., `qwen`, `wan2.2`)
2. Hugging Face: Search `lora` + `comfyui`
3. GitHub: Search `comfyui lora` repositories
4. Community recommendations in Discord/Reddit

### Finding Workflow Examples
1. Model cards on Civitai often include workflow JSON
2. SeaArt/OpenArt workflow detail pages
3. YouTube tutorials (many include workflow downloads)
4. GitHub workflow collections

---

## Notes & Considerations

### Content Moderation
- NSFW content varies by platform (some require age verification)
- Consider content policies when integrating workflows
- `nsfw_No` node can help with content filtering if needed

### Model Licensing
- Check model licenses before commercial use
- Some LoRAs have usage restrictions
- Verify NSFW model compliance with platform policies

### Workflow Compatibility
- Workflows may require specific custom nodes
- Model versions must match workflow requirements
- Test workflows in ComfyUI before production integration

---

## Workflow Download Workflow

### Recommended Process

1. **Discovery**: Browse platforms (Comfy Workflows, SeaArt, OpenArt)
2. **Selection**: Filter by tags (NSFW, LoRA, model type)
3. **Download**: Get JSON file from workflow detail page
4. **Storage**: Save to `docs/research/community-workflows/` or `workflows/`
5. **Testing**: Import into ComfyUI and test
6. **Documentation**: Add to workflow library with notes

### Local Workflow Library

Current location: `docs/research/community-workflows/`
- Contains 16 workflows from Instara community
- All JSON files ready for import
- See `ANALYSIS.md` for workflow details

Recommended structure:
```
docs/research/community-workflows/
├── nsfw/
│   ├── t2i/          # Text-to-image workflows
│   ├── i2v/          # Image-to-video workflows
│   └── lora/         # LoRA-focused workflows
├── general/          # General purpose workflows
└── ANALYSIS.md       # Workflow analysis
```

---

## Next Steps

1. **Immediate**: 
   - ✅ ComfyUI Wiki workflows cloned at `libs/comfyui-workflows/`
   - Bookmark key platforms (Comfy Workflows, SeaArt, OpenArt, GitHub repos)
   - Browse local workflow library for useful patterns
2. **Short-term**: 
   - Join ComfyUI Discord for community access
   - Test workflows from local library in ComfyUI
   - Document useful workflows for RYLA integration
3. **Medium-term**: 
   - Build workflow discovery process into development workflow
   - Convert useful workflows to TypeScript in `libs/business/src/workflows/`
   - Set up git submodule for workflow library (optional)
4. **Long-term**: 
   - Consider contributing workflows back to community
   - Build internal workflow management system

---

## Related Documents

- `docs/research/community-workflows/ANALYSIS.md` - Analysis of Instara workflows
- `docs/research/comfyui-workflows-library/COMFYUI-WIKI-WORKFLOWS-ANALYSIS.md` - **Analysis of ComfyUI Wiki workflows for RYLA MVP**
- `docs/research/comfyui-workflows-library/QUICK-REFERENCE.md` - Quick reference guide
- `docs/technical/COMFYUI-RUNPOD-IMPLEMENTATION-PLAN.md` - Implementation details
- `docs/ops/runpod/COMFYUI-WORKER-SETUP.md` - RunPod setup guide

