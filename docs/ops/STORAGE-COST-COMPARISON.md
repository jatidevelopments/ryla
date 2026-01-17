# Storage & CDN Cost Comparison - Bunny vs Cloudflare R2

## Overview

This document provides a comprehensive cost comparison between Bunny CDN and Cloudflare R2, including storage, egress, and image optimization features.

**Last Updated**: 2026-01-XX

---

## Quick Comparison Summary

| Feature | Bunny CDN | Cloudflare R2 |
|---------|-----------|---------------|
| **Storage Cost** | $0.01/GB | $0.015/GB |
| **Egress Cost** | $0.01-0.06/GB (varies by region, 1TB free) | $0 (unlimited) |
| **CDN** | Built-in (100+ locations) | Built-in (300+ locations) |
| **Image Optimization** | $9.50/month (unlimited) | $5/month base + usage OR Worker |
| **Location Pricing** | Varies by region | Uniform (no regional pricing) |
| **Best For** | MVP/early stage (<1TB egress) | Scale stage (>1TB egress) |

---

## Detailed Cost Breakdown

### Storage & Egress Costs

#### Scenario 1: MVP (100GB storage, 100GB egress/month)

| Service | Storage | Egress | Total |
|---------|---------|--------|-------|
| **Bunny CDN** | $1.00 | $0 (free tier) | **$1.00/month** |
| **Cloudflare R2** | $1.50 | $0 | **$1.50/month** |

**Winner**: Bunny (slightly cheaper at low usage)

#### Scenario 2: Growth (100GB storage, 1TB egress/month)

| Service | Storage | Egress | Total |
|---------|---------|--------|-------|
| **Bunny CDN** | $1.00 | $0 (free tier) | **$1.00/month** |
| **Cloudflare R2** | $1.50 | $0 | **$1.50/month** |

**Winner**: Bunny (still cheaper, but R2 is competitive)

#### Scenario 3: Scale (1TB storage, 2TB egress/month)

| Service | Storage | Egress | Total |
|---------|---------|--------|-------|
| **Bunny CDN** | $10.00 | $10.00 | **$20.00/month** |
| **Cloudflare R2** | $15.00 | $0 | **$15.00/month** |

**Winner**: Cloudflare R2 (zero egress fees win at scale)

#### Scenario 4: Large Scale (1TB storage, 10TB egress/month)

| Service | Storage | Egress | Total |
|---------|---------|--------|-------|
| **Bunny CDN** | $10.00 | $90.00 | **$100.00/month** |
| **Cloudflare R2** | $15.00 | $0 | **$15.00/month** |

**Winner**: Cloudflare R2 (massive savings at high egress)

---

## Image Optimization Costs

### Bunny CDN Image Optimization

**Pricing:**
- **Base Cost**: $9.50/month (unlimited transformations)
- **Features**: Resizing, format conversion (WebP/AVIF), quality adjustment
- **Usage**: URL-based transformations (`?width=800&format=webp`)
- **No additional compute costs**

**Example:**
```
https://cdn.bunny.net/image.jpg?width=800&format=webp&quality=80
```

### Cloudflare Image Optimization Options

#### Option 1: Cloudflare Images Service

**Pricing:**
- **Base**: $5/month (1M images stored, 100K transformations/month)
- **Additional Storage**: $1 per 100K images stored
- **Additional Transformations**: $1 per 100K transformations

**Example (1M images stored, 1M transformations/month):**
```
Base: $5.00
Storage: $9.00 (900K additional images)
Transformations: $9.00 (900K additional)
Total: $23.00/month
```

#### Option 2: Custom Worker

**Pricing:**
- **Base**: $5/month (10M requests, 30M CPU-ms included)
- **Additional Requests**: $0.30 per 1M requests
- **Additional CPU**: $0.02 per 1M CPU-ms

**Example (1M image requests, ~50ms CPU per request):**
```
Base: $5.00
CPU: 1M × 50ms = 50M ms (20M additional) = $0.40
Total: $5.40/month
```

