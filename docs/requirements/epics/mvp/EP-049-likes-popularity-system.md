# [EPIC] EP-049: Likes & Popularity System

**Status**: Completed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-011: Template Gallery & Content Library](../../../initiatives/IN-011-template-gallery-content-library.md)  
> **Phase**: 3 (Discovery & Sorting)  
> **Priority**: P1  
> **Depends On**: EP-046 (Template Sets)

---

## P1: Requirements

### Problem Statement

Users have no way to express preference for templates they like, and there's no mechanism to surface popular or trending templates. The current system only tracks usage count, which doesn't reflect user preference and doesn't account for recency (trending vs. all-time popular).

### MVP Objective

Implement a likes system and popularity algorithm that:
- Allows users to like/unlike templates and template sets
- Tracks likes count on templates
- Implements a trending algorithm using materialized views
- Provides sorting options: Popular (by likes), Trending (by usage rate), New, Recent

**Measurable**: 30% of active users like at least one template within first week. Popular sort is used by 50% of gallery visitors.

### Non-Goals

- Dislike/downvote functionality
- Like notifications to template creators
- Like history/feed
- Social features (followers, shares)

### Business Metric

**Target**: B - Retention (likes create engagement), C - Core Value (better discovery)

---

## P2: Scoping

### Feature List

| ID | Feature | Description |
|----|---------|-------------|
| F1 | Template Likes Schema | Store user likes for templates |
| F2 | Template Set Likes Schema | Store user likes for sets |
| F3 | Likes Repository | Data access for like operations |
| F4 | Trending Materialized View | Time-weighted popularity scoring |
| F5 | Likes tRPC Endpoints | API for like/unlike operations |
| F6 | Trending Cron Job | Daily refresh of trending view |

### Stories

#### ST-049-001: Template Likes Database Schema

**As a** developer  
**I want to** create the likes database schema  
**So that** user preferences can be stored

**Acceptance Criteria**:
- [ ] AC1: `template_likes` table created with user_id, template_id
- [ ] AC2: Unique constraint prevents duplicate likes
- [ ] AC3: `template_set_likes` table created similarly
- [ ] AC4: Proper indexes for query performance
- [ ] AC5: Foreign key cascades on delete

#### ST-049-002: Likes Count Tracking

**As a** developer  
**I want to** track likes count on templates  
**So that** popularity can be displayed and sorted

**Acceptance Criteria**:
- [ ] AC1: `likes_count` column added to templates table
- [ ] AC2: `likes_count` column added to template_sets table
- [ ] AC3: Count incremented on like
- [ ] AC4: Count decremented on unlike
- [ ] AC5: Trigger or application logic keeps count in sync

#### ST-049-003: Likes Repository

**As a** developer  
**I want to** create the likes repository  
**So that** like operations are properly abstracted

**Acceptance Criteria**:
- [ ] AC1: `likeTemplate` creates like record and increments count
- [ ] AC2: `unlikeTemplate` removes like record and decrements count
- [ ] AC3: `isLiked` checks if user has liked a template
- [ ] AC4: `getLikedByUser` returns all templates liked by user
- [ ] AC5: `getLikersCount` returns count for a template
- [ ] AC6: Same operations for template sets

#### ST-049-004: Trending Materialized View

**As a** developer  
**I want to** create a trending algorithm  
**So that** hot templates can be surfaced

**Acceptance Criteria**:
- [ ] AC1: Materialized view calculates usage_rate (usage / days since creation)
- [ ] AC2: Only includes public templates
- [ ] AC3: View has index for fast sorting
- [ ] AC4: View can be refreshed without blocking reads

#### ST-049-005: Trending Cron Job

**As a** developer  
**I want to** refresh trending data daily  
**So that** trending templates stay current

**Acceptance Criteria**:
- [ ] AC1: Cron job runs at 2 AM daily (low traffic)
- [ ] AC2: Uses Redis lock to prevent duplicate runs
- [ ] AC3: Logs success/failure to monitoring
- [ ] AC4: Refresh completes in under 1 minute

#### ST-049-006: Likes tRPC Endpoints

**As a** user  
**I want to** like and unlike templates  
**So that** I can express my preferences

**Acceptance Criteria**:
- [ ] AC1: `likes.like` - Like a template (returns new count)
- [ ] AC2: `likes.unlike` - Unlike a template (returns new count)
- [ ] AC3: `likes.isLiked` - Check if user has liked
- [ ] AC4: `likes.getLikedTemplates` - Get user's liked templates
- [ ] AC5: Same endpoints for template sets
- [ ] AC6: All endpoints require authentication
- [ ] AC7: Optimistic updates supported (return new count immediately)

