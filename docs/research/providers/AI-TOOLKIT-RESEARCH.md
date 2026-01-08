# AI Toolkit (Ostris) - Research & Documentation

> **Date**: 2025-01-27  
> **Source Video**: [Hyperrealistic Consistent Characters Workflow](../../youtube-videos/PhiPASFYBmk/analysis.md)  
> **Status**: ✅ Official Repository Found

## What We Know

### From Video Analysis

- **Creator**: Ostris (GitHub: [ostris/ai-toolkit](https://github.com/ostris/ai-toolkit))
- **Tool Name**: "AI Toolkit"
- **Purpose**: LoRA training for One 2.1/2.2, Flux, SDXL, SD 1.5, and other models
- **Deployment**: Available as RunPod template (official template maintained by creator)
- **Interface**: Web-based Gradio UI + CLI
- **Cost**: ~$4 per LoRA, 1.5 hours training time
- **GitHub**: https://github.com/ostris/ai-toolkit
- **License**: MIT

### Video Reference

The video transcript states:
> "Now if you have any questions for Laura training or you want to use this data set we just created uh to train a different kind of Laura, I highly recommend you check out Ostrus AI YouTube channel. He's the creator of AI toolkit and he has a bunch of amazing walkthroughs and tutorials showing how to use this tool to train all sorts of different Loras."

## Documentation Search Results

### ✅ Official Repository: FOUND

**GitHub Repository**: https://github.com/ostris/ai-toolkit

**Key Information**:
- **Stars**: 8.8k ⭐
- **Forks**: 1k
- **Language**: Python (89%), TypeScript (9.7%)
- **License**: MIT
- **Last Updated**: Active development (last commit April 2025)

**Features**:
- ✅ Gradio-based web UI (`flux_train_ui.py`)
- ✅ CLI interface for training
- ✅ YAML configuration files
- ✅ Official RunPod template
- ✅ Support for Flux, SDXL, SD 1.5, WAN 2.2, and more
- ✅ LoRA and LoKr training
- ✅ Dataset preparation tools

### ⚠️ API Documentation: PARTIAL

**Gradio UI**:
- AI Toolkit uses **Gradio** for its web interface
- Gradio automatically exposes API endpoints
- API endpoints typically at `/api/` path
- Can be discovered via Gradio's built-in API docs

**CLI Interface**:
- Python-based: `python run.py config/your_config.yml`
- YAML configuration files
- Can be automated via Python scripts

**RunPod Template**:
- Official template maintained by creator
- Link mentioned in README (needs verification)
- Template likely includes Gradio UI with API access

### ✅ YouTube Channel: FOUND (Indirectly)

**Ostrus AI YouTube Channel**:
- Mentioned in video as creator's channel
- Contains tutorials and walkthroughs
- May have links to GitHub/docs in video descriptions

**Action Needed**: 
- Search YouTube for "@OstrusAI" or "Ostrus AI" channel
- Check video descriptions for GitHub links
- Look for pinned videos or channel about section

### ✅ RunPod Template: EXISTS (But Not in Our List)

**Template Details**:
- Name: "AI Toolkit" (by Ostrus)
- Available on RunPod
- Not currently in our template list (may need to search RunPod console)

**Action Needed**:
- Search RunPod console for "AI Toolkit" template
- Check template description/README for documentation links
- Look for template creator's GitHub/site

## Research Strategy

### Option 1: YouTube Channel Research

1. **Find Ostrus AI YouTube Channel**:
   - Search YouTube for "@OstrusAI" or "Ostrus AI"
   - Check channel about section for links
   - Look for GitHub, documentation, or website links

2. **Check Video Descriptions**:
   - Original video (PhiPASFYBmk) description
   - Other Ostrus AI videos
   - Look for GitHub, docs, or API links

3. **Check Channel Links**:
   - YouTube channel custom links
   - Social media links
   - Website/documentation links

### Option 2: RunPod Template Research

1. **Search RunPod Console**:
   - Go to Templates section
   - Search for "AI Toolkit" or "Ostrus"
   - Check template README/description

2. **Template Details**:
   - Look for documentation links
   - Check template creator profile
   - Look for GitHub repository link

### Option 3: Reverse Engineering

If no official docs found:
- Use browser DevTools to discover API (as planned)
- Document endpoints manually
- Create our own API client

## Next Steps

### Immediate Actions

1. **Search YouTube for Ostrus AI Channel**:
   ```bash
   # Use YouTube search or browser
   # Look for: @OstrusAI or "Ostrus AI" channel
   # Check channel about section and video descriptions
   ```

2. **Check Original Video Description**:
   - Video: https://www.youtube.com/watch?v=PhiPASFYBmk
   - Look for links in description
   - Check pinned comments

3. **Search RunPod Console**:
   - Templates → Search "AI Toolkit"
   - Check template README
   - Look for documentation links

4. **Search GitHub**:
   ```bash
   # Try various search terms:
   # - "ostrus ai toolkit"
   # - "ai-toolkit" user:ostrus
   # - "lora trainer" ostrus
   ```

### If Documentation Found

- ✅ Update `AIToolkitClient` with official API
- ✅ Document API endpoints in our docs
- ✅ Skip reverse engineering step

### If No Documentation Found

- ⚠️ Proceed with browser DevTools discovery
- ⚠️ Document discovered endpoints
- ⚠️ Create API client from discovered endpoints

## Alternative: Check Video Description

The original video may have links in its description. Let's check:

**Video URL**: https://www.youtube.com/watch?v=PhiPASFYBmk

**Action**: 
- Open video in browser
- Check description for:
  - GitHub links
  - Documentation links
  - Website links
  - Discord/community links

## Alternative Tools

If AI Toolkit doesn't have official API docs, consider:

1. **fal.ai 1.2.2 Trainer**: 
   - Has official API documentation
   - Simpler integration
   - May be easier to automate

2. **Flux Gym**:
   - Mentioned in video as alternative
   - May have better documentation
   - Supports Flux models

3. **Custom Training Script**:
   - Use kohya_ss or similar
   - Full control
   - More complex setup

## References

- [Video Analysis](../../youtube-videos/PhiPASFYBmk/analysis.md)
- [Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)
- [Discovery Guide](../../../technical/infrastructure/ai-toolkit/API-DISCOVERY-GUIDE.md)

## Update Log

- **2025-01-27**: Initial research - no official documentation found
- **2025-01-27**: ✅ **Official repository found**: https://github.com/ostris/ai-toolkit
- **Next**: 
  - Review source code for API structure
  - Check Gradio API documentation
  - Find official RunPod template
  - Test API endpoints

