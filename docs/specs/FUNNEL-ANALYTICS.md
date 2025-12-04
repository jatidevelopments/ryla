# Funnel Analytics Events

> PostHog event tracking specification for the AI Influencer funnel.

## Event Summary

| Event | Trigger | Key Properties |
|-------|---------|----------------|
| `funnel_entry_started` | User starts funnel | `source`, `utm_*` |
| `funnel_step_viewed` | Step becomes visible | `step_index`, `step_name`, `step_type` |
| `funnel_step_completed` | User advances to next step | `step_index`, `form_data` |
| `funnel_step_validation_failed` | Validation error | `step_index`, `trigger_field` |
| `funnel_step_error` | Unexpected error | `step_index`, `error_message` |
| `funnel_option_selected` | User selects option | `step_name`, `option_value`, `is_selected` |
| `funnel_form_data_updated` | Form data changes | `step_index`, `form_fields`, `total_fields_filled` |
| `character_generation_started` | Generation begins | `form_data` |
| `character_generation_completed` | Generation finishes | `duration_ms` |
| `paywall_opened` | Payment screen shown | `step_index` |
| `payment_initiated` | User starts payment | `plan`, `amount` |
| `payment_email_started` | Email field focused | - |
| `payment_email_entered` | Email input | `email_domain` |
| `payment_email_blurred` | Email field blurred | `is_valid` |
| `subscription_step_viewed` | Subscription screen | `plans_shown` |
| `payment_failed` | Payment error | `error_type`, `error_message` |

---

## Core Funnel Events

### funnel_entry_started
Fired when user first lands on the funnel.

```typescript
safePostHogCapture("funnel_entry_started", {
    source: "landing" | "ad" | "referral",
    utm_source: string,
    utm_medium: string,
    utm_campaign: string,
    utm_content: string,
    referrer: string,
});
```

### funnel_step_viewed
Fired when a step becomes visible to the user.

```typescript
safePostHogCapture("funnel_step_viewed", {
    step_index: number,        // 0-35
    step_name: string,         // "Choose Ethnicity"
    step_type: string,         // "input" | "info" | "payment" | "loader" | "social-proof"
    form_data: object,         // Current form state
    total_fields_filled: number,
});
```

### funnel_step_completed
Fired when user successfully advances to the next step.

```typescript
safePostHogCapture("funnel_step_completed", {
    step_index: number,        // Step being completed
    step_name: string,
    step_type: string,
    next_step_index: number,   // Step being advanced to
    next_step_name: string,
    form_data: object,         // All filled form fields
    total_fields_filled: number,
});
```

### funnel_step_validation_failed
Fired when validation prevents step advancement.

```typescript
safePostHogCapture("funnel_step_validation_failed", {
    step_index: number,
    step_name: string,
    step_type: string,
    trigger_field: string,     // Field(s) that failed validation
});
```

### funnel_step_error
Fired on unexpected errors.

```typescript
safePostHogCapture("funnel_step_error", {
    step_index: number,
    step_name: string,
    step_type: string,
    error_message: string,
});
```

---

## Option Selection Events

### funnel_option_selected
Fired when user selects/deselects an option.

```typescript
safePostHogCapture("funnel_option_selected", {
    step_index: number,
    step_name: string,         // "Use Case", "AI Influencer Experience"
    option_type: string,       // "use_case", "experience_level", etc.
    option_value: string,      // "ai_onlyfans", "never_created", etc.
    is_selected: boolean,      // true if selected, false if deselected
    total_selected: number,    // For multi-select fields
});
```

---

## Form Data Events

### funnel_form_data_updated
Fired when form data changes (debounced).

```typescript
safePostHogCapture("funnel_form_data_updated", {
    step_index: number,
    step_name: string,
    form_fields: {
        // Only non-empty fields
        influencer_ethnicity?: string,
        influencer_age?: number,
        use_cases?: string[],
        // ... other fields
    },
    total_fields_filled: number,
});
```