#### ST-049-007: Sorting Queries

**As a** developer  
**I want to** implement sorting options in template queries  
**So that** users can discover templates by preference

**Acceptance Criteria**:
- [ ] AC1: `popular` sort: ORDER BY likes_count DESC, usage_count DESC
- [ ] AC2: `trending` sort: JOIN trending view, ORDER BY usage_rate DESC
- [ ] AC3: `new` sort: ORDER BY created_at DESC
- [ ] AC4: `recent` sort: ORDER BY user's recent template usage
- [ ] AC5: Sorting works for both templates and template sets
- [ ] AC6: Sorting combined with other filters (category, content_type)

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `template_liked` | User likes template | `template_id`, `is_set`, `likes_count` |
| `template_unliked` | User unlikes template | `template_id`, `is_set`, `likes_count` |
| `trending_view_refreshed` | Cron job completes | `rows_updated`, `duration_ms` |

### Non-MVP Items

- Like animations/effects
- "Users who liked this also liked" recommendations
- Like notifications
- Weekly/monthly trending periods
- Weighted trending (likes + usage combined)

---

## P3: Architecture

### Data Model

```sql
-- Template Likes
CREATE TABLE template_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, template_id)
);

-- Indexes
CREATE INDEX idx_template_likes_user ON template_likes(user_id);
CREATE INDEX idx_template_likes_template ON template_likes(template_id);
CREATE INDEX idx_template_likes_created ON template_likes(created_at DESC);

-- Template Set Likes
CREATE TABLE template_set_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  set_id UUID NOT NULL REFERENCES template_sets(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, set_id)
);

-- Indexes
CREATE INDEX idx_template_set_likes_user ON template_set_likes(user_id);
CREATE INDEX idx_template_set_likes_set ON template_set_likes(set_id);

-- Add likes_count to templates (if not already added)
ALTER TABLE templates ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;
CREATE INDEX idx_templates_likes ON templates(likes_count DESC);

-- Trending Materialized View
CREATE MATERIALIZED VIEW template_trending AS
SELECT
  id,
  usage_count,
  likes_count,
  created_at,
  -- Usage rate: usage per day since creation
  usage_count / NULLIF(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 0) AS usage_rate,
  -- Combined score (can be adjusted)
  (usage_count * 0.3 + likes_count * 0.7) / NULLIF(EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400, 0) AS trending_score
FROM templates
WHERE is_public = true AND created_at > NOW() - INTERVAL '90 days';

-- Unique index for concurrent refresh
CREATE UNIQUE INDEX idx_template_trending_id ON template_trending(id);

-- Index for sorting
CREATE INDEX idx_template_trending_score ON template_trending(trending_score DESC);
CREATE INDEX idx_template_trending_usage_rate ON template_trending(usage_rate DESC);
```

### TypeScript Types

```typescript
// libs/shared/src/types/template-likes.ts

export interface TemplateLike {
  id: string;
  userId: string;
  templateId: string;
  createdAt: Date;
}

export interface TemplateSetLike {
  id: string;
  userId: string;
  setId: string;
  createdAt: Date;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export type SortOption = 'popular' | 'trending' | 'new' | 'recent';
```

### Trending Algorithm

```
trending_score = (usage_count * 0.3 + likes_count * 0.7) / days_since_creation

- Weights: 70% likes, 30% usage
- Only considers templates from last 90 days
- Refreshed daily at 2 AM

Example:
- Template A: 100 uses, 50 likes, 7 days old
  Score = (100 * 0.3 + 50 * 0.7) / 7 = (30 + 35) / 7 = 9.29

- Template B: 500 uses, 10 likes, 30 days old
  Score = (500 * 0.3 + 10 * 0.7) / 30 = (150 + 7) / 30 = 5.23

Template A ranks higher (more engagement relative to age)
```

### Cron Job Implementation

