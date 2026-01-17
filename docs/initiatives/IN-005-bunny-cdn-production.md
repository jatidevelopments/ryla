# [INITIATIVE] IN-005: Bunny CDN Production Implementation

**Status**: Proposed  
**Created**: 2026-01-XX  
**Last Updated**: 2026-01-XX  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, Frontend Team

---

## Executive Summary

**One-sentence description**: Implement Bunny CDN Storage and CDN for production image storage and delivery, replacing the planned Cloudflare R2 solution with a proven, cost-effective alternative used successfully in MDC project.

**Business Impact**: E-CAC (reduced infrastructure costs), C-Core Value (faster image delivery improves user experience)

---

## Why (Business Rationale)

### Problem Statement

RYLA currently uses MinIO for local development, but production storage is not yet configured. ADR-005 decided on Cloudflare R2, but we have a proven alternative (Bunny CDN) that:
- Is already successfully used in the MDC project
- Has lower storage costs ($0.01/GB vs $0.015/GB for R2)
- Includes 1TB free egress per month (good for MVP/early stage)
- Has simpler setup (all-in-one storage + CDN)
- Is S3-compatible (works with existing code)
- **Built-in image optimization** - $9.50/month for unlimited transformations (resizing, format conversion, WebP/AVIF)

### Current State

- **Local Development**: MinIO via docker-compose (working well)
- **Code**: Already S3-compatible (AWS SDK with endpoint configuration)
- **Static Assets**: Bunny CDN (`https://rylaai.b-cdn.net`) already configured for public folder
- **Production Storage**: Not yet configured
- **ADR-005**: Decided on Cloudflare R2, but not yet implemented

### Desired State

- **Production Storage**: Bunny Storage (S3-compatible) for all user-generated content
- **CDN**: Bunny CDN for fast global delivery
- **Image Optimization**: Built-in optimization service ($9.50/month unlimited)
- **Code**: Minimal changes (already S3-compatible)
- **Cost**: Competitive with Cloudflare R2 for MVP/early stage (< 1TB egress/month)
- **Proven Solution**: Leverage MDC project implementation patterns

### Business Drivers

- **Revenue Impact**: Faster image delivery improves user experience, potentially increasing engagement and retention
- **Cost Impact**: Lower storage costs ($0.01/GB vs $0.015/GB) and 1TB free egress saves $15-30/month in early stages
- **Risk Mitigation**: Using a proven solution (MDC) reduces implementation risk and learning curve
- **Competitive Advantage**: Fast image delivery improves perceived performance and user satisfaction
- **User Experience**: Global CDN ensures fast image loading worldwide, improving core value delivery

---

## How (Approach & Strategy)

### Strategy

1. **Learn from MDC Implementation**
   - Review MDC's Bunny CDN setup (S3-compatible storage + CDN)
   - Copy proven patterns and configuration
   - Adapt to RYLA's specific needs

2. **Incremental Implementation**
   - Phase 1: Set up Bunny Storage (S3-compatible)
   - Phase 2: Configure CDN for image delivery
   - Phase 3: Update environment variables and test
   - Phase 4: Migrate existing images (if any)

3. **Minimal Code Changes**
   - Leverage existing S3-compatible code
   - Only update environment variables
   - No code refactoring needed

### Key Principles

- **Proven Patterns**: Copy successful MDC implementation
- **Minimal Disruption**: Use existing S3-compatible code, no refactoring
- **Incremental Rollout**: Test thoroughly before full migration
- **Cost Optimization**: Leverage 1TB free egress for MVP stage

### Phases

1. **Phase 1: Research & Planning** - Review MDC implementation, document patterns - 1-2 days
2. **Phase 2: Bunny Storage Setup** - Create storage zone, configure S3-compatible API - 1 day
3. **Phase 3: CDN Configuration** - Set up CDN pull zone, configure caching - 1 day
4. **Phase 4: Code Integration** - Update environment variables, test uploads - 1-2 days
5. **Phase 5: Testing & Validation** - End-to-end testing, performance validation - 2-3 days
6. **Phase 6: Production Deployment** - Deploy to production, monitor - 1 day

**Total Timeline**: 7-10 days

### Dependencies

