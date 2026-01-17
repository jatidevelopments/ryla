# [INITIATIVE] IN-010: Denrisi Workflow Serverless Validation & Testing Framework

**Status**: Proposed  
**Created**: 2026-01-15  
**Last Updated**: 2026-01-15  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, Product Team

---

## Executive Summary

**One-sentence description**: Validate and test the Z-Image Denrisi workflow on RunPod serverless ComfyUI endpoints, ensuring all dependencies are correctly installed, performance meets requirements, and establishing a reusable testing framework for future workflow deployments.

**Business Impact**: C-Core Value (ensures reliable image generation), E-CAC (validates cost-effective serverless approach), B-Retention (prevents workflow failures in production)

---

## Why (Business Rationale)

### Problem Statement

The Z-Image Denrisi workflow is a critical production workflow that requires:
- **Custom Nodes**: `res4lyf` package (ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler)
- **Models**: Z-Image-Turbo models (diffusion, text encoder, VAE)
- **Serverless Deployment**: Must work reliably on RunPod serverless endpoints

**Key Pain Points**:
- No systematic validation that Denrisi works on serverless endpoints
- Dependency management (EP-039) generates scripts but not validated end-to-end
- No performance benchmarks for serverless vs dedicated pods
- No reusable testing framework for future workflows
- Risk of production failures if dependencies are missing or incorrect
- Cold start times and scaling behavior unknown

### Current State

- **Workflow Definition**: ✅ Exists (`libs/business/src/workflows/z-image-danrisi.ts`)
- **Dependency Management**: ✅ EP-039 generates install scripts and Dockerfiles
- **Test Script**: ⚠️ Basic test exists (`scripts/tests/test-comfyui-serverless.ts`) but not comprehensive
- **Serverless Endpoint**: ⚠️ Exists but not validated for Denrisi workflow
- **Documentation**: ⚠️ Setup guide exists but no validation results
- **Testing Framework**: ❌ No reusable framework for workflow testing

### Desired State

- **Validated Workflow**: Denrisi workflow tested and verified on serverless
- **Performance Metrics**: Cold start times, generation times, cost per image documented
- **Dependency Verification**: All custom nodes and models confirmed installed
- **Testing Framework**: Reusable test suite for validating any workflow on serverless
- **Documentation**: Complete validation report with success criteria met
- **CI/CD Integration**: Automated testing in deployment pipeline

### Business Drivers

- **Revenue Impact**: Reliable workflows = better user experience = higher retention
- **Cost Impact**: Validates serverless cost-effectiveness vs dedicated pods
- **Risk Mitigation**: Prevents production failures from missing dependencies
- **Competitive Advantage**: Faster workflow deployment with confidence
- **User Experience**: Ensures consistent, high-quality image generation

---

## How (Approach & Strategy)

### Strategy

1. **End-to-End Validation**: Test Denrisi workflow on actual serverless endpoint
2. **Dependency Verification**: Verify all custom nodes and models are installed correctly
3. **Performance Benchmarking**: Measure cold start, generation time, cost
4. **Framework Development**: Build reusable testing framework for future workflows
5. **Documentation**: Document findings, best practices, and validation process

### Key Principles

- **Real Environment Testing**: Test on actual RunPod serverless endpoints, not mocks
- **Comprehensive Coverage**: Test all workflow paths, error cases, edge cases
- **Reusability**: Framework should work for any ComfyUI workflow
- **Automation**: Tests should be runnable in CI/CD pipeline
- **Documentation First**: Document as we go, not after

### Phases

1. **Phase 1: Endpoint Setup & Validation** - Deploy/verify serverless endpoint with dependencies - 3 days
2. **Phase 2: Workflow Testing** - Test Denrisi workflow end-to-end - 2 days
3. **Phase 3: Performance Benchmarking** - Measure metrics, document results - 2 days
4. **Phase 4: Testing Framework** - Build reusable test framework - 3 days
5. **Phase 5: Documentation & Integration** - Document findings, integrate into CI/CD - 2 days

