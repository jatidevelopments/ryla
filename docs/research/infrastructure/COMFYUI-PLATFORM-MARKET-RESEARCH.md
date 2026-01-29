# ComfyUI Platform Market Research

> **Date**: 2026-01-27  
> **Status**: Research Complete  
> **Initiative**: IN-015  
> **Purpose**: Comprehensive evaluation of cloud hosting solutions for ComfyUI workflows

---

## Executive Summary

This document provides a comprehensive market analysis of cloud hosting platforms that support ComfyUI workflows with serverless capabilities. The research covers specialized ComfyUI platforms, enterprise cloud providers, and alternative GPU hosting solutions.

**Key Finding**: Specialized platforms (RunComfy, ViewComfy) offer the best balance of ease-of-use and cost for complex custom workflows, while enterprise clouds (AWS, GCP, Azure) require significant DevOps effort but offer enterprise-grade reliability.

**Note**: This document focuses on **cloud hosting platforms** for ComfyUI. For comparison of **open-source alternatives to ComfyUI itself** (Fooocus, InvokeAI, etc.), see [ComfyUI Open-Source Alternatives](./COMFYUI-OPEN-SOURCE-ALTERNATIVES.md).

---

## Platform Categories

### Category 1: Specialized ComfyUI Platforms

These platforms are purpose-built for ComfyUI workflows, offering native support and minimal setup.

#### 1. RunComfy (runcomfy.com)

**Overview**: Dedicated "ComfyUI Cloud" platform designed to bridge local development and production serverless APIs.

**Key Features**:
- **Cloud Save**: Packages entire environment (OS, Python, custom nodes, models) into reproducible container
- **One-Click Deployment**: Deploy any saved workflow to serverless endpoint
- **Native ComfyUI Support**: Built-in ComfyUI-Manager, direct Civitai/Hugging Face downloads
- **Scale-to-Zero**: True serverless with automatic scaling

**Serverless**: ✅ Yes (native)
**ComfyUI Support**: ✅ Native (purpose-built)
**Custom Nodes**: ✅ Fully supported via Manager
**Setup Time**: ⭐⭐⭐⭐⭐ (Minutes)

**Pricing Model**:
- Pay-per-use GPU time
- GPU tiers: 16GB (T4/A4000) to 141GB (H200)
- No subscription required (pay-as-you-go)
- Estimated: ~$2-4/hr for A10/A100 tier

**Best For**: Fast production deployment, complex custom workflows, minimal DevOps

**MCP/AI Agent Ready**: ⚠️ Unknown (needs testing)

---

#### 2. ViewComfy (viewcomfy.com)

**Overview**: Similar to RunComfy, focuses on workflow management and visualization layer.

**Key Features**:
- Workflow-as-a-Service model
- Managed infrastructure
- Cleaner UI/UX for team collaboration
- Environment sharing

**Serverless**: ✅ Yes
**ComfyUI Support**: ✅ Native
**Custom Nodes**: ✅ Supported
**Setup Time**: ⭐⭐⭐⭐⭐ (Minutes)

**Pricing Model**:
- Pay-per-second GPU usage
- A10 ~$2.2/hr, A100 ~$4.1/hr
- Optional subscription plans ($0-30+/mo)
- Scales to zero

**Best For**: Team collaboration, workflow management, similar to RunComfy

**MCP/AI Agent Ready**: ⚠️ Unknown (needs testing)

---

#### 3. Fal.ai

**Overview**: Highly optimized for ComfyUI with managed runtime.

**Key Features**:
- Upload ComfyUI JSON directly
- Handles custom nodes in background
- Managed runtime environment
- Fast execution

**Serverless**: ✅ Yes
**ComfyUI Support**: ✅ Optimized
**Custom Nodes**: ✅ Mostly supported (niche nodes may need support)
**Setup Time**: ⭐⭐⭐⭐ (Low)

**Pricing Model**:
- Pay-per-execution
- Competitive pricing
- No idle costs

