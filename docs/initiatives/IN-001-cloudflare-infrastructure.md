# [INITIATIVE] IN-001: Cloudflare Infrastructure Migration

**Status**: Active  
**Created**: 2026-01-XX  
**Last Updated**: 2026-01-XX  
**Owner**: Infrastructure Team  
**Stakeholders**: Engineering, Product, Finance

---

## Executive Summary

**One-sentence description**: Migrate frontend applications and storage infrastructure to Cloudflare Pages and R2 to reduce costs, improve global performance, and simplify deployment.

**Business Impact**: E-CAC (Cost optimization), A-Activation (Performance improvement)

---

## Why (Business Rationale)

### Problem Statement

Current infrastructure costs are high due to:

- Fly.io hosting costs for all applications (frontend + backend)
- Egress fees from storage providers
- Limited global CDN capabilities affecting user experience
- Complex deployment processes across multiple platforms

### Current State

- All apps (landing, funnel, web, api) hosted on Fly.io
- Storage on external providers with egress fees
- No global CDN for static assets
- Deployment requires Fly.io configuration and secrets management

### Desired State

- Frontend apps (landing, funnel, web) on Cloudflare Pages with global CDN
- Backend API remains on Fly.io (hybrid approach)
- Storage on Cloudflare R2 with zero egress fees
- Simplified deployment via GitHub Actions
- Improved global performance and reduced costs

### Business Drivers

- **Revenue Impact**: Lower infrastructure costs improve unit economics
- **Cost Impact**: Target 30-50% reduction in hosting/storage costs
- **Risk Mitigation**: Reduce vendor lock-in, improve redundancy
- **Competitive Advantage**: Faster page loads improve conversion rates
- **User Experience**: Global CDN reduces latency, improves Core Web Vitals

---

## How (Approach & Strategy)

### Strategy

Hybrid approach: Cloudflare for frontend/CDN, Fly.io for backend API

**Rationale**:

- Cloudflare Pages excels at static/Next.js frontend hosting
- Fly.io better suited for backend API with persistent connections
- Best of both worlds: performance + cost optimization

### Key Principles

- **Zero Downtime**: Incremental migration with feature flags
- **Cost First**: Prioritize cost reduction without sacrificing performance
- **Performance**: Maintain or improve page load times
- **Simplicity**: Reduce deployment complexity where possible

### Phases

1. **Phase 1: R2 Storage Setup** - [Timeline: 2 weeks]

   - Create R2 buckets
   - Set up CDN Worker for R2 proxy
   - Migrate image storage
   - Validate zero egress fees

2. **Phase 2: Pages Deployment** - [Timeline: 3 weeks]

   - Set up Cloudflare Pages projects
   - Configure GitHub Actions for deployment
   - Deploy landing page first (lowest risk)
   - Deploy funnel and web apps
   - Set up custom domains

3. **Phase 3: Validation & Optimization** - [Timeline: 2 weeks]
   - Performance benchmarking
   - Cost validation
   - Monitor error rates
   - Optimize CDN caching

### Dependencies

- Cloudflare API token with required permissions
- GitHub Actions workflows configured
- DNS access for custom domains
- R2 API tokens for storage access

### Constraints

- Must maintain backward compatibility during migration
- Zero downtime requirement
- Must preserve all existing functionality
- Budget: No additional spend beyond current infrastructure

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-XX
- **Target Completion**: 2026-Q2
- **Key Milestones**:
  - R2 Storage Live: 2026-02-XX
  - Landing Page on Pages: 2026-02-XX
  - All Frontend Apps Migrated: 2026-03-XX
  - Cost Validation Complete: 2026-03-XX

### Priority

**Priority Level**: P1

**Rationale**: Cost optimization is important but not blocking product development. Can proceed in parallel with feature work.

### Resource Requirements

- **Team**: Infrastructure/DevOps (1-2 engineers)
- **Budget**: Minimal - Cloudflare free tier + paid tier costs
- **External Dependencies**: Cloudflare account, DNS access

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team Lead  
**Role**: Engineering  
**Responsibilities**:

- Coordinate migration phases
- Ensure zero downtime
- Validate cost savings
- Document processes

### Key Stakeholders

