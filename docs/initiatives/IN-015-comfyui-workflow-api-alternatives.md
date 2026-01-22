# [INITIATIVE] IN-015: ComfyUI Workflow-to-API Platform Evaluation

**Status**: Active  
**Created**: 2026-01-19  
**Last Updated**: 2026-01-27  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, Product Team

---

## Executive Summary

**One-sentence description**: Evaluate and adopt alternative platforms (RunComfy, ViewComfy, Modal, Baseten, or other cloud hosting) that provide turnkey "import ComfyUI workflow → get API endpoint" solutions with MCP/AI agent accessibility, reducing operational complexity and enabling fast production deployment compared to current RunPod serverless setup that experiences frequent crashes and reliability issues.

**Business Impact**: E-CAC (reduce infrastructure costs), C-Core Value (improve reliability), B-Retention (reduce workflow failures), A-Activation (faster feature deployment)

---

## Why (Business Rationale)

### Problem Statement

**Current Pain Points**:
- **RunPod Serverless Setup Complexity**: Requires manual Docker image creation, endpoint configuration, network volume management, and custom node installation - takes too long to set up
- **Frequent Crashes**: Workers crash frequently, requiring constant resetting and manual intervention
- **Operational Overhead**: Workers not spinning up reliably, cold start issues, manual troubleshooting required
- **Infrastructure Management**: Must maintain custom Dockerfiles, dependency scripts, and endpoint configurations
- **Time to Deploy**: New workflows require significant setup time (Docker builds, endpoint creation, testing) - blocking production launch
- **Reliability Issues**: Current endpoint (`pwqwwai0hlhtw9`) experiencing worker spin-up failures, blocking production workflows
- **MCP/AI Agent Integration**: RunPod setup is frustrating for AI agents to configure end-to-end; need easier programmatic access
- **Unknown Load at Launch**: Serverless means unpredictable costs and reliability during initial launch phase

**Key Pain Points**:
- No systematic validation that workflows work on serverless endpoints (addressed by EP-044, but still complex)
- Dependency management (EP-039) generates scripts but requires manual deployment
- No "one-click" workflow-to-API solution
- High engineering time spent on infrastructure vs. product features
- Current RunPod setup requires deep infrastructure knowledge
- **URGENT**: Need workflows live in production ASAP to support image, video, and face-swap capabilities

### Current State

- **Workflow Definition**: ✅ Exists (`libs/business/src/workflows/`)
- **Dependency Management**: ✅ EP-039 generates install scripts and Dockerfiles
- **Serverless Endpoint**: ⚠️ RunPod serverless exists but unreliable (workers not spinning up)
- **Testing Framework**: ✅ EP-044 provides comprehensive testing (but endpoint unavailable)
- **Documentation**: ⚠️ Setup guides exist but complex, many manual steps
- **Alternative Platforms**: ❌ Not evaluated or tested

### Desired State

- **Turnkey Solution**: Upload workflow → get API endpoint (minimal setup)
- **Reliable Infrastructure**: Workers spin up reliably, no crashes, no manual intervention
- **Reduced Operational Overhead**: Less time spent on Docker, endpoints, dependencies
- **Cost Optimization**: Lower per-run costs or better cost predictability (pay only for what we need)
- **Faster Deployment**: New workflows deployable in minutes, not hours/days
- **Better Developer Experience**: Focus on workflows, not infrastructure
- **MCP/AI Agent Ready**: Easy programmatic access via MCP or standard APIs for AI agent integration
- **Production Ready**: Fast path to get workflows live for image, video, face-swap capabilities
- **Extensible**: Easy to add new workflows and capabilities without complex setup

### Business Drivers

- **Revenue Impact**: Faster workflow deployment = more features = higher user satisfaction
- **Cost Impact**: Potentially lower infrastructure costs, reduced engineering time
- **Risk Mitigation**: More reliable infrastructure = fewer production failures
- **Competitive Advantage**: Faster iteration on new workflows and features
- **User Experience**: More reliable image generation = better retention

---

## How (Approach & Strategy)

### Strategy

**Two-Path Approach**:

1. **Fast Path (Immediate)**: Evaluate RunComfy and ViewComfy for quick production deployment
   - Test with Denrisi workflow (most complex, most custom nodes)
   - Measure setup time, reliability, MCP accessibility
   - If viable, deploy to production within 1 week

