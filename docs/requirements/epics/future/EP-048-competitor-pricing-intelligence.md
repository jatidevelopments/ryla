# [EPIC] EP-048: Competitor Pricing Intelligence System

**Status**: Proposed
**Phase**: P2
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Automated system to collect, track, and analyze competitor pricing data. Enables RYLA to monitor market pricing trends, maintain competitive positioning, and make data-driven pricing decisions.

> **Phase**: Phase 2+  
> **Priority**: P2 (Business Intelligence)  
> **Depends on**: Phase 1 manual research (COMPETITOR-PRICING-DATA.md)

---

## Business Impact

**Target Metric**: E - CAC (Competitive Intelligence)

**Hypothesis**: When we have real-time visibility into competitor pricing, we can optimize our pricing strategy, identify market opportunities, and respond quickly to competitive threats.

**Success Criteria**:
- Pricing data freshness: **<7 days** (weekly updates)
- Coverage: **100%** of 🔴 Critical + 🔴 High competitors tracked
- Automation rate: **80%+** of pricing updates automated
- Data accuracy: **95%+** automated data accuracy
- Admin usage: **Weekly** pricing reviews by team

---

## Problem Statement

### Current State (Phase 1)

- Manual research required for each competitor
- Pricing data stored in markdown files
- No automated tracking of pricing changes
- Time-consuming to keep data fresh
- No historical pricing trends
- Difficult to compare pricing side-by-side

### Desired State (Phase 2)

- Automated weekly pricing collection
- Database storage with version history
- Admin dashboard for viewing/editing
- Alerts on significant pricing changes
- Historical pricing charts
- Side-by-side pricing comparisons
- Export capabilities (CSV/PDF)

---

## Features

### F1: Competitor Database Schema

**Data Model**:

```typescript
// Competitor
{
  id: string
  name: string
  website: string
  category: string
  threat_level: 'critical' | 'high' | 'medium' | 'low'
  pricing_model: 'subscription' | 'credits' | 'one-time' | 'freemium' | 'enterprise'
  created_at: timestamp
  updated_at: timestamp
}

// Pricing Tier
{
  id: string
  competitor_id: string
  tier_name: string
  monthly_price: number | null
  annual_price: number | null
  currency: 'USD' | 'EUR' | 'GBP'
  credits_per_month: number | null
  features: string[]
  nsfw_enabled: boolean
  api_access: boolean
  created_at: timestamp
  updated_at: timestamp
}

// Pricing History (for tracking changes)
{
  id: string
  competitor_id: string
  tier_id: string | null
  field_name: string // 'monthly_price', 'annual_price', etc.
  old_value: any
  new_value: any
  detected_at: timestamp
  source: 'scraper' | 'manual'
}

// Credit Pricing (if applicable)
{
  id: string
  competitor_id: string
  credit_type: 'image' | 'video' | 'generic'
  price_per_credit: number
  bulk_discounts: { quantity: number, price: number }[]
  created_at: timestamp
  updated_at: timestamp
}

// Research Link
{
  id: string
  competitor_id: string
  link_type: 'pricing_page' | 'signup' | 'terms' | 'app_store'
  url: string
  last_verified: timestamp
}
```

**Database**: Supabase (Postgres)

---

### F2: Web Scraping Infrastructure

**Approach**: Automated scraping of competitor pricing pages

**Technical Stack**:
- **Scraper**: Playwright (headless browser)
- **Scheduling**: Cron job (weekly runs)
- **Storage**: Supabase database
- **Error Handling**: Manual review queue for failures

**Scraping Strategy**:

1. **Pricing Page Detection**
   - Common paths: `/pricing`, `/plans`, `/prices`, `/subscription`
   - Fallback: Search for pricing keywords in HTML

2. **Data Extraction**
   - Extract tier names, prices, features
   - Handle multiple currencies
   - Detect credit-based pricing
   - Capture trial periods, guarantees

3. **Change Detection**
   - Compare new data vs. existing data
   - Flag significant changes (>10% price change)
   - Create pricing history entries

4. **Manual Review Queue**
   - Failed scrapes → manual review
   - Ambiguous data → manual verification
   - New competitors → manual setup

