# Competitor Pricing Research Strategy

> **Created**: December 17, 2025  
> **Status**: Phase 1 - Manual Research  
> **Epic**: [EP-048](../requirements/epics/future/EP-048-competitor-pricing-intelligence.md)

---

## Overview

Systematic approach to collecting, tracking, and analyzing competitor pricing across all identified competitors in the AI influencer market. This research informs RYLA's pricing strategy and competitive positioning.

---

## Phase 1: Manual Research (Current)

**Goal**: Collect baseline pricing data for all competitors

### Research Scope

From `COMPETITORS.md`, we have **35+ competitors** across 6 categories:

1. **AI Image Generation (Adult/NSFW Focus)** - 16 competitors
2. **AI Companion/Chat Platforms** - 10 competitors  
3. **Virtual Influencer Creation** - 8 competitors
4. **OnlyFans/Content Monetization** - 5 platforms
5. **Audio Erotica & Stories** - 4 competitors
6. **Generic AI Image Tools** - 6 tools

### Pricing Data to Collect

For each competitor, document:

#### Subscription Pricing
- **Tier names** (e.g., Basic, Pro, Elite)
- **Monthly price** (USD/EUR)
- **Annual price** (if available, discount %)
- **Features per tier** (credits, features, limits)
- **Free tier** (if available, what's included)

#### Credit/Transactional Pricing
- **Credit cost per image** (if applicable)
- **Credit cost per video** (if applicable)
- **Credit packages** (bulk pricing)
- **Credit expiration** (if any)

#### One-time/Other Models
- **One-time fees** (e.g., Glambase €99)
- **Pay-per-use** pricing
- **Enterprise/custom** pricing (if mentioned)

#### Additional Pricing Factors
- **NSFW premium** (if NSFW costs more)
- **API access** pricing (if available)
- **Team/agency** pricing
- **Trial periods** (length, what's included)
- **Money-back guarantee** (if any)

### Research Sources

1. **Public Pricing Pages**
   - Visit competitor websites
   - Check `/pricing` or `/plans` pages
   - Screenshot pricing tables
   - Save direct links

2. **Sign-up Flow**
   - Create test accounts (if needed)
   - Document pricing shown during signup
   - Note any hidden fees or upsells

3. **App Stores** (if mobile apps)
   - iOS App Store pricing
   - Google Play pricing
   - In-app purchase details

4. **Third-party Sources**
   - ProductHunt pricing mentions
   - Reddit discussions
   - Review sites (G2, Capterra, etc.)

### Data Collection Template

For each competitor, create entry:

```markdown
## [Competitor Name]

**Website**: [URL]
**Category**: [Category from COMPETITORS.md]
**Threat Level**: [🔴 Critical / 🔴 High / 🟡 Medium / 🟢 Low]

### Pricing Model
- [ ] Subscription
- [ ] Credits/Transactional
- [ ] One-time
- [ ] Freemium
- [ ] Enterprise/Custom

### Subscription Tiers

| Tier | Monthly | Annual | Credits/Features | Notes |
|------|---------|--------|------------------|-------|
| Free | $0 | - | 10 images/mo | Limited features |
| Basic | $19 | $190 (16% off) | 100 images/mo | - |
| Pro | $49 | $490 (16% off) | 500 images/mo | NSFW unlocked |
| Elite | $99 | $990 (16% off) | Unlimited | API access |

### Credit Pricing (if applicable)
- Image generation: $0.10/image
- Video generation: $0.50/video
- Bulk packages: 1000 credits = $80 (20% discount)

### Additional Pricing
- NSFW premium: +$10/mo on Basic/Pro
- API access: $199/mo (Elite tier only)
- Team pricing: Contact sales

### Trial & Guarantees
- Free trial: 7 days (credit card required)
- Money-back: 30-day guarantee

### Research Links
- Pricing page: [URL]
- Signup flow: [URL]
- Terms: [URL]
- Last verified: [Date]

### Notes
- [Any special pricing, discounts, or observations]
```

### Priority Order

Research in this order (by threat level):

1. **🔴 Critical Competitors** (8)
   - MakeInfluencer
   - The Influencer AI
   - Influencer Studio
   - CreatorCore AI
   - ZenCreator
   - Foxy.ai
   - Higgsfield
   - Fanvue AI

2. **🔴 High Threat** (10)
   - MySnapFace
   - SoulGen
   - Candy.ai
   - dFans AI
   - VirtualGF
   - DreamGF.ai
   - Sugarlab.AI
   - Clonify
   - AIfluencers.io
   - CreatorGen

3. **🟡 Medium Threat** (15+)
   - Remaining competitors

4. **🟢 Low Threat** (5+)
   - Generic tools, reference only

---

## Phase 2: Automated Scraping (Future - EP-048)

**Goal**: Automate pricing collection and keep data fresh

### Technical Approach

1. **Web Scraping**
   - Scrape pricing pages weekly
   - Detect pricing changes
   - Alert on significant changes

2. **API Monitoring** (if competitors have public APIs)
   - Monitor pricing endpoints
   - Track feature changes

3. **Data Storage**
   - Store in database (Supabase)
   - Version history (track changes over time)
   - Admin panel for manual review

4. **Admin Dashboard**
   - View all competitor pricing
   - Compare pricing side-by-side
   - Historical pricing charts
   - Export to CSV/PDF

### Implementation Details

See [EP-048](../requirements/epics/future/EP-048-competitor-pricing-intelligence.md) for full technical specification.

---

## Phase 3: Analysis & Insights (Future)

**Goal**: Turn data into actionable insights

### Analysis Outputs

1. **Pricing Benchmarks**
   - Average price per tier
   - Price ranges by category
   - NSFW premium analysis

2. **Feature-Price Mapping**
   - What features justify higher prices?
   - Feature gaps vs. competitors
   - Value proposition analysis

3. **Market Trends**
   - Pricing changes over time
   - New pricing models emerging
   - Discount/promotion patterns

4. **RYLA Positioning**
   - Where should RYLA price?
   - Competitive advantages to highlight
   - Pricing strategy recommendations

---

## Data Storage

### Phase 1: Manual Research

**Location**: `docs/research/COMPETITOR-PRICING-DATA.md`

- One file with all pricing data
- Easy to read and update manually
- Version controlled in Git

### Phase 2: Automated System

**Location**: Database + Admin Panel

- Structured data in Supabase
- Admin panel for viewing/editing
- API for programmatic access
- Historical tracking

---

## Research Checklist

### Phase 1 Tasks

- [ ] Create pricing data template
- [ ] Research 🔴 Critical competitors (8)
- [ ] Research 🔴 High threat competitors (10)
- [ ] Research 🟡 Medium threat competitors (15+)
- [ ] Document pricing models
- [ ] Identify pricing patterns
- [ ] Create summary analysis
- [ ] Share findings with team

### Phase 2 Tasks (Future)

- [ ] Design database schema
- [ ] Build scraping infrastructure
- [ ] Create admin dashboard
- [ ] Set up monitoring/alerts
- [ ] Document automation process

---

## Success Metrics

### Phase 1
- **Coverage**: 100% of 🔴 Critical + 🔴 High competitors
- **Accuracy**: All pricing verified from source
- **Completeness**: All pricing models documented
- **Timeline**: Complete within 1 week

### Phase 2
- **Automation**: 80%+ of pricing updates automated
- **Freshness**: Data updated weekly
- **Accuracy**: 95%+ automated data accuracy
- **Coverage**: All competitors tracked

---

## Next Steps

1. **Start Phase 1**: Begin manual research on 🔴 Critical competitors
2. **Create EP-048**: Define automated system requirements
3. **Build Phase 2**: Implement scraping + admin panel
4. **Analyze**: Generate insights for pricing strategy

---

## Related Documents

- [COMPETITORS.md](./COMPETITORS.md) - Full competitor list
- [COMPETITORS-FULL-ANALYSIS.md](./COMPETITORS-FULL-ANALYSIS.md) - Detailed analysis
- [EP-048](../requirements/epics/future/EP-048-competitor-pricing-intelligence.md) - Automated system epic

---

_Last Updated: December 17, 2025_