| Name        | Role               | Involvement | Responsibilities           |
| ----------- | ------------------ | ----------- | -------------------------- |
| Engineering | Development        | High        | Implementation, testing    |
| Product     | Product Management | Medium      | Prioritization, validation |
| Finance     | Finance            | Medium      | Cost tracking, validation  |

### Teams Involved

- **Infrastructure Team**: Migration execution
- **Frontend Team**: Pages deployment support
- **Backend Team**: API integration validation

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status update in #mvp-ryla-dev
- **Audience**: Engineering team, Product, Finance

---

## Success Criteria

### Primary Success Metrics

| Metric                        | Target    | Measurement Method       | Timeline                |
| ----------------------------- | --------- | ------------------------ | ----------------------- |
| Infrastructure Cost Reduction | -30%      | Monthly spend comparison | 3 months post-migration |
| Page Load Time (Global)       | <2s (p95) | Cloudflare Analytics     | 1 month post-migration  |
| Egress Fees                   | $0        | Cloudflare billing       | Immediate               |
| Deployment Time               | -50%      | CI/CD metrics            | 1 month post-migration  |

### Business Metrics Impact

**Target Metric**: [x] E-CAC (Cost optimization), [x] A-Activation (Performance)

**Expected Impact**:

- **E-CAC**: -30% infrastructure costs
- **A-Activation**: +5-10% improvement from faster page loads

### Leading Indicators

- R2 storage usage (GB stored)
- Pages deployments (success rate)
- CDN hit rate (>90% target)
- Error rates (<0.1% target)

### Lagging Indicators

- Monthly infrastructure spend
- User activation rates
- Page load time percentiles
- User-reported performance issues

---

## Definition of Done

### Initiative Complete When:

- [x] R2 buckets created and configured
- [x] CDN Worker deployed and tested
- [ ] All frontend apps deployed to Cloudflare Pages
- [ ] Custom domains configured
- [ ] Cost reduction validated (30%+)
- [ ] Performance benchmarks met (<2s p95)
- [ ] Documentation updated
- [ ] Team trained on new deployment process
- [ ] Post-mortem completed

### Not Done Criteria

**This initiative is NOT done if:**

- [ ] Cost reduction not achieved
- [ ] Performance degraded
- [ ] Deployment process more complex
- [ ] Documentation incomplete
- [ ] Team not trained
- [ ] Technical debt introduced

---

## Related Work

### Epics

| Epic | Name                     | Status | Link            |
| ---- | ------------------------ | ------ | --------------- |
| N/A  | Infrastructure Migration | Active | This initiative |

### Dependencies

- **Blocks**: None currently
- **Blocked By**: None
- **Related Initiatives**: None

### Documentation

- [Cloudflare Setup Guide](../ops/CLOUDFLARE-SETUP-INDEX.md)
- [Cloudflare vs Fly.io Comparison](../ops/CLOUDFLARE-VS-FLY-COMPARISON.md)
- [Storage Setup](../ops/STORAGE-SETUP.md)

---

## Risks & Mitigation

| Risk                    | Probability | Impact | Mitigation Strategy                                 |
| ----------------------- | ----------- | ------ | --------------------------------------------------- |
| Migration downtime      | Low         | High   | Incremental migration, feature flags, rollback plan |
| Cost increase           | Low         | Medium | Free tier usage, monitor billing closely            |
| Performance degradation | Low         | High   | Benchmark before/after, monitor Core Web Vitals     |
| Deployment complexity   | Medium      | Low    | Automate via GitHub Actions, document process       |

---

## Progress Tracking

### Current Phase

**Phase**: Phase 1 - R2 Storage Setup  
**Status**: On Track

### Recent Updates

- **2026-01-XX**: Initiative created, Cloudflare MCP servers configured
- **2026-01-XX**: R2 bucket creation planned, CDN Worker code written
- **2026-01-XX**: API token configuration in progress

### Next Steps

1. Complete API token setup
2. Create R2 buckets via Cloudflare MCP
3. Deploy CDN Worker
4. Test R2 storage access
5. Begin Phase 2 planning

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

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare vs Fly.io Comparison](../ops/CLOUDFLARE-VS-FLY-COMPARISON.md)
- [Cloudflare Setup Index](../ops/CLOUDFLARE-SETUP-INDEX.md)

---

**Template Version**: 1.0  
**Last Updated**: 2026-01-XX
