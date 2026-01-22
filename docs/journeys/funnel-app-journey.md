# Funnel App User Journey

**App**: `apps/funnel`  
**Domain**: `goviral.ryla.ai`  
**Purpose**: Payment and conversion funnel - entry point for new users to create AI influencers and subscribe

---

## Overview

The funnel app is the conversion-optimized entry point where new users create their first AI influencer and complete payment. It's designed for maximum conversion with a streamlined wizard and payment flow.

## Key User Flows

### 1. New User Conversion Flow

**Goal**: Convert visitor to paying subscriber  
**Target Time**: < 10 minutes  
**Target Conversion**: >20%

```
┌─────────────┐
│   ENTRY     │ ← Ads, Social, Direct
│   / (root)  │
└──────┬──────┘
       │ Start wizard
       ▼
┌─────────────┐
│   WIZARD    │ ← Multi-step form
│   /?step=0  │
│             │
│ Step 0: Welcome
│ Step 1-22: Character creation
│ Step: Payment
│ Step: Success
└──────┬──────┘
       │ Complete wizard
       ▼
┌─────────────┐
│  GENERATING │ ← Loading state
│   (modal)   │
└──────┬──────┘
       │ Preview ready
       ▼
┌─────────────┐
│   PAYWALL   │ ← Show preview, blur
│  /?step=33  │
│             │
│ "Unlock for $29/mo"
│ [Enter Email]
│ [Pay Now]
└──────┬──────┘
       │ Finby redirect
       ▼
┌─────────────┐
│   FINBY     │ ← External payment
│  CHECKOUT   │
└──────┬──────┘
       │ Success webhook
       ▼
┌─────────────┐
│   SUCCESS   │ ← Payment confirmed
│  /?step=35  │
│             │
│ "Welcome to RYLA!"
│ [Go to Dashboard]
└─────────────┘
```

**Key Events**:
- `funnel.started`
- `funnel.step_completed`
- `funnel.generation_started`
- `funnel.paywall.viewed`
- `funnel.payment.started`
- `funnel.payment.completed`
- `funnel.converted`

---

### 2. Guest User Flow (No Account)

**Goal**: Allow users to try before creating account  
**Target Time**: < 5 minutes to preview

```
┌─────────────┐
│   WIZARD    │ ← No account required
│   /?step=0  │
└──────┬──────┘
       │ Complete wizard
       ▼
┌─────────────┐
│  GENERATING │
│   (modal)   │
└──────┬──────┘
       │ Preview ready
       ▼
┌─────────────┐
│   PAYWALL   │
│  /?step=33  │
│             │
│ "Create account to continue"
│ [Email]
│ [Password]
│ [Create & Pay]
└──────┬──────┘
       │ Account created + payment
       ▼
┌─────────────┐
│   SUCCESS   │
│  /?step=35  │
└─────────────┘
```

**Key Events**:
- `funnel.guest.started`
- `funnel.guest.paywall.viewed`
- `funnel.guest.account.created`
- `funnel.guest.converted`

---

### 3. Returning User Flow (Logged In)

**Goal**: Quick access for existing users  
**Target Time**: < 30 seconds

```
┌─────────────┐
│   ENTRY     │
│   / (root)  │
└──────┬──────┘
       │ Already logged in
       ▼
┌─────────────┐
│   WIZARD    │ ← Resume or start new
│   /?step=0  │
│             │
│ [Continue Previous]
│ [Start New]
└─────────────┘
```

**Key Events**:
- `funnel.returning.viewed`
- `funnel.returning.resumed`
- `funnel.returning.started_new`

---

## Screen Inventory

### Public Screens (No Auth Required)

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| F-P-01 | Funnel Entry | `/` | Main entry point | `funnel.entry.viewed` |
| F-P-02 | Wizard Step | `/?step=[N]` | Character creation step | `funnel.step.viewed` |
| F-P-03 | Payment Step | `/?step=33` | Subscription selection | `funnel.payment.viewed` |
| F-P-04 | Success Step | `/?step=35` | Payment success | `funnel.success.viewed` |

