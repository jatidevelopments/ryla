# ComfyUI-Copilot: AI-Powered Workflow Assistant

> **Source**: [AIDC-AI/ComfyUI-Copilot](https://github.com/AIDC-AI/ComfyUI-Copilot)  
> **Version**: v2.0 (as of 2025-08-14)  
> **Purpose**: AI-powered custom node for ComfyUI that enhances workflow automation and provides intelligent assistance  
> **License**: MIT

---

## Overview

**ComfyUI-Copilot** is an AI-powered custom node for ComfyUI that transforms workflow development from manual node-by-node construction into an intelligent, conversational experience. It acts as a "development partner" that can generate, debug, optimize, and tune ComfyUI workflows using natural language.

### Key Capabilities

- 🤖 **Workflow Generation**: Generate workflows from text descriptions
- 🐛 **Workflow Debugging**: Automatically detect and fix errors
- 🔄 **Workflow Rewriting**: Optimize existing workflows based on requirements
- 🎛️ **Parameter Tuning**: Batch test parameter combinations with visual comparison
- 🔍 **Node Discovery**: Find the right nodes for specific tasks
- 📦 **Model Recommendations**: Discover appropriate models and LoRAs

---

## How ComfyUI-Copilot Helps RYLA

### 1. **Accelerate Workflow Development**

**Current State**: RYLA manually builds workflows in TypeScript (`libs/business/src/workflows/`) or imports JSON workflows from `libs/comfyui-workflows/`.

**With Copilot**: 
- Generate new workflow variations from natural language descriptions
- Quickly prototype workflows before converting to TypeScript
- Explore workflow patterns from Copilot's library of 3+ high-quality workflows per request

**Example Use Cases**:
```text
"I want a workflow for generating profile pictures with face consistency using PuLID"
"I need a workflow for video generation with WAN 2.2"
"Create a workflow for inpainting with Flux Dev"
```

### 2. **Debug Workflow Issues**

**Current State**: Manual debugging of workflow JSON, checking node connections, parameter validation.

**With Copilot**:
- One-click debug button analyzes current canvas workflow
- Automatically detects:
  - Missing models (with download prompts)
  - Parameter errors
  - Workflow connection errors
  - Node compatibility issues
- Provides specific repair suggestions

**RYLA Integration**:
- Test workflows in ComfyUI pod before serverless deployment
- Debug workflows exported from TypeScript builders
- Validate workflows from `libs/comfyui-workflows/` library

### 3. **Optimize Existing Workflows**

**Current State**: Manual workflow optimization, trial-and-error parameter tuning.

**With Copilot**:
- Rewrite workflows based on requirements:
  - "Help me add LoRA support to this workflow"
  - "Optimize this workflow for faster generation"
  - "Add face consistency to this base image workflow"
- Understands local ComfyUI environment and available nodes
- Provides personalized optimization suggestions

**RYLA Workflows to Optimize**:
- `z-image-danrisi.ts` - Add new features or optimize performance
- `flux-pulid.ts` - Enhance face consistency logic
- `z-image-pulid.ts` - Improve parameter handling

### 4. **Parameter Tuning & Experimentation**

**Current State**: Manual parameter testing, no systematic comparison.

**With Copilot**:
- **GenLab Tab**: Batch execute different parameter combinations
- Visual comparison of results
- Systematic parameter range testing
- Find optimal configurations faster

**RYLA Use Cases**:
- Tune CFG scale, steps, seed ranges for base image generation
- Optimize PuLID strength for face consistency
- Test LoRA strength values for character generation
- Compare different model checkpoints

### 5. **Node & Model Discovery**

**Current State**: Manual research for nodes and models, browsing documentation.

**With Copilot**:
- **Node Recommendations**: "I want a node for face swapping" → Gets IPAdapter FaceID recommendations
- **Node Query**: Select node on canvas → Get detailed usage, parameters, downstream recommendations
- **Model Recommendations**: "I want a LoRA that generates anime characters" → Gets model suggestions

**RYLA Benefits**:
- Discover new nodes for workflow enhancements
- Find appropriate LoRAs for character generation
- Understand node capabilities before implementation

---

## Installation

### Prerequisites

- ComfyUI installed and running
- Python 3.8+ (ComfyUI requirement)
- Git

### Installation Steps

#### Option 1: Git Installation (Recommended)

```bash
# Navigate to ComfyUI custom_nodes directory
cd /path/to/ComfyUI/custom_nodes

# Clone repository
git clone https://github.com/AIDC-AI/ComfyUI-Copilot.git

# Or use SSH
git clone git@github.com:AIDC-AI/ComfyUI-Copilot.git

# Install dependencies
cd ComfyUI-Copilot
pip install -r requirements.txt
```

#### Option 2: ComfyUI Manager

1. Open ComfyUI Manager
2. Go to **Custom Nodes Manager**
3. Search for **"ComfyUI-Copilot"**
4. Click **Install**
5. **Update to latest version** after installation

**Note**: Manager installation can be buggy. Git installation is recommended.

### Windows Users

```bash
# Use embedded Python
python_embeded\python.exe -m pip install -r ComfyUI\custom_nodes\ComfyUI-Copilot\requirements.txt
```

---

## Activation & Setup

### 1. Launch Copilot

After running ComfyUI:
1. Find the **Copilot activation button** on the left side panel
2. Click to launch Copilot service

### 2. Generate API Key

1. Click the **\*** button in Copilot interface
2. Enter your email address in the popup
3. API Key will be sent to your email
4. Paste API Key into input box
5. Click **Save** to activate

### 3. Configure Models

Click the **\*** button to configure:

- **Chat Model**: For conversational assistance (OpenAI, LMStudio, etc.)
- **Workflow Generation Model**: For generating workflows (can be different from chat model)

**Supported Models**:
- OpenAI (GPT-4, GPT-3.5)
- LMStudio (local models)
- DeepSeek
- Other OpenAI-compatible APIs

---

## Usage Guide

### Generating Workflows

**Natural Language Input**:
```text
I want a workflow for generating profile pictures with face consistency
```

**Result**:
- Returns 3 high-quality workflows from Copilot's library
- Returns 1 AI-generated workflow
- One-click import to ComfyUI canvas

**RYLA Workflow**:
1. Generate workflow in Copilot
2. Import to ComfyUI pod for testing
3. Export JSON workflow
4. Convert to TypeScript in `libs/business/src/workflows/` (if needed)
5. Deploy to serverless endpoint

### Debugging Workflows

**Method 1: Debug Current Canvas**
1. Load workflow into ComfyUI canvas
2. Click **Debug** button (upper right of input box)
3. Copilot analyzes workflow and provides fixes

**Method 2: Debug After Import**
1. Import workflow from Copilot
2. Click **Accept** to load to canvas
3. Click **Debug** button
4. Fix issues automatically

**Features**:
- Detects missing models → prompts for download
- Identifies parameter errors
- Finds connection issues
- Suggests node replacements

### Rewriting Workflows

**Natural Language Input**:
```text
Help me add LoRA support to the current canvas
Optimize this workflow for faster generation
Add face consistency using PuLID to this workflow
```

**Best Practices**:
- **Clear Context**: Copilot understands your local ComfyUI environment
- **Control Context Length**: Click **Clear Context** button regularly to avoid interruptions
- **Expert Experience**: For new models (e.g., WAN 2.2), add expert experience to help LLM understand

**RYLA Integration**:
- Optimize workflows before TypeScript conversion
- Add features to existing workflows
- Test variations before production deployment

### Parameter Tuning (GenLab)

1. **Switch to GenLab Tab**
2. **Ensure Workflow Runs**: Workflow must execute successfully before batch testing
3. **Set Parameter Ranges**:
   - CFG scale: 1.0 to 10.0
   - Steps: 9 to 50
   - Seed: Random or specific range
4. **Batch Execute**: System tests all combinations
5. **Visual Comparison**: Review results side-by-side
6. **Select Optimal**: Choose best parameter configuration

**RYLA Use Cases**:
- Tune base image generation parameters
- Optimize face consistency strength
- Test LoRA strength values
- Compare model checkpoints

### Node & Model Discovery

**Node Recommendations**:
```text
I want a node for face swapping
I need a node for inpainting
```

**Node Query**:
1. Select node on canvas
2. Click **Node Query** button
3. Get detailed information:
   - Description
   - Parameter definitions
   - Usage tips
   - Downstream workflow recommendations

**Model Recommendations**:
```text
I want a LoRA that generates anime characters
I need a base model for portrait generation
```

---

## Integration with RYLA Workflow Builders

### Current RYLA Workflow Builders

RYLA has TypeScript workflow builders in `libs/business/src/workflows/`:

- `z-image-danrisi.ts` - Z-Image-Turbo with LoRA
- `flux-pulid.ts` - Flux Dev with PuLID
- `z-image-pulid.ts` - Z-Image-Turbo with PuLID

### Workflow: Copilot → TypeScript

1. **Generate in Copilot**: Create workflow using natural language
2. **Test in ComfyUI Pod**: Import to pod, test, debug
3. **Export JSON**: Save workflow JSON
4. **Convert to TypeScript**: Implement in `libs/business/src/workflows/`
5. **Deploy**: Use in serverless endpoints

### Workflow: TypeScript → Copilot

1. **Export from TypeScript**: Generate workflow JSON from builder
2. **Import to ComfyUI**: Load into ComfyUI pod
3. **Debug with Copilot**: Use Copilot to debug issues
4. **Optimize**: Use Copilot to optimize workflow
5. **Update TypeScript**: Apply optimizations back to TypeScript builder

### Best Practices

- **Prototype First**: Use Copilot to prototype workflows before TypeScript implementation
- **Debug Before Deploy**: Always test workflows in ComfyUI pod with Copilot before serverless deployment
- **Document Patterns**: Document successful Copilot-generated patterns for reuse
- **Version Control**: Keep Copilot-generated workflows in `workflows/` directory for reference

---

## Use Cases for RYLA

### 1. Base Image Generation Workflows

**Current**: Manual TypeScript builders for Flux and Z-Image-Turbo

**With Copilot**:
- Generate variations: "Create a workflow for base image generation with 3 variations"
- Optimize parameters: Use GenLab to tune CFG, steps, seed
- Add features: "Add negative prompt handling to this workflow"

### 2. Face Consistency Workflows

**Current**: PuLID and IPAdapter FaceID implementations

**With Copilot**:
- Debug face consistency issues
- Tune PuLID strength values
- Compare PuLID vs IPAdapter FaceID workflows
- Optimize for different face angles

### 3. Profile Picture Generation

**Current**: `ProfilePictureSetService` with fast/consistent modes

**With Copilot**:
- Generate workflow variations for different positions
- Optimize for speed (fast mode) vs quality (consistent mode)
- Tune InstantID strength for consistent mode
- Debug workflow issues before production

### 4. Video Generation Workflows

**Current**: WAN 2.1, WAN 2.2 workflows in `libs/comfyui-workflows/`

**With Copilot**:
- Generate WAN 2.2 workflows (new model, may need expert experience)
- Debug video generation issues
- Optimize for different resolutions (480P, 720P)
- Add LoRA support to video workflows

### 5. Workflow Library Exploration

**Current**: Manual browsing of `libs/comfyui-workflows/` library

**With Copilot**:
- Generate workflows similar to library examples
- Understand workflow patterns from library
- Adapt library workflows for RYLA use cases
- Discover new workflow types

---

## Limitations & Considerations

### Context Length

- **Workflow Rewriting**: Carries a lot of context, can interrupt if too long
- **Solution**: Click **Clear Context** button regularly
- **Best Practice**: Work on one workflow at a time, clear context between major changes

### New Models

- **Issue**: Models released after May 2025 (e.g., WAN 2.2) may cause LLM to fail
- **Solution**: Add expert experience to help LLM understand new models
- **Workaround**: Use Copilot for debugging/optimization, not initial generation

### Model Availability

- **Missing Models**: Copilot detects missing models and prompts for download
- **RYLA Note**: Ensure models are available in ComfyUI pod or serverless endpoint
- **Best Practice**: Test model availability before workflow deployment

### API Costs

- **Consideration**: Copilot uses LLM APIs (OpenAI, etc.) which have costs
- **Optimization**: Use local models (LMStudio) for cost savings
- **RYLA Note**: Consider API costs when using Copilot extensively

---

## Troubleshooting

### Copilot Not Appearing

1. **Check Installation**: Verify Copilot is in `custom_nodes/` directory
2. **Check Dependencies**: Run `pip install -r requirements.txt`
3. **Restart ComfyUI**: Restart ComfyUI after installation
4. **Check Logs**: Look for errors in ComfyUI console

### API Key Issues

1. **Check Email**: Verify API key was sent to correct email
2. **Check Spam**: API key email may be in spam folder
3. **Regenerate**: Request new API key if needed
4. **Verify Format**: Ensure API key is pasted correctly (no extra spaces)

### Workflow Generation Fails

1. **Clear Context**: Click **Clear Context** button
2. **Simplify Request**: Break down complex requests into smaller parts
3. **Check Model**: Ensure workflow generation model is configured correctly
4. **Try Again**: Retry with slightly different wording

### Debug Not Working

1. **Check Workflow**: Ensure workflow is loaded in canvas
2. **Check Nodes**: Verify all nodes are properly connected
3. **Check Models**: Ensure required models are available
4. **Clear Context**: Clear context and try again

---

## MCP (Model Context Protocol) Support

**ComfyUI-Copilot does not currently have an official MCP server implementation.**

Instead, ComfyUI-Copilot uses a **hierarchical multi-agent framework** with:
- A central "assistant agent" that coordinates tasks
- Specialized "worker agents" for specific tasks (debugging, node recommendation, parameter tuning)
- Internal agent-based communication within the ComfyUI ecosystem

**RYLA MCP Integration**:
- RYLA has its own MCP server at `apps/mcp/` that provides tools for character generation, gallery management, and workflow execution
- ComfyUI-Copilot operates as a ComfyUI custom node (not an MCP server)
- Future integration could potentially bridge ComfyUI-Copilot's capabilities with RYLA's MCP server for programmatic access

**Alternative Access Methods**:
- **ComfyUI Interface**: Primary access via ComfyUI custom node UI
- **API Integration**: Could potentially integrate via ComfyUI's API endpoints
- **Direct Installation**: Install as ComfyUI custom node (not via MCP)

---

## Related Documentation

- **[ComfyUI Serverless Setup Guide](./COMFYUI-SERVERLESS-SETUP-GUIDE.md)** - Deploy ComfyUI serverless endpoints
- **[ComfyUI Testing Guide](./COMFYUI-TESTING-GUIDE.md)** - Test workflows in ComfyUI pod
- **[ComfyUI Workflow Conversion](../../../ops/COMFYUI-WORKFLOW-CONVERSION.md)** - Convert UI format to API format
- **[ComfyUI Workflows Library](../../../libs/comfyui-workflows/RYLA-README.md)** - RYLA workflow library
- **[ComfyUI Communities & Repositories](../../../research/workflows/comfyui/COMFYUI-COMMUNITIES-REPOSITORIES.md)** - Workflow sources
- **[RYLA MCP Server](../../../apps/mcp/README.md)** - RYLA's MCP server for programmatic access

---

## Resources

- **GitHub Repository**: https://github.com/AIDC-AI/ComfyUI-Copilot
- **Discord**: https://discord.gg/rb36gWG9Se
- **Contact**: ComfyUI-Copilot@service.alibaba.com
- **License**: MIT

---

## Summary

ComfyUI-Copilot is a powerful tool that can significantly accelerate RYLA's workflow development process. By providing AI-powered workflow generation, debugging, optimization, and parameter tuning, it reduces the time from idea to production-ready workflow.

**Key Benefits for RYLA**:
- ✅ Faster workflow prototyping
- ✅ Automated debugging and error detection
- ✅ Systematic parameter optimization
- ✅ Node and model discovery
- ✅ Workflow optimization and rewriting

**Recommended Workflow**:
1. Generate workflow in Copilot
2. Test in ComfyUI pod
3. Debug and optimize with Copilot
4. Convert to TypeScript (if needed)
5. Deploy to serverless endpoint

---

**Last Updated**: 2026-01-27  
**Status**: Ready for evaluation and integration
