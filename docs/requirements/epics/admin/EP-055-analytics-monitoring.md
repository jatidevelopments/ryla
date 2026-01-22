# [EPIC] EP-055: Analytics & Monitoring

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 2  
**Priority**: P1  
**Status**: Completed

---

## Overview

Build analytics dashboards and system monitoring tools for the admin panel. Provides insights into user behavior, platform usage, and system health.

---

## Business Impact

**Target Metric**: All (A, B, C, D, E visibility)

**Hypothesis**: When we have visibility into platform metrics and system health, we can make better decisions and respond to issues faster.

**Success Criteria**:

- Key metrics visible at a glance
- System issues detected within 5 minutes
- Data available for business decisions

---

## Features

### F1: Admin Dashboard Home

Overview dashboard showing key metrics:

**User Metrics**:
- Total users
- New users (today/week/month)
- Active users (DAU, WAU, MAU)
- User growth chart

**Content Metrics**:
- Total characters
- Total images generated
- Images today
- Generation success rate

**Revenue Metrics**:
- Active subscriptions by tier
- Credits purchased today
- Credits consumed today
- Refunds issued today

**Quick Actions**:
- Recent bug reports (open)
- Failed jobs (last 24h)
- Pending influencer requests

### F2: User Analytics

Deep dive into user behavior:

**Acquisition**:
- New signups over time
- Signup source (direct, referral, funnel)
- Conversion funnel (visit → signup → first generation)

**Engagement**:
- Daily active users
- Weekly active users
- Monthly active users
- Sessions per user
- Generations per user

**Retention**:
- D1, D7, D30 retention cohorts
- Churn rate by tier
- User lifetime chart

**Segmentation**:
- Users by subscription tier
- Users by geography (if available)
- Users by character count
- Power users vs casual

### F3: Content Analytics

Generated content insights:

**Generation Stats**:
- Generations per day/week/month
- By quality mode (draft vs hq)
- By type (studio, base image, profile pictures)
- By aspect ratio
- NSFW vs SFW split

**Popular Content**:
- Popular scenes
- Popular environments
- Popular outfits
- Popular poses

**Performance**:
- Average generation time
- Success rate by type
- Failure reasons breakdown
- Queue length over time

### F4: Revenue Analytics

Billing and revenue insights:

**Subscriptions**:
- Active subscriptions by tier
- New subscriptions
- Cancellations
- Upgrades/downgrades
- MRR estimation

**Credits**:
- Credits purchased
- Credits consumed
- Credits granted (admin)
- Credits refunded
- Credit balance distribution

**Trends**:
- Revenue trend chart
- Churn trend
- ARPU calculation

### F5: System Health Dashboard

Real-time system status:

**Infrastructure**:
- Database connection status
- Redis connection status
- S3/R2 storage status
- API response times

**Job Processing**:
- Queue length
- Processing rate
- Failed jobs count
- Average wait time
- ComfyUI pod status

**Error Tracking**:
- API error rate
- Error types breakdown
- Recent errors log

### F6: Audit Log Viewer

View all admin actions:

- Filter by admin user
- Filter by action type
- Filter by resource type
- Filter by date range
- Export to CSV

---

## Acceptance Criteria

### AC-1: Dashboard Home

- [ ] All key metrics displayed
- [ ] Data is accurate and current
- [ ] Charts render correctly
- [ ] Quick actions navigate correctly
- [ ] Auto-refresh works (5 min interval)

### AC-2: User Analytics

- [ ] Signup charts accurate
- [ ] Active user counts correct
- [ ] Retention cohorts calculated correctly
- [ ] Segmentation filters work
- [ ] Date range selector works

### AC-3: Content Analytics

- [ ] Generation stats accurate
- [ ] Popular content rankings correct
- [ ] Performance metrics accurate
- [ ] Breakdown charts render correctly

### AC-4: Revenue Analytics

- [ ] Subscription counts accurate
- [ ] Credit stats accurate
- [ ] Trend charts render correctly
- [ ] MRR calculation reasonable

### AC-5: System Health

- [ ] Status indicators accurate
- [ ] Job queue metrics correct
- [ ] Error counts accurate
- [ ] Refresh updates data
- [ ] Alerts on critical issues

### AC-6: Audit Log

