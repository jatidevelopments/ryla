# Business Metrics Framework

## The 5 Core Metrics (A-E)

Every epic/feature must move one of these:

| ID | Metric | Definition | How to Measure |
|----|--------|------------|----------------|
| **A** | Activation | Signup → first core action | Funnel: signup → core_action_completed |
| **B** | Retention | E7/E30 engagement signal | % users returning day 7/30 |
| **C** | Core Value | North Star usage metric | runs, outputs, workflows completed |
| **D** | Conversion | First paying users / WTP | Trial → paid, survey scores |
| **E** | CAC Proxy | Effort/cost to acquire + activate | Time/spend per activated user |

---

## Feature Validation

Before building, answer:

1. **Which metric does it move?** (A/B/C/D/E)
2. **How will we measure it?** (PostHog event/funnel)
3. **What behaviour change do we expect?** (hypothesis)

**If it doesn't move a metric → it's not MVP.**

---

## Prioritization Order

```
Activation → Retention → Core Value → Conversion
```

1. Can users activate? If not, fix A first
2. Do they return? If not, fix B
3. Are they getting value? If not, fix C
4. Will they pay? Then optimize D
5. CAC optimization comes after product-market fit

---

## Epic Template Addition

```markdown
## Business Impact

**Target Metric**: [ ] A-Activation [ ] B-Retention [ ] C-Core Value [ ] D-Conversion [ ] E-CAC

**Hypothesis**: When we [change], users will [behavior], measured by [metric] improving by [X%]

**Measurement**:
- Event: `feature.action`
- Funnel: [funnel name]
- Success: [target number]
```

---

## Analytics Events per Metric

### A - Activation
```
user_signed_up
user_activated (first core action)
onboarding_completed
```

### B - Retention
```
session_started
feature_used (with date tracking)
user_returned_d7
user_returned_d30
```

### C - Core Value
```
core_action_started
core_action_completed
output_generated
workflow_run
```

### D - Conversion
```
paywall_viewed
trial_started
subscription_created
payment_completed
```

### E - CAC
```
signup_source
referral_used
marketing_attributed
```

