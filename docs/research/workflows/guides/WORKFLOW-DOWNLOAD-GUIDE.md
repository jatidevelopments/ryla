# ComfyUI Workflow Download Guide

> **Purpose**: Practical guide for downloading workflow JSON files from various sources  
> **Target**: NSFW and LoRA-focused workflows

---

## Quick Start

### Option 1: GitHub Repository (Easiest)

**ComfyUI Wiki Workflows** - Curated collection:
```bash
# Already cloned in RYLA repo
cd libs/comfyui-workflows

# Browse workflow categories
ls -la

# Example: View Flux workflows
ls flux/text_to_image/
```

**Location**: `libs/comfyui-workflows/` in RYLA repository  
**Status**: ✅ Already cloned and available locally

---

### Option 2: Web Platforms (Manual Download)

#### **Comfy Workflows** (comfyworkflows.com)

1. Visit: https://comfyworkflows.com
2. Search for workflows (use filters: NSFW, LoRA, model type)
3. Click on workflow to view details
4. Click "Download" button (usually top-right)
5. Save JSON file to `docs/research/community-workflows/`

#### **SeaArt** (seaart.ai)

1. Visit: https://www.seaart.ai
2. Browse or search workflows
3. Click workflow to open detail page
4. Look for "Download Workflow" or "JSON" button
5. Save JSON file

#### **OpenArt** (openart.ai)

1. Visit: https://openart.ai
2. Filter by tags (NSFW, LoRA, etc.)
3. Open workflow page
4. Download JSON file
5. Save to local directory

---

## Download Script (Future Enhancement)

### Planned: Automated Workflow Downloader

```python
# scripts/download-workflows.py (to be created)
# Downloads workflows from multiple sources

import requests
import json
from pathlib import Path

WORKFLOWS_DIR = Path("docs/research/community-workflows")

# GitHub API for comfyui-wiki/workflows
# SeaArt/OpenArt web scraping (check ToS first)
# Civitai API for model workflows
```

**Status**: Manual download recommended for now (platforms may have rate limits/ToS restrictions)

---

## Workflow Sources Summary

| Source | Method | NSFW | LoRA | Direct JSON |
|--------|--------|------|------|-------------|
| **ComfyUI Wiki (GitHub)** | Clone repo | Limited | Yes | ✅ |
| **Comfy Workflows** | Web download | Yes | Yes | ✅ |
| **SeaArt** | Web download | Yes | Yes | ✅ |
| **OpenArt** | Web download | Yes | Yes | ✅ |
| **Comfy Studio** | Web download | Yes | Yes | ✅ |
| **Civitai** | Model pages | Yes | Yes | ⚠️ (in model cards) |
| **GitHub Search** | Clone/download | Varies | Varies | ✅ |

---

## Recommended Workflow

### Step 1: Discovery
1. Start with **Comfy Workflows** or **SeaArt** for NSFW workflows
2. Use search filters: "NSFW", "LoRA", model name (e.g., "Wan 2.2", "Qwen")
3. Check workflow descriptions for required models/nodes

### Step 2: Download
1. Click workflow to view details
2. Verify required models are available
3. Download JSON file
4. Save with descriptive name: `{workflow-name}-{version}.json`

### Step 3: Organize
Save to appropriate directory:
```
docs/research/community-workflows/
├── nsfw/
│   ├── t2i/              # Text-to-image
│   ├── i2v/              # Image-to-video
│   └── lora/             # LoRA-specific
└── general/              # General workflows
```

### Step 4: Test
1. Import JSON into ComfyUI (drag-and-drop)
2. Check for missing custom nodes
3. Verify required models are loaded
4. Test with sample prompt

### Step 5: Document
Add to workflow library with notes:
- Required models
- Custom nodes needed
- Use case
- Quality assessment

---

## GitHub Workflow Collections

### Finding Workflow Repositories

**GitHub Search**:
```
comfyui workflow filename:*.json
```

**Filter by**:
- Language: JSON
- Topic: comfyui
- Stars: >10 (for quality)

**Example Repositories**:
- `comfyui-wiki/workflows` - Official wiki workflows
- Individual developer repos (search "comfyui workflow")

### Downloading from GitHub

**Clone entire repo**:
```bash
git clone https://github.com/user/comfyui-workflows.git
cd comfyui-workflows
```

**Download single file**:
```bash
# Using curl
curl -O https://raw.githubusercontent.com/user/repo/main/workflow.json

# Or use GitHub web interface
# 1. Navigate to file
# 2. Click "Raw" button
# 3. Save page as JSON
```

---

## Platform-Specific Instructions

### Comfy Workflows (comfyworkflows.com)

