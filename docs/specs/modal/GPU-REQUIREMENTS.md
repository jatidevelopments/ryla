# Modal.com GPU Requirements & Cost Optimization

**Status**: Active  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Modal GPU Pricing (Per Second)

| GPU Type | Price / Second | Price / Hour | VRAM | Use Case |
|----------|---------------|--------------|------|----------|
| **T4** | $0.000164/sec | **$0.59/hr** | 16 GB | Lightweight inference, small models |
| **L4** | $0.000222/sec | **$0.80/hr** | 24 GB | Medium inference, optimized models |
| **A10** | $0.000306/sec | **$1.10/hr** | 24 GB | Medium inference, good performance |
| **L40S** | $0.000542/sec | **$1.95/hr** | 48 GB | Large models, high-res generation |
| **A100 40GB** | $0.000556/sec | **$2.00/hr** | 40 GB | Large models, high throughput |
| **A100 80GB** | $0.000694/sec | **$2.50/hr** | 80 GB | Very large models, batch processing |
| **H100** | $0.001097/sec | **$3.95/hr** | 80 GB | Maximum performance, training |

**Source**: [Modal Pricing](https://modal.com/pricing)

**Note**: Billing is per second of actual compute time. No charges when idle (serverless).

---

## Model GPU Requirements

### Current Models Deployed

| Model | Current GPU | Recommended GPU | VRAM Required | Justification |
|-------|-------------|-----------------|---------------|---------------|
| **Flux Schnell** | L40S | **T4 or A10** | 8-12 GB | Fast, lightweight model. T4 sufficient for 1024x1024. |
| **Flux Dev** | L40S | **L40S or A100 40GB** | 16-20 GB | Large model (~20GB), high quality. L40S good balance. |
| **InstantID** | L40S | **A10 or L40S** | 8-12 GB | Medium model (~4.7GB). A10 sufficient, L40S for batch. |
| **LoRA** | L40S | **T4 or A10** | 4-8 GB | Small models (~50-200MB). T4 sufficient. |
| **Wan2.1** | L40S | **L40S or A100** | 20-24 GB | Video generation, memory intensive. L40S recommended. |
| **SeedVR2** | L40S | **A10 or L40S** | 12-16 GB | Upscaling model. A10 sufficient, L40S for quality. |

---

## Recommended GPU Allocation Strategy

### Strategy 1: Cost-Optimized (Recommended for MVP)

**Goal**: Minimize costs while maintaining acceptable performance.

| Model | GPU | Cost/Hour | Cost/Request* | Savings vs L40S |
|-------|-----|-----------|--------------|-----------------|
| Flux Schnell | **T4** | $0.59 | ~$0.001 | **70% savings** |
| Flux Dev | **L40S** | $1.95 | ~$0.010 | Baseline |
| InstantID | **A10** | $1.10 | ~$0.006 | **44% savings** |
| LoRA | **T4** | $0.59 | ~$0.001 | **70% savings** |
| Wan2.1 | **L40S** | $1.95 | ~$0.030 | Baseline |
| SeedVR2 | **A10** | $1.10 | ~$0.008 | **44% savings** |

*Estimated cost per request (assuming ~5-15s execution time)

**Total Estimated Savings**: ~50-60% for lightweight models

---

### Strategy 2: Performance-Optimized

**Goal**: Maximum performance, acceptable costs.

| Model | GPU | Cost/Hour | Use Case |
|-------|-----|-----------|----------|
| Flux Schnell | **A10** | $1.10 | Better performance than T4 |
| Flux Dev | **L40S** | $1.95 | Good balance |
| InstantID | **L40S** | $1.95 | Better batch performance |
| LoRA | **A10** | $1.10 | Better performance than T4 |
| Wan2.1 | **A100 80GB** | $2.50 | Maximum video quality |
| SeedVR2 | **L40S** | $1.95 | Better upscaling quality |

---

### Strategy 3: Hybrid (Recommended for Production)

**Goal**: Balance cost and performance based on usage patterns.

| Model | GPU | Rationale |
|-------|-----|-----------|
| Flux Schnell | **T4** | Fast enough, 70% cost savings |
| Flux Dev | **L40S** | Primary model, needs quality |
| InstantID | **A10** | Good balance, 44% savings |
| LoRA | **T4** | Small models, 70% savings |
| Wan2.1 | **L40S** | Video needs memory |
| SeedVR2 | **A10** | Good balance, 44% savings |

---

## Implementation Plan

### Phase 1: Test GPU Requirements (Week 1)

1. **Test Flux Schnell on T4**
   - Deploy with T4 GPU
   - Measure latency, quality, success rate
   - Compare to L40S baseline
   - **Target**: <5s latency, 100% success rate

2. **Test InstantID on A10**
   - Deploy with A10 GPU
   - Measure face consistency, latency
   - Compare to L40S baseline
   - **Target**: 85-90% consistency, <30s latency

3. **Test LoRA on T4**
   - Deploy with T4 GPU
   - Measure generation quality, latency
   - Compare to L40S baseline
   - **Target**: >95% consistency, <30s latency

### Phase 2: Implement GPU Configuration (Week 2)

1. **Update `config.py`** with GPU per model:
   ```python
   GPU_CONFIG = {
       "flux": "T4",           # Flux Schnell
       "flux-dev": "L40S",     # Flux Dev
       "instantid": "A10",     # InstantID
       "lora": "T4",           # LoRA
       "wan2": "L40S",         # Wan2.1
       "seedvr2": "A10",       # SeedVR2
   }
   ```

2. **Update handlers** to use model-specific GPU:
   ```python
   @app.cls(
       gpu=GPU_CONFIG["flux"],  # Use T4 for Flux Schnell
       ...
   )
   ```

3. **Update cost tracker** with correct pricing

### Phase 3: Monitor & Optimize (Ongoing)

1. **Track costs per endpoint**
2. **Monitor latency and quality**
3. **Adjust GPU allocation based on usage**
4. **Document learnings**

---

## Cost Impact Analysis

### Current Setup (All L40S)

**Assumptions**:
- 1000 requests/day
- Average 10s execution time per request
- Mix: 40% Flux Schnell, 30% Flux Dev, 20% InstantID, 10% LoRA

**Daily Cost**:
- Flux Schnell: 400 requests × 10s × $0.000542 = **$2.17**
- Flux Dev: 300 requests × 10s × $0.000542 = **$1.63**
- InstantID: 200 requests × 10s × $0.000542 = **$1.08**
- LoRA: 100 requests × 10s × $0.000542 = **$0.54**
- **Total**: **$5.42/day** = **$162.60/month**

### Optimized Setup (Hybrid Strategy)

**Daily Cost**:
- Flux Schnell (T4): 400 requests × 10s × $0.000164 = **$0.66**
- Flux Dev (L40S): 300 requests × 10s × $0.000542 = **$1.63**
- InstantID (A10): 200 requests × 10s × $0.000306 = **$0.61**
- LoRA (T4): 100 requests × 10s × $0.000164 = **$0.16**
- **Total**: **$3.06/day** = **$91.80/month**

**Monthly Savings**: **$70.80 (44% reduction)**

---

## VRAM Requirements by Model

| Model | Model Size | VRAM Required | GPU Options |
|-------|------------|---------------|-------------|
| Flux Schnell | ~4 GB | 8-12 GB | T4 (16GB), A10 (24GB) |
| Flux Dev | ~20 GB | 16-20 GB | L40S (48GB), A100 40GB (40GB) |
| InstantID | ~4.7 GB | 8-12 GB | T4 (16GB), A10 (24GB), L40S (48GB) |
| LoRA | ~50-200 MB | 4-8 GB | T4 (16GB), A10 (24GB) |
| Wan2.1 | ~15-20 GB | 20-24 GB | L40S (48GB), A100 40GB (40GB) |
| SeedVR2 | ~10-15 GB | 12-16 GB | A10 (24GB), L40S (48GB) |

**Note**: VRAM requirements include model weights + activations + scratch space.

---

## Testing & Validation

### Test Plan

1. **Deploy each model on recommended GPU**
2. **Measure**:
   - Latency (target: <30s for most, <5s for Flux Schnell)
   - Success rate (target: >95%)
   - Quality (visual inspection, consistency metrics)
   - Cost per request
3. **Compare to L40S baseline**
4. **Document results**

### Success Criteria

- ✅ Latency within 20% of L40S baseline
- ✅ Success rate >95%
- ✅ Quality acceptable (no degradation)
- ✅ Cost savings >30% for lightweight models

---

## Recommendations

### Immediate Actions

1. **Update cost tracker** with correct Modal pricing
2. **Test Flux Schnell on T4** (highest savings potential)
3. **Test InstantID on A10** (good balance)
4. **Document GPU requirements** in EP-058

### Short-term (Next Sprint)

1. **Implement GPU configuration** in `config.py`
2. **Update handlers** to use model-specific GPUs
3. **Deploy and monitor** costs

### Long-term (Post-MVP)

1. **Implement GPU fallback** (try cheaper GPU first, fallback if needed)
2. **Monitor usage patterns** and adjust allocation
3. **Consider quantization** for further cost reduction

---

## Related Documentation

- [EP-058 Requirements](../epics/mvp/EP-058-modal-mvp-models-requirements.md)
- [EP-058 Architecture](../../architecture/epics/EP-058-modal-mvp-models-architecture.md)
- [Modal Pricing](https://modal.com/pricing)
- [Cost Tracking](../modal/COST-TRACKING.md)

---

**Status**: Ready for Implementation  
**Next Steps**: Test GPU requirements, update configuration
