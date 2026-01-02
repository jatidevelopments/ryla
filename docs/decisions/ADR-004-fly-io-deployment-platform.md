# ADR-004: Fly.io as Primary Deployment Platform

**Status**: Accepted  
**Date**: 2025-12-17  
**Deciders**: Development Team  
**Related**: [AWS vs Fly.io Comparison](../ops/AWS-VS-FLY-COMPARISON.md)

---

## Context

RYLA MVP requires deploying 4 containerized applications:
- `apps/landing` - Marketing landing page (Next.js)
- `apps/funnel` - Payment conversion funnel (Next.js)
- `apps/web` - Main web application (Next.js)
- `apps/api` - Backend API (Node.js/NestJS)

**Key Requirements:**
- Fast deployment cycles for MVP iteration
- Cost-effective for low-to-medium traffic
- Simple CI/CD integration
- Auto-scaling capabilities
- Multi-region support (future)
- Docker-based deployment (already containerized)

**Current State:**
- All apps have Dockerfiles
- Fly.io configs exist (`fly.toml`) for landing, funnel, web
- Manual deployment via `flyctl deploy`
- GitHub Actions workflows exist but don't deploy yet

**The Question**: Should RYLA use Fly.io or migrate to AWS (App Runner/ECS) for deployment?

---

## Decision