2. **Comprehensive Evaluation (Parallel)**: Evaluate all alternatives including other cloud hosting
   - Test RunComfy, ViewComfy, Modal, Baseten, and other cloud hosting solutions
   - Cost analysis: Compare pricing models, compute costs, and total cost of ownership
   - Ease of use: Measure setup time, deployment complexity, developer experience
   - Reliability: Test worker spin-up, cold starts, error handling, crash frequency
   - MCP/AI Agent Integration: Evaluate programmatic access, API quality, automation support
   - Migration Planning: Plan migration path if switching platforms
   - Decision Framework: Create decision matrix and recommendation

**Priority**: Fast path first (get production live), then comprehensive evaluation for long-term optimization

### Key Principles

- **Speed to Production**: Fast path to get workflows live ASAP (days, not weeks)
- **Data-Driven**: Test real workflows, measure actual costs and performance
- **Minimize Disruption**: Evaluate alternatives without breaking current setup
- **Cost-Conscious**: Prioritize cost-effectiveness while maintaining quality (pay only for what we need)
- **Developer Experience**: Prioritize ease of use and deployment speed
- **Reliability First**: Choose platform with best uptime, worker reliability, and crash resistance
- **MCP/AI Agent Ready**: Must support programmatic access for AI agent integration
- **Extensibility**: Easy to add new workflows (image, video, face-swap) without complex setup

### Phases

**Fast Path (Week 1)**:
1. **Phase 1A: Quick Platform Research** - Document RunComfy, ViewComfy, pricing, MCP access - 1 day
2. **Phase 2A: Fast POC Testing** - Test RunComfy, ViewComfy with Denrisi workflow, measure setup time - 2 days
3. **Phase 3A: Fast Decision** - Quick cost/reliability comparison, recommend fast path solution - 0.5 days
4. **Phase 4A: Fast Deployment** - Deploy to production if viable - 1.5 days

**Comprehensive Evaluation (Week 2-3, Parallel)**:
1. **Phase 1B: Full Platform Research** - Document all platforms (RunComfy, ViewComfy, Modal, Baseten, other cloud hosting), pricing, features, MCP support - 2 days
2. **Phase 2B: Comprehensive POC Testing** - Test all platforms with Denrisi workflow - 3 days
3. **Phase 3B: Cost & Performance Analysis** - Measure costs, cold starts, reliability, MCP accessibility - 2 days
4. **Phase 4B: Decision & Recommendation** - Create decision matrix, recommend long-term platform - 1 day
5. **Phase 5B: Migration Planning (if applicable)** - Plan migration path if switching - 2 days

**Total Timeline**: 
- **Fast Path**: 5 days (get production live)
- **Comprehensive**: 1.5-2 weeks (long-term optimization)

### Dependencies

- **EP-044**: Serverless Endpoint Testing Framework (provides testing methodology)
- **EP-039**: ComfyUI Dependency Management (workflows and dependencies)
- **IN-010**: Denrisi Workflow Validation (test workflow)
- **RunPod Access**: For comparison testing
- **Platform Access**: RunComfy, ViewComfy trial accounts

### Constraints

- Must support ComfyUI workflows (API JSON format)
- Must support custom nodes (e.g., `res4lyf`)
- Must support custom models (Z-Image-Turbo, LoRAs)
- Must be serverless (scale to zero) OR have predictable costs
- Must support MCP/AI agent integration (programmatic access, standard APIs)
- Must be reliable (no frequent crashes, minimal manual intervention)
- Budget: ~$100-200 for testing across platforms
- Must not break existing production workflows during evaluation
- **Fast Path Constraint**: Must be deployable to production within 1 week

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-27 (IMMEDIATE - current RunPod crashes blocking production)
- **Fast Path Target**: 2026-02-01 (5 days - get production live)
- **Comprehensive Target**: 2026-02-14 (2.5 weeks - long-term optimization)

**Key Milestones**:
- **M1A: Fast Path Platform Research**: 2026-01-28
- **M2A: Fast Path POC Testing**: 2026-01-30
- **M3A: Fast Path Decision**: 2026-01-30
- **M4A: Fast Path Production Deployment**: 2026-02-01
- **M1B: Comprehensive Platform Research**: 2026-02-03
- **M2B: Comprehensive POC Testing**: 2026-02-07
- **M3B: Cost & Performance Analysis**: 2026-02-10
- **M4B: Long-Term Decision & Recommendation**: 2026-02-12
- **M5B: Migration Plan (if applicable)**: 2026-02-14