**Best For**: Quick deployments, managed custom nodes

**MCP/AI Agent Ready**: ⚠️ Unknown (needs testing)

---

#### 4. Replicate

**Overview**: Uses "Cog" to containerize models, supports ComfyUI.

**Key Features**:
- Cog-based containerization
- Structured deployment
- Model versioning
- API-first approach

**Serverless**: ✅ Yes
**ComfyUI Support**: ✅ Supported (via Cog)
**Custom Nodes**: ⚠️ Requires custom builds
**Setup Time**: ⭐⭐⭐ (Moderate)

**Pricing Model**:
- Pay-per-execution
- Model-based pricing
- Competitive rates

**Best For**: Model versioning, structured deployments

**MCP/AI Agent Ready**: ✅ Yes (REST API)

---

### Category 2: General GPU Hosting (Current)

#### 5. RunPod (Current Platform)

**Overview**: General-purpose GPU hosting with ComfyUI serverless support.

**Key Features**:
- ComfyUI-to-API tool (automated Dockerfile generation)
- Serverless workers
- Network volumes for models
- Custom Docker images

**Serverless**: ✅ Yes
**ComfyUI Support**: ✅ Via workers/templates
**Custom Nodes**: ⚠️ Complex (requires custom Docker images)
**Setup Time**: ⭐⭐ (High - current pain point)

**Pricing Model**:
- Pure GPU time pricing
- RTX 4090: ~$0.25-0.4/hr
- A100: ~$1.8/hr
- **Cheapest raw compute cost**

**Current Issues**:
- Workers crash frequently
- Complex custom node setup
- Network volume sync issues
- Manual Docker management

**Best For**: Cost optimization (if reliability fixed)

**MCP/AI Agent Ready**: ⚠️ Complex (requires custom wrapper)

---

#### 6. Vast.ai

**Overview**: GPU cloud marketplace with serverless capabilities, offering affordable GPU compute with pre-built ComfyUI templates.

**Key Features**:
- **Serverless GPU Compute**: Dynamic scaling with reserve pool of workers for fast cold starts
- **Pre-built ComfyUI Template**: Dedicated serverless template with `/generate/sync` endpoint
- **Marketplace Model**: Access to global GPU fleet (RTX 4090, A100, etc.) at competitive rates
- **Fast Cold Starts**: Reserve pool enables sub-minute spin-up times
- **Cost Optimization**: ~20% cheaper than RunPod for RTX 4090 (~$0.35/hr)
- **S3 Integration**: Built-in support for output storage
- **Debugging Tools**: Logs, Jupyter, SSH access
- **Custom Workers**: PyWorker framework for building custom backends

**Serverless**: ✅ Yes (with reserve pool)
**ComfyUI Support**: ✅ Native (pre-built template)
**Custom Nodes**: ⚠️ Unknown (needs testing with template)
**Setup Time**: ⭐⭐⭐⭐ (Low - pre-built template)

**Pricing Model**:
- Pay-per-use GPU time
- RTX 4090: ~$0.35/hr (~20% cheaper than RunPod)
- A100: ~$1.4-1.6/hr (estimated, marketplace pricing)
- Volume storage pricing unclear (may be separate charge)

**Best For**: 
- Cost-optimized ComfyUI deployments
- Fast setup with pre-built templates
- Simple workflows (standard ComfyUI)

**MCP/AI Agent Ready**: ⚠️ Unknown (Python SDK available, needs testing)

**Comparison to RunPod/Modal**:
- ✅ Cheaper: ~20% cheaper than RunPod for RTX 4090
- ✅ Faster Setup: Pre-built template vs Docker/code
- ⚠️ Trade-off: No Infrastructure as Code (template-based)
- ⚠️ Unknown: Reliability, GitHub Actions support, custom nodes

**See**: [Vast.ai vs Modal/RunPod Comparison](./VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md) for detailed analysis.