**Example (5M image requests, ~50ms CPU per request):**
```
Base: $5.00 (covers 10M requests)
CPU: 5M × 50ms = 250M ms (220M additional) = $4.40
Total: $9.40/month
```

#### Option 3: Manual Optimization (Before Upload)

**Pricing:**
- **Cost**: $0 (preprocessing)
- **Tools**: Python scripts (`scripts/utils/compress-slider-images.py`)
- **Best For**: Static assets, predictable sizes

---

## Complete Cost Comparison (With Image Optimization)

### Scenario 1: MVP (100GB storage, 100GB egress, 50K image requests/month)

| Service | Storage | Egress | Image Opt | Total |
|---------|---------|--------|-----------|-------|
| **Bunny CDN** | $1.00 | $0 | $9.50 | **$10.50/month** |
| **R2 + Images** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **R2 + Worker** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **R2 (no opt)** | $1.50 | $0 | $0 | **$1.50/month** |

**Winner**: R2 (no optimization) or R2 + Images if optimization needed

### Scenario 2: Growth (100GB storage, 1TB egress, 500K image requests/month)

| Service | Storage | Egress | Image Opt | Total |
|---------|---------|--------|-----------|-------|
| **Bunny CDN** | $1.00 | $0 | $9.50 | **$10.50/month** |
| **R2 + Images** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **R2 + Worker** | $1.50 | $0 | $5.00 | **$6.50/month** |
| **R2 (no opt)** | $1.50 | $0 | $0 | **$1.50/month** |

**Winner**: R2 (no optimization) or R2 + Images

### Scenario 3: Scale (1TB storage, 2TB egress, 5M image requests/month)

| Service | Storage | Egress | Image Opt | Worker Compute | Total |
|---------|---------|--------|-----------|---------------|-------|
| **Bunny CDN** | $10.00 | $10.00 | $9.50 | - | **$29.50/month** |
| **R2 + Images** | $15.00 | $0 | $5.00 + $9.00 | - | **$29.00/month** |
| **R2 + Worker** | $15.00 | $0 | $5.00 | $4.40 | **$24.40/month** |
| **R2 (no opt)** | $15.00 | $0 | $0 | - | **$15.00/month** |

**Winner**: R2 (no optimization) or R2 + Worker for optimization

### Scenario 4: Large Scale (1TB storage, 10TB egress, 10M image requests/month)

| Service | Storage | Egress | Image Opt | Worker Compute | Total |
|---------|---------|--------|-----------|---------------|-------|
| **Bunny CDN** | $10.00 | $90.00 | $9.50 | - | **$109.50/month** |
| **R2 + Images** | $15.00 | $0 | $5.00 + $19.00 | - | **$39.00/month** |
| **R2 + Worker** | $15.00 | $0 | $5.00 | $8.80 | **$28.80/month** |
| **R2 (no opt)** | $15.00 | $0 | $0 | - | **$15.00/month** |

**Winner**: R2 (no optimization) or R2 + Worker for optimization

---

## Location-Based Pricing

### Bunny CDN - Regional Pricing

| Region | Storage Cost | Egress Cost (after 1TB free) |
|--------|--------------|------------------------------|
| **Europe & North America** | $0.01/GB | $0.01/GB |
| **Asia & Oceania** | $0.01/GB | $0.03/GB |
| **South America** | $0.01/GB | $0.045/GB |
| **Middle East & Africa** | $0.01/GB | $0.06/GB |

**Key Points:**
- Storage cost is uniform across all regions
- Egress cost varies significantly by region
- Choose storage location based on upload source (affects latency)
- Egress cost depends on where users download from

### Cloudflare R2 - Uniform Pricing

| Location | Storage Cost | Egress Cost |
|----------|--------------|-------------|
| **All Regions** | $0.015/GB | $0 (unlimited) |

**Key Points:**
- Same pricing regardless of location
- Zero egress fees apply globally
- Location choice affects performance only, not cost

---

## Recommendations for RYLA

### MVP/Growth Stage (< 1TB egress/month)

