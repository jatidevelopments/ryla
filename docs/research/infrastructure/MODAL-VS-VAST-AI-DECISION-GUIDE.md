# Modal.com vs Vast.ai: Decision Guide

> **Date**: 2026-01-27  
> **Status**: Research Complete  
> **Initiative**: IN-030  
> **Purpose**: Clear decision framework for choosing between Modal.com and Vast.ai

---

## Executive Summary

**Modal.com is better for**: Production reliability, Infrastructure as Code, developer experience, and teams prioritizing stability over raw cost.

**Vast.ai is better for**: Cost optimization, initial setup speed, and teams willing to trade some reliability/control for lower costs.

**Recommendation**: **Start with Modal.com** for production, evaluate Vast.ai for cost optimization after establishing stable workflows.

---

## Quick Comparison

| Factor | Modal.com | Vast.ai | Winner |
|--------|-----------|---------|--------|
| **Cost (Raw Compute)** | $1.50-3.00/hr (A10-A100) | $0.35-1.60/hr (RTX 4090-A100) | 🏆 Vast.ai |
| **Cost (Total)** | Included storage | Unknown storage costs | ⚠️ TBD |
| **Reliability** | ✅ High (managed platform) | ⚠️ Unknown (marketplace) | 🏆 Modal |
| **Infrastructure as Code** | ✅ Full (Python) | ❌ No (template-based) | 🏆 Modal |
| **GitHub Actions** | ✅ Native | ⚠️ Unknown | 🏆 Modal |
| **Developer Experience** | ✅ Excellent | ⚠️ Good (template) | 🏆 Modal |
| **Setup Time** | ⭐⭐⭐ (Moderate) | ⭐⭐⭐⭐ (Low - template) | 🏆 Vast.ai |
| **Custom Nodes** | ✅ Full control | ⚠️ Unknown (template) | 🏆 Modal |
| **Code Reusability** | N/A (current) | ⚠️ ~70% (needs adaptation) | 🏆 Modal |

---

## When Modal.com is Better

### 1. **Production Reliability is Critical**

**Modal Advantages**:
- ✅ **Managed Platform**: Not a marketplace - consistent, reliable infrastructure
- ✅ **Proven Reliability**: No frequent crashes, reliable worker spin-up
- ✅ **Auto-Recovery**: Automatic failure recovery
- ✅ **Support**: Good documentation and support

**Vast.ai Concerns**:
- ⚠️ **Marketplace Model**: Similar to RunPod - may have reliability issues
- ⚠️ **Unknown Reliability**: No production data yet
- ⚠️ **Community Support**: Less enterprise support

**When This Matters**:
- Production workloads with SLAs
- Customer-facing services
- High-volume generation
- Can't afford downtime

**Example**: RYLA's production image generation - users expect reliable service.

---

### 2. **Infrastructure as Code is Important**

**Modal Advantages**:
- ✅ **Full IaC**: Everything in Python, version-controlled
- ✅ **Single File Deployment**: `app.py` contains entire infrastructure
- ✅ **Easy Review**: Code review for infrastructure changes
- ✅ **Reproducible**: Same code = same infrastructure

**Vast.ai Limitations**:
- ❌ **Template-Based**: Pre-built templates, not code-driven
- ❌ **Less Flexible**: Can't customize infrastructure easily
- ❌ **No Version Control**: Template changes not tracked in code

**When This Matters**:
- Teams using Git workflows
- Need to review infrastructure changes
- Want reproducible deployments
- Multiple environments (dev/staging/prod)

**Example**: RYLA's current Modal setup - all infrastructure in `apps/modal/app.py`, version-controlled.

---

### 3. **Developer Experience & Automation**

**Modal Advantages**:
- ✅ **Native GitHub Actions**: `modal deploy` works out of the box
- ✅ **Local Testing**: `modal run` for testing before deployment
- ✅ **Excellent Docs**: Comprehensive documentation
- ✅ **Standard REST API**: Easy integration

**Vast.ai Limitations**:
- ⚠️ **Unknown GitHub Actions**: May need custom scripts
- ⚠️ **Unknown Local Testing**: May not support local testing
- ⚠️ **Less Documentation**: Newer platform, less documentation