- [ ] All actions logged
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Export to CSV works
- [ ] Admin names shown

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_dashboard_viewed` | Dashboard opened | `tab` |
| `admin_analytics_filtered` | Filter applied | `dashboard`, `filter_type` |
| `admin_analytics_exported` | Export triggered | `dashboard`, `format` |
| `admin_audit_log_viewed` | Audit log opened | - |

---

## User Stories

### ST-250: View Dashboard Overview

**As an** admin  
**I want to** see key platform metrics at a glance  
**So that** I understand the current state of the platform

**AC**: AC-1

### ST-251: Analyze User Growth

**As a** product manager  
**I want to** see user acquisition and retention metrics  
**So that** I can make product decisions

**AC**: AC-2

### ST-252: Monitor Content Generation

**As a** content admin  
**I want to** see content generation statistics  
**So that** I can identify trends and issues

**AC**: AC-3

### ST-253: Track Revenue Metrics

**As a** billing admin  
**I want to** see revenue and subscription metrics  
**So that** I can monitor business health

**AC**: AC-4

### ST-254: Monitor System Health

**As an** operations admin  
**I want to** see system health status  
**So that** I can respond to issues quickly

**AC**: AC-5

### ST-255: View Audit Logs

**As a** super admin  
**I want to** see all admin actions  
**So that** I can audit and review activity

**AC**: AC-6

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Analytics
admin.analytics.dashboard.getOverview()
admin.analytics.dashboard.getQuickStats()

admin.analytics.users.getGrowth({ period })
admin.analytics.users.getActive({ period })
admin.analytics.users.getRetention({ cohortSize })
admin.analytics.users.getSegmentation({ by })

admin.analytics.content.getGenerations({ period })
admin.analytics.content.getPopular({ category, limit })
admin.analytics.content.getPerformance({ period })

admin.analytics.revenue.getSubscriptions()
admin.analytics.revenue.getCredits({ period })
admin.analytics.revenue.getTrends({ period })

admin.analytics.system.getHealth()
admin.analytics.system.getJobMetrics()
admin.analytics.system.getErrors({ period })

admin.analytics.audit.getLogs({ filters, limit, offset })
admin.analytics.audit.export({ filters, format })
```

### Dashboard Data Aggregation

```typescript
// libs/business/src/services/admin-analytics.service.ts
export class AdminAnalyticsService {
  async getDashboardOverview() {
    const [users, subscriptions, content, jobs] = await Promise.all([
      this.getUserStats(),
      this.getSubscriptionStats(),
      this.getContentStats(),
      this.getJobStats(),
    ]);
    
    return {
      users: {
        total: users.total,
        newToday: users.newToday,
        newThisWeek: users.newThisWeek,
        active: users.dau,
      },
      subscriptions: {
        active: subscriptions.active,
        byTier: subscriptions.byTier,
      },
      content: {
        totalImages: content.totalImages,
        today: content.today,
        successRate: content.successRate,
      },
      jobs: {
        queueLength: jobs.queued,
        failed24h: jobs.failed24h,
        avgProcessingTime: jobs.avgProcessingTime,
      },
    };
  }
  
  async getUserRetention(cohortSize: 'day' | 'week' | 'month') {
    // Calculate retention cohorts
    // D1 = users who returned 1 day after signup
    // D7 = users who returned 7 days after signup
    // etc.
  }
}
```

### Charts Configuration

```typescript
// Using Recharts
const chartColors = {
  primary: '#a855f7',
  secondary: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  muted: 'rgba(255, 255, 255, 0.4)',
};

// Common chart config
const defaultChartConfig = {
  style: {
    background: 'transparent',
  },
  margin: { top: 10, right: 30, left: 0, bottom: 0 },
};
```

### UI Components

```
apps/admin/app/analytics/
├── page.tsx                    # Dashboard home
├── users/
│   └── page.tsx               # User analytics
├── content/
│   └── page.tsx               # Content analytics
├── revenue/
│   └── page.tsx               # Revenue analytics
├── system/
│   └── page.tsx               # System health
├── audit/
│   └── page.tsx               # Audit logs
├── components/
│   ├── MetricCard.tsx
│   ├── TrendChart.tsx
│   ├── PieChart.tsx
│   ├── BarChart.tsx
│   ├── RetentionTable.tsx
│   ├── HealthIndicator.tsx
│   ├── QuickActionCard.tsx
│   └── AuditLogTable.tsx
└── hooks/
    ├── useDashboard.ts
    ├── useAnalytics.ts
    └── useSystemHealth.ts
```

### System Health Check

```typescript
// libs/business/src/services/health.service.ts
export class HealthService {
  async getSystemHealth() {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkS3(),
      this.checkRunPod(),
    ]);
    
    return {
      database: this.formatCheck(checks[0]),
      redis: this.formatCheck(checks[1]),
      storage: this.formatCheck(checks[2]),
      comfyui: this.formatCheck(checks[3]),
      overall: checks.every(c => c.status === 'fulfilled' && c.value.healthy),
    };
  }
  
  private async checkDatabase() {
    const start = Date.now();
    await this.db.execute(sql`SELECT 1`);
    return { healthy: true, latencyMs: Date.now() - start };
  }
}
```

---

## Non-Goals (Phase 2+)

- Real-time streaming dashboards
- Custom report builder
- Scheduled reports (email)
- A/B test analytics
- Funnel visualization builder
- PostHog integration (using our own data)

---

## Dependencies

- EP-050: Admin Authentication
- Database access for aggregations
- Redis for job queue metrics
- Existing schemas for data

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