---

## Character Generation Events

### character_generation_started
Fired when AI generation begins.

```typescript
safePostHogCapture("character_generation_started", {
    form_data: object,         // Complete configuration
    total_fields_filled: number,
});
```

### character_generation_completed
Fired when generation finishes successfully.

```typescript
safePostHogCapture("character_generation_completed", {
    duration_ms: number,
    success: boolean,
});
```

---

## Payment Events

### paywall_opened
Fired when subscription/payment screen is shown.

```typescript
safePostHogCapture("paywall_opened", {
    step_index: number,
    step_name: string,
    form_data: object,
});
```

### subscription_step_viewed
Fired when subscription options are displayed.

```typescript
safePostHogCapture("subscription_step_viewed", {
    plans_shown: string[],     // Plan IDs shown
    recommended_plan: string,   // Pre-selected plan
});
```

### payment_email_started
Fired when user focuses email field.

```typescript
safePostHogCapture("payment_email_started", {
    step_index: number,
});
```

### payment_email_entered
Fired when user types in email field.

```typescript
safePostHogCapture("payment_email_entered", {
    email_domain: string,      // "gmail.com" (not full email for privacy)
});
```

### payment_email_blurred
Fired when user leaves email field.

```typescript
safePostHogCapture("payment_email_blurred", {
    is_valid: boolean,
});
```

### payment_initiated
Fired when user clicks pay button.

```typescript
safePostHogCapture("payment_initiated", {
    plan_id: number,
    plan_name: string,
    amount: number,            // In cents
    currency: string,          // "USD"
});
```

### payment_failed
Fired on payment errors.

```typescript
safePostHogCapture("payment_failed", {
    error_type: string,        // "card_declined", "network_error", etc.
    error_message: string,
    plan_id: number,
});
```

---

## PostHog Funnels

### Main Conversion Funnel
```
1. funnel_entry_started
2. funnel_step_completed (step_index: 4)   // Ethnicity selected
3. funnel_step_completed (step_index: 11)  // Face completed
4. character_generation_started
5. character_generation_completed
6. paywall_opened
7. payment_initiated
```

### Drop-off Analysis Funnel
```
1. funnel_step_viewed (any step)
2. funnel_step_completed (same step)

// Compare step_index to find where users drop off
```

### Payment Conversion Funnel
```
1. subscription_step_viewed
2. payment_email_started
3. payment_email_entered
4. payment_initiated
5. payment_completed (via webhook)
```

---

## Key Metrics to Track

### Activation (A)
- Funnel start → Step 4 (Ethnicity) completion rate
- Time to first input step

### Engagement (B)
- Average steps completed per session
- Steps with highest drop-off
- Form fields filled vs available

### Core Value (C)
- Character generation completion rate
- Time from start to generation

### Conversion (D)
- Paywall → Payment initiated rate
- Email entered → Payment success rate

### Drop-off Analysis
```sql
-- HogQL: Step drop-off rates
SELECT
    step_index,
    step_name,
    COUNT(*) as started,
    countIf(next_step_index IS NOT NULL) as completed,
    completed / started as completion_rate
FROM events
WHERE event = 'funnel_step_viewed'
GROUP BY step_index, step_name
ORDER BY step_index
```

---

## Implementation Notes

### Safe PostHog Capture
```typescript
// lib/analytics/posthog-utils.ts
export function safePostHogCapture(
    eventName: string, 
    properties?: Record<string, any>
): void {
    if (isPostHogAvailable()) {
        try {
            (window as any).posthog.capture(eventName, properties);
        } catch (error) {
            console.warn('PostHog capture failed:', error);
        }
    }
}
```

### Tracking Best Practices
1. Always include `step_index` and `step_name` for step events
2. Use `safePostHogCapture` to handle SSR gracefully
3. Debounce `funnel_form_data_updated` to avoid event spam
4. Never log PII (full email, payment details) - use hashed/partial values
5. Include `form_data` in completion events for segment analysis