**Total Timeline**: 2 weeks

### Dependencies

- **EP-039**: ComfyUI Dependency Management (provides install scripts and Dockerfiles)
- **IN-008**: ComfyUI Dependency Management Initiative (parent)
- **RunPod Infrastructure**: Serverless endpoint must be available
- **Models**: Z-Image-Turbo models must be available on network volume

### Constraints

- Must test on actual RunPod serverless (not local/mock)
- Requires RunPod API key and endpoint access
- Network volume must have models pre-loaded
- Testing costs money (RunPod credits)
- Must not break existing production workflows

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-16 (after EP-039 P7 completes)
- **Target Completion**: 2026-01-30
- **Key Milestones**:
  - **M1: Endpoint Validated**: 2026-01-18
  - **M2: Workflow Tested**: 2026-01-20
  - **M3: Performance Benchmarked**: 2026-01-22
  - **M4: Framework Complete**: 2026-01-27
  - **M5: Documentation & Integration**: 2026-01-30

### Priority

**Priority Level**: P1

**Rationale**: 
- Blocks production deployment of Denrisi workflow
- Validates EP-039 dependency management system
- Prevents production failures
- Enables faster workflow deployment in future

### Resource Requirements

- **Team**: Infrastructure Team (1 engineer), Backend Team (0.5 engineer for integration)
- **Budget**: ~$50-100 in RunPod credits for testing
- **External Dependencies**: 
  - RunPod API access
  - Serverless endpoint deployment
  - Network volume with models

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Infrastructure Team  
**Role**: Infrastructure Lead  
**Responsibilities**: 
- Endpoint setup and validation
- Performance benchmarking
- Testing framework development
- Documentation

### Key Stakeholders
| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend Engineers | High | Workflow integration, API testing |
| Product Team | Product Manager | Medium | Success criteria validation |
| DevOps Team | DevOps Engineers | Medium | CI/CD integration |

### Teams Involved
- **Infrastructure Team**: Endpoint setup, testing framework
- **Backend Team**: Workflow validation, API integration
- **DevOps Team**: CI/CD pipeline integration

### Communication Plan
- **Updates Frequency**: Daily during active testing
- **Update Format**: Slack updates, weekly status report
- **Audience**: Infrastructure Team, Backend Team, Product Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Workflow Success Rate** | 100% | Automated test runs (10+ samples) | End of Phase 2 |
| **Cold Start Time** | < 60 seconds | Measure endpoint startup time | End of Phase 3 |
| **Generation Time** | < 30 seconds | Average time per image | End of Phase 3 |
| **Dependency Verification** | 100% | All nodes/models confirmed installed | End of Phase 1 |
| **Test Framework Coverage** | 80%+ | Code coverage of framework | End of Phase 4 |
| **Documentation Completeness** | 100% | All sections documented | End of Phase 5 |

### Business Metrics Impact
**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **C-Core Value**: Reliable workflows = better image quality = higher user satisfaction
- **B-Retention**: Fewer failures = better user experience = higher retention
- **E-CAC**: Validates serverless cost-effectiveness

### Leading Indicators
- Endpoint health checks passing
- Workflow submission successful
- Images generated successfully
- No dependency errors in logs

### Lagging Indicators
- Production workflow success rate > 99%
- User satisfaction with image quality
- Cost per image within budget
- Zero production incidents from missing dependencies

---

## Definition of Done

### Initiative Complete When:
- [ ] Denrisi workflow tested and validated on serverless endpoint
- [ ] All dependencies verified installed correctly
- [ ] Performance metrics documented (cold start, generation time, cost)
- [ ] Testing framework created and documented
- [ ] Validation report published
- [ ] CI/CD integration complete (optional but recommended)
- [ ] Documentation updated with findings
- [ ] Stakeholders notified of completion