---

#### 7. Modal

**Overview**: Code-driven serverless platform with good scaling and native GitHub Actions support.

**Key Features**:
- **Infrastructure as Code**: Python-based deployment (single file)
- **GitHub Actions Native**: `modal deploy` command, automatic CI/CD
- **Network Storage**: `modal.Volume` and `modal.NetworkFileSystem` for persistent storage
- **Good Autoscaling**: Scale-to-zero, handles traffic spikes
- **Standard REST APIs**: MCP/AI agent ready
- **Local Testing**: Test functions locally before deploying

**Serverless**: ✅ Yes
**ComfyUI Support**: ⚠️ Manual (requires Python wrapper, but cleaner than Docker)
**Custom Nodes**: ⚠️ Manual (defined in Python image, easier than Dockerfile)
**Setup Time**: ⭐⭐⭐ (Moderate - code-driven, but better DX than RunPod)

**Pricing Model**:
- Pay-per-use (per-second billing)
- $–$$ (competitive, slightly more than RunPod)
- No separate volume storage cost (included)
- Good scaling economics

**Network Storage**:
- ✅ `modal.Volume`: Persistent read-write storage
- ✅ `modal.NetworkFileSystem`: Shared access across containers
- ✅ Mount at custom paths (e.g., `/root/models`)
- ✅ Programmatic upload/download via Python API

**GitHub Actions Integration**:
- ✅ Native support via `modal deploy` command
- ✅ Single command deployment
- ✅ Automatic updates on push
- ✅ No custom scripts or MCP server needed

**Best For**: 
- Code-driven teams
- Infrastructure as Code preference
- GitHub Actions CI/CD workflows
- Teams wanting better developer experience than RunPod

**MCP/AI Agent Ready**: ✅ Yes (REST API, standard endpoints)

**Comparison to RunPod**:
- ✅ Better: Infrastructure as Code, GitHub Actions native, cleaner storage management
- ⚠️ Trade-off: Slightly higher cost (~2-3x per execution), but no volume storage fees
- ✅ Better: Local testing, easier debugging, version controlled infrastructure

---

#### 8. Baseten

**Overview**: Enterprise-grade serverless ML platform.

**Key Features**:
- Enterprise reliability
- Standard REST APIs
- Good documentation
- Model management

**Serverless**: ✅ Yes
**ComfyUI Support**: ⚠️ Manual (Docker container)
**Custom Nodes**: ⚠️ Manual (baked into image)
**Setup Time**: ⭐⭐⭐⭐ (Moderate)

**Pricing Model**:
- Enterprise pricing
- $$$ (premium)
- Management fees

**Best For**: Enterprise compliance, selling as product

**MCP/AI Agent Ready**: ✅ Yes (REST API)

---

### Category 3: Enterprise Cloud Providers

#### 9. AWS SageMaker

**Overview**: AWS managed ML platform with inference endpoints.

**Key Features**:
- SageMaker Inference Endpoints
- Async Inference for long tasks
- EKS integration
- Enterprise compliance

**Serverless**: ⚠️ Partial (Async Inference, not true serverless)
**ComfyUI Support**: ❌ Manual (custom Docker container)
**Custom Nodes**: ❌ Manual (baked into Docker image)
**Setup Time**: ⭐ (Very High - days/weeks)

**Pricing Model**:
- Per-ms execution + overhead
- High management fees
- Spot instances available (60-90% discount)
- **Most expensive** for ComfyUI use case

**Implementation**:
- Deploy ComfyUI as Docker container
- Custom handler scripts required
- IAM, networking, security setup
- Significant DevOps overhead

**Best For**: Enterprise compliance, existing AWS infrastructure, data residency

**MCP/AI Agent Ready**: ✅ Yes (REST API via SageMaker endpoints)

---

#### 10. GCP Vertex AI

**Overview**: Google Cloud managed ML platform.

