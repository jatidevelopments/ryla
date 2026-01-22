# Cost Tracking for Modal Endpoints

## Overview

Cost tracking has been implemented for all Modal endpoints to accurately track the actual costs per workflow run. Each endpoint now tracks execution time and calculates costs based on Modal's L40S GPU pricing.

## Implementation

### Cost Tracker Module

Located at `apps/modal/cost_tracker.py`, this module provides:

- **CostTracker class**: Tracks execution time and calculates costs
- **CostMetrics dataclass**: Stores cost breakdown (GPU, CPU, memory, total)
- **Modal GPU pricing**: L40S GPU = $0.000694/sec (~$2.50/hr)

### Current Status

Cost tracking is implemented in all endpoint implementations:
- ✅ `/flux` - Flux Schnell
- ✅ `/flux-dev` - Flux Dev  
- ✅ `/flux-instantid` - Flux Dev + InstantID
- ✅ `/flux-lora` - Flux Dev + LoRA
- ✅ `/wan2` - Wan2.1 text-to-video
- ✅ `/workflow` - Custom workflows

### Cost Calculation

**Formula:**
```
Cost = execution_time_seconds × GPU_price_per_second
```

**L40S GPU Pricing:**
- $0.000694 per second
- ~$2.50 per hour
- Similar to A100 80GB pricing

### Cost Information

Cost information is:
1. **Logged** to Modal logs (console output)
2. **Returned in response headers**:
   - `X-Cost-USD`: Total cost in USD (e.g., "0.001388")
   - `X-Execution-Time-Sec`: Execution time in seconds (e.g., "2.000")
   - `X-GPU-Type`: GPU type used (e.g., "L40S")

### Example Cost Output

```
💰 Cost: $0.001388 | Time: 2.00s | GPU: L40S @ $0.001388
```

### Accessing Cost Information

#### Via Client Script

The `ryla_client.py` script now displays cost information:

```bash
python apps/modal/ryla_client.py flux --prompt "test"
# Output includes:
# 💰 Cost: $0.001388 | Time: 2.00s | GPU: L40S
```

#### Via API Response Headers

```python
import requests

response = requests.post(
    "https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/flux",
    json={"prompt": "test"}
)

cost = response.headers.get("X-Cost-USD")
exec_time = response.headers.get("X-Execution-Time-Sec")
gpu_type = response.headers.get("X-GPU-Type")

print(f"Cost: ${cost}, Time: {exec_time}s, GPU: {gpu_type}")
```

#### Via Modal Logs

Check Modal logs for cost information:

```bash
modal app logs ryla-comfyui
# Look for lines starting with "💰"
```

### Expected Costs per Endpoint

Based on typical execution times:

| Endpoint | Typical Time | Estimated Cost |
|----------|-------------|----------------|
| `/flux` (Schnell) | 3-5s | $0.002-0.003 |
| `/flux-dev` | 10-20s | $0.007-0.014 |
| `/flux-instantid` | 15-25s | $0.010-0.017 |
| `/flux-lora` | 12-18s | $0.008-0.012 |
| `/wan2` (video) | 60-120s | $0.042-0.083 |
| `/workflow` | Varies | Varies |

**Note:** Actual costs depend on:
- Prompt complexity
- Image/video resolution
- Number of steps
- Cold start time (first request)
- Model loading time

### Cost Tracking Accuracy

Costs are calculated based on:
- ✅ Actual execution time (measured)
- ✅ GPU type (L40S, configured)
- ✅ Modal's published pricing ($0.000694/sec for L40S)

**Limitations:**
- Does not include cold start costs (container initialization)
- Does not include volume storage costs (included in Modal pricing)
- Does not include network egress costs (if applicable)

### Future Enhancements

Potential improvements:
1. Aggregate cost reporting (total costs per day/week/month)
2. Cost per user tracking
3. Cost alerts/budgets
4. Cost breakdown by model type
5. Historical cost analysis

### Troubleshooting

**Cost headers not appearing:**
- Check Modal logs for cost tracking output
- Verify `cost_tracker.py` is included in image build
- Check that execution completed successfully

**Cost seems incorrect:**
- Verify GPU type matches actual usage (L40S)
- Check Modal pricing page for current rates
- Account for cold start time on first request

## Related Documentation

- Modal Pricing: https://modal.com/pricing
- Cost Analysis: `docs/decisions/ADR-007-modal-over-runpod.md`
- Credit System: `docs/technical/systems/CREDIT-SYSTEM.md`
