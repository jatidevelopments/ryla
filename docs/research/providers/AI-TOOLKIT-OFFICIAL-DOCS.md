# AI Toolkit - Official Documentation

> **Repository**: https://github.com/ostris/ai-toolkit  
> **Date**: 2025-01-27  
> **Status**: ✅ Repository Found

## Repository Overview

**GitHub**: https://github.com/ostris/ai-toolkit  
**Creator**: Ostris  
**License**: MIT  
**Stars**: 8.8k ⭐  
**Language**: Python (89%), TypeScript (9.7%)

## Key Features

### Supported Models
- ✅ Flux 1.0 (schnell and dev)
- ✅ SDXL 1.0 & 1.1
- ✅ Stable Diffusion 1.5 & 2.1
- ✅ WAN 2.2 (video models)
- ✅ One 2.1/2.2 (mentioned in video)
- ✅ **Z-Image Turbo** ⭐ (confirmed)
- ✅ OmniGen2
- ✅ Kontext training

### Training Types
- LoRA training
- LoKr training
- Layer-specific training
- Instruction dataset training

### Interfaces
1. **Gradio UI**: Web-based interface (`flux_train_ui.py`)
2. **CLI**: Command-line interface (`python run.py config/your_config.yml`)
3. **RunPod Template**: Official template for cloud deployment

## Installation

### Local Installation

```bash
git clone https://github.com/ostris/ai-toolkit.git
cd ai-toolkit
git submodule update --init --recursive
python -m venv venv
source venv/bin/activate
pip install torch
pip install -r requirements.txt
```

### RunPod Deployment

**Official Template**: Mentioned in README (link needs verification)

**Steps** (from README):
1. Search RunPod templates for "AI Toolkit"
2. Deploy pod with template
3. Set password in environment variables
4. Access via HTTP service

**Video Tutorial**: Creator mentions a video showing how to get started with RunPod

## API Access

### Gradio API

Since AI Toolkit uses **Gradio** for its UI, it automatically exposes API endpoints:

**Typical Gradio API Structure**:
- Base URL: `http://<pod-url>/`
- API Docs: `http://<pod-url>/docs` (if enabled)
- API Endpoints: `http://<pod-url>/api/`

**Gradio API Endpoints** (typical):
- `POST /api/predict` - Run predictions/training
- `GET /api/` - List available endpoints
- WebSocket support for real-time updates

**Discovery Method**:
1. Access Gradio UI
2. Check browser DevTools → Network tab
3. Look for `/api/` endpoints
4. Or check Gradio's built-in API docs at `/docs`

### CLI Interface

**Training Command**:
```bash
python run.py config/your_config.yml
```

**Config File Structure** (YAML):
```yaml
model:
  name: "ostris/FLUX.1-dev"
  
dataset:
  path: "/path/to/dataset"
  trigger_word: "your_trigger_word"

network:
  type: "lora"
  linear: 128
  linear_alpha: 128

training:
  steps: 2000
  batch_size: 1
  learning_rate: 0.0001
```

## Dataset Format

**Required Structure**:
```
dataset/
  ├── image1.jpg
  ├── image1.txt  (caption file)
  ├── image2.jpg
  ├── image2.txt
  └── ...
```

**Caption Format**:
- Text file with same name as image
- Contains caption text
- Can include `[trigger]` placeholder (replaced with `trigger_word` from config)

**Supported Formats**:
- Images: `.jpg`, `.jpeg`, `.png`
- ⚠️ WebP currently has issues

## RunPod Integration

### Official Template

The README mentions:
> "I maintain an official Runpod Pod template here which can be accessed here."

**Action Needed**: 
- Find the official RunPod template link
- Check template description for setup instructions
- Verify template includes Gradio UI with API access

### Template Configuration

Based on video and README:
- **Environment Variables**: `PASSWORD` (for Gradio UI)
- **HTTP Service**: Accessible via RunPod HTTP service link
- **GPU**: RTX 4090/5090 recommended

## API Discovery Strategy

### Option 1: Gradio API Docs

1. Deploy AI Toolkit pod on RunPod
2. Access HTTP service URL
3. Navigate to `/docs` (Gradio's built-in API documentation)
4. Review available endpoints

### Option 2: Browser DevTools

1. Open Gradio UI in browser
2. Open DevTools → Network tab
3. Perform actions (create dataset, start training)
4. Observe API calls to `/api/` endpoints

### Option 3: Source Code Analysis

1. Clone repository
2. Check `ui/` folder for Gradio interface code
3. Review `flux_train_ui.py` for API structure
4. Check for FastAPI or other API frameworks

## Next Steps

1. ✅ **Repository Found** - Update documentation
2. ⏳ **Check Gradio API** - Access `/docs` endpoint when pod is deployed
3. ⏳ **Find RunPod Template** - Search RunPod console for official template
4. ⏳ **Review Source Code** - Check `ui/` folder for API structure
5. ⏳ **Test API** - Deploy pod and test API endpoints

## References

- **GitHub Repository**: https://github.com/ostris/ai-toolkit
- **Video Analysis**: [Hyperrealistic Consistent Characters Workflow](../../youtube-videos/PhiPASFYBmk/analysis.md)
- **Integration Spec**: [AI Toolkit LoRA Training Integration](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)