**Use Fly.io as the primary deployment platform for all RYLA applications.**

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Actions                        │
│              (CI/CD Pipeline)                            │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                      Fly.io                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ Landing  │  │  Funnel  │  │   Web    │  │   API    ││
│  │ (fra)    │  │  (fra)   │  │  (fra)   │  │  (fra)   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
└─────────────────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Domains                               │
│  ryla.ai │ goviral.ryla.ai │ app.ryla.ai │ end.ryla.ai │
└─────────────────────────────────────────────────────────┘
```

### Key Points

1. **All apps on Fly.io** - Unified platform, simpler ops
2. **Region: Frankfurt (fra)** - EU data residency, low latency
3. **Auto-scaling** - Fly.io handles traffic spikes
4. **Docker-based** - Existing Dockerfiles work as-is
5. **GitHub Actions** - Automated deployments via CI/CD

---

## Rationale

### Why Fly.io Over AWS?

| Factor | Fly.io | AWS App Runner | Winner |
|--------|--------|----------------|--------|
| **Setup Time** | 30 min | 2-4 hours | ✅ Fly.io |
| **Cost (MVP)** | $35-50/mo | $115/mo | ✅ Fly.io |
| **CD Complexity** | Low | Medium-High | ✅ Fly.io |
| **Deployment Speed** | ~5 min | ~10-15 min | ✅ Fly.io |
| **Learning Curve** | Low | High | ✅ Fly.io |
| **Auto-scaling** | Built-in | Built-in | ✅ Tie |
| **Enterprise Features** | Limited | Extensive | ✅ AWS |
| **Multi-region** | Manual | Easy | ✅ AWS |

### Cost Analysis (12 months)

```
Fly.io:     $1,125/year
AWS:        $2,145/year
Savings:    $1,020/year (45% cheaper)
```

**Break-even point**: ~200k requests/day (when AWS becomes cheaper)

### MVP Phase Considerations

1. **Speed > Features** - Need fast iteration, not enterprise tooling
2. **Budget Constraint** - MVP budget favors cost-effective solutions
3. **Team Size** - Small team benefits from simpler platform
4. **Risk** - Fly.io is working, migration adds risk with no immediate benefit

---

## Consequences

### Positive

- ✅ **Fast deployment** - ~5 minute deploys, one command
- ✅ **Cost-effective** - 45% cheaper than AWS at MVP scale
- ✅ **Simple CD** - GitHub Actions integration straightforward
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **Zero-downtime** - Built-in blue/green deployments
- ✅ **Already working** - No migration risk
- ✅ **Docker-native** - Existing Dockerfiles work as-is
- ✅ **Auto-rollback** - Failed deployments auto-revert

### Negative

- ❌ **Limited enterprise features** - No advanced IAM, compliance tools
- ❌ **Vendor lock-in** - Fly.io-specific features (volumes, networking)
- ❌ **Multi-region complexity** - Manual setup vs AWS automation
- ❌ **Cost at scale** - May become expensive at very high traffic
- ❌ **Less ecosystem** - Fewer integrations than AWS

### Risks

1. **Vendor lock-in** → Mitigation: Use standard Docker, easy to migrate later
2. **Cost at scale** → Mitigation: Revisit at 200k req/day, migration path documented
3. **Limited features** → Mitigation: MVP doesn't need enterprise features yet
4. **Platform stability** → Mitigation: Fly.io has good uptime, monitor closely

---

## Alternatives Considered

### Option 1: AWS App Runner

**Pros:**
- Extensive enterprise features (IAM, CloudWatch, etc.)
- Better multi-region support
- AWS ecosystem integration
- Cost-effective at very high scale

**Cons:**
- 2-3x more expensive at MVP scale
- Complex setup (2-4 hours per app)
- Steeper learning curve
- More GitHub Actions steps needed

**Why not:** Cost and complexity don't justify benefits for MVP phase.

### Option 2: AWS ECS Fargate

**Pros:**
- Full control over infrastructure
- Advanced deployment strategies (blue/green, canary)
- Cost optimization options (reserved, spot)

**Cons:**
- Very complex (4-8 hours setup per app)
- 3-4x more expensive at MVP scale
- Many moving parts (ALB, target groups, tasks)
- High maintenance overhead

**Why not:** Overkill for MVP, too complex for small team.

### Option 3: AWS Amplify (Frontend Only)

**Pros:**
- Optimized for Next.js
- Native GitHub integration
- Fast CDN
- Auto PR previews

**Cons:**
- Frontend only (can't run API/backend)
- Limited customization
- Vendor lock-in

**Why not:** Can't deploy all apps, would need hybrid approach.

### Option 4: Hybrid (Amplify + Fly.io)

**Pros:**
- Best of both worlds
- Amplify for frontend, Fly.io for backend

**Cons:**
- More complexity (two platforms)
- Higher cost
- More to manage

**Why not:** Unnecessary complexity for MVP. Fly.io handles all apps well.

---

## Implementation

### Phase 1: CD Pipeline Setup (Week 1)

1. **GitHub Actions Workflows**
   - Update `deploy-staging.yml` to deploy to Fly.io
   - Update `deploy-production.yml` to deploy to Fly.io
   - Add matrix strategy for multiple apps
   - Add health checks post-deployment

2. **Secrets Management**
   - Configure Fly.io API tokens in GitHub Secrets
   - Set app-specific secrets via `fly secrets set`
   - Document secret management process

3. **Deployment Strategy**
   - Staging: Auto-deploy on `main` branch push
   - Production: Manual trigger or release tag
   - Rollback: Auto on health check failure

### Phase 2: Monitoring & Alerts (Week 2)

1. **Health Checks**
   - Add health check endpoints to all apps
   - Configure Fly.io health checks
   - Set up alerts on failures

2. **Monitoring**
   - Fly.io metrics dashboard
   - GitHub Actions deployment status
   - Slack notifications on deploy/failure

### Phase 3: Optimization (Ongoing)

1. **Cost Optimization**
   - Review auto-stop settings
   - Optimize VM sizes based on usage
   - Monitor and adjust scaling

2. **Performance**
   - Monitor response times
   - Optimize Docker images
   - CDN integration if needed

---

## Migration Path (Future)

When to revisit:
- **Traffic > 200k req/day** - Cost break-even point
- **Enterprise customers** - Compliance requirements
- **Need AWS services** - RDS, S3, Lambda integration
- **Team grows** - More AWS expertise available

**Migration effort**: 2-3 weeks (documented in comparison doc)

---

## Related Decisions

- [ADR-001: Database Architecture](./ADR-001-database-architecture.md) - Supabase for database
- [AWS vs Fly.io Comparison](../ops/AWS-VS-FLY-COMPARISON.md) - Detailed comparison

## References

- [Fly.io Documentation](https://fly.io/docs/)
- [Fly.io GitHub Actions](https://github.com/superfly/flyctl-actions)
- [Fly.io Pricing](https://fly.io/docs/about/pricing/)
- [CD Strategy Document](../ops/FLY-IO-CD-STRATEGY.md)

