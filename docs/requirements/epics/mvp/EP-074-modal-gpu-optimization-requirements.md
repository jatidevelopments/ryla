# [EPIC] EP-074: Modal.com GPU Cost Optimization - Requirements

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Status**: P1 - Requirements  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Problem Statement

RYLA currently uses L40S GPU ($1.95/hr) for all Modal endpoints, but many models (Flux Schnell, InstantID, LoRA) can run on cheaper GPUs (T4 at $0.59/hr, A10 at $1.10/hr) without performance degradation. This results in unnecessary costs (~44-70% overspending for lightweight models).

**Who has this problem**: 
- Infrastructure team paying for over-provisioned GPU resources
- Product team needing cost-efficient MVP launch
- Business team needing to optimize CAC (Customer Acquisition Cost)

**Why it matters**: 
- Current setup: ~$162/month for 1000 requests/day
- Optimized setup: ~$92/month (44% savings = $70/month = $840/year)
- Cost optimization critical for MVP sustainability

---

## MVP Objective

Optimize GPU allocation per model on Modal.com, reducing costs by 40-50% while maintaining acceptable performance (<30s latency, >95% success rate). Implement GPU configuration system that allows different GPUs per endpoint.

**Measurable outcomes**:
- GPU requirements documented per model
- GPU configuration system implemented
- Cost savings validated (40-50% reduction for lightweight models)
- All endpoints tested on recommended GPUs
- Performance maintained (latency within 20% of baseline)

---

## Non-Goals

**Explicitly out of scope for this epic**:
- Model quantization (future optimization)
- GPU fallback logic (future enhancement)
- Performance optimization beyond GPU selection
- Changing model architecture

---

## Business Metric

**Target Metrics**:
- [x] **E - CAC**: Reduces infrastructure costs (40-50% savings)
- [x] **C - Core Value**: Maintains core functionality (no degradation)
- [ ] **A - Activation**: (Indirect - lower costs enable more usage)
- [ ] **B - Retention**: (Indirect - cost efficiency improves sustainability)

**Primary Metric**: **E - CAC** (Cost reduction)

---

## Hypothesis

When we optimize GPU allocation per model (T4 for lightweight, A10 for medium, L40S for heavy), we will reduce costs by 40-50% while maintaining acceptable performance, measured by:
- Cost per request reduced by 40-50% for lightweight models
- Latency within 20% of L40S baseline
- Success rate >95% (same as baseline)
- Quality acceptable (no visual degradation)

This validates that cost optimization is possible without sacrificing quality.

---

## Success Criteria

### Technical Success
- [ ] GPU requirements documented per model
- [ ] GPU configuration system implemented (`config.py` with GPU per model)
- [ ] All endpoints tested on recommended GPUs
- [ ] Latency within 20% of L40S baseline
- [ ] Success rate >95% (same as baseline)
- [ ] Quality acceptable (no visual degradation)

### Business Success
- [ ] Cost per request reduced by 40-50% for lightweight models
- [ ] Monthly cost savings: $70+ (44% reduction)
- [ ] Cost tracking accurate per GPU type
- [ ] Documentation complete for GPU selection

---

## Constraints

- **Timeline**: Must complete before MVP launch (1 week target)
- **Performance**: Cannot degrade latency >20% from baseline
- **Quality**: Cannot degrade visual quality
- **Compatibility**: Must work with existing Modal infrastructure
- **Testing**: Must validate each GPU before production use

---

## Dependencies

### Required Before Start
- ✅ EP-058 (Modal MVP Models) completed or in progress
- ✅ Current models working on L40S (baseline)
- ✅ Cost tracking implemented

### Blocks
- None (can start in parallel with EP-058)

### Blocked By
- None (can start immediately)

---

## GPU Requirements Summary

| Model | Current GPU | Recommended GPU | Cost/Hour | Savings |
|-------|------------|-----------------|-----------|---------|
| Flux Schnell | L40S | **T4** | $0.59 | **70%** |
| Flux Dev | L40S | **L40S** | $1.95 | Baseline |
| InstantID | L40S | **A10** | $1.10 | **44%** |
| LoRA | L40S | **T4** | $0.59 | **70%** |
| Wan2.1 | L40S | **L40S** | $1.95 | Baseline |
| SeedVR2 | L40S | **A10** | $1.10 | **44%** |

**See**: [GPU Requirements Documentation](../../specs/modal/GPU-REQUIREMENTS.md) for detailed analysis.

---

## Open Questions

### Technical Questions
- [ ] What's the actual latency difference between T4 and L40S for Flux Schnell?
- [ ] Can InstantID maintain 85-90% consistency on A10?
- [ ] What's the failure rate on cheaper GPUs?
- [ ] Should we implement GPU fallback (try cheaper, fallback if needed)?

### Business Questions
- [ ] What's the acceptable latency increase for cost savings?
- [ ] Should we optimize further with quantization?
- [ ] When should we re-evaluate GPU allocation?

---

## Related Documentation

- [GPU Requirements](../../specs/modal/GPU-REQUIREMENTS.md) - Detailed GPU analysis
- [EP-058 Requirements](./EP-058-modal-mvp-models-requirements.md) - Modal MVP Models
- [Cost Tracking](../../specs/modal/COST-TRACKING.md) - Cost tracking implementation

---

**Next Phase**: P2 - Scoping (break down into stories)

**Status**: P1 - Requirements Complete
