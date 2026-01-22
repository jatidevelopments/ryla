# Fly.io Postgres vs Neon Database Comparison

**Status**: Reference Document  
**Date**: 2026-01-XX  
**Decision**: Stay with Fly.io Postgres (for now)  
**Related**: [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md), [Fly.io Deployment Guide](./FLY-IO-DEPLOYMENT-GUIDE.md)

---

## Quick Summary

| Aspect | Fly.io Postgres | Neon |
|--------|-----------------|------|
| **Cost (Low Usage)** | $38-41/mo | $5-30/mo |
| **Cost (High Usage)** | $40-100/mo | $30-555/mo |
| **Latency** | Very Low (same network) | Higher (external) |
| **Cold Starts** | None | Yes (when idle) |
| **Predictability** | Fixed cost | Variable |
| **Dev/Test Branching** | Limited | Excellent |
| **Best For** | Production, always-on | Low usage, dev/test |

---

## Current Setup

### RYLA Database Configuration

- **Database**: Fly.io Managed Postgres (MPG) or Unmanaged Postgres
- **Region**: Frankfurt (fra)
- **Apps**: 4 apps on Fly.io (landing, funnel, web, api)
- **Estimated Cost**: ~$5-10/mo (unmanaged) or ~$38-41/mo (managed MPG)
- **Status**: ✅ Working

---

## Fly.io Managed Postgres (MPG)

### Pricing

| Plan | CPU/RAM | Base Price | Storage | Total (10GB) |
|------|---------|------------|---------|--------------|
| Basic | Shared-2x / 1GB | $38/mo | $0.28/GB | **$40.80/mo** |
| Starter | Shared-2x / 2GB | $72/mo | $0.28/GB | **$74.80/mo** |
| Launch | Performance-2x / 8GB | $282/mo | $0.28/GB | **$284.80/mo** |

**Note**: If you're seeing ~$5-10/mo, you might be using unmanaged Postgres (not MPG).

### Advantages

- ✅ **Same network as apps** → Very low latency (same region)
- ✅ **Integrated with Fly.io** → Simpler operations, one platform
- ✅ **Predictable costs** → Fixed monthly pricing, easier budgeting
- ✅ **Always-on performance** → No cold starts, consistent response times
- ✅ **High availability** → Automatic failover, backups included
- ✅ **Postgres extensions** → PostGIS, pgvector, and many others
- ✅ **Multiple regions** → Frankfurt, Ashburn, global options
- ✅ **Already working** → No migration needed

### Disadvantages

- ❌ **Higher cost at low usage** → ~$38-41/mo minimum for managed
- ❌ **No scale-to-zero** → Pay even when database is idle
- ❌ **Limited dev/test branching** → Not as easy as Neon
- ❌ **Fixed resources** → Less flexible scaling
- ❌ **Vendor lock-in** → Tied to Fly.io platform

---

## Neon (Serverless Postgres)

### Pricing

| Plan | Compute | Storage | Egress | Monthly Estimate (Low Usage) |
|------|---------|---------|--------|------------------------------|
| Free | 50 CU-hours | 0.5GB | Limited | **$0/mo** (for dev) |
| Launch | $0.14/CU-hour | $0.35/GB | 100GB free | **$5-30/mo** (variable) |
| Scale | $0.26/CU-hour | $0.35/GB | 100GB free | **$20-100/mo** (variable) |

**Example (Launch plan, 10GB storage, 100 CU-hours/month):**
- Compute: 100 × $0.14 = $14
- Storage: 10GB × $0.35 = $3.50
- **Total: ~$17.50/mo**

### Advantages

- ✅ **Lower cost at low usage** → $5-30/mo vs $38-41/mo for Fly.io
- ✅ **Scale-to-zero** → Pay only when database is active
- ✅ **Database branching** → Excellent for dev/test environments
- ✅ **Autoscaling** → Handles traffic spikes automatically
- ✅ **Point-in-time restore** → 7-day (Launch) or 30-day (Scale) recovery
- ✅ **Usage-based billing** → Pay for what you use
- ✅ **Global regions** → Multiple data center options

### Disadvantages