**When This Matters**:
- CI/CD automation
- Fast iteration cycles
- Team collaboration
- AI agent integration

**Example**: RYLA's GitHub Actions workflow - automatic deployment on push.

---

### 4. **Custom Requirements**

**Modal Advantages**:
- ✅ **Full Control**: Install any custom nodes, any dependencies
- ✅ **Flexible Image Build**: Python DSL for complex setups
- ✅ **Custom Volumes**: Persistent storage with full control

**Vast.ai Limitations**:
- ⚠️ **Template Constraints**: Pre-built template may not support all custom nodes
- ⚠️ **Less Flexible**: May need PyWorker for custom requirements
- ⚠️ **Unknown Storage**: Volume management unclear

**When This Matters**:
- Complex custom nodes (e.g., res4lyf, controlaltai-nodes)
- Specialized workflows
- Custom model storage requirements

**Example**: RYLA's Denrisi workflow requires res4lyf custom nodes.

---

## When Vast.ai is Better

### 1. **Cost Optimization is Priority**

**Vast.ai Advantages**:
- ✅ **Cheaper Raw Compute**: ~20% cheaper than RunPod, ~50-70% cheaper than Modal
- ✅ **RTX 4090 Available**: $0.35/hr vs Modal's A10 at $1.50-2.00/hr
- ✅ **Marketplace Pricing**: Competitive rates

**Modal Costs**:
- ⚠️ **Higher Per-Hour**: A10 $1.50-2.00/hr, A100 $2.00-3.00/hr
- ⚠️ **No RTX Options**: Only A10, A100, L40S, H100
- ✅ **Included Storage**: No separate volume charges

**Cost Comparison** (Per 1,000 SDXL Images):
- **Vast.ai RTX 4090**: ~$0.50-1.00
- **Modal A10**: $2.00-4.00
- **Modal A100**: $1.00-2.00

**When This Matters**:
- High-volume generation
- Cost-sensitive workloads
- Batch processing
- Budget constraints

**Example**: Processing 10,000 images/month - Vast.ai saves ~$20-30 vs Modal A10.

---

### 2. **Fast Initial Setup**

**Vast.ai Advantages**:
- ✅ **Pre-built Template**: One-command deployment
- ✅ **Minimal Setup**: Template handles ComfyUI installation
- ✅ **Quick Start**: Get running in minutes

**Modal Setup**:
- ⚠️ **Code Required**: Need to write Python code
- ⚠️ **Image Build**: Need to define image with ComfyUI
- ⚠️ **More Steps**: Setup takes longer initially

**When This Matters**:
- Prototyping
- Quick testing
- One-off projects
- Learning/experimentation

**Example**: Testing a new workflow - Vast.ai template = faster initial setup.

---

### 3. **Simple Workflows (No Custom Nodes)**

**Vast.ai Advantages**:
- ✅ **Template Works**: Pre-built template handles standard ComfyUI
- ✅ **No Custom Setup**: Template includes common nodes
- ✅ **Easy Deployment**: Just send workflow JSON

**Modal Setup**:
- ⚠️ **More Setup**: Need to define image, install nodes
- ⚠️ **More Code**: More infrastructure code needed

**When This Matters**:
- Standard ComfyUI workflows
- No custom nodes required
- Simple use cases

**Example**: Basic SDXL text-to-image - Vast.ai template sufficient.

---

## Cost Analysis: Total Cost of Ownership

### Raw Compute Costs

**Per 1,000 SDXL Images (1024x1024)**:

| Platform | GPU | Cost per 1,000 Images |
|----------|-----|----------------------|
| **Vast.ai** | RTX 4090 | **~$0.50-1.00** |
| **Vast.ai** | A100 | **~$0.80-1.60** |
| **Modal** | A10 | $2.00-4.00 |
| **Modal** | A100 | $1.00-2.00 |

**Verdict**: Vast.ai is **2-4x cheaper** for raw compute.

---

### Hidden Costs

#### Storage Costs

**Modal**:
- ✅ Volume storage included (no separate charge)
- ✅ 200GB models = $0/month