**Key Features**:
- Vertex AI Custom Training/Prediction
- G2 (L4) and A3 (H100) instances
- Model Garden integration
- Enterprise features

**Serverless**: ⚠️ Partial (Autoscaling, not true serverless)
**ComfyUI Support**: ❌ Manual (custom Docker container)
**Custom Nodes**: ❌ Manual (baked into image)
**Setup Time**: ⭐ (Very High - days/weeks)

**Pricing Model**:
- Standard Vertex AI pricing
- Moderate to High
- Spot instances available

**Implementation**:
- Custom container deployment
- GCS for model storage
- Significant setup complexity

**Best For**: Existing GCP infrastructure, Google ecosystem

**MCP/AI Agent Ready**: ✅ Yes (REST API)

---

#### 11. Azure Machine Learning

**Overview**: Microsoft Azure managed ML platform.

**Key Features**:
- Azure ML Online Endpoints
- Custom Docker environments
- Enterprise integration
- Compliance features

**Serverless**: ⚠️ Partial (Managed endpoints, autoscaling)
**ComfyUI Support**: ❌ Manual (custom Docker container)
**Custom Nodes**: ❌ Manual (baked into image)
**Setup Time**: ⭐ (Very High - days/weeks)

**Pricing Model**:
- Enterprise-tier pricing
- High costs
- Management overhead

**Implementation**:
- Custom Docker environment
- Azure Files for storage
- Complex setup

**Best For**: Existing Azure infrastructure, Microsoft ecosystem

**MCP/AI Agent Ready**: ✅ Yes (REST API)

---

## Cost Comparison Matrix

| Platform | Setup Effort | Serverless | Cost (Low → High) | ComfyUI Native | Custom Nodes | Best For |
|----------|-------------|------------|-------------------|----------------|--------------|----------|
| **RunComfy** | ★★★★★ | ✅ Yes | $$ | ✅ Yes | ✅ Easy | Fast production, complex workflows |
| **ViewComfy** | ★★★★★ | ✅ Yes | $$ | ✅ Yes | ✅ Easy | Team collaboration |
| **Fal.ai** | ★★★★☆ | ✅ Yes | $$ | ✅ Optimized | ✅ Mostly | Quick deployments |
| **Replicate** | ★★★☆☆ | ✅ Yes | $$ | ⚠️ Via Cog | ⚠️ Custom builds | Model versioning |
| **RunPod** | ★★☆☆☆ | ✅ Yes | $ | ⚠️ Via workers | ⚠️ Complex | Cost optimization |
| **Vast.ai** | ★★★★☆ | ✅ Yes | $ | ✅ Native (template) | ⚠️ Unknown | Cost-optimized, fast setup |
| **Modal** | ★★★☆☆ | ✅ Yes | $–$$ | ⚠️ Manual | ⚠️ Manual | Code-driven teams |
| **Baseten** | ★★★★☆ | ✅ Yes | $$$ | ⚠️ Manual | ⚠️ Manual | Enterprise |
| **AWS SageMaker** | ★☆☆☆☆ | ⚠️ Partial | $$$$ | ❌ Manual | ❌ Manual | Enterprise compliance |
| **GCP Vertex AI** | ★☆☆☆☆ | ⚠️ Partial | $$$ | ❌ Manual | ❌ Manual | GCP ecosystem |
| **Azure ML** | ★☆☆☆☆ | ⚠️ Partial | $$$$ | ❌ Manual | ❌ Manual | Azure ecosystem |

### Cost Ranking (Cheapest → Most Expensive)

1. **Vast.ai** - $ (cheapest, ~20% cheaper than RunPod)
2. **RunPod** - $ (cheapest raw compute)
3. **Modal** - $–$$ (competitive)
3. **RunComfy/ViewComfy** - $$ (balanced)
4. **Fal.ai/Replicate** - $$ (competitive)
5. **Baseten** - $$$ (premium)
6. **GCP Vertex AI** - $$$ (enterprise)
7. **AWS SageMaker** - $$$$ (most expensive)
8. **Azure ML** - $$$$ (enterprise premium)