- ❌ **External to Fly.io** → Higher network latency (apps on Fly.io, DB on Neon)
- ❌ **Cold starts** → Latency when database is idle (scale-to-zero)
- ❌ **Variable costs** → Harder to budget, can spike with traffic
- ❌ **Fewer Postgres extensions** → Standard Postgres, fewer niche extensions
- ❌ **Less control** → Managed service, less infrastructure control
- ❌ **Migration effort** → 2-4 hours to migrate from Fly.io
- ❌ **More operational complexity** → Separate service to manage

---

## Cost Comparison

### Scenario 1: MVP (Low Usage)

**Assumptions**: 10GB storage, 50-100 CU-hours/month

| Service | Compute | Storage | Total |
|---------|---------|---------|-------|
| **Fly.io MPG** | $38/mo (base) | $2.80 (10GB) | **$40.80/mo** |
| **Neon Launch** | $14 (100 CU-hours) | $3.50 (10GB) | **$17.50/mo** |

**Savings with Neon**: $23.30/mo (57% cheaper)

### Scenario 2: Growth (Medium Usage)

**Assumptions**: 50GB storage, 500 CU-hours/month

| Service | Compute | Storage | Total |
|---------|---------|---------|-------|
| **Fly.io MPG** | $38/mo (base) | $14 (50GB) | **$52/mo** |
| **Neon Launch** | $70 (500 CU-hours) | $17.50 (50GB) | **$87.50/mo** |

**Winner**: Fly.io (slightly cheaper at this scale)

### Scenario 3: Scale (High Usage)

**Assumptions**: 100GB storage, 2000 CU-hours/month

| Service | Compute | Storage | Total |
|---------|---------|---------|-------|
| **Fly.io MPG (Starter)** | $72/mo (base) | $28 (100GB) | **$100/mo** |
| **Neon Scale** | $520 (2000 CU-hours) | $35 (100GB) | **$555/mo** |

**Winner**: Fly.io (much cheaper at high usage)

### Break-Even Point

**Neon is cheaper when**: Usage < 200-300 CU-hours/month  
**Fly.io is cheaper when**: Usage > 300-400 CU-hours/month

---

## Head-to-Head Comparison

| Factor | Fly.io MPG | Neon | Winner |
|--------|------------|------|--------|
| **Cost (low usage)** | $38-41/mo | $5-30/mo | ✅ Neon |
| **Cost (high usage)** | $40-100/mo | $30-555/mo | ✅ Fly.io |
| **Latency** | Very low (same network) | Higher (external) | ✅ Fly.io |
| **Cold starts** | None | Yes (when idle) | ✅ Fly.io |
| **Predictability** | Fixed cost | Variable | ✅ Fly.io |
| **Dev/test branching** | Limited | Excellent | ✅ Neon |
| **Scale-to-zero** | No | Yes | ✅ Neon |
| **High availability** | Built-in | Built-in | ✅ Tie |
| **Postgres extensions** | Many | Standard | ✅ Fly.io |
| **Operational simplicity** | Integrated | Separate service | ✅ Fly.io |
| **Cost at scale** | Predictable | Can spike | ✅ Fly.io |

---

## Decision Matrix

### Choose Fly.io Postgres If:

- ✅ Everything is working well (current setup)
- ✅ You value low latency and predictable performance
- ✅ You want operational simplicity (one platform)
- ✅ You're in MVP phase (stability > cost optimization)
- ✅ Your usage is > 200 CU-hours/month
- ✅ You need many Postgres extensions
- ✅ You want predictable costs for budgeting

### Choose Neon If:

- ✅ Cost is critical and usage is < 200 CU-hours/month
- ✅ You need database branching for dev/test environments
- ✅ You have variable/bursty workloads
- ✅ You can tolerate slightly higher latency
- ✅ You're willing to migrate (2-4 hours effort)
- ✅ You want scale-to-zero for cost savings

---

## Hybrid Approach (Best of Both Worlds)

**Use both services:**

- **Fly.io Postgres** → Production database
- **Neon** → Dev/staging databases

### Benefits

- ✅ **Production**: Low latency, predictable performance
- ✅ **Dev/staging**: Lower cost, easy branching
- ✅ **Best of both**: Performance where it matters, cost savings for dev

### Cost