**Vast.ai**:
- ⚠️ Storage pricing unknown
- ⚠️ May be separate charge (similar to RunPod's $0.07/GB/month)
- ⚠️ 200GB models = potentially $14/month

**Impact**: If Vast.ai charges for storage, Modal's A100 becomes competitive.

---

#### Operational Overhead

**Modal**:
- ✅ Low operational overhead (reliable, automated)
- ✅ Less engineering time on infrastructure
- ✅ Faster deployment (minutes vs hours)

**Vast.ai**:
- ⚠️ Unknown operational overhead
- ⚠️ May require more troubleshooting (marketplace model)
- ⚠️ May need more engineering time

**Impact**: If Vast.ai requires 2x more engineering time, cost savings disappear.

---

#### Reliability Costs

**Modal**:
- ✅ High reliability (fewer failures)
- ✅ Auto-recovery (less manual intervention)
- ✅ Less downtime

**Vast.ai**:
- ⚠️ Unknown reliability
- ⚠️ May have more failures (marketplace model)
- ⚠️ May require manual intervention

**Impact**: Failures cost engineering time and user trust.

---

### Total Cost of Ownership Example

**Scenario**: 10,000 images/month, 200GB model storage

**Vast.ai RTX 4090**:
- Compute: 10,000 × $0.00075 = **$7.50/month**
- Storage: Unknown (assume $14/month like RunPod) = **$14/month**
- Operational overhead: Unknown (assume 2 hours/month) = **~$200/month** (engineering time)
- **Total**: ~$221.50/month

**Modal A10**:
- Compute: 10,000 × $0.003 = **$30/month**
- Storage: Included = **$0/month**
- Operational overhead: Low (0.5 hours/month) = **~$50/month**
- **Total**: ~$80/month

**Verdict**: If operational overhead is high, Modal may be cheaper overall.

---

## Reliability Comparison

### Modal.com Reliability

**Strengths**:
- ✅ **Managed Platform**: Not marketplace - consistent infrastructure
- ✅ **Proven Track Record**: Used by many production teams
- ✅ **Auto-Recovery**: Automatic failure handling
- ✅ **Good Support**: Documentation and support available

**Weaknesses**:
- ⚠️ **Higher Cost**: More expensive than marketplace options
- ⚠️ **Less Flexibility**: Can't choose specific GPU providers

**Reliability Score**: **9/10** (High)

---

### Vast.ai Reliability

**Strengths**:
- ✅ **Reserve Pool**: Faster cold starts
- ✅ **Marketplace Model**: Access to many GPU providers
- ✅ **Good Debugging**: Jupyter, SSH access

**Weaknesses**:
- ⚠️ **Marketplace Model**: Similar to RunPod - may have reliability issues
- ⚠️ **Unknown**: No production data yet
- ⚠️ **Variable Quality**: Different providers = different reliability

**Reliability Score**: **6/10** (Unknown, but concerns based on marketplace model)

---

### RunPod Reliability (Reference)

**Issues Experienced**:
- ❌ Frequent worker crashes
- ❌ Workers not spinning up
- ❌ Jobs stuck in queue
- ❌ High operational overhead

**Reliability Score**: **4/10** (Poor - why we moved to Modal)

**Note**: Vast.ai uses similar marketplace model, so may have similar issues.

---

## Decision Framework

### Choose Modal.com If:

1. ✅ **Production reliability is critical**
2. ✅ **Infrastructure as Code is important**
3. ✅ **GitHub Actions automation needed**
4. ✅ **Custom nodes/workflows required**
5. ✅ **Team values developer experience**
6. ✅ **Can afford 2-4x higher compute costs**
7. ✅ **Want proven, stable platform**

**Best For**: Production workloads, teams prioritizing stability and DX over raw cost.

---

### Choose Vast.ai If:

1. ✅ **Cost optimization is priority**
2. ✅ **Simple workflows (no custom nodes)**
3. ✅ **Fast initial setup needed**
4. ✅ **Prototyping/experimentation**
5. ✅ **Willing to trade reliability for cost**
6. ✅ **Can handle operational overhead**
7. ✅ **Budget constraints**

**Best For**: Cost-sensitive workloads, prototyping, simple use cases.

---

### Hybrid Approach (Recommended)

**Strategy**: Use both platforms strategically.

1. **Start with Modal.com**:
   - Production workloads
   - Complex workflows
   - Reliability-critical services

2. **Evaluate Vast.ai**:
   - Cost optimization opportunities
   - Batch processing
   - Non-critical workloads

3. **Gradual Migration**:
   - Test Vast.ai with one workflow
   - Compare cost, reliability, DX
   - Migrate if benefits outweigh risks

**Benefits**:
- ✅ Best of both worlds
- ✅ Risk mitigation (fallback)
- ✅ Data-driven decision

---

## Recommendation for RYLA

### Current State

**RYLA Uses Modal.com** (per ADR-007):
- ✅ Production workflows deployed
- ✅ Infrastructure as Code established
- ✅ GitHub Actions automation working
- ✅ Custom nodes working (res4lyf, etc.)

### Recommendation: **Stick with Modal.com, Evaluate Vast.ai**

**Phase 1: Continue with Modal.com** (Now)
- ✅ Production stability
- ✅ Proven reliability
- ✅ Good developer experience
- ✅ Infrastructure as Code

**Phase 2: Evaluate Vast.ai** (IN-030 Initiative)
- ✅ Test with one workflow (e.g., Flux)
- ✅ Compare cost, reliability, DX
- ✅ Measure operational overhead
- ✅ Make data-driven decision

**Phase 3: Strategic Decision** (After Evaluation)
- ✅ If Vast.ai works well → Use for cost optimization
- ✅ If Modal is better → Stick with Modal
- ✅ Hybrid approach → Use both strategically

### Why Not Start with Vast.ai?

**Risks**:
- ⚠️ Unknown reliability (marketplace model concerns)
- ⚠️ May not support custom nodes (res4lyf, etc.)
- ⚠️ Unknown operational overhead
- ⚠️ May require more engineering time

**Benefits of Starting with Modal**:
- ✅ Establish stable production first
- ✅ Understand requirements better
- ✅ Then optimize costs with Vast.ai if needed

---

## Cost vs Reliability Trade-off

### The Real Question

**Is 2-4x cost savings worth potential reliability issues?**

**Answer Depends On**:

1. **Volume**: 
   - Low volume (<1,000 images/month) → Cost difference small (~$2-4/month)
   - High volume (>10,000 images/month) → Cost difference significant (~$20-40/month)

2. **Reliability Requirements**:
   - Production/customer-facing → Reliability critical
   - Internal/batch processing → Can tolerate some failures

3. **Engineering Time**:
   - Limited engineering time → Modal (lower overhead)
   - Engineering time available → Vast.ai (can handle issues)

4. **Risk Tolerance**:
   - Low risk tolerance → Modal (proven, stable)
   - High risk tolerance → Vast.ai (experiment, optimize)

---

## Summary

### Modal.com Wins On:
- ✅ **Reliability** (managed platform, proven)
- ✅ **Infrastructure as Code** (full Python IaC)
- ✅ **Developer Experience** (excellent DX, automation)
- ✅ **Custom Requirements** (full control)

### Vast.ai Wins On:
- ✅ **Cost** (2-4x cheaper raw compute)
- ✅ **Initial Setup** (faster with templates)
- ✅ **Simple Workflows** (template sufficient)

### Recommendation:
**Start with Modal.com for production, evaluate Vast.ai for cost optimization after establishing stable workflows.**

---

## References

- [Vast.ai vs Modal/RunPod Comparison](./VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md)
- [Vast.ai Code Reusability Analysis](./VAST-AI-CODE-REUSABILITY-ANALYSIS.md)
- [Modal vs RunPod Comparison](./MODAL-VS-RUNPOD-COMPARISON.md)
- [ADR-007: Use Modal.com Over RunPod](../decisions/ADR-007-modal-over-runpod.md)
- [IN-030: Vast.ai Alternative Infrastructure Evaluation](../initiatives/IN-030-vast-ai-alternative-infrastructure.md)

---

**Last Updated**: 2026-01-27  
**Status**: Research Complete - Decision Framework Ready