**Scraping Targets** (Priority Order):

1. 🔴 Critical (8 competitors) - Weekly
2. 🔴 High (10 competitors) - Weekly
3. 🟡 Medium (15+ competitors) - Bi-weekly
4. 🟢 Low (5+ competitors) - Monthly

**Rate Limiting**:
- Respect robots.txt
- Delay between requests (2-5 seconds)
- User-agent rotation
- IP rotation (if needed)

---

### F3: Admin Dashboard

**Location**: `apps/admin` (existing admin app)

**Features**:

1. **Competitor List View**
   - Table of all competitors
   - Filter by threat level, category
   - Sort by last updated
   - Status indicators (✅ Automated, ⚠️ Manual, ❌ Failed)

2. **Competitor Detail View**
   - Full pricing information
   - Pricing tiers table
   - Credit pricing (if applicable)
   - Research links
   - Pricing history timeline
   - Manual edit capabilities

3. **Pricing Comparison View**
   - Side-by-side comparison
   - Select multiple competitors
   - Compare by tier (Basic vs Basic, Pro vs Pro)
   - Feature comparison matrix

4. **Historical Pricing Charts**
   - Price trends over time
   - Tier-by-tier comparison
   - Market average trends
   - Price change alerts

5. **Alerts & Notifications**
   - Significant price changes (>10%)
   - New competitors detected
   - Scraping failures
   - Data quality issues

6. **Export Capabilities**
   - Export to CSV
   - Export to PDF (formatted report)
   - Export pricing comparison

**UI Components**:
- Use existing `@ryla/ui` components
- Tables, charts, filters
- Responsive design (mobile-friendly)

---

### F4: Manual Data Entry

**For cases where scraping fails or is not possible**:

1. **Manual Entry Form**
   - Competitor selection
   - Tier creation/editing
   - Price input (with currency)
   - Feature checklist
   - Research link management

2. **Data Validation**
   - Required fields
   - Price format validation
   - Currency consistency
   - Duplicate detection

3. **Verification Workflow**
   - Mark data as "verified"
   - Add verification notes
   - Link to source (screenshot, URL)

---

### F5: API Access (Optional - Phase 3)

**For programmatic access to pricing data**:

```typescript
// GET /api/competitors/pricing
// Returns current pricing for all competitors

// GET /api/competitors/:id/pricing
// Returns pricing for specific competitor

// GET /api/competitors/:id/history
// Returns pricing history for competitor
```

**Use Cases**:
- Internal dashboards
- Pricing strategy analysis
- Automated reports

---

## Technical Architecture

### Components

```
apps/admin/
  pages/
    competitors/
      index.tsx          # Competitor list
      [id].tsx           # Competitor detail
      compare.tsx         # Pricing comparison
      history.tsx         # Historical charts
  components/
    CompetitorTable.tsx
    PricingTierCard.tsx
    PricingHistoryChart.tsx
    ComparisonMatrix.tsx

libs/business/
  services/
    competitor-pricing.service.ts    # Business logic
  models/
    competitor.model.ts
    pricing-tier.model.ts

libs/data/
  repositories/
    competitor.repository.ts         # Database access
    pricing-history.repository.ts

scripts/
  competitor-pricing/
    scrape-pricing.ts                # Scraping script
    detect-changes.ts                # Change detection
    send-alerts.ts                   # Alert notifications
```

### Data Flow

```
1. Weekly Cron Job
   ↓
2. Scrape Competitor Pricing Pages (Playwright)
   ↓
3. Extract Pricing Data
   ↓
4. Compare with Existing Data
   ↓
5. Store in Database (Supabase)
   ↓
6. Create History Entries (if changes detected)
   ↓
7. Send Alerts (if significant changes)
   ↓
8. Admin Dashboard (view/edit data)
```

---

## Implementation Phases

### Phase 2.1: Database & Manual Entry (Week 1-2)

- [ ] Design database schema
- [ ] Create Supabase tables
- [ ] Build admin dashboard (list view)
- [ ] Build manual entry form
- [ ] Migrate Phase 1 data to database

