# Funnel & Web Apps: Fly.io vs Cloudflare Analysis

**Decision Context**: Choosing hosting platform for funnel and web apps with API routes

---

## Executive Summary

**Recommendation**: **Hybrid Approach** - Keep funnel/web on Fly.io, move landing to Cloudflare Pages

| Aspect | Fly.io | Cloudflare Pages | Winner |
|--------|--------|------------------|--------|
| **Cost** | $24/mo (2 apps) | $0/mo (but API routes don't work) | ⚠️ Tie (Cloudflare free but limited) |
| **Performance** | Good (regional) | Excellent (global edge) | ✅ Cloudflare (for static) |
| **API Routes** | ✅ Full support | ❌ Not supported | ✅ Fly.io |
| **Functionality** | ✅ 100% | ⚠️ ~70% (no APIs) | ✅ Fly.io |
| **Global Users** | ⚠️ Slower | ✅ Fast | ✅ Cloudflare |
| **Complexity** | ✅ Simple | ⚠️ Two platforms | ✅ Fly.io |

---

## Detailed Analysis

### 1. Cost Comparison

#### Option A: Both on Fly.io (Current)
```
Funnel:     $12/mo  (always-on, 256MB RAM)
Web:        $12/mo  (always-on, 256MB RAM)
───────────────────────────────
Total:      $24/mo
```

**Annual Cost**: $288/year

#### Option B: Both on Cloudflare Pages
```
Funnel:     $0/mo   (free tier)
Web:        $0/mo   (free tier)
───────────────────────────────
Total:      $0/mo
```

**BUT**: API routes don't work, so you'd need:
- Keep API on Fly.io: $15/mo
- Or rewrite to Cloudflare Workers: $5-50/mo + 2-4 weeks dev time

**Effective Cost**: $15-50/mo (depending on API solution)

**Annual Cost**: $180-600/year

#### Option C: Hybrid (Recommended)
```
Landing:    $0/mo   (Cloudflare Pages - already working)
Funnel:     $12/mo  (Fly.io - keep for API routes)
Web:        $12/mo  (Fly.io - keep for API routes)
API:        $15/mo  (Fly.io - backend)
───────────────────────────────
Total:      $39/mo
```

**Annual Cost**: $468/year

**Savings vs All Fly.io**: $0 (but landing is free on Cloudflare)

---

### 2. Performance Comparison

#### Global Latency

**Fly.io (Frankfurt region)**:
- EU users: 30-80ms ✅
- US East: 80-120ms ⚠️
- US West: 150-200ms ❌
- Asia: 200-300ms ❌
- South America: 180-250ms ❌

**Cloudflare Pages (300+ edge locations)**:
- EU users: 10-30ms ✅✅
- US East: 15-40ms ✅✅
- US West: 20-50ms ✅✅
- Asia: 25-60ms ✅✅
- South America: 30-70ms ✅✅

**Performance Winner**: ✅ **Cloudflare Pages** (2-5x faster for global users)

#### API Route Performance

**Fly.io**:
- Full Next.js API routes support
- No execution time limits
- Persistent database connections
- Background jobs supported
- WebSocket support

**Cloudflare Pages**:
- ❌ API routes return 404 (not supported)
- Would need Cloudflare Workers (different platform)
- 30s execution limit
- No persistent connections
- No background jobs

**API Performance Winner**: ✅ **Fly.io** (funnel/web need API routes)

---

### 3. Feature Support

#### Funnel App Requirements
- ✅ Payment processing (Finby API routes)
- ✅ Webhook handling (`/api/finby/notification`)
- ✅ Payment status checks (`/api/finby/payment-status/[reference]`)
- ✅ Refund processing (`/api/finby/refund`)
- ✅ Dynamic page rendering (`force-dynamic`)

**Fly.io**: ✅ All features work  
**Cloudflare Pages**: ❌ API routes don't work (would break payments)

#### Web App Requirements
- ✅ tRPC API routes (`/api/trpc/*`)
- ✅ Authentication flows
- ✅ Dynamic page rendering
- ✅ Server-side data fetching

**Fly.io**: ✅ All features work  
**Cloudflare Pages**: ❌ tRPC API routes don't work (would break app)

---

### 4. Migration Complexity

#### Moving to Cloudflare Pages

**Effort**: 4-6 hours per app  
**Risk**: Medium-High (API routes won't work)  
**Downtime**: ~5 minutes per app  
**Testing**: Extensive (need to verify all features)

**Blockers**:
- API routes need to be moved to Fly.io backend
- Payment webhooks need to be reconfigured
- tRPC endpoints need to be proxied
- Dynamic features may break

#### Staying on Fly.io

**Effort**: 0 hours (already working)  
**Risk**: None  
**Downtime**: None  
**Testing**: None needed

---

### 5. Operational Aspects

#### Deployment

**Fly.io**:
- ✅ Single platform for all apps
- ✅ Unified deployment process
- ✅ Single dashboard
- ✅ Consistent monitoring
- ⚠️ Manual preview deployments

**Cloudflare Pages**:
- ⚠️ Two platforms (Pages + Fly.io for API)
- ⚠️ Two deployment pipelines
- ⚠️ Two dashboards
- ⚠️ Split monitoring
- ✅ Automatic preview deployments

#### Monitoring & Debugging

**Fly.io**:
- ✅ Single log stream
- ✅ Unified metrics
- ✅ Easy debugging (all in one place)
- ✅ Simple error tracking

**Cloudflare Pages**:
- ⚠️ Split logs (Pages + Fly.io)
- ⚠️ Two monitoring systems
- ⚠️ Harder to debug (two platforms)
- ⚠️ More complex error tracking

#### Maintenance

**Fly.io**:
- ✅ One platform to learn
- ✅ One set of tools
- ✅ Simpler operations
- ✅ Easier onboarding

**Cloudflare Pages**:
- ⚠️ Two platforms to learn
- ⚠️ Two sets of tools
- ⚠️ More complex operations
- ⚠️ Harder onboarding

---

### 6. Business Impact

#### Conversion Rate (Funnel)

**Fly.io (Regional)**:
- EU users: Fast → Good conversion ✅
- Global users: Slower → Lower conversion ⚠️
- **Estimated impact**: -2-5% conversion for non-EU users

**Cloudflare Pages (Global Edge)**:
- All users: Fast → Better conversion ✅
- **Estimated impact**: +2-5% conversion globally
- **BUT**: API routes don't work → Payments broken → 0% conversion ❌

**Winner**: ⚠️ **Fly.io** (works vs broken)

#### User Experience (Web)

**Fly.io**:
- EU users: Fast, responsive ✅
- Global users: Slower, but functional ✅
- All features work ✅

**Cloudflare Pages**:
- All users: Fast, responsive ✅✅
- But tRPC API broken → App doesn't work ❌

**Winner**: ⚠️ **Fly.io** (works vs broken)

---

## Cost-Benefit Analysis

### Scenario 1: Keep Both on Fly.io

**Cost**: $24/mo ($288/year)  
**Performance**: Good for EU, slower globally  
**Functionality**: ✅ 100% working  
**Complexity**: ✅ Low  
**Risk**: ✅ None

**ROI**: High (everything works, predictable costs)

### Scenario 2: Move Both to Cloudflare Pages

**Cost**: $0/mo (but API routes broken)  
**Performance**: ✅ Excellent globally  
**Functionality**: ❌ ~70% (API routes don't work)  
**Complexity**: ⚠️ Medium (two platforms)  
**Risk**: ❌ High (payments/app broken)

**ROI**: Negative (saves money but breaks functionality)

### Scenario 3: Hybrid (Recommended)

**Cost**: $24/mo (funnel/web) + $0 (landing on Cloudflare)  
**Performance**: Good for funnel/web, excellent for landing  
**Functionality**: ✅ 100% working  
**Complexity**: ⚠️ Medium (two platforms)  
**Risk**: ✅ Low (only landing moved)

**ROI**: High (best of both worlds)

---

## Recommendation Matrix

### Keep Funnel/Web on Fly.io If:
- ✅ **API routes are critical** (they are - payments & tRPC)
- ✅ **Want single platform** (simpler operations)
- ✅ **Budget allows $24/mo** (reasonable cost)
- ✅ **EU-focused users** (good performance)
- ✅ **Want zero risk** (everything works)

### Move Funnel/Web to Cloudflare If:
- ❌ **Only if you rewrite API routes** (2-4 weeks dev time)
- ❌ **Only if you move to Cloudflare Workers** (different platform)
- ❌ **Only if you accept API limitations** (not recommended)

---

## Final Recommendation

### **Keep Funnel & Web on Fly.io (MVP Phase)**

#### Why:

1. **Functionality First**
   - Funnel: Payment API routes are critical - can't break payments
   - Web: tRPC API routes are critical - can't break app functionality
   - Cloudflare Pages doesn't support API routes → Would break both apps

2. **Cost is Reasonable**
   - $24/mo for 2 apps = $12/app = Very reasonable
   - Cloudflare "free" but requires API migration (2-3 days = $1,000-1,500 dev cost)
   - Break-even: ~10-12 months (not worth it for MVP)

3. **Performance is Good Enough**
   - EU users: Excellent (30-80ms)
   - Global users: Acceptable (150-300ms) - still functional
   - Conversion impact: Minimal for MVP phase

4. **Operational Simplicity**
   - Single platform = Easier to manage
   - Single deployment pipeline = Less complexity
   - Single monitoring system = Easier debugging

5. **Risk Management**
   - Zero migration risk (already working)
   - Zero downtime risk
   - Zero functionality risk

### **Future Consideration: Funnel Migration**

**Funnel CAN work on Cloudflare Pages** if API routes are moved to backend (2-3 days work).

**See**: `docs/ops/FUNNEL-CLOUDFLARE-FEASIBILITY.md` for detailed migration path.

**When to consider**:
- ✅ Have 2-3 days for migration and testing
- ✅ Want better global performance
- ✅ Want to consolidate payment logic in backend
- ✅ Traffic > 10K users/month (global edge becomes valuable)

#### When to Revisit:

**Consider Cloudflare Workers (not Pages) if:**
- Traffic > 10M requests/day (Workers becomes cheaper)
- Need better global performance (but requires API rewrite)
- Willing to invest 2-4 weeks in migration

**Consider Hybrid (Cloudflare Pages) if:**
- You can move API routes to separate backend
- You can proxy tRPC to Fly.io backend
- You're willing to accept added complexity

---

## Cost Projection (12 months)

### Option A: Keep on Fly.io
```
Month 1-12:   $24/mo  = $288/year
────────────────────────────
Total:       $288/year
```

### Option B: Move to Cloudflare Pages
```
Pages:       $0/mo
API rewrite: $5,000 (one-time dev cost)
Workers:     $5-50/mo (depending on traffic)
────────────────────────────
Year 1:      $5,060-5,600
Year 2+:     $60-600/year
Break-even:  ~11 years
```

### Option C: Hybrid (Current)
```
Landing:     $0/mo   (Cloudflare - already done)
Funnel:      $12/mo  (Fly.io)
Web:         $12/mo  (Fly.io)
API:         $15/mo  (Fly.io)
────────────────────────────
Total:       $39/mo  ($468/year)
```

---

## Performance Impact Analysis

### Funnel App (Payment Conversion)

**Current (Fly.io)**:
- EU users: 30-80ms → Good conversion ✅
- Global users: 150-300ms → Acceptable conversion ⚠️
- **Estimated conversion loss**: 2-5% for non-EU users

**If moved to Cloudflare Pages**:
- All users: 10-50ms → Better conversion ✅✅
- **BUT**: API routes broken → Payments don't work → 0% conversion ❌
- **Net impact**: -100% conversion (broken)

**Verdict**: Stay on Fly.io (working > fast but broken)

### Web App (User Experience)

**Current (Fly.io)**:
- EU users: Fast, responsive ✅
- Global users: Slower but functional ✅
- All features work ✅

**If moved to Cloudflare Pages**:
- All users: Fast, responsive ✅✅
- **BUT**: tRPC API broken → App doesn't work ❌
- **Net impact**: Broken app (unusable)

**Verdict**: Stay on Fly.io (working > fast but broken)

---

## Other Considerations

### Developer Experience

**Fly.io**:
- ✅ Single platform to learn
- ✅ Consistent tooling
- ✅ Simple debugging
- ✅ Good documentation

**Cloudflare Pages**:
- ⚠️ Two platforms (Pages + Workers for APIs)
- ⚠️ Different tooling
- ⚠️ More complex debugging
- ⚠️ Learning curve

### Scalability

**Fly.io**:
- ✅ Auto-scaling built-in
- ✅ Handles traffic spikes
- ✅ Predictable costs
- ✅ Good for MVP → Growth

**Cloudflare Pages**:
- ✅ Auto-scaling built-in
- ✅ Handles traffic spikes
- ✅ Pay-per-use (can be cheaper at scale)
- ⚠️ But API routes don't work

### Vendor Lock-in

**Fly.io**:
- ⚠️ Docker-based (portable)
- ⚠️ Some Fly.io-specific features
- ✅ Can migrate if needed

**Cloudflare Pages**:
- ✅ Standard Next.js (portable)
- ⚠️ Cloudflare-specific features
- ✅ Can migrate if needed

---

## Final Verdict

### **Recommendation: Keep Funnel & Web on Fly.io**

**Rationale**:
1. ✅ **Functionality > Cost**: $24/mo is reasonable for working apps
2. ✅ **API routes are critical**: Payments and tRPC can't break
3. ✅ **Performance is good enough**: EU users get excellent performance
4. ✅ **Operational simplicity**: Single platform is easier
5. ✅ **Zero risk**: Already working, no migration needed

**Cost**: $24/mo ($288/year) - Very reasonable for 2 production apps

**Performance**: Good for EU, acceptable globally

**Functionality**: ✅ 100% working

**Complexity**: ✅ Low (single platform)

---

## Alternative: Future Migration Path

If you want to optimize costs later:

1. **Move API routes to separate backend** (Fly.io API)
2. **Proxy API calls from Cloudflare Pages** to Fly.io
3. **Deploy frontend to Cloudflare Pages**
4. **Keep backend on Fly.io**

**This would give you**:
- ✅ Fast global frontend (Cloudflare Pages)
- ✅ Working API routes (Fly.io backend)
- ✅ Cost: $15/mo (API only) + $0 (frontend) = $15/mo
- ⚠️ Added complexity (two platforms, API proxying)

**Migration effort**: 1-2 weeks  
**Cost savings**: $9/mo ($108/year)  
**Break-even**: ~2-3 months (worth it if you have time)

---

## Summary Table

| Factor | Fly.io | Cloudflare Pages | Winner |
|--------|--------|------------------|--------|
| **Monthly Cost** | $24 | $0 (but broken) | ⚠️ Tie |
| **Annual Cost** | $288 | $0 (but broken) | ⚠️ Tie |
| **API Routes** | ✅ Works | ❌ Broken | ✅ Fly.io |
| **Performance (EU)** | ✅ Excellent | ✅ Excellent | ✅ Tie |
| **Performance (Global)** | ⚠️ Good | ✅ Excellent | ✅ Cloudflare |
| **Functionality** | ✅ 100% | ❌ ~70% | ✅ Fly.io |
| **Complexity** | ✅ Low | ⚠️ Medium | ✅ Fly.io |
| **Risk** | ✅ None | ❌ High | ✅ Fly.io |
| **Migration Effort** | ✅ 0 hours | ⚠️ 2-4 weeks | ✅ Fly.io |
| **ROI** | ✅ High | ❌ Negative | ✅ Fly.io |

**Overall Winner**: ✅ **Fly.io** (functionality > cost savings)

---

**Conclusion**: Keep funnel and web on Fly.io. The $24/mo cost is reasonable for fully functional apps. Cloudflare Pages would save money but break critical functionality (payments, tRPC). Not worth the risk for MVP phase.