- **MDC Project Access**: Need access to MDC codebase to review implementation
- **Bunny Account**: Create/access Bunny.net account
- **Environment Variables**: Update production environment variables
- **No Code Dependencies**: Existing S3-compatible code works as-is

### Constraints

- **Must maintain S3-compatibility**: Code should work with both MinIO (local) and Bunny (production)
- **Must not break existing functionality**: All existing image upload/download flows must continue working
- **Budget**: Bunny Storage + CDN + Image Optimization costs (estimated $10.50-40/month for MVP stage)

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-XX
- **Target Completion**: 2026-01-XX (7-10 days from start)
- **Key Milestones**:
  - Phase 1 Complete (Research): 2026-01-XX
  - Phase 2 Complete (Storage Setup): 2026-01-XX
  - Phase 3 Complete (CDN Setup): 2026-01-XX
  - Phase 4 Complete (Integration): 2026-01-XX
  - Phase 5 Complete (Testing): 2026-01-XX
  - Phase 6 Complete (Production): 2026-01-XX

### Priority

**Priority Level**: P1

**Rationale**: 
- Production storage is required before launch
- Bunny CDN is a proven, cost-effective solution
- Lower priority than core features (P0) but higher than nice-to-haves (P2)
- Can be done in parallel with feature development

### Resource Requirements

- **Team**: 1 Backend Engineer (full-time), 1 Frontend Engineer (part-time for testing)
- **Budget**: $10.50-40/month for Bunny Storage + CDN + Image Optimization (scales with usage)
- **External Dependencies**: 
  - Bunny.net account and API access
  - Access to MDC project codebase for reference

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team  
**Role**: Infrastructure/DevOps  
**Responsibilities**: 
- Bunny Storage and CDN setup
- Environment variable configuration
- Production deployment
- Monitoring and maintenance

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend Development | High | Code integration, testing, API updates |
| Frontend Team | Frontend Development | Medium | Frontend testing, CDN URL configuration |
| Infrastructure Team | DevOps | High | Bunny setup, deployment, monitoring |

### Teams Involved

- **Backend Team**: Integrate Bunny Storage, update image upload/download services
- **Frontend Team**: Test image loading, verify CDN URLs work correctly
- **Infrastructure Team**: Set up Bunny account, configure storage and CDN

### Communication Plan

- **Updates Frequency**: Daily during implementation, weekly after completion
- **Update Format**: Slack updates in #mvp-ryla-dev channel
- **Audience**: Development team, product team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Image upload success rate | > 99% | Monitor API logs, error rates | Ongoing |
| Image load time (p95) | < 2s | CDN analytics, browser performance | Ongoing |
| Storage cost | < $40/month | Bunny billing dashboard | Monthly |
| CDN cache hit ratio | > 80% | Bunny CDN analytics | Ongoing |
| Zero downtime migration | 100% | Monitor error rates during migration | During migration |

### Business Metrics Impact