**Recommended**: Cloudflare R2 (no optimization)
- **Cost**: $1.50/month
- **Reason**: Lowest cost, zero egress fees
- **Optimization**: Use existing Python scripts for preprocessing

**Alternative**: Bunny CDN (if built-in optimization needed)
- **Cost**: $10.50/month
- **Reason**: Simple setup, unlimited transformations
- **Trade-off**: Higher cost but simpler workflow

### Scale Stage (> 1TB egress/month)

**Recommended**: Cloudflare R2 + Custom Worker
- **Cost**: ~$20-30/month
- **Reason**: Zero egress fees save significant money
- **Optimization**: Worker handles on-demand optimization efficiently

**Alternative**: Cloudflare R2 (no optimization)
- **Cost**: $15/month
- **Reason**: Lowest cost if preprocessing is acceptable
- **Optimization**: Manual optimization before upload

### Key Decision Factors

1. **Egress Volume**: 
   - < 1TB/month: Bunny and R2 are competitive
   - > 1TB/month: R2's zero egress fees win

2. **Image Optimization Needs**:
   - Manual optimization acceptable: R2 (no optimization) - $1.50/month
   - Need on-demand optimization: 
     - Bunny: $9.50/month (simplest)
     - R2 + Worker: $5-10/month (most flexible)
     - R2 + Images: $5-25/month (integrated)

3. **User Geography**:
   - Mostly EU/NA: Bunny egress costs are low ($0.01/GB)
   - Global users: R2's uniform pricing is better

4. **Setup Complexity**:
   - Bunny: Simplest (built-in optimization)
   - R2 + Worker: Requires development
   - R2 (no optimization): Simplest (manual preprocessing)

---

## Cost Projections by Usage

### Low Usage (100GB storage, 100GB egress, 50K images)

| Service | Monthly Cost |
|---------|--------------|
| Bunny CDN | $10.50 |
| R2 + Images | $6.50 |
| R2 + Worker | $6.50 |
| R2 (no opt) | **$1.50** |

### Medium Usage (100GB storage, 1TB egress, 500K images)

| Service | Monthly Cost |
|---------|--------------|
| Bunny CDN | $10.50 |
| R2 + Images | $6.50 |
| R2 + Worker | $6.50 |
| R2 (no opt) | **$1.50** |

### High Usage (1TB storage, 2TB egress, 5M images)

| Service | Monthly Cost |
|---------|--------------|
| Bunny CDN | $29.50 |
| R2 + Images | $29.00 |
| R2 + Worker | $24.40 |
| R2 (no opt) | **$15.00** |

### Very High Usage (1TB storage, 10TB egress, 10M images)

| Service | Monthly Cost |
|---------|--------------|
| Bunny CDN | $109.50 |
| R2 + Images | $39.00 |
| R2 + Worker | $28.80 |
| R2 (no opt) | **$15.00** |

---

## Summary

### When to Choose Bunny CDN

✅ **Choose Bunny if:**
- Staying under 1TB egress/month
- Need built-in image optimization (simplest setup)
- Most users in Europe/North America
- Want predictable flat-rate optimization ($9.50/month)

### When to Choose Cloudflare R2

✅ **Choose Cloudflare R2 if:**
- Expecting > 1TB egress/month (zero egress fees win)
- Can do manual optimization before upload (lowest cost)
- Have global user base (uniform pricing)
- Need maximum cost savings at scale

### Image Optimization Strategy

1. **Start Simple**: Manual optimization (existing scripts) - $0
2. **Scale Up**: Add Worker for on-demand optimization - $5-10/month
3. **Alternative**: Bunny's built-in optimization - $9.50/month (if using Bunny)

---

## Related Documentation

- [ADR-005: Cloudflare R2 Storage Decision](../decisions/ADR-005-cloudflare-r2-storage.md)
- [IN-005: Bunny CDN Production Implementation](../initiatives/IN-005-bunny-cdn-production.md)
- [Storage Setup Guide](./STORAGE-SETUP.md)
- [Image Optimization Guide](../technical/guides/IMAGE-OPTIMIZATION.md)

---

**Last Updated**: 2026-01-XX
