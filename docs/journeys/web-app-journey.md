# Web App User Journey

**App**: `apps/web`  
**Domain**: `app.ryla.ai`  
**Purpose**: Main authenticated user experience for managing AI influencers and generating content

---

## Overview

The web app is the core application where users manage their AI influencers, generate content, and access all features after authentication.

## Key User Flows

### 1. New User Onboarding Flow

**Goal**: First-time user completes onboarding and creates first character  
**Target Time**: < 5 minutes

```
┌─────────────┐
│    LOGIN    │ ← From landing/funnel
│  /login     │
└──────┬──────┘
       │ Authenticated
       ▼
┌─────────────┐
│ ONBOARDING  │ ← First-time user
│ /onboarding │
│             │
│ Step 1: Welcome
│ Step 2: Tutorial
│ Step 3: Preferences
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│  DASHBOARD  │
│ /dashboard  │
└──────┬──────┘
       │ "Create Character"
       ▼
┌─────────────┐
│   WIZARD    │
│  /wizard    │
└─────────────┘
```

**Key Events**:
- `onboarding.started`
- `onboarding.step_completed`
- `onboarding.completed`
- `wizard.started`

---

### 2. Character Creation Flow

**Goal**: Create a new AI influencer character  
**Target Time**: < 10 minutes

```
┌─────────────┐
│  DASHBOARD  │
│ /dashboard  │
└──────┬──────┘
       │ "Create New"
       ▼
┌─────────────┐
│   WIZARD    │
│  /wizard    │
│             │
│ Step 0: Welcome
│ Step 1: Ethnicity
│ Step 2: Age
│ Step 3: Body Type
│ Step 4: Hair Style
│ Step 5: Hair Color
│ Step 6: Eye Color
│ Step 7: Outfit Style
│ Step 8: Voice (optional)
│ Step 9: Preview & Name
│ Step 10: Generate
│ Step 11-22: Additional steps
│ Step: Base Image
│ Step: Profile Pictures
└──────┬──────┘
       │ Generation starts
       ▼
┌─────────────┐
│ GENERATING  │ ← Loading state
│   (modal)   │
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│ INFLUENCER  │
│ /influencer │
│   /[id]     │
└─────────────┘
```

**Key Events**:
- `wizard.started`
- `wizard.step_completed`
- `wizard.generation_started`
- `wizard.generation_completed`
- `influencer.created`

---

### 3. Content Generation Flow (Studio)

**Goal**: Generate images for an influencer  
**Target Time**: < 2 minutes to start generation

```
┌─────────────┐
│   STUDIO    │
│  /studio    │
└──────┬──────┘
       │ Select influencer
       ▼
┌─────────────┐
│   STUDIO    │
│ (filtered)  │
│             │
│ [Select Template]
│ [Enter Prompt]
│ [Choose Settings]
│ [Generate]
└──────┬──────┘
       │ Generation starts
       ▼
┌─────────────┐
│ GENERATING  │ ← Real-time progress
│   (modal)   │
└──────┬──────┘
       │ Complete
       ▼
┌─────────────┐
│   STUDIO    │
│ (new image)  │
│             │
│ [View] [Download]
│ [Like] [Delete]
└─────────────┘
```

**Key Events**:
- `studio.viewed`
- `studio.template_selected`
- `studio.generation_started`
- `studio.generation_completed`
- `studio.image_downloaded`
- `studio.image_liked`

---

### 4. Template Gallery Flow

**Goal**: Browse and use content templates  
**Target Time**: < 1 minute to find template

```
┌─────────────┐
│  TEMPLATES  │
│ /templates   │
└──────┬──────┘
       │ Browse
       ▼
┌─────────────┐
│  TEMPLATES  │
│ (filtered)  │
│             │
│ [Category Filter]
│ [Search]
│ [Select Template]
└──────┬──────┘
       │ "Use Template"
       ▼
┌─────────────┐
│   STUDIO    │
│ (pre-filled)│
└─────────────┘
```

**Key Events**:
- `templates.viewed`
- `templates.category_selected`
- `templates.template_selected`
- `templates.template_used`

---

### 5. Influencer Management Flow

**Goal**: View and manage influencer details  
**Target Time**: < 30 seconds

```
┌─────────────┐
│  DASHBOARD  │
│ /dashboard  │
└──────┬──────┘
       │ Click influencer
       ▼
┌─────────────┐
│ INFLUENCER  │
│ /influencer │
│   /[id]     │
│             │
│ [View Images]
│ [Edit Settings]
│ [Generate More]
│ [Delete]
└─────────────┘
```

**Key Events**:
- `influencer.viewed`
- `influencer.settings_updated`
- `influencer.deleted`

---

### 6. Settings & Account Management

**Goal**: Manage account settings and subscription  
**Target Time**: < 2 minutes

