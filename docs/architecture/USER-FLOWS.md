# RYLA MVP User Flows

## Overview

This document maps all user flows, navigation paths, and screen transitions for the MVP.

---

## 1. Primary Flow: New User → Paid Subscriber

**Goal**: Convert visitor to paying customer
**Target Time**: <10 minutes
**Target Conversion**: >20%

```
┌─────────────┐
│   LANDING   │ ← Ads, Social, Direct
│   (EP-006)  │
└──────┬──────┘
       │ CTA: "Start Creating"
       ▼
┌─────────────┐
│   WIZARD    │ ← 8-10 steps
│   (EP-001)  │
│             │
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
└──────┬──────┘
       │ Generation starts
       ▼
┌─────────────┐
│ GENERATING  │ ← Loading state (30-60s)
│   (EP-005)  │
└──────┬──────┘
       │ Preview ready
       ▼
┌─────────────┐
│   PAYWALL   │ ← Show preview, blur/lock
│   (EP-003)  │
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
│  DASHBOARD  │ ← Character ready
│   (EP-004)  │
│             │
│ Download images
│ Create more
└─────────────┘
```

---

## 2. Return User Flow: Login → Dashboard

**Goal**: Access existing characters
**Target Time**: <30 seconds

```
┌─────────────┐
│   LANDING   │
└──────┬──────┘
       │ "Login" link
       ▼
┌─────────────┐
│    LOGIN    │
│   (EP-002)  │
│             │
│ [Email]
│ [Password]
│ [Login]
│ "Forgot password?"
└──────┬──────┘
       │ Success
       ▼
┌─────────────┐
│  DASHBOARD  │
│   (EP-004)  │
│             │
│ Character grid
│ [Create New] → Wizard
│ [Character] → Detail
└─────────────┘
```

---

## 3. Character Management Flow

**Goal**: View, regenerate, download

```
┌─────────────┐
│  DASHBOARD  │
└──────┬──────┘
       │ Click character
       ▼
┌─────────────┐
│  CHARACTER  │
│   DETAIL    │
│   (EP-004)  │
│             │
│ Image gallery
│ [Download All]
│ [Download Single]
│ [Regenerate]
│ [Delete]
└──────┬──────┘
       │
       ├─── [Regenerate] → Generating → Updated Gallery
       │
       └─── [Delete] → Confirm → Dashboard
```

---

## 4. Password Reset Flow

```
┌─────────────┐
│    LOGIN    │
└──────┬──────┘
       │ "Forgot password?"
       ▼
┌─────────────┐
│   FORGOT    │
│  PASSWORD   │
│   (EP-002)  │
│             │
│ [Email]
│ [Send Reset Link]
└──────┬──────┘
       │ Email sent
       ▼
┌─────────────┐
│   CHECK     │
│   EMAIL     │
│  (message)  │
└──────┬──────┘
       │ Click email link
       ▼
┌─────────────┐
│   RESET     │
│  PASSWORD   │
│             │
│ [New Password]
│ [Confirm]
│ [Reset]
└──────┬──────┘
       │ Success
       ▼
┌─────────────┐
│    LOGIN    │
│ (with msg)  │
└─────────────┘
```

---

## 5. Guest Conversion Flow

**Goal**: Convert wizard user without account

```
┌─────────────┐
│   WIZARD    │ ← No account
│  (as guest) │
└──────┬──────┘
       │ Completes wizard
       ▼
┌─────────────┐
│   PAYWALL   │
│             │
│ "Create account to continue"
│ [Email]
│ [Password]
│ [Create & Pay]
└──────┬──────┘
       │ Account created + payment
       ▼
┌─────────────┐
│  DASHBOARD  │
│ (logged in) │
└─────────────┘
```

---

## Screen Inventory (MVP)

