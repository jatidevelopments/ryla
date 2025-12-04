# Funnel Architecture - AI Influencer Creation Flow

> Source: `/Users/admin/Documents/Projects/funnel-adult-v3`
> Last analyzed: 2025-12-04

## Overview

The AI Influencer funnel is a multi-step wizard that guides users through creating a personalized AI character. It uses a hard paywall model where users configure their influencer before payment.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| State Management | Zustand + React Hook Form |
| Validation | Zod |
| Analytics | PostHog (previously Mixpanel) |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (16 languages) |
| Database | Supabase (session persistence) |
| Payments | Finby + Shift4 |

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FUNNEL FLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  Entry   │───▶│  Config  │───▶│ Generate │───▶│ Payment  │  │
│  │  Phase   │    │  Phase   │    │  Phase   │    │  Phase   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│   Steps 0-4       Steps 5-28      Steps 29-31    Steps 32-35   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Zustand    │  │  Supabase    │  │   PostHog    │          │
│  │ (Form State) │  │  (Sessions)  │  │  (Analytics) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Step Types

| Type | Purpose | Validation | Example |
|------|---------|------------|---------|
| `info` | Display information/features | None | Hyper Realistic Skin |
| `social-proof` | Trust building | None | Partnership Proof |
| `input` | User selections | Field-specific | Choose Ethnicity |
| `loader` | Generation progress | None | Character Generation |
| `payment` | Pricing/checkout | Email | Subscription |

## Key Design Patterns

### 1. Single Source of Truth for Steps
```typescript
// features/funnel/config/steps.ts
export const FUNNEL_STEPS_CONFIG: Omit<StepInfo, "index">[] = [
    { name: "Choose Creation Method", type: "info", component: ChooseCreationMethodStep },
    // ... 35 total steps
];

export const FUNNEL_STEPS = FUNNEL_STEPS_CONFIG.map((step, index) => ({
    ...step,
    index,
}));
```

### 2. Form State Management
```typescript
// React Hook Form + Zod validation
const form = useForm<FunnelSchema>({
    resolver: zodResolver(funnelV3Schema),
    defaultValues,
    mode: "onSubmit", // Only validate on submit
});
```

### 3. Step-Specific Validation
```typescript
// Only validate the current step's field(s)
const fieldsToValidate = currentStep.formField
    ? Array.isArray(currentStep.formField)
        ? currentStep.formField
        : [currentStep.formField]
    : [];
```

### 4. Persistent Sessions
- Session ID stored in localStorage
- Form data synced to Supabase (2.5s debounce)
- Allows users to resume where they left off

## Conversion Funnel Strategy

### Phase 1: Entry & Engagement (Steps 0-4)
- Hook user with creation method choice
- Build trust with partnership proof
- Understand user experience level
- Capture use case intent

### Phase 2: Basic Configuration (Steps 5-16)
- Intersperse input steps with "info" steps
- Show quality features (skin, hands) between inputs
- Keep momentum with social proof breaks

### Phase 3: Advanced Customization (Steps 17-28)
- Body customization
- Outfit selection
- Video content options
- NSFW toggle (conditional flow)

### Phase 4: Conversion (Steps 29-35)
- Character generation (loader/anticipation)
- Access preview
- Feature summary (value recap)
- Subscription selection
- Payment capture

## Conditional Step Logic

```typescript
// NSFW flow - skip preview if disabled
if (current === LIPSYNC_STEP_INDEX && 
    form.getValues("enable_nsfw") === false) {
    previous = NSFW_CONTENT_STEP_INDEX;
}
```

## Internationalization

Supported languages (16):
- English, German, French, Spanish, Italian, Portuguese
- Dutch, Polish, Russian, Ukrainian, Turkish
- Arabic, Hindi, Japanese, Korean, Chinese

## Payment Integration

### Pricing
- **Single plan**: $29.00/month
- No trial period
- Hard paywall (pay before access)

### Flow
1. User selects subscription tier
2. Enters email
3. Payment processed via Finby/Shift4
4. Session updated with payment status
5. Access granted to character

## Session Data Model

```typescript
interface FunnelSession {
    session_id: string;
    current_step: number;
    created_at: timestamp;
    // All form fields stored as JSON
    options: Partial<FunnelSchema>;
}
```

## Performance Optimizations

1. **Debounced Persistence**: Form data saved every 2.5s
2. **Lazy Component Loading**: Steps loaded on demand
3. **Image CDN**: Character assets served from CDN
4. **Race Condition Prevention**: Step ref tracking during async validation

## Error Handling

```typescript
// PostHog error tracking
safePostHogCapture("funnel_step_error", {
    step_index: active,
    step_name: currentStepName,
    error_message: error.message,
});
```