```
┌─────────────┐
│  DASHBOARD  │
│ /dashboard  │
└──────┬──────┘
       │ "Settings"
       ▼
┌─────────────┐
│  SETTINGS   │
│ /settings   │
│             │
│ [Profile]
│ [Billing]
│ [Credits]
│ [Notifications]
│ [Preferences]
└─────────────┘
```

**Key Events**:
- `settings.viewed`
- `settings.profile_updated`
- `settings.billing_updated`
- `settings.credits_purchased`

---

## Screen Inventory

### Public Screens (No Auth)

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| W-P-01 | Home | `/` | Redirect to dashboard or login | `home.viewed` |
| W-P-02 | Login | `/login` | User authentication | `login.viewed` |
| W-P-03 | Register | `/register` | New user signup | `register.viewed` |
| W-P-04 | Forgot Password | `/forgot-password` | Password recovery | `forgot_password.viewed` |
| W-P-05 | Reset Password | `/reset-password` | Set new password | `reset_password.viewed` |
| W-P-06 | Auth Callback | `/auth` | OAuth callback | `auth.callback` |

### Onboarding Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| W-O-01 | Onboarding | `/onboarding` | First-time user setup | `onboarding.started` |
| W-O-02 | Onboarding Step | `/onboarding/[step]` | Onboarding step | `onboarding.step_completed` |
| W-O-03 | Onboarding Complete | `/onboarding/complete` | Onboarding success | `onboarding.completed` |

### Core App Screens (Auth Required)

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| W-C-01 | Dashboard | `/dashboard` | Main home screen | `dashboard.viewed` |
| W-C-02 | Wizard | `/wizard` | Character creation | `wizard.started` |
| W-C-03 | Wizard Step | `/wizard/step-[N]` | Wizard step | `wizard.step_viewed` |
| W-C-04 | Studio | `/studio` | Content generation | `studio.viewed` |
| W-C-05 | Templates | `/templates` | Template gallery | `templates.viewed` |
| W-C-06 | Activity | `/activity` | Generation history | `activity.viewed` |
| W-C-07 | Influencer Detail | `/influencer/[id]` | Character details | `influencer.viewed` |
| W-C-08 | Settings | `/settings` | User settings | `settings.viewed` |
| W-C-09 | Pricing | `/pricing` | Pricing plans | `pricing.viewed` |
| W-C-10 | Buy Credits | `/buy-credits` | Credit purchase | `buy_credits.viewed` |

### Payment Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| W-PY-01 | Payment Success | `/payment/success` | Payment confirmation | `payment.success` |
| W-PY-02 | Payment Cancel | `/payment/cancel` | Payment cancelled | `payment.cancelled` |
| W-PY-03 | Payment Error | `/payment/error` | Payment error | `payment.error` |

---

## Navigation Structure

### Main Navigation (Logged In)

```
[Logo] ── [Dashboard] ── [Studio] ── [Templates] ── [Activity] ──────── [Settings] [Profile]
```

### Mobile Navigation

```
[☰ Menu] ─────────────────────────────────── [Logo]

Menu:
├── Dashboard
├── Studio
├── Templates
├── Activity
├── Settings
└── Logout
```

---

## Key Touchpoints

### Activation Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| First character created | Wizard | Complete wizard | `influencer.created` | A (Activation) |
| First image generated | Studio | Generate image | `studio.generation_completed` | A (Activation) |
| First template used | Templates | Use template | `templates.template_used` | A (Activation) |

### Retention Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| Return visit | Dashboard | Login | `session.started` | B (Retention) |
| Generate content | Studio | Generate | `studio.generation_started` | B (Retention) |
| View influencer | Influencer | View | `influencer.viewed` | B (Retention) |

### Revenue Touchpoints

| Touchpoint | Screen | Action | Event | Metric |
|------------|--------|--------|-------|--------|
| View pricing | Pricing | View | `pricing.viewed` | D (Conversion) |
| Buy credits | Buy Credits | Purchase | `credits.purchased` | D (Conversion) |
| Upgrade subscription | Settings | Upgrade | `subscription.upgraded` | D (Conversion) |

---

## Error States

| Screen | Error | User Sees | Recovery |
|--------|-------|-----------|----------|
| Login | Wrong password | "Invalid credentials" | Retry, forgot password |
| Wizard | Required field | Inline error | Fill field |
| Studio | Generation failed | "Generation failed" | Retry button |
| Payment | Declined | Error message | Try again |

---

## Analytics Mapping

| Journey Stage | Business Metric | Key Event |
|---------------|-----------------|-----------|
| Activation | A | `influencer.created`, `studio.generation_completed` |
| Retention | B | `session.started`, `studio.generation_started` |
| Core Value | C | `studio.generation_completed`, `templates.template_used` |
| Conversion | D | `credits.purchased`, `subscription.upgraded` |

---

## Related Documentation

- **Architecture**: `docs/architecture/general/USER-FLOWS.md`
- **Routes**: `apps/web/lib/routes.ts`
- **Epics**: `docs/requirements/epics/mvp/`
- **Customer Journey**: `docs/journeys/CUSTOMER-JOURNEY.md`