### Setup Effort Ranking (Easiest → Hardest)

1. **RunComfy/ViewComfy** - Minutes (one-click)
2. **Vast.ai** - Low (pre-built template)
3. **Fal.ai** - Low (upload JSON)
4. **Baseten** - Moderate (Docker)
5. **Replicate** - Moderate (Cog)
6. **Modal** - Moderate (code-driven)
7. **RunPod** - High (current pain point)
7. **AWS/GCP/Azure** - Very High (days/weeks)

---

## Detailed Cost Estimations: Image & Video Generation

### Cost Calculation Methodology

Costs are calculated based on:
- **GPU hourly rates** (from platform pricing)
- **Average generation time** (model-dependent)
- **Per-second billing** (serverless platforms)
- **Cold start considerations** (if applicable)

**Assumptions:**
- Image generation: SDXL (1024x1024, ~30 steps) = 5-15 seconds
- Image generation: Flux.1-dev (1024x1024, ~20-30 steps) = 10-25 seconds
- Video generation: SVD/AnimateDiff (2-4 sec clip, 25 frames) = 60-120 seconds
- Video generation: Wan 2.1/2.2 (5-10 sec clip, HD) = 180-300 seconds

### Image Generation Costs

#### Standard Image (SDXL, 1024x1024)

| Platform | GPU Tier | Hourly Rate | Gen Time | Cost per Image | Cost per 1,000 Images |
|----------|----------|-------------|----------|----------------|----------------------|
| **Vast.ai** | RTX 4090 (24GB) | ~$0.35/hr | 5-8s | **~$0.0005-0.001** | **~$0.50-1.00** |
| **RunPod** | RTX 3090/4090 (24GB) | $0.40-0.70/hr | 5-8s | **$0.0006-0.0016** | **$0.60-1.60** |
| **RunPod** | A100 (80GB) | $1.80-2.30/hr | 2-3s | **$0.001-0.002** | **$1.00-2.00** |
| **RunComfy** | T4/A4000 (16GB) | ~$0.40/hr | 8-12s | **$0.0009-0.0013** | **$0.90-1.30** |
| **RunComfy** | A10 (24GB) | ~$1.75-2.50/hr | 5-8s | **$0.0024-0.0056** | **$2.40-5.60** |
| **ViewComfy** | A10 (24GB) | ~$2.20/hr | 5-8s | **$0.003-0.005** | **$3.00-5.00** |
| **Fal.ai** | Managed | Pay-per-exec | 5-10s | **~$0.002-0.005** | **~$2.00-5.00** |
| **Replicate** | Managed | Pay-per-exec | 5-10s | **~$0.002-0.005** | **~$2.00-5.00** |
| **Modal** | A10 (24GB) | ~$1.50-2.00/hr | 5-8s | **$0.002-0.004** | **$2.00-4.00** |
| **AWS SageMaker** | g5.xlarge (A10G) | ~$1.00-1.50/hr | 8-12s | **$0.0022-0.005** | **$2.20-5.00** |
| **GCP Vertex AI** | L4 (24GB) | ~$1.30-1.80/hr | 8-12s | **$0.0029-0.006** | **$2.90-6.00** |
| **Azure ML** | NC A100 v4 | ~$3.60+/hr | 3-5s | **$0.003-0.005** | **$3.00-5.00** |

#### High-End Image (Flux.1-dev, 1024x1024)