### Priority

**Priority Level**: P0 (URGENT - blocking production launch)

**Rationale**: 
- Current RunPod setup is unreliable (frequent crashes, workers not spinning up)
- High operational overhead blocking feature development
- **URGENT**: Need workflows live in production ASAP for image, video, face-swap capabilities
- Potential cost savings and reliability improvements
- Faster workflow deployment = competitive advantage
- MCP/AI agent integration needed for automation

### Resource Requirements

- **Team**: Infrastructure Team (1 engineer), Backend Team (0.5 engineer for integration testing)
- **Budget**: ~$100-200 in platform credits for testing
- **External Dependencies**: 
  - RunComfy trial account
  - ViewComfy trial account
  - Modal account (if testing)
  - Baseten account (if testing)
  - Other cloud hosting solutions (to be identified)
  - Current RunPod access (for comparison)
  - MCP server access (for testing AI agent integration)

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Infrastructure Team  
**Role**: Infrastructure Lead  
**Responsibilities**: 
- Platform evaluation and testing
- Cost analysis
- Decision matrix creation
- Migration planning (if applicable)

### Key Stakeholders
| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend Engineers | High | Integration testing, API compatibility |
| Product Team | Product Manager | Medium | Success criteria validation, cost approval |
| DevOps Team | DevOps Engineers | Low | Migration support (if applicable) |

### Teams Involved
- **Infrastructure Team**: Platform evaluation, testing, decision
- **Backend Team**: Integration testing, API compatibility
- **Product Team**: Cost approval, success criteria

### Communication Plan
- **Updates Frequency**: Daily during active testing
- **Update Format**: Slack updates, weekly status report
- **Audience**: Infrastructure Team, Backend Team, Product Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Platform Comparison Matrix** | Complete | Document all platforms, pricing, features | End of Phase 1 |
| **POC Success Rate** | 100% (2+ platforms) | Denrisi workflow works on tested platforms | End of Phase 2 |
| **Cost Comparison** | Documented | Actual costs per 1000 images | End of Phase 3 |
| **Setup Time Reduction** | < 30 minutes | Time to deploy new workflow | End of Phase 2 |
| **Reliability Improvement** | 99%+ uptime | Worker spin-up success rate | End of Phase 3 |
| **Decision Made** | Clear recommendation | Decision matrix + recommendation doc | End of Phase 4 |

### Business Metrics Impact
**Target Metric**: [ ] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **E-CAC**: Reduced infrastructure costs and engineering time
- **C-Core Value**: More reliable workflows = better image generation
- **B-Retention**: Fewer failures = better user experience

### Leading Indicators
- Platform comparison matrix complete
- POC workflows successful on tested platforms
- Cost analysis shows potential savings
- Setup time significantly reduced

### Lagging Indicators
- Production workflow success rate > 99%
- Infrastructure costs reduced
- Time to deploy new workflows < 1 hour
- Zero production incidents from infrastructure

---

## Definition of Done

### Initiative Complete When:

**Fast Path Complete When:**
- [ ] RunComfy and ViewComfy tested with Denrisi workflow
- [ ] Fast path decision made (recommend platform or continue with RunPod)
- [ ] If viable, deployed to production
- [ ] MCP/AI agent integration evaluated

**Comprehensive Evaluation Complete When:**
- [ ] Platform comparison matrix complete (all platforms)
- [ ] At least 3 platforms tested with Denrisi workflow
- [ ] Cost analysis documented (per 1000 images)
- [ ] MCP/AI agent integration evaluated for all platforms
- [ ] Decision matrix created with recommendation
- [ ] Migration plan created (if switching platforms)
- [ ] Stakeholders notified of decision
- [ ] Documentation updated with findings

### Not Done Criteria
**This initiative is NOT done if:**
- [ ] No platforms tested
- [ ] Cost analysis incomplete
- [ ] No clear recommendation
- [ ] Migration plan missing (if applicable)
- [ ] Documentation incomplete

---

## Related Work

### Epics
| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-044 | RunPod Serverless Endpoint Testing & Validation Framework | In Progress | [EP-044](../requirements/epics/mvp/EP-044-serverless-endpoint-testing.md) |
| EP-039 | ComfyUI Dependency Management | In Progress | [EP-039](../requirements/epics/mvp/EP-039-comfyui-dependency-management.md) |