### Wizard Steps

The funnel uses a dynamic step system based on creation method:

**Presets Flow**: Quick character creation from templates
**AI Flow**: AI-assisted character creation
**Custom Flow**: Full custom character creation

Steps include:
- Welcome
- Creation method selection
- Character attributes (ethnicity, age, body type, etc.)
- Hair style and color
- Eye color
- Outfit style
- Voice selection
- Preview and name
- Generation
- Payment
- Success

---

## Navigation Structure

### Funnel Navigation (Minimal)

On `goviral.ryla.ai` domain:
- Navigation hidden for focus
- Step progress indicator
- Back/Next buttons

On other domains:
- Sidebar navigation available
- Step navigator visible

---

## Key Touchpoints

### Conversion Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| Funnel started | Entry | View | `funnel.started` | E (CAC) |
| Wizard completed | Wizard | Complete | `funnel.wizard.completed` | A (Activation) |
| Paywall viewed | Paywall | View | `funnel.paywall.viewed` | D (Conversion) |
| Payment started | Payment | Click pay | `funnel.payment.started` | D (Conversion) |
| Payment completed | Success | Success | `funnel.payment.completed` | D (Conversion) |

### Funnel Drop-off Points

| Step | Drop-off Risk | Mitigation |
|------|---------------|------------|
| Step 0 (Welcome) | High | Clear value prop |
| Step 5-10 (Mid-wizard) | Medium | Progress indicator, save state |
| Step 33 (Payment) | High | Social proof, urgency, preview |
| Payment redirect | High | Clear instructions, return flow |

---

## Payment Integration

### Finby Payment Flow

```
┌─────────────┐
│   PAYWALL   │
│  /?step=33  │
└──────┬──────┘
       │ "Pay Now"
       ▼
┌─────────────┐
│   FINBY     │ ← Popup-based
│  CHECKOUT   │
│             │
│ [Payment Form]
│ [Complete]
└──────┬──────┘
       │ Success/Cancel
       ▼
┌─────────────┐
│   CALLBACK  │
│  /api/webhook│
└──────┬──────┘
       │ Process
       ▼
┌─────────────┐
│   SUCCESS   │
│  /?step=35  │
└─────────────┘
```

**Payment Events**:
- `funnel.payment.popup.opened`
- `funnel.payment.completed`
- `funnel.payment.cancelled`
- `funnel.payment.failed`

---

## State Persistence

### URL-Based Navigation

- Step stored in URL: `?step=34`
- Allows direct linking and bookmarking
- Back/forward browser navigation works

### LocalStorage Backup

- Form data persisted in `funnel-storage`
- Step state saved for recovery
- Used if URL parameter missing

---

## Error States

| Screen | Error | User Sees | Recovery |
|--------|-------|-----------|----------|
| Wizard | Required field | Inline error | Fill field |
| Wizard | Validation error | Error message | Fix input |
| Generating | Timeout | "Taking longer..." | Wait or retry |
| Generating | Failed | "Generation failed" | Retry button |
| Payment | Declined | Finby error | Try again |
| Payment | Network error | Error message | Retry |

---

## Analytics Mapping

| Journey Stage | Business Metric | Key Event |
|---------------|-----------------|-----------|
| Acquisition | E (CAC) | `funnel.started` |
| Activation | A | `funnel.wizard.completed` |
| Conversion | D | `funnel.payment.completed` |

---

## Internationalization

The funnel supports multiple locales:
- Routes: `/[locale]/`
- Content translated
- Payment in local currency (where supported)

---

## Related Documentation

- **Routes**: Funnel uses URL parameters (`?step=N`)
- **Payment**: `docs/requirements/epics/funnel/EP-003-payment.md`
- **Wizard**: `docs/requirements/epics/mvp/EP-001-*.md`
- **Customer Journey**: `docs/journeys/CUSTOMER-JOURNEY.md`