```typescript
// apps/api/src/modules/template/services/template-trending.service.ts

@Injectable()
export class TemplateTrendingService {
  constructor(
    private readonly db: Database,
    private readonly redisLock: RedisLockService,
    private readonly analytics: AnalyticsService,
  ) {}

  @Cron('0 2 * * *', { timeZone: 'Europe/Berlin' })
  async refreshTrendingView() {
    const lockKey = 'cron:refreshTemplateTrending:lock';
    const lock = await this.redisLock.acquireLock(lockKey, 600);
    
    if (!lock) {
      Logger.warn('Trending refresh skipped - lock active');
      return;
    }

    try {
      const start = Date.now();
      
      await this.db.execute(
        sql`REFRESH MATERIALIZED VIEW CONCURRENTLY template_trending`
      );
      
      const duration = Date.now() - start;
      Logger.log(`Trending view refreshed in ${duration}ms`);
      
      this.analytics.capture('trending_view_refreshed', {
        duration_ms: duration,
      });
    } catch (error) {
      Logger.error('Failed to refresh trending view', error);
      throw error;
    } finally {
      await this.redisLock.releaseLock(lockKey);
    }
  }
}
```

---

## Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `libs/data/src/schema/template-likes.schema.ts` | Likes schema |
| `libs/data/src/repositories/template-likes.repository.ts` | Likes data access |
| `libs/business/src/services/template-trending.service.ts` | Trending cron job |
| `libs/trpc/src/routers/template-likes.router.ts` | Likes API |
| `libs/shared/src/types/template-likes.ts` | Types |
| `drizzle/migrations/XXXX_create_likes_and_trending.sql` | Migration |

### Modify Files

| File | Changes |
|------|---------|
| `libs/data/src/schema/templates.schema.ts` | Ensure likes_count exists |
| `libs/data/src/repositories/templates.repository.ts` | Add sorting by popular/trending |
| `libs/trpc/src/routers/templates.router.ts` | Use new sorting options |
| `libs/trpc/src/root.ts` | Register likes router |
| `apps/api/src/app.module.ts` | Register trending service |

---

## Task Breakdown

| Task ID | Story | Task | Estimate |
|---------|-------|------|----------|
| TSK-049-001 | ST-049-001 | Create template_likes schema | 1h |
| TSK-049-002 | ST-049-001 | Create template_set_likes schema | 0.5h |
| TSK-049-003 | ST-049-001 | Create migration | 0.5h |
| TSK-049-004 | ST-049-002 | Ensure likes_count columns exist | 0.5h |
| TSK-049-005 | ST-049-003 | Create TemplateLikesRepository | 2h |
| TSK-049-006 | ST-049-003 | Implement like/unlike with count sync | 1h |
| TSK-049-007 | ST-049-003 | Implement isLiked and getLikedByUser | 1h |
| TSK-049-008 | ST-049-004 | Create trending materialized view | 1h |
| TSK-049-009 | ST-049-004 | Add indexes | 0.5h |
| TSK-049-010 | ST-049-005 | Create TemplateTrendingService | 1h |
| TSK-049-011 | ST-049-005 | Implement cron job with lock | 1h |
| TSK-049-012 | ST-049-006 | Create likes tRPC router | 1.5h |
| TSK-049-013 | ST-049-006 | Implement all endpoints | 1.5h |
| TSK-049-014 | ST-049-007 | Update templates repository with sorting | 2h |
| TSK-049-015 | ST-049-007 | Implement recent sort (user's history) | 1h |
| TSK-049-016 | - | Write unit tests | 2h |
| TSK-049-017 | - | Add analytics events | 0.5h |
| **Total** | | | **18.5h** |

---

## Dependencies

- **Blocks**: EP-047 (UX needs sorting to work)
- **Blocked By**: EP-046 (Template Sets need likes too)

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Likes count race condition | Low | Medium | Use atomic increment/decrement |
| Trending view refresh slow | Low | Low | CONCURRENTLY refresh, run at 2 AM |
| Gaming/spam likes | Medium | Medium | Rate limiting (future), monitor patterns |

---

## Phase Checklist

- [x] P1: Requirements ✅
- [x] P2: Scoping ✅
- [x] P3: Architecture ✅
- [ ] P4: UI Skeleton (covered in EP-047)
- [x] P5: Technical Spec ✅
- [x] P6: Implementation ✅ (schema, repository, service, tRPC router, trending view)
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

---

## Related Documentation

- Initiative: `docs/initiatives/IN-011-template-gallery-content-library.md`
- Parent Epic: `docs/requirements/epics/mvp/EP-020-template-gallery.md`
- MDC Trending Reference: `/Users/admin/Documents/Projects/MDC/mdc-backend/src/modules/character/services/character-trending-service.ts`