| Platform | GPU Tier | Hourly Rate | Gen Time | Cost per Image | Cost per 1,000 Images |
|----------|----------|-------------|----------|----------------|----------------------|
| **Vast.ai** | A100 (80GB) | ~$1.4-1.6/hr | 10-15s | **~$0.0039-0.0067** | **~$3.90-6.70** |
| **RunPod** | A6000 (48GB) | ~$0.80-1.20/hr | 12-18s | **$0.0027-0.006** | **$2.70-6.00** |
| **RunPod** | A100 (80GB) | $1.80-2.30/hr | 10-15s | **$0.005-0.0096** | **$5.00-9.60** |
| **RunComfy** | A100 (80GB) | ~$2.00-3.50/hr | 10-15s | **$0.0056-0.0146** | **$5.60-14.60** |
| **RunComfy** | H100 (80GB) | ~$4.00-5.00/hr | 8-12s | **$0.0089-0.0167** | **$8.90-16.70** |
| **ViewComfy** | A100 (80GB) | ~$4.10/hr | 10-15s | **$0.011-0.017** | **$11.00-17.00** |
| **AWS SageMaker** | g5.2xlarge (A10G) | ~$1.20-1.50/hr | 15-20s | **$0.005-0.0083** | **$5.00-8.30** |
| **GCP Vertex AI** | A100 | ~$3.80/hr | 10-15s | **$0.0106-0.0158** | **$10.60-15.80** |

**Note**: Flux.1 requires 24GB+ VRAM, so lower-tier GPUs (T4, A4000) are not viable.

### Video Generation Costs

#### Short Video (SVD/AnimateDiff, 2-4 seconds, 25 frames)

| Platform | GPU Tier | Hourly Rate | Gen Time | Cost per Video | Cost per 100 Videos |
|----------|----------|-------------|----------|----------------|---------------------|
| **Vast.ai** | A100 (80GB) | ~$1.4-1.6/hr | 60-90s | **~$0.023-0.04** | **~$2.30-4.00** |
| **RunPod** | A100 (80GB) | $1.80-2.30/hr | 60-90s | **$0.03-0.0575** | **$3.00-5.75** |
| **RunComfy** | A100 (80GB) | ~$2.00-3.50/hr | 60-90s | **$0.033-0.0875** | **$3.30-8.75** |
| **RunComfy** | H100 (80GB) | ~$4.00-5.00/hr | 45-60s | **$0.05-0.083** | **$5.00-8.30** |
| **ViewComfy** | A100 (80GB) | ~$4.10/hr | 60-90s | **$0.068-0.103** | **$6.80-10.30** |
| **AWS SageMaker** | g5.2xlarge (A10G) | ~$1.20-1.50/hr | 90-120s | **$0.03-0.05** | **$3.00-5.00** |
| **GCP Vertex AI** | A100 | ~$3.80/hr | 60-90s | **$0.063-0.095** | **$6.30-9.50** |

#### High-End Video (Wan 2.1/2.2, 5-10 seconds, HD)

| Platform | GPU Tier | Hourly Rate | Gen Time | Cost per Video | Cost per 100 Videos |
|----------|----------|-------------|----------|----------------|---------------------|
| **Vast.ai** | A100 (80GB) | ~$1.4-1.6/hr | 180-240s | **~$0.07-0.107** | **~$7.00-10.70** |
| **RunPod** | A100 (80GB) | $1.80-2.30/hr | 180-240s | **$0.09-0.153** | **$9.00-15.30** |
| **RunComfy** | H100 (80GB) | ~$4.00-5.00/hr | 180-240s | **$0.20-0.333** | **$20.00-33.30** |
| **RunComfy** | H200 (141GB) | ~$6.00-8.00/hr | 150-200s | **$0.25-0.444** | **$25.00-44.40** |
| **ViewComfy** | A100 (80GB) | ~$4.10/hr | 240-300s | **$0.273-0.342** | **$27.30-34.20** |
| **AWS SageMaker** | p4d.24xlarge (A100) | ~$3.00+/hr | 240-300s | **$0.20-0.25** | **$20.00-25.00** |
| **GCP Vertex AI** | A100 | ~$3.80/hr | 240-300s | **$0.253-0.317** | **$25.30-31.70** |

### Cost Summary by Use Case

#### Image Generation (per 1,000 images)