### Not Done Criteria
**This initiative is NOT done if:**
- [ ] Workflow fails on serverless endpoint
- [ ] Dependencies missing or incorrect
- [ ] Performance metrics not documented
- [ ] Testing framework not reusable
- [ ] Documentation incomplete
- [ ] No validation report

---

## Related Work

### Epics
| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-039 | ComfyUI Dependency Management | In Progress | [EP-039](../requirements/epics/mvp/EP-039-comfyui-dependency-management.md) |
| EP-005 | Content Studio | Active | [EP-005](../requirements/epics/mvp/EP-005-content-studio.md) |

### Dependencies
- **Blocks**: Production deployment of Denrisi workflow on serverless
- **Blocked By**: EP-039 (needs dependency management system)
- **Related Initiatives**: 
  - IN-008: ComfyUI Dependency Management (provides dependency scripts)
  - IN-007: ComfyUI Infrastructure Improvements (related infrastructure work)

### Documentation
- [ComfyUI Serverless Setup Guide](../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [ComfyUI Serverless Test Results](../../ops/runpod/COMFYUI-SERVERLESS-TEST-RESULTS.md)
- [EP-039 Architecture](../../architecture/epics/EP-039-ARCHITECTURE.md)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **Missing Dependencies** | Medium | High | Use EP-039 generated scripts, verify before testing |
| **Serverless Cold Starts** | High | Medium | Document cold start times, optimize if needed |
| **Cost Overruns** | Low | Medium | Set budget limit, monitor usage closely |
| **Workflow Failures** | Medium | High | Test incrementally, fix issues as found |
| **Network Volume Issues** | Low | High | Verify volume attachment before testing |

---

## Progress Tracking

### Current Phase
**Phase**: Proposed  
**Status**: Not Started

### Recent Updates
- **2026-01-15**: Initiative created

### Next Steps
1. Review and approve initiative
2. Set up serverless endpoint with dependencies
3. Begin Phase 1: Endpoint Setup & Validation

---

## Technical Details

### Workflow to Test

**Workflow ID**: `z-image-danrisi`  
**Source**: `libs/business/src/workflows/z-image-danrisi.ts`

**Required Custom Nodes**:
- `ClownsharKSampler_Beta` (from `res4lyf`)
- `Sigmas Rescale` (from `res4lyf`)
- `BetaSamplingScheduler` (from `res4lyf`)

**Required Models**:
- `z_image_turbo_bf16.safetensors` (diffusion model)
- `qwen_3_4b.safetensors` (text encoder)
- `z-image-turbo-vae.safetensors` (VAE)

### Testing Framework Structure

```
scripts/tests/
├── serverless/
│   ├── workflow-validator.ts      # Validates workflow structure
│   ├── dependency-checker.ts      # Verifies dependencies installed
│   ├── performance-benchmark.ts    # Measures performance metrics
│   ├── end-to-end-test.ts         # Full workflow test
│   └── framework.ts               # Reusable test framework
├── fixtures/
│   └── denrisi-workflow.json      # Test workflow fixture
└── utils/
    └── serverless-client.ts       # RunPod serverless API client
```

### Validation Checklist

- [ ] Serverless endpoint deployed
- [ ] Network volume attached with models
- [ ] Custom nodes installed (res4lyf)
- [ ] Models accessible at correct paths
- [ ] Workflow submission successful
- [ ] Image generation successful
- [ ] Performance metrics within targets
- [ ] Error handling tested
- [ ] Cold start behavior documented

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

## References

- [RunPod ComfyUI Serverless Tutorial](https://docs.runpod.io/tutorials/serverless/comfyui)
- [ComfyUI Serverless Setup Guide](../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [EP-039: ComfyUI Dependency Management](../requirements/epics/mvp/EP-039-comfyui-dependency-management.md)
- [Z-Image Danrisi Workflow](../../../libs/business/src/workflows/z-image-danrisi.ts)
- [RunPod Serverless API Documentation](https://docs.runpod.io/serverless/endpoints)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-15