### Dependencies
- **Blocks**: Potential migration from RunPod (if alternative chosen)
- **Blocked By**: None (can run in parallel with EP-044)
- **Related Initiatives**: 
  - IN-010: Denrisi Workflow Serverless Validation (test workflow)
  - IN-007: ComfyUI Infrastructure Improvements (related infrastructure work)

### Documentation
- [ComfyUI Platform Market Research](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md) - **Comprehensive market analysis**
- [Modal vs RunPod Comparison](../../research/infrastructure/MODAL-VS-RUNPOD-COMPARISON.md) - **GitHub Actions & Network Storage comparison**
- [ComfyUI Serverless Setup Guide](../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [RunPod Endpoint Worker Fix Guide](../../ops/runpod/ENDPOINT-WORKER-FIX-GUIDE.md)
- [Current Work Status](../../ops/runpod/CURRENT-WORK-STATUS.md)

---

## Platform Comparison Matrix

### Quick Reference

| Platform | Setup Effort | Serverless | Cost (Low → High) | ComfyUI Native | MCP/AI Agent Ready | Best For |
|----------|-------------|------------|-------------------|----------------|-------------------|----------|
| **RunComfy** | ★★★★★ (Easiest) | ✅ Yes | $$ | ✅ Yes | ⚠️ Unknown | Fastest: upload workflow → endpoint. Cloud Save eliminates custom node issues. |
| **ViewComfy** | ★★★★★ (Easiest) | ✅ Yes | $$ | ✅ Yes | ⚠️ Unknown | Similar to RunComfy, nicer dashboard. Team collaboration. |
| **Fal.ai** | ★★★★☆ (Low) | ✅ Yes | $$ | ✅ Optimized | ⚠️ Unknown | Quick deployments, managed custom nodes. |
| **Replicate** | ★★★☆☆ (Moderate) | ✅ Yes | $$ | ⚠️ Via Cog | ✅ Yes (REST API) | Model versioning, structured deployments. |
| **RunPod Serverless** | ★★☆☆☆ (High) | ✅ Yes | $ | ⚠️ Via workers | ⚠️ Complex | Best cost/per-run. Current reliability issues. |
| **Modal** | ★★★☆☆ (Moderate) | ✅ Yes | $–$$ | ⚠️ Manual | ✅ Yes (REST API) | Code-driven teams, flexible scaling. |
| **Baseten** | ★★★★☆ (Moderate) | ✅ Yes | $$$ | ⚠️ Manual | ✅ Yes (REST API) | Enterprise-grade, overkill unless selling as product. |
| **AWS SageMaker** | ★☆☆☆☆ (Very High) | ⚠️ Partial | $$$$ | ❌ Manual | ✅ Yes (REST API) | Enterprise compliance, existing AWS infrastructure. |
| **GCP Vertex AI** | ★☆☆☆☆ (Very High) | ⚠️ Partial | $$$ | ❌ Manual | ✅ Yes (REST API) | GCP ecosystem, enterprise features. |
| **Azure ML** | ★☆☆☆☆ (Very High) | ⚠️ Partial | $$$$ | ❌ Manual | ✅ Yes (REST API) | Azure ecosystem, enterprise compliance. |

### Detailed Cost Comparison

**See [Detailed Cost Estimations](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md#detailed-cost-estimations-image--video-generation) for per-image and per-video costs.**

| Platform | Pricing Model | Typical GPU Cost (A10 / A100) | Subscription | Idle Cost | Effective Cost Verdict |
|----------|---------------|-------------------------------|--------------|-----------|------------------------|
| **RunPod Serverless** | Pure GPU time | RTX 4090 ~$0.25–0.4/hr<br>A100 ~$1.8/hr | None | No | **Cheapest by far, more work** |
| **Modal** | Pay-per-use | Competitive | None | No | **Good cost, code-driven** |
| **Fal.ai** | Pay-per-execution | Competitive | None | No | **Competitive pricing** |
| **Replicate** | Pay-per-execution | Model-based | None | No | **Competitive pricing** |
| **RunComfy** | Pay-per-hour GPU (tiers) | A10 ~$1.75–2.5/hr<br>A100 ~$2.00–3.50/hr | ~$20–30/mo | No | Easy, but slightly overpriced compute |
| **ViewComfy** | Pay-per-second GPU | A10 ~$2.2/hr<br>A100 ~$4.1/hr | $0–$30+/mo (plans) | No (scales to zero) | **Best balance of ease + cost** |
| **Baseten** | Enterprise pricing | Premium | Enterprise | No | **Premium pricing** |
| **GCP Vertex AI** | Standard pricing | Moderate-High | None | Partial (min instances) | **Enterprise pricing** |
| **AWS SageMaker** | Per-ms + overhead | High + management fees | None | Partial (min instances) | **Most expensive** |
| **Azure ML** | Enterprise pricing | High | Enterprise | Partial (min instances) | **Enterprise premium** |

### Quick Cost Reference (Per Generation)

**Image Generation (SDXL, 1024x1024):**
- **RunPod RTX 3090**: $0.0006–0.0016 per image ($0.60–1.60 per 1,000)
- **RunComfy A10**: $0.0024–0.0056 per image ($2.40–5.60 per 1,000)
- **ViewComfy A10**: $0.003–0.005 per image ($3.00–5.00 per 1,000)

**Image Generation (Flux.1-dev, 1024x1024):**
- **RunPod A100**: $0.005–0.0096 per image ($5.00–9.60 per 1,000)
- **RunComfy A100**: $0.0056–0.0146 per image ($5.60–14.60 per 1,000)
- **RunComfy H100**: $0.0089–0.0167 per image ($8.90–16.70 per 1,000)

**Video Generation (SVD, 2–4 seconds):**
- **RunPod A100**: $0.03–0.0575 per video ($3.00–5.75 per 100)
- **RunComfy A100**: $0.033–0.0875 per video ($3.30–8.75 per 100)
- **ViewComfy A100**: $0.068–0.103 per video ($6.80–10.30 per 100)

**Video Generation (Wan 2.1, 5–10 seconds HD):**
- **RunPod A100**: $0.09–0.153 per video ($9.00–15.30 per 100)
- **RunComfy H100**: $0.20–0.333 per video ($20.00–33.30 per 100)
- **RunComfy H200**: $0.25–0.444 per video ($25.00–44.40 per 100)

**See full cost breakdown**: [Detailed Cost Estimations](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md#detailed-cost-estimations-image--video-generation)

**Cost Ranking** (cheapest → most expensive per run):
1. RunPod Serverless ($) → 2. Modal/Fal.ai/Replicate ($–$$) → 3. RunComfy/ViewComfy ($$) → 4. Baseten ($$$) → 5. GCP Vertex AI ($$$) → 6. AWS SageMaker/Azure ML ($$$$)

**Setup Effort Ranking** (easiest → hardest):
1. RunComfy/ViewComfy (★★★★★) → 2. Fal.ai (★★★★☆) → 3. Replicate/Modal/Baseten (★★★☆☆) → 4. RunPod Serverless (★★☆☆☆) → 5. AWS/GCP/Azure (★☆☆☆☆)

### Recommendation (Pre-Evaluation)

**Fast Path / MVP**: RunComfy (Cloud Save solves custom node issues)  
**Backup Fast Path**: ViewComfy (similar to RunComfy)  
**Absolute Lowest Cost**: RunPod Serverless (if reliability fixed)  
**Code-Driven Teams**: Modal (REST API, flexible)  
**Enterprise Compliance**: AWS SageMaker / GCP Vertex AI / Azure ML  
**Model Versioning**: Replicate (Cog-based)  
**Quick Deployments**: Fal.ai (managed runtime)

**Note**: This is a pre-evaluation recommendation. Final decision will be based on actual testing results. See [ComfyUI Platform Market Research](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md) for detailed analysis.

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Platform Limitations** | Medium | High | Test with real workflows early, identify blockers quickly |
| **Cost Overruns** | Low | Medium | Set budget limit, monitor usage closely during testing |
| **Migration Complexity** | Medium | High | Test migration path early, plan incremental rollout |
| **Platform Lock-in** | Medium | Medium | Evaluate API compatibility, plan abstraction layer |
| **Reliability Unknown** | Medium | High | Test worker spin-up, cold starts, error handling, crash frequency |
| **Custom Node Support** | High | High | Verify custom nodes (res4lyf) work on each platform |
| **MCP/AI Agent Integration** | Medium | High | Test programmatic access, API quality, automation support early |
| **Fast Path Platform Fails** | Medium | High | Have backup platform ready, test multiple options in parallel |
| **Unknown Load at Launch** | High | Medium | Choose platform with good scaling and predictable costs |

---

## Progress Tracking

### Current Phase
**Phase**: Active - Fast Path Evaluation  
**Status**: On Track

### Recent Updates
- **2026-01-19**: Initiative created based on RunPod reliability issues and operational complexity
- **2026-01-27**: **URGENT UPDATE**: Initiative activated due to frequent RunPod crashes blocking production. Added fast path strategy, MCP/AI agent integration requirements, and other cloud hosting solutions evaluation.

### Next Steps (Fast Path)
1. ✅ Initiative activated and updated
2. Set up trial accounts (RunComfy, ViewComfy) - **IMMEDIATE**
3. Begin Phase 1A: Quick Platform Research (RunComfy, ViewComfy, MCP access)
4. Begin Phase 2A: Fast POC Testing with Denrisi workflow
5. Make fast path decision and deploy to production if viable

### Next Steps (Comprehensive)
1. Research other cloud hosting solutions (AWS SageMaker, GCP Vertex AI, Azure ML, etc.)
2. Evaluate MCP/AI agent integration capabilities for all platforms
3. Complete comprehensive cost and reliability analysis

---

## Technical Details

### Workflow to Test

**Primary Test Workflow**: Z-Image Denrisi (`z-image-danrisi`)  
**Source**: `libs/business/src/workflows/z-image-danrisi.ts`

**Required Custom Nodes**:
- `ClownsharKSampler_Beta` (from `res4lyf`)
- `Sigmas Rescale` (from `res4lyf`)
- `BetaSamplingScheduler` (from `res4lyf`)

**Required Models**:
- `z_image_turbo_bf16.safetensors` (diffusion model)
- `qwen_3_4b.safetensors` (text encoder)
- `z-image-turbo-vae.safetensors` (VAE)

### Evaluation Criteria

1. **Ease of Setup** (1-5 stars)
   - Time to deploy workflow
   - Number of manual steps
   - Documentation quality

2. **Cost Effectiveness** (per 1000 images)
   - Compute costs
   - Platform fees
   - Total cost of ownership

3. **Reliability** (uptime %)
   - Worker spin-up success rate
   - Cold start consistency
   - Error handling
   - Crash frequency (critical - current RunPod issue)
   - Recovery time after crashes
   - Manual intervention required

4. **Performance** (seconds)
   - Cold start time
   - Generation time per image
   - Queue wait time

5. **Developer Experience** (1-5 stars)
   - API simplicity
   - Documentation
   - Debugging tools
   - Error messages

6. **Feature Support**
   - Custom nodes support
   - Custom models support
   - Network volumes
   - WebSocket support

7. **MCP/AI Agent Integration** (Critical for automation)
   - Programmatic API access (REST, GraphQL, etc.)
   - API documentation quality
   - Authentication/authorization support
   - Webhook support for async operations
   - Error handling and retry logic
   - Rate limiting and quotas
   - SDK availability (Python, TypeScript, etc.)
   - MCP server compatibility (if applicable)

### Testing Plan

**Phase 2A: Fast Path POC Testing**
1. **RunComfy**:
   - Create account, upload Denrisi workflow
   - Deploy endpoint, test with 5 images
   - Measure setup time, costs, reliability, crash frequency
   - Test MCP/AI agent integration (API access, webhooks, error handling)

2. **ViewComfy**:
   - Create account, upload Denrisi workflow
   - Deploy endpoint, test with 5 images
   - Measure setup time, costs, reliability, crash frequency
   - Test MCP/AI agent integration (API access, webhooks, error handling)

**Phase 2B: Comprehensive POC Testing**
3. **RunPod Serverless** (baseline):
   - Use existing endpoint (if fixed)
   - Test with 5 images
   - Measure costs, reliability, crash frequency (for comparison)
   - Evaluate MCP/AI agent integration complexity

4. **Modal**:
   - Create account, deploy ComfyUI workflow
   - Test with 5 images
   - Measure setup time, costs, reliability
   - Test MCP/AI agent integration (REST API)

5. **Baseten**:
   - Create account, deploy ComfyUI workflow
   - Test with 5 images
   - Measure setup time, costs, reliability
   - Test MCP/AI agent integration (REST API)

6. **Other Cloud Hosting** (TBD):
   - Research AWS SageMaker, GCP Vertex AI, Azure ML
   - Evaluate ComfyUI support and setup complexity
   - Test if viable for our use case

**Phase 3A: Fast Path Cost Analysis**
- Run 20 images on RunComfy and ViewComfy
- Calculate cost per 1000 images (estimate)
- Document cold start times
- Measure reliability (worker spin-up success rate, crash frequency)
- Evaluate MCP/AI agent integration ease

**Phase 3B: Comprehensive Cost Analysis**
- Run 100 images on each platform
- Calculate cost per 1000 images
- Document cold start times
- Measure reliability (worker spin-up success rate, crash frequency)
- Compare MCP/AI agent integration across all platforms

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well
- [To be documented]

### What Could Be Improved
- [To be documented]

### Recommendations for Future Initiatives
- [To be documented]

---

## MCP/AI Agent Integration Requirements

### Why MCP/AI Agent Integration Matters

- **Automation**: AI agents need to programmatically deploy workflows, check status, handle errors
- **Development Speed**: Faster iteration when AI agents can configure infrastructure
- **Reliability**: Automated error handling and retry logic
- **Current Pain Point**: RunPod setup is "frustrating for AI agents to set up end-to-end"

### Required Capabilities

1. **Standard REST API** (preferred) or GraphQL
   - Well-documented endpoints
   - Consistent error responses
   - Authentication via API keys or tokens

2. **Webhook Support**
   - Async job completion notifications
   - Error notifications
   - Status updates

3. **SDK Availability**
   - Python SDK (for automation scripts)
   - TypeScript/JavaScript SDK (for Node.js integration)
   - REST API as fallback

4. **Error Handling**
   - Clear error messages
   - Retry logic support
   - Rate limiting information

5. **MCP Server Compatibility** (if applicable)
   - Can be wrapped in MCP server for Cursor/other tools
   - Standard API makes MCP wrapping easier

### Evaluation Criteria

| Platform | API Type | SDK | Webhooks | MCP Ready | Notes |
|----------|---------|-----|----------|-----------|-------|
| **RunComfy** | TBD | TBD | TBD | TBD | To be tested |
| **ViewComfy** | TBD | TBD | TBD | TBD | To be tested |
| **RunPod Serverless** | REST | Limited | Yes | ⚠️ Complex | Requires custom wrapper |
| **Modal** | REST | Yes | Yes | ✅ Yes | Standard REST APIs |
| **Baseten** | REST | Yes | Yes | ✅ Yes | Standard REST APIs |

### Testing Plan

1. **API Access Test**: Can we deploy workflow via API?
2. **Status Check Test**: Can we check job status programmatically?
3. **Error Handling Test**: Are errors clear and actionable?
4. **Webhook Test**: Do webhooks work for async operations?
5. **MCP Wrapper Test**: Can we create MCP server wrapper easily?

---

## References

- [ComfyUI Platform Market Research](../../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md) - **Complete market analysis**
- [RunComfy Documentation](https://docs.runcomfy.com/quickstart)
- [RunComfy Serverless Introduction](https://docs.runcomfy.com/serverless/introduction)
- [ViewComfy](https://viewcomfy.com/)
- [Fal.ai](https://fal.ai/)
- [Replicate Documentation](https://replicate.com/docs)
- [RunPod Serverless Documentation](https://docs.runpod.io/serverless/endpoints)
- [Modal Documentation](https://modal.com/docs)
- [Baseten Documentation](https://docs.baseten.co)
- [AWS SageMaker Inference](https://docs.aws.amazon.com/sagemaker/)
- [GCP Vertex AI](https://cloud.google.com/vertex-ai)
- [Azure ML](https://learn.microsoft.com/azure/machine-learning/)
- [MCP Registry](https://docs.mcp.run/)
- [ComfyUI Serverless Setup Guide](../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [EP-044: Serverless Endpoint Testing](../requirements/epics/mvp/EP-044-serverless-endpoint-testing.md)
- [Current Work Status](../../ops/runpod/CURRENT-WORK-STATUS.md)
- [Maxim's Feedback: RunPod Serverless Strategy](../../ops/runpod/MAXIM-FEEDBACK-SERVERLESS.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-19