| Use Case | Cheapest | Mid-Range | Premium |
|----------|----------|-----------|---------|
| **SDXL (Standard)** | Vast.ai RTX 4090: **~$0.50-1.00** | RunPod RTX 3090: **$0.60-1.60** | RunComfy A10: **$2.40-5.60** |
| **Flux.1 (High-End)** | Vast.ai A100: **~$3.90-6.70** | RunPod A100: **$5.00-9.60** | RunComfy A100: **$5.60-14.60** |

#### Video Generation (per 100 videos)

| Use Case | Cheapest | Mid-Range | Premium |
|----------|----------|-----------|---------|
| **Short Video (SVD)** | Vast.ai A100: **~$2.30-4.00** | RunPod A100: **$3.00-5.75** | RunComfy A100: **$3.30-8.75** |
| **HD Video (Wan 2.1)** | Vast.ai A100: **~$7.00-10.70** | RunPod A100: **$9.00-15.30** | RunComfy H100: **$20.00-33.30** |

### Additional Cost Considerations

#### Cold Start Costs
- **RunPod/RunComfy**: No charge during cold start (30-60s), but adds latency
- **Keep-Warm**: Optional, costs ~$0.40-2.00/hr depending on GPU tier
- **AWS/GCP/Azure**: Cold starts can take 2-5 minutes, may require minimum instances

#### Storage & Egress
- **Model Storage**: Network volumes (RunPod): ~$0.07/GB/month
- **Output Storage**: S3/Azure Blob: ~$0.023/GB/month
- **Egress**: Usually free or minimal for first 100GB/month

#### Volume Discounts
- **RunPod**: Reserved instances: 20-30% discount
- **AWS/GCP**: Spot instances: 60-90% discount (but can be interrupted)
- **Enterprise**: Volume discounts available for high usage

### Cost Optimization Strategies

1. **Right-Size GPU**: Match GPU VRAM to model requirements (16GB for SDXL, 48GB+ for Flux, 80GB+ for video)
2. **Scale-to-Zero**: Use serverless with minWorkers=0 to avoid idle costs
3. **Batch Processing**: Process multiple images/videos in single request when possible
4. **Keep-Warm vs. Cold Start**: Calculate break-even point (typically ~10-20 requests/hour)
5. **Spot Instances**: Use for non-critical workloads (AWS/GCP) - 60-90% savings but can be interrupted

---

## Serverless Capabilities

### True Serverless (Scale-to-Zero)

✅ **RunComfy** - Native scale-to-zero  
✅ **ViewComfy** - Native scale-to-zero  
✅ **Fal.ai** - Scale-to-zero  
✅ **Replicate** - Scale-to-zero  
✅ **RunPod** - Scale-to-zero (with minWorkers=0)  
✅ **Vast.ai** - Scale-to-zero (with reserve pool)  
✅ **Modal** - Scale-to-zero  
✅ **Baseten** - Scale-to-zero  

### Partial Serverless (Autoscaling, but not scale-to-zero)

⚠️ **AWS SageMaker** - Async Inference, autoscaling  
⚠️ **GCP Vertex AI** - Autoscaling endpoints  
⚠️ **Azure ML** - Managed endpoints with autoscaling  

---

## ComfyUI Custom Node Support

### Native/Easy Support

✅ **RunComfy** - ComfyUI-Manager, Cloud Save captures all nodes  
✅ **ViewComfy** - Similar to RunComfy  
✅ **Fal.ai** - Managed runtime handles most nodes  
⚠️ **Vast.ai** - Pre-built template (unknown custom node support)  

### Manual Support (Requires Custom Builds)

⚠️ **Replicate** - Via Cog containerization  
⚠️ **RunPod** - Custom Docker images required  
⚠️ **Vast.ai** - Pre-built template (may need PyWorker for custom)  
⚠️ **Modal** - Code-driven, manual container builds  
⚠️ **Baseten** - Docker image with nodes baked in  