| ID | Screen | Route | Auth Required | Epic |
|----|--------|-------|---------------|------|
| L1 | Landing | `/` | No | EP-006 |
| W1 | Wizard | `/create` | No (guest OK) | EP-001 |
| W2 | Generating | `/create/generating` | No | EP-005 |
| P1 | Paywall | `/create/unlock` | No | EP-003 |
| P2 | Payment Success | `/payment/success` | Yes | EP-003 |
| A1 | Signup | `/signup` | No | EP-002 |
| A2 | Login | `/login` | No | EP-002 |
| A3 | Forgot Password | `/forgot-password` | No | EP-002 |
| A4 | Reset Password | `/reset-password` | No | EP-002 |
| D1 | Dashboard | `/dashboard` | Yes | EP-004 |
| D2 | Character Detail | `/characters/[id]` | Yes | EP-004 |
| S1 | Settings | `/settings` | Yes | - |

**Total: 12 screens**

---

## Navigation Structure

### Header (Marketing Pages)
```
[Logo] ────────────────────────── [Login] [Start Creating]
```

### Header (App Pages - Logged In)
```
[Logo] ── [Dashboard] ── [Create New] ──────── [Settings] [Logout]
```

### Mobile Navigation
```
[☰ Menu] ─────────────────────────────────── [Logo]

Menu opens:
├── Dashboard
├── Create New
├── Settings
└── Logout
```

---

## Wizard Steps (Derived from Ghost Funnel)

| Step | Name | Options | Required |
|------|------|---------|----------|
| 1 | Ethnicity | 6 options | Yes |
| 2 | Age Range | Slider 18-65 | Yes |
| 3 | Body Type | 4 options | Yes |
| 4 | Hair Style | 8 options | Yes |
| 5 | Hair Color | 10 options | Yes |
| 6 | Eye Color | 6 options | Yes |
| 7 | Outfit Style | 6 options | Yes |
| 8 | Voice | 5 options | No |
| 9 | Name & Preview | Text + summary | Yes |
| 10 | Generate | Button | Yes |

---

## State Transitions

### Wizard States
```
draft → generating → ready → (regenerating) → ready
                  ↘ failed → (retry) → generating
```

### Subscription States
```
none → active → (cancelled) → expired
           ↘ past_due → (paid) → active
                     ↘ expired
```

---

## Error States

| Screen | Error | User Sees | Recovery |
|--------|-------|-----------|----------|
| Login | Wrong password | "Invalid credentials" | Retry, forgot password |
| Login | No account | "No account found" | Signup link |
| Wizard | Required field | Inline error | Fill field |
| Generating | Timeout | "Taking longer..." | Wait or retry |
| Generating | Failed | "Generation failed" | Retry button |
| Payment | Declined | Finby error page | Try again |

---

## 3 Wireframe Versions

### Version A: Linear Funnel
- Wizard is the hero experience
- No distractions, full focus
- Payment before seeing full result
- Best for: Maximizing wizard completion

### Version B: Dashboard-First  
- Signup required before wizard
- Dashboard as home base
- Shows what you'll get (empty state)
- Best for: Return user experience

### Version C: Preview-Heavy
- Live preview during wizard
- Teaser images before paywall
- More "try before buy"
- Best for: Reducing payment anxiety

---

## Interaction → Event Mapping

| Interaction | Event | Properties |
|-------------|-------|------------|
| Land on page | `page_viewed` | `path`, `referrer` |
| Click CTA | `cta_clicked` | `location`, `text` |
| Start wizard | `wizard_started` | `source` |
| Complete step | `wizard_step_completed` | `step`, `duration` |
| Skip step | `wizard_step_skipped` | `step` |
| Abandon wizard | `wizard_abandoned` | `last_step` |
| View paywall | `paywall_viewed` | - |
| Click pay | `checkout_started` | `plan_id` |
| Payment success | `checkout_completed` | `amount` |
| Login | `auth_login_completed` | - |
| Signup | `auth_signup_completed` | - |
| Download image | `image_downloaded` | `character_id` |