- Production: $40-41/mo (Fly.io)
- Dev/staging: $0-10/mo (Neon free/Launch)
- **Total: $40-51/mo** (vs $40-41/mo for Fly.io only)

---

## Migration Effort (If Switching)

### From Fly.io to Neon

**Time**: 2-4 hours  
**Risk**: Medium (database migration always has risk)

**Steps**:
1. Create Neon database
2. Export data from Fly.io Postgres
3. Import data to Neon
4. Update connection strings in apps
5. Test thoroughly
6. Switch DNS/config
7. Monitor for 24-48 hours

**Rollback**: Keep Fly.io database for 1-2 weeks as backup

---

## Recommendation for RYLA

### Current Recommendation: **Stay with Fly.io Postgres**

**Reasons**:
1. ✅ **Already working** → No migration risk
2. ✅ **MVP phase** → Stability > cost optimization
3. ✅ **Low latency** → Same network as apps
4. ✅ **Predictable costs** → Easier budgeting
5. ✅ **Simpler operations** → One platform to manage

### When to Revisit Neon

- **Need dev/test database branching** → Neon excels here
- **Usage consistently < 100 CU-hours/month** → Significant cost savings
- **Cost becomes critical constraint** → Neon can save $20-30/mo at low usage
- **Apps move off Fly.io** → No latency benefit from same network

### Hybrid Approach (Recommended for Future)

- **Production**: Fly.io Postgres (performance, latency)
- **Dev/staging**: Neon (cost, branching)

---

## Cost Projections (12 Months)

### Scenario: Low Usage (100 CU-hours/month, 10GB storage)

| Month | Fly.io MPG | Neon Launch | Savings |
|-------|------------|-------------|---------|
| 1-3 | $40.80/mo | $17.50/mo | $23.30/mo |
| 4-6 | $40.80/mo | $17.50/mo | $23.30/mo |
| 7-9 | $40.80/mo | $17.50/mo | $23.30/mo |
| 10-12 | $40.80/mo | $17.50/mo | $23.30/mo |
| **Total** | **$489.60/year** | **$210/year** | **$279.60/year** |

**Break-even**: Migration effort pays for itself in ~2-3 months at low usage

### Scenario: Medium Usage (500 CU-hours/month, 50GB storage)

| Month | Fly.io MPG | Neon Launch | Difference |
|-------|------------|-------------|------------|
| 1-12 | $52/mo | $87.50/mo | -$35.50/mo |
| **Total** | **$624/year** | **$1,050/year** | **-$426/year** |

**Winner**: Fly.io (cheaper at medium usage)

---

## Action Items

### Immediate

1. **Verify current Fly.io Postgres setup**:
   ```bash
   flyctl postgres list
   flyctl postgres status ryla-db-prod
   ```
   - Check if it's managed (MPG) or unmanaged
   - Verify current cost

2. **Monitor usage**:
   - Track database compute hours
   - Track storage growth
   - Re-evaluate at 100+ CU-hours/month

### Future Considerations

1. **If using unmanaged Postgres**:
   - Consider upgrading to MPG for production reliability
   - Or migrate to Neon for lower cost

2. **If using MPG and cost is high**:
   - Evaluate actual usage (CU-hours, storage)
   - Compare with Neon pricing
   - Consider hybrid approach (Fly.io prod, Neon dev)

3. **When usage grows**:
   - Re-evaluate at 200+ CU-hours/month
   - Fly.io becomes more cost-effective at higher usage

---

## Related Documentation

- [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md) - Database technology decision
- [Fly.io Deployment Guide](./FLY-IO-DEPLOYMENT-GUIDE.md) - Complete Fly.io setup
- [AWS vs Fly.io Comparison](./AWS-VS-FLY-COMPARISON.md) - Infrastructure comparison
- [External Dependencies](../specs/general/EXTERNAL-DEPENDENCIES.md) - All external services

---

## References

- [Fly.io Managed Postgres](https://fly.io/docs/mpg/)
- [Fly.io Postgres Pricing](https://fly.io/docs/mpg/overview/)
- [Neon Documentation](https://neon.com/docs)
- [Neon Pricing](https://neon.com/docs/introduction/plans)

---

**Last Updated**: 2026-01-XX  
**Next Review**: When usage exceeds 200 CU-hours/month or cost becomes critical constraint