### Phase 2.2: Scraping Infrastructure (Week 3-4)

- [ ] Set up Playwright scraper
- [ ] Implement pricing page detection
- [ ] Build data extraction logic
- [ ] Create change detection system
- [ ] Set up cron job scheduling

### Phase 2.3: Admin Dashboard Features (Week 5-6)

- [ ] Competitor detail view
- [ ] Pricing comparison view
- [ ] Historical charts
- [ ] Alerts & notifications
- [ ] Export capabilities

### Phase 2.4: Testing & Refinement (Week 7-8)

- [ ] Test scraping on all competitors
- [ ] Verify data accuracy
- [ ] Handle edge cases
- [ ] Performance optimization
- [ ] Documentation

---

## Acceptance Criteria

### AC1: Database Schema
- ✅ All competitor data stored in Supabase
- ✅ Pricing tiers with version history
- ✅ Research links tracked
- ✅ Change history maintained

### AC2: Scraping Infrastructure
- ✅ Weekly automated scraping runs
- ✅ 80%+ success rate on pricing page detection
- ✅ Change detection works correctly
- ✅ Failed scrapes go to manual review queue

### AC3: Admin Dashboard
- ✅ View all competitors and pricing
- ✅ Edit pricing manually
- ✅ Compare pricing side-by-side
- ✅ View historical pricing trends
- ✅ Export data to CSV/PDF

### AC4: Data Quality
- ✅ 95%+ automated data accuracy
- ✅ All 🔴 Critical + 🔴 High competitors tracked
- ✅ Pricing changes detected within 7 days
- ✅ Manual verification workflow in place

### AC5: Alerts & Notifications
- ✅ Significant price changes trigger alerts
- ✅ Scraping failures notify admins
- ✅ New competitors detected automatically

---

## Future Enhancements (Phase 3+)

1. **AI-Powered Pricing Analysis**
   - Predict competitor pricing changes
   - Market trend analysis
   - Pricing recommendation engine

2. **Competitive Intelligence Reports**
   - Automated weekly reports
   - Market positioning analysis
   - Feature gap analysis

3. **Integration with Pricing Strategy**
   - Link to RYLA pricing decisions
   - A/B test pricing recommendations
   - ROI analysis of pricing changes

4. **Mobile App Support**
   - Monitor competitor mobile app pricing
   - In-app purchase tracking

5. **Social Media Monitoring**
   - Track competitor pricing announcements
   - Monitor discount/promotion campaigns

---

## Dependencies

- **Phase 1 Complete**: Manual research data available
- **Admin App**: Existing admin dashboard (`apps/admin`)
- **Supabase**: Database access
- **Playwright**: Web scraping capability
- **Cron Jobs**: Scheduling infrastructure (Vercel Cron or similar)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Competitors block scraping | High | Manual entry fallback, rate limiting, user-agent rotation |
| Pricing pages change structure | Medium | Flexible selectors, manual review queue, regular updates |
| Data accuracy issues | High | Manual verification workflow, confidence scores |
| Legal/ToS concerns | Medium | Respect robots.txt, rate limiting, public data only |
| Maintenance overhead | Medium | Automated monitoring, clear error handling |

---

## Success Metrics

- **Coverage**: 100% of 🔴 Critical + 🔴 High competitors
- **Freshness**: Data updated within 7 days
- **Automation**: 80%+ of updates automated
- **Accuracy**: 95%+ automated data accuracy
- **Usage**: Weekly admin dashboard usage
- **Value**: Pricing decisions informed by data

---

## Related Documents

- [COMPETITOR-PRICING-STRATEGY.md](../../research/COMPETITOR-PRICING-STRATEGY.md) - Research strategy
- [COMPETITOR-PRICING-DATA.md](../../research/COMPETITOR-PRICING-DATA.md) - Phase 1 manual data
- [COMPETITORS.md](../../research/COMPETITORS.md) - Full competitor list
- [COMPETITORS-FULL-ANALYSIS.md](../../research/COMPETITORS-FULL-ANALYSIS.md) - Detailed analysis

---

_This epic enables data-driven pricing strategy and competitive intelligence for RYLA._