**Target Metric**: [ ] A-Activation [ ] B-Retivation [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **E-CAC**: Competitive costs vs Cloudflare R2 in early stage (Bunny: $10.50/month vs R2: $6.50/month with optimization)
- **C-Core Value**: Faster image delivery + built-in optimization improves user experience and engagement
- **Image Optimization**: Built-in optimization eliminates need for preprocessing or Workers

### Leading Indicators

- Bunny Storage zone created and accessible
- CDN pull zone configured and serving images
- Environment variables updated in production
- Test uploads successful
- CDN cache hit ratio > 50% within first week

### Lagging Indicators

- Image upload success rate > 99% for 1 week
- Image load time (p95) < 2s for 1 week
- Zero production incidents related to image storage
- Cost within budget (< $40/month)

---

## Definition of Done

### Initiative Complete When:

- [ ] Bunny Storage zone created and configured
- [ ] CDN pull zone set up and serving images
- [ ] Environment variables updated in production
- [ ] All image upload/download flows tested and working
- [ ] CDN cache hit ratio > 80%
- [ ] Image load time (p95) < 2s
- [ ] Documentation updated (ADR, setup guides)
- [ ] Monitoring and alerts configured
- [ ] Team trained on Bunny CDN management
- [ ] Post-implementation review completed

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Image uploads fail or are unreliable
- [ ] CDN not serving images correctly
- [ ] Image load times are slow (> 3s p95)
- [ ] Documentation missing or incomplete
- [ ] Monitoring not configured
- [ ] Team not trained on new system

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| TBD | Image Storage & CDN Implementation | Not Created | TBD |

### Dependencies

- **Blocks**: Production launch (images need storage)
- **Blocked By**: None
- **Related Initiatives**: 
  - IN-001 (Cloudflare Infrastructure) - May conflict if Cloudflare R2 was planned
  - IN-003 (SFW/NSFW Separation) - May need separate storage zones

### Documentation

- [ADR-005](./../decisions/ADR-005-cloudflare-r2-storage.md) - Cloudflare R2 decision (to be updated or superseded)
- [MDC Implementation](./../../MDC/mdc-backend/src/modules/aws-s3/services/aws-s3.service.ts) - Reference implementation
- [Storage Setup Guide](./../ops/STORAGE-SETUP.md) - To be updated with Bunny instructions

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Bunny API changes break compatibility | Low | High | Use S3-compatible API (standard), monitor Bunny updates |
| CDN cache issues cause slow loads | Medium | Medium | Configure proper cache headers, monitor cache hit ratio |
| Cost overruns if egress exceeds 1TB | Medium | Low | Monitor usage, set up alerts at 80% of free tier |
| Image optimization costs not justified | Low | Medium | Evaluate usage patterns, consider manual optimization if low volume |
| Migration breaks existing images | Low | High | Thorough testing, gradual rollout, rollback plan |
| MDC patterns don't fit RYLA needs | Medium | Medium | Adapt patterns, don't blindly copy, test thoroughly |

---

## Progress Tracking

### Current Phase

**Phase**: Phase 1 - Research & Planning  
**Status**: Not Started

### Recent Updates

- **2026-01-XX**: Initiative created, awaiting approval to start

### Next Steps

1. Review MDC Bunny CDN implementation in detail
2. Document Bunny Storage setup process
3. Create Bunny account and storage zone
4. Configure S3-compatible API access
5. Set up CDN pull zone

---

## MDC Implementation Reference

### Key Learnings from MDC

1. **S3-Compatible API**: MDC uses AWS SDK with custom endpoint pointing to Bunny Storage
2. **CDN Configuration**: Uses Bunny CDN (`s3mdc.b-cdn.net`, `mdc-p.b-cdn.net`) for image delivery
3. **Next.js Config**: Remote image patterns configured in `next.config.ts` for Bunny CDN domains
4. **Environment Variables**: `CDN_URL` configured for frontend, AWS S3 env vars for backend
5. **Storage Structure**: Simple file paths, no complex folder structures needed

### MDC Configuration Pattern

**Backend (NestJS)**:
```typescript
// Uses AWS SDK with Bunny Storage endpoint
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
  },
  endpoint: process.env.AWS_S3_ENDPOINT, // Bunny Storage endpoint
});
```

**Frontend (Next.js)**:
```typescript
// next.config.ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "s3mdc.b-cdn.net", pathname: "/**" },
    { protocol: "https", hostname: "mdc-p.b-cdn.net", pathname: "/**" },
  ],
}
```

**Environment Variables**:
```bash
AWS_S3_REGION=ny
AWS_S3_ACCESS_KEY=bunny_storage_access_key
AWS_S3_SECRET_KEY=bunny_storage_secret_key
AWS_S3_BUCKET_NAME=storage_zone_name
AWS_S3_ENDPOINT=https://storage.bunnycdn.com
CDN_URL=https://s3mdc.b-cdn.net
```

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [To be filled]

### What Could Be Improved

- [To be filled]

### Recommendations for Future Initiatives

- [To be filled]

---

## References

- [Bunny CDN Documentation](https://docs.bunny.net/)
- [Bunny Storage Documentation](https://docs.bunny.net/storage/)
- [Bunny S3-Compatible API](https://docs.bunny.net/storage/api/storage-api)
- [Bunny CDN Pricing](https://bunny.net/pricing/)
- [MDC Backend Implementation](./../../MDC/mdc-backend/src/modules/aws-s3/services/aws-s3.service.ts)
- [MDC Frontend Configuration](./../../MDC/mdc-next-frontend/next.config.ts)
- [ADR-005: Cloudflare R2 Storage](./../decisions/ADR-005-cloudflare-r2-storage.md)
- [Storage Setup Guide](./../ops/STORAGE-SETUP.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-XX