### Complex/Not Recommended

❌ **AWS SageMaker** - Manual Docker, significant DevOps  
❌ **GCP Vertex AI** - Manual Docker, significant DevOps  
❌ **Azure ML** - Manual Docker, significant DevOps  

---

## MCP/AI Agent Integration

### Known MCP-Ready (REST APIs)

✅ **Modal** - Standard REST APIs  
✅ **Baseten** - Standard REST APIs  
✅ **Replicate** - REST API  
⚠️ **Vast.ai** - Python SDK, CLI (needs testing)  
✅ **AWS SageMaker** - REST API via endpoints  
✅ **GCP Vertex AI** - REST API  
✅ **Azure ML** - REST API  

### Needs Testing

⚠️ **RunComfy** - Unknown (needs evaluation)  
⚠️ **ViewComfy** - Unknown (needs evaluation)  
⚠️ **Fal.ai** - Unknown (needs evaluation)  
⚠️ **Vast.ai** - Python SDK available (needs testing)  
⚠️ **RunPod** - Complex (requires custom wrapper)  

### MCP Integration Resources

- **mcp.run**: Registry for turning APIs into MCP tools
- **Fractal SDK**: Tools for embedding ComfyUI UIs in chat apps via MCP

---

## Recommendations

### Fast Path (Phase 1A) - Immediate Production

**Priority**: Test **RunComfy** first
- Addresses custom node pain point directly
- One-click deployment
- Cloud Save eliminates dependency issues
- Fastest path to production

**Backup**: **ViewComfy** if RunComfy doesn't meet requirements

### Comprehensive Evaluation (Phase 1B)

**For Cost Optimization**: RunPod (if reliability can be fixed)  
**For Enterprise Compliance**: AWS SageMaker / GCP Vertex AI / Azure ML  
**For Code-Driven Teams**: Modal  
**For Model Versioning**: Replicate  
**For Managed Runtime**: Fal.ai  

### Not Recommended for Fast Path

❌ **AWS/GCP/Azure** - Too much DevOps overhead for fast deployment  
❌ **Baseten** - Overkill unless selling as product  
❌ **RunPod** - Current reliability issues block fast path  

---

## Key Insights

1. **Specialized platforms (RunComfy, ViewComfy) solve the custom node problem** via Cloud Save/snapshotting
2. **Enterprise clouds require significant DevOps** but offer compliance/security
3. **Cost vs. Effort trade-off**: Specialized platforms cost more but save weeks of setup time
4. **MCP integration**: Most platforms have REST APIs, but specialized platforms need testing
5. **Serverless**: True scale-to-zero available on specialized platforms, partial on enterprise clouds

---

## Next Steps

1. **Phase 1A**: Test RunComfy with Denrisi workflow (most complex)
2. **Phase 1A**: Test ViewComfy as backup option
3. **Phase 1B**: Evaluate MCP/AI agent integration for chosen platform
4. **Phase 1B**: Cost analysis (per 1000 images)
5. **Phase 1B**: Reliability testing (crash frequency, recovery time)

---

## References

- [RunComfy Documentation](https://docs.runcomfy.com/serverless/introduction)
- [ViewComfy](https://viewcomfy.com/)
- [RunPod ComfyUI Serverless](https://docs.runpod.io/tutorials/serverless/comfyui)
- [Modal Documentation](https://modal.com/docs)
- [Baseten Documentation](https://docs.baseten.co)
- [AWS SageMaker Inference](https://docs.aws.amazon.com/sagemaker/)
- [GCP Vertex AI](https://cloud.google.com/vertex-ai)
- [Azure ML](https://learn.microsoft.com/azure/machine-learning/)
- [MCP Registry](https://docs.mcp.run/)
- [Fractal SDK](https://github.com/fractal-mcp/sdk)

---

**Last Updated**: 2026-01-27  
**Next Review**: After Phase 1A testing complete