1. **Browse**: https://comfyworkflows.com
2. **Search**: Use search bar with keywords
3. **Filter**: Use tags (NSFW, LoRA, model type)
4. **Download**: 
   - Click workflow card
   - Click "Download" button (usually top-right)
   - JSON file downloads automatically
5. **Import**: Drag JSON into ComfyUI

**Features**:
- Thousands of workflows
- Community ratings
- Search and filter
- Direct JSON download

---

### SeaArt (seaart.ai)

1. **Browse**: https://www.seaart.ai
2. **Search**: Use search with "NSFW" or "LoRA"
3. **Workflow Page**: 
   - Detailed instructions
   - Model requirements listed
   - Download button visible
4. **Download**: Click "Download Workflow" button
5. **Save**: JSON file ready for import

**Features**:
- NSFW-focused workflows
- Detailed model requirements
- Workflow previews
- Integration guides

---

### OpenArt (openart.ai)

1. **Browse**: https://openart.ai
2. **Filter**: Use tags for NSFW/LoRA workflows
3. **Workflow Detail**:
   - User-uploaded workflows
   - Description and requirements
   - Download option
4. **Download**: JSON file from workflow page
5. **Import**: Use in ComfyUI

**Features**:
- Community-driven
- Wide variety
- User ratings
- Direct downloads

---

## Local Workflow Library Structure

### Current Structure

```
docs/research/community-workflows/
├── 1GIRL (STAND-ALONE) V3.json
├── Instara InstagirlMix I2V Fast V1.json
├── ... (16 workflows from Instara)
└── ANALYSIS.md
```

### Recommended Structure

```
docs/research/community-workflows/
├── nsfw/
│   ├── t2i/                    # Text-to-image NSFW
│   │   ├── wan2.2-nsfw-t2i.json
│   │   └── qwen-nsfw-t2i.json
│   ├── i2v/                    # Image-to-video NSFW
│   │   └── wan2.2-i2v-nsfw.json
│   └── lora/                   # LoRA-focused NSFW
│       └── multi-lora-nsfw.json
├── general/                    # General workflows
│   └── ...
├── ANALYSIS.md                 # Workflow analysis
└── README.md                   # Library index
```

---

## Workflow Import Process

### In ComfyUI

1. **Drag-and-Drop**:
   - Open ComfyUI interface
   - Drag JSON file into canvas
   - Workflow loads automatically

2. **Menu Import**:
   - `Workflow` → `Import`
   - Select JSON file
   - Workflow loads

3. **Verify**:
   - Check for missing nodes (red indicators)
   - Install required custom nodes
   - Load required models
   - Test with sample prompt

---

## Troubleshooting

### Missing Custom Nodes

**Error**: Red node indicators in workflow

**Solution**:
1. Note node name from error
2. Install via ComfyUI Manager or manual install
3. Restart ComfyUI
4. Reload workflow

### Missing Models

**Error**: Model not found warnings

**Solution**:
1. Check workflow description for required models
2. Download models to appropriate directories:
   - Checkpoints: `models/checkpoints/`
   - LoRAs: `models/loras/`
   - VAE: `models/vae/`
3. Refresh ComfyUI
4. Reload workflow

### Workflow Compatibility

**Issue**: Workflow doesn't work with current ComfyUI version

**Solution**:
1. Check ComfyUI version compatibility
2. Update ComfyUI if needed
3. Check for workflow version notes
4. Try alternative workflow version

---

## Best Practices

1. **Organize Early**: Set up directory structure before downloading
2. **Name Clearly**: Use descriptive filenames with version
3. **Document**: Note required models and nodes
4. **Test First**: Always test in ComfyUI before production use
5. **Version Control**: Track workflow versions
6. **Backup**: Keep original JSON files

---

## Related Documents

- `docs/research/COMFYUI-COMMUNITIES-REPOSITORIES.md` - Complete platform overview
- `docs/research/community-workflows/ANALYSIS.md` - Analysis of existing workflows
- `workflows/README.md` - Workflow usage in RYLA project

---

## Quick Reference

### Top Download Sources

1. **Comfy Workflows**: https://comfyworkflows.com (thousands of workflows)
2. **SeaArt**: https://www.seaart.ai (NSFW-focused)
3. **OpenArt**: https://openart.ai (community-driven)
4. **GitHub**: https://github.com/comfyui-wiki/workflows (curated collection)

### Search Terms

- NSFW workflows: "NSFW", "adult", "uncensored"
- LoRA workflows: "LoRA", "lora", "multi-lora"
- Model-specific: "Wan 2.2", "Qwen", "Flux"
- Task-specific: "I2V", "T2I", "face swap", "character"

---

## Next Steps

1. **Download workflows** from recommended sources
2. **Organize** into local library structure
3. **Test** workflows in ComfyUI
4. **Document** findings and requirements
5. **Integrate** into RYLA workflow system

