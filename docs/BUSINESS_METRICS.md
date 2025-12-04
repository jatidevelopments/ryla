# Business Metrics & KPIs

## Overview
MVP-focused metrics for AI SaaS business validation.

---

## Core Business Metrics

### Revenue Metrics

| Metric | Definition | MVP Target |
|--------|------------|------------|
| **MRR** | Monthly Recurring Revenue | Track from day 1 |
| **ARPU** | Average Revenue Per User | Define pricing tier |
| **LTV** | Lifetime Value (ARPU × Avg Lifespan) | Estimate after 30 days |

### Acquisition Metrics

| Metric | Definition | MVP Target |
|--------|------------|------------|
| **CAC** | Customer Acquisition Cost | Track all spend |
| **Signups** | New user registrations | Weekly tracking |
| **Activation Rate** | % completing key action | > 40% |
| **Trial → Paid** | Conversion rate | > 5% |

### Retention Metrics

| Metric | Definition | MVP Target |
|--------|------------|------------|
| **D1/D7/D30** | Day 1/7/30 retention | Track trends |
| **Churn Rate** | % users leaving per month | < 10% |
| **NPS** | Net Promoter Score | > 30 |

---

## MVP Funnel

### Awareness → Acquisition
```
Metric: Visitor → Signup Rate
Target: > 10%
Track:  Landing page visits → Signups
```

### Acquisition → Activation
```
Metric: Signup → Core Action Rate
Target: > 40%
Track:  Signups → Completed [key feature]
```

### Activation → Revenue
```
Metric: Active → Paid Rate
Target: > 5%
Track:  Active users → Paying customers
```

### Revenue → Retention
```
Metric: Month 1 → Month 2 Retention
Target: > 80%
Track:  Paid M1 → Still paid M2
```

### Retention → Referral
```
Metric: Users who invite others
Target: > 10%
Track:  Referral link usage
```

---

## PostHog Events to Track

### User Lifecycle
```javascript
// Signup
posthog.capture('user_signed_up', {
  source: 'landing_page',
  plan: 'free'
});

// Activation (define your key action)
posthog.capture('user_activated', {
  first_project_created: true,
  time_to_activate_minutes: 5
});

// Conversion
posthog.capture('user_converted', {
  plan: 'pro',
  trial_days: 7
});

// Churn
posthog.capture('user_churned', {
  reason: 'cancelled',
  lifetime_days: 30
});
```

### Feature Usage
```javascript
// Feature adoption
posthog.capture('feature_used', {
  feature: 'feature_name',
  count: 1
});

// Key action completion
posthog.capture('key_action_completed', {
  action: 'action_name',
  duration_seconds: 10
});
```

### Errors & Issues
```javascript
// User-facing errors
posthog.capture('error_occurred', {
  type: 'payment_failed',
  message: 'Card declined'
});
```

---

## Smoke Test Funnel (Pre-Launch)

### Week 1: Landing Page
| Step | Metric | Target |
|------|--------|--------|
| Visit | Unique visitors | 100+ |
| Scroll | Scroll depth > 50% | > 60% |
| CTA Click | Signup button clicks | > 10% |
| Signup | Completed signup | > 5% |

### Week 2: Core Feature
| Step | Metric | Target |
|------|--------|--------|
| Login | Return visits | > 50% of signups |
| Start | Begin core action | > 70% |
| Complete | Finish core action | > 40% |
| Return | D7 retention | > 30% |

### Week 3: Conversion
| Step | Metric | Target |
|------|--------|--------|
| Trial Start | Begin paid trial | > 20% |
| Trial Active | Use during trial | > 60% |
| Convert | Paid subscription | > 10% of trials |

---

## Dashboard Setup

### Key Dashboards in PostHog

1. **Acquisition Dashboard**
   - Daily signups
   - Signup sources
   - Signup → Activation funnel

2. **Engagement Dashboard**
   - Daily active users (DAU)
   - Feature usage frequency
   - Session duration

3. **Revenue Dashboard**
   - Trial starts
   - Conversions
   - Churn events

4. **Health Dashboard**
   - Error rates
   - Page load times
   - API response times

---

## Weekly Review Template

```markdown
## Week of [DATE]

### Acquisition
- New signups: X (target: Y)
- Signup rate: X% (target: Y%)
- Top sources: [list]

### Activation
- Activation rate: X% (target: Y%)
- Time to activate: X min (target: Y min)
- Blockers identified: [list]

### Retention
- D7 retention: X% (target: Y%)
- Churned users: X
- Churn reasons: [list]

### Revenue
- New trials: X
- Conversions: X
- MRR change: +/- $X

### Learnings
- [What worked]
- [What didn't]
- [Actions for next week]
```

---

## Unit Economics (MVP Goals)

### Target Ratios
| Ratio | Formula | Target |
|-------|---------|--------|
| LTV:CAC | LTV ÷ CAC | > 3:1 |
| Payback Period | CAC ÷ ARPU | < 6 months |
| Gross Margin | (Revenue - COGS) ÷ Revenue | > 70% |

### Break-Even Analysis
```
Fixed Costs (monthly): $X
Variable Cost per User: $Y
Price per User: $Z

Break-even Users = Fixed Costs ÷ (Price - Variable Cost)
```

