# RYLA MVP Architecture

## Overview

This document defines the complete technical architecture for RYLA MVP, covering all 7 epics (EP-001 to EP-007).

**Architecture Principles:**
- Simple > Complex
- Mobile-first responsive
- Serverless where possible
- Type-safe end-to-end

---

## 1. Functional Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Next.js (apps/web)                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐        │   │
│  │  │ Landing │ │ Wizard  │ │Dashboard│ │ Payment │        │   │
│  │  │ EP-006  │ │ EP-001  │ │ EP-004  │ │ EP-003  │        │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘        │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js API Routes (apps/web/api)           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │ /auth/*  │ │/character│ │/checkout │ │/webhooks │    │   │
│  │  │ EP-002   │ │ EP-001   │ │ EP-003   │ │ EP-003/7 │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Business Logic (libs/business)              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │AuthSvc   │ │CharSvc   │ │PaymentSvc│ │EmailSvc  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │  ┌──────────┐                                            │   │
│  │  │GenSvc    │                                            │   │
│  │  └──────────┘                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                Data Access (libs/data)                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │UserRepo  │ │CharRepo  │ │SubsRepo  │ │ImageRepo │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Supabase │ │ Finby    │ │Replicate │ │ Resend   │           │
│  │ DB+Auth  │ │ Payments │ │ AI Gen   │ │ Email    │           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐                                                    │
│  │ PostHog  │                                                    │
│  │Analytics │                                                    │
│  └──────────┘                                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **Presentation** | `apps/web/app/*` | Routes, pages, React components |
| **API** | `apps/web/app/api/*` | HTTP endpoints, validation, auth guards |
| **Business** | `libs/business/src/services/*` | Domain logic, orchestration |
| **Data** | `libs/data/src/repositories/*` | Database queries, Supabase client |
| **Shared** | `libs/shared/src/*` | Types, constants, utilities |
| **UI** | `libs/ui/src/*` | Reusable React components |
| **Analytics** | `libs/analytics/src/*` | PostHog event capture |

---

## 2. Data Model

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│    users     │       │  characters  │       │    images    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │◄──────┤ user_id (FK) │◄──────┤character_id  │
│ email        │       │ id (PK)      │       │ id (PK)      │
│ created_at   │       │ name         │       │ storage_path │
│ updated_at   │       │ config       │       │ status       │
└──────────────┘       │ seed         │       │ created_at   │
       │               │ status       │       └──────────────┘
       │               │ created_at   │
       │               └──────────────┘
       │
       ▼
┌──────────────┐       ┌──────────────┐
│subscriptions │       │   profiles   │
├──────────────┤       ├──────────────┤
│ id (PK)      │       │ user_id (PK) │
│ user_id (FK) │       │ display_name │
│ finby_id     │       │ avatar_url   │
│ plan_id      │       │ settings     │
│ status       │       │ updated_at   │
│ ends_at      │       └──────────────┘
│ created_at   │
└──────────────┘
```

### Supabase Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS (managed by Supabase Auth)
-- ============================================
-- Note: auth.users is managed by Supabase Auth
-- We create a profiles table for additional user data

-- ============================================
-- PROFILES
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SUBSCRIPTIONS
-- ============================================
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due', 'expired');

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  finby_customer_id TEXT,
  finby_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL, -- 'free', 'creator'
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_finby ON subscriptions(finby_subscription_id);

-- ============================================
-- CHARACTERS
-- ============================================
CREATE TYPE character_status AS ENUM ('draft', 'generating', 'ready', 'failed');

CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  config JSONB NOT NULL, -- CharacterConfig object
  seed TEXT, -- For consistent generation
  status character_status DEFAULT 'draft',
  generation_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_characters_user ON characters(user_id);
CREATE INDEX idx_characters_status ON characters(status);

-- ============================================
-- IMAGES
-- ============================================
CREATE TYPE image_status AS ENUM ('pending', 'generating', 'ready', 'failed');

CREATE TABLE images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path TEXT, -- Supabase Storage path
  public_url TEXT,
  prompt TEXT,
  model TEXT,
  status image_status DEFAULT 'pending',
  generation_params JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_character ON images(character_id);
CREATE INDEX idx_images_user ON images(user_id);

-- ============================================
-- GENERATION JOBS (for queue management)
-- ============================================
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed');

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  replicate_id TEXT, -- Replicate prediction ID
  status job_status DEFAULT 'queued',
  input_params JSONB,
  output_urls TEXT[],
  error TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_status ON generation_jobs(status);
CREATE INDEX idx_jobs_character ON generation_jobs(character_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions: Users can only view their own
CREATE POLICY subscriptions_select ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Characters: Users can CRUD their own
CREATE POLICY characters_select ON characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY characters_insert ON characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY characters_update ON characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY characters_delete ON characters FOR DELETE USING (auth.uid() = user_id);

-- Images: Users can access their own
CREATE POLICY images_select ON images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY images_insert ON images FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Jobs: Users can view their own jobs
CREATE POLICY jobs_select ON generation_jobs FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run in Supabase Dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('character-images', 'character-images', true);
```

### TypeScript Types

```typescript
// libs/shared/src/types/database.ts

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Character {
  id: string;
  user_id: string;
  name: string;
  config: CharacterConfig;
  seed: string | null;
  status: 'draft' | 'generating' | 'ready' | 'failed';
  generation_error: string | null;
  created_at: string;
  updated_at: string;
}

export interface CharacterConfig {
  ethnicity: string;
  age_range: [number, number];
  body_type: string;
  hair_style: string;
  hair_color: string;
  eye_color: string;
  outfit_style: string;
  voice_id?: string;
  nsfw_enabled: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  finby_customer_id: string | null;
  finby_subscription_id: string | null;
  plan_id: 'free' | 'creator';
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  current_period_start: string | null;
  current_period_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Image {
  id: string;
  character_id: string;
  user_id: string;
  storage_path: string | null;
  public_url: string | null;
  prompt: string | null;
  model: string | null;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  generation_params: Record<string, unknown> | null;
  error_message: string | null;
  created_at: string;
}

export interface GenerationJob {
  id: string;
  character_id: string;
  user_id: string;
  replicate_id: string | null;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  input_params: Record<string, unknown> | null;
  output_urls: string[] | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}
```

---

## 3. API Contracts

### Authentication (EP-002)

```typescript
// POST /api/auth/signup
Request: { email: string; password: string }
Response: { user: User; session: Session } | { error: string }

// POST /api/auth/login
Request: { email: string; password: string }
Response: { user: User; session: Session } | { error: string }

// POST /api/auth/logout
Request: {} (cookie-based)
Response: { success: boolean }

// POST /api/auth/reset-password
Request: { email: string }
Response: { success: boolean }

// POST /api/auth/update-password
Request: { password: string } (requires valid reset token)
Response: { success: boolean }
```

### Characters (EP-001, EP-004)

```typescript
// POST /api/characters
Request: { name: string; config: CharacterConfig }
Response: { character: Character }

// GET /api/characters
Response: { characters: Character[] }

// GET /api/characters/[id]
Response: { character: Character; images: Image[] }

// PUT /api/characters/[id]
Request: { name?: string; config?: Partial<CharacterConfig> }
Response: { character: Character }

// DELETE /api/characters/[id]
Response: { success: boolean }

// POST /api/characters/[id]/generate
Request: { count?: number } // default 5
Response: { job: GenerationJob }
```

### Generation (EP-005)

```typescript
// GET /api/jobs/[id]
Response: { job: GenerationJob }

// GET /api/jobs/[id]/status
Response: { status: string; progress?: number; images?: Image[] }

// POST /api/webhooks/replicate
Request: ReplicateWebhookPayload
Response: { received: boolean }
```

### Payment (EP-003)

```typescript
// POST /api/checkout
Request: { plan_id: string }
Response: { checkout_url: string; session_id: string }

// GET /api/subscription
Response: { subscription: Subscription | null }

// POST /api/subscription/cancel
Response: { success: boolean }

// POST /api/webhooks/finby
Request: FinbyWebhookPayload
Response: { received: boolean }
```

### Emails (EP-007)

```typescript
// Internal service - no public API
// Triggered by other services

// Email types:
// - welcome (on signup)
// - password_reset (on reset request)
// - payment_receipt (on payment success)
// - download_ready (on generation complete)
```

---

## 4. Component Architecture

### Page Structure

```
apps/web/app/
├── (marketing)/
│   └── page.tsx                    # Landing (EP-006)
├── (auth)/
│   ├── login/page.tsx              # Login (EP-002)
│   ├── signup/page.tsx             # Signup (EP-002)
│   └── reset-password/page.tsx     # Reset (EP-002)
├── (app)/
│   ├── layout.tsx                  # Auth wrapper
│   ├── wizard/
│   │   └── page.tsx                # Character Wizard (EP-001)
│   ├── dashboard/
│   │   └── page.tsx                # Dashboard (EP-004)
│   ├── characters/
│   │   └── [id]/page.tsx           # Character Detail (EP-004)
│   └── settings/
│       └── page.tsx                # User Settings
├── (checkout)/
│   ├── pricing/page.tsx            # Pricing (EP-003)
│   └── payment/
│       ├── success/page.tsx        # Payment Success
│       └── cancel/page.tsx         # Payment Cancelled
└── api/
    ├── auth/[...route]/route.ts
    ├── characters/route.ts
    ├── characters/[id]/route.ts
    ├── characters/[id]/generate/route.ts
    ├── checkout/route.ts
    ├── subscription/route.ts
    └── webhooks/
        ├── finby/route.ts
        └── replicate/route.ts
```

### Shared Components (libs/ui)

```
libs/ui/src/
├── components/
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   ├── Toast/
│   ├── Spinner/
│   ├── Progress/
│   └── Avatar/
├── layouts/
│   ├── MarketingLayout/
│   ├── AppLayout/
│   └── AuthLayout/
└── hooks/
    ├── useMediaQuery.ts
    └── useDebounce.ts
```

### Feature Components

```
apps/web/components/
├── landing/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── HowItWorks.tsx
│   └── FinalCTA.tsx
├── wizard/
│   ├── WizardProvider.tsx
│   ├── WizardProgress.tsx
│   ├── WizardNavigation.tsx
│   ├── steps/
│   │   ├── EthnicityStep.tsx
│   │   ├── AgeStep.tsx
│   │   ├── BodyStep.tsx
│   │   ├── HairStep.tsx
│   │   ├── StyleStep.tsx
│   │   ├── VoiceStep.tsx
│   │   ├── PreviewStep.tsx
│   │   └── GeneratingStep.tsx
│   └── CharacterPreview.tsx
├── dashboard/
│   ├── CharacterGrid.tsx
│   ├── CharacterCard.tsx
│   ├── EmptyState.tsx
│   └── QuickActions.tsx
├── character/
│   ├── CharacterHeader.tsx
│   ├── ImageGallery.tsx
│   ├── ImageActions.tsx
│   └── RegenerateButton.tsx
├── auth/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── ResetForm.tsx
│   └── AuthGuard.tsx
└── payment/
    ├── PricingCard.tsx
    ├── PlanComparison.tsx
    ├── SubscriptionStatus.tsx
    └── PaymentSuccess.tsx
```

---

## 5. Event Schema (PostHog)

### Event Naming Convention

```
{feature}_{action}_{status?}
```

### Core Events

| Event | Category | Properties | Epic |
|-------|----------|------------|------|
| `page_viewed` | Core | `path`, `referrer`, `utm_*` | All |
| `error_occurred` | Core | `error_type`, `message`, `page` | All |

### Landing Events (EP-006)

| Event | Properties |
|-------|------------|
| `landing_viewed` | `utm_source`, `utm_medium`, `utm_campaign`, `referrer` |
| `landing_scrolled` | `scroll_depth` (25/50/75/100) |
| `landing_cta_clicked` | `cta_location` (hero/middle/bottom) |
| `landing_feature_viewed` | `feature_name` |

### Auth Events (EP-002)

| Event | Properties |
|-------|------------|
| `auth_signup_started` | `source` |
| `auth_signup_completed` | `method` (email) |
| `auth_signup_failed` | `error_type` |
| `auth_login_started` | - |
| `auth_login_completed` | `method` |
| `auth_login_failed` | `error_type` |
| `auth_logout` | - |
| `auth_password_reset_requested` | - |
| `auth_password_reset_completed` | - |
| `auth_guest_converted` | `had_progress` |

### Wizard Events (EP-001)

| Event | Properties |
|-------|------------|
| `wizard_started` | `source` |
| `wizard_step_viewed` | `step_index`, `step_name` |
| `wizard_step_completed` | `step_index`, `step_name`, `duration_ms` |
| `wizard_step_skipped` | `step_index`, `step_name` |
| `wizard_abandoned` | `last_step`, `time_spent_ms` |
| `wizard_completed` | `total_steps`, `total_duration_ms` |

### Character Events (EP-001, EP-004)

| Event | Properties |
|-------|------------|
| `character_created` | `character_id`, `config_summary` |
| `character_updated` | `character_id`, `fields_changed` |
| `character_deleted` | `character_id` |
| `character_viewed` | `character_id` |

### Generation Events (EP-005)

| Event | Properties |
|-------|------------|
| `generation_started` | `character_id`, `image_count` |
| `generation_completed` | `character_id`, `duration_ms`, `image_count` |
| `generation_failed` | `character_id`, `error_type` |
| `image_downloaded` | `image_id`, `format` |
| `image_pack_downloaded` | `character_id`, `image_count` |

### Payment Events (EP-003)

| Event | Properties |
|-------|------------|
| `pricing_viewed` | `plans_shown` |
| `plan_selected` | `plan_id`, `price` |
| `checkout_started` | `plan_id` |
| `checkout_completed` | `plan_id`, `amount`, `currency` |
| `checkout_abandoned` | `plan_id`, `step` |
| `subscription_created` | `plan_id` |
| `subscription_cancelled` | `plan_id`, `reason` |

### Email Events (EP-007)

| Event | Properties |
|-------|------------|
| `email_sent` | `type`, `recipient_id` |
| `email_delivered` | `type`, `recipient_id` |
| `email_opened` | `type`, `recipient_id` |
| `email_clicked` | `type`, `link_type` |

---

## 6. Funnel Definitions

### Primary Funnel: Landing → Paid

```
landing_viewed
  → landing_cta_clicked
    → wizard_started
      → wizard_completed
        → generation_completed
          → checkout_started
            → checkout_completed
```

**Target Conversion**: >20% (landing → paid)

### Activation Funnel: Signup → First Character

```
auth_signup_completed
  → wizard_started
    → wizard_completed
      → generation_completed
```

**Target Conversion**: >60%

### Payment Funnel

```
pricing_viewed
  → plan_selected
    → checkout_started
      → checkout_completed
```

**Target Conversion**: >50%

### Retention Funnel

```
Day 0: auth_signup_completed
Day 1: character_viewed OR generation_started
Day 7: character_viewed OR generation_started
```

**Target D7**: >15%

---

## 7. Integration Architecture

### Supabase

```typescript
// libs/data/src/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

// Client-side (browser)
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side (API routes)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Finby

```typescript
// libs/business/src/services/payment.service.ts
const FINBY_BASE_URL = 'https://api.finby.eu/v1';

export const paymentService = {
  async createCheckoutSession(userId: string, planId: string) {
    const response = await fetch(`${FINBY_BASE_URL}/checkout/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FINBY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_id: process.env.FINBY_MERCHANT_ID,
        product_id: planId === 'creator' 
          ? process.env.FINBY_PRODUCT_ID_CREATOR 
          : process.env.FINBY_PRODUCT_ID_FREE,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
        metadata: { user_id: userId },
      }),
    });
    return response.json();
  },
  
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement Finby signature verification
  },
};
```

### Replicate

```typescript
// libs/business/src/services/generation.service.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export const generationService = {
  async generateImages(character: Character, count: number = 5) {
    const predictions = await Promise.all(
      Array.from({ length: count }).map(() =>
        replicate.predictions.create({
          model: 'stability-ai/sdxl', // or chosen model
          input: {
            prompt: buildPrompt(character.config),
            seed: character.seed ? parseInt(character.seed) : undefined,
            // ... other params
          },
          webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/replicate`,
          webhook_events_filter: ['completed'],
        })
      )
    );
    return predictions;
  },
  
  buildPrompt(config: CharacterConfig): string {
    // Build consistent prompt from config
  },
};
```

### Resend

```typescript
// libs/business/src/services/email.service.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  async sendWelcome(email: string, name?: string) {
    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Welcome to RYLA',
      html: renderTemplate('welcome', { name }),
    });
  },
  
  async sendPasswordReset(email: string, resetUrl: string) {
    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Reset your RYLA password',
      html: renderTemplate('password-reset', { resetUrl }),
    });
  },
  
  async sendPaymentReceipt(email: string, data: ReceiptData) {
    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Your RYLA payment receipt',
      html: renderTemplate('receipt', data),
    });
  },
  
  async sendDownloadReady(email: string, characterName: string, downloadUrl: string) {
    return resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `Your ${characterName} images are ready!`,
      html: renderTemplate('download-ready', { characterName, downloadUrl }),
    });
  },
};
```

### PostHog

```typescript
// libs/analytics/src/capture.ts
import posthog from 'posthog-js';

export function initAnalytics() {
  if (typeof window !== 'undefined') {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // Manual control
    });
  }
}

export function capture(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties);
  }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}
```

---

## 8. Security Considerations

### Authentication

- All auth via Supabase Auth (battle-tested)
- JWT tokens in httpOnly cookies
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints

### API Security

- All mutations require authentication
- Row Level Security (RLS) on all tables
- Input validation with Zod
- Webhook signature verification

### Data Protection

- No PII in analytics events
- Passwords never logged
- API keys in environment variables only
- HTTPS everywhere

---

## 9. File Plan Summary

| Directory | Files to Create |
|-----------|-----------------|
| `libs/shared/src/types/` | `database.ts`, `api.ts`, `events.ts` |
| `libs/data/src/` | `supabase.ts`, `repositories/*.ts` |
| `libs/business/src/services/` | `auth.ts`, `character.ts`, `generation.ts`, `payment.ts`, `email.ts` |
| `libs/analytics/src/` | `capture.ts`, `identify.ts`, `events.ts` |
| `apps/web/app/` | All page routes |
| `apps/web/app/api/` | All API routes |
| `apps/web/components/` | Feature components |

---

## Next Steps

1. **P4**: UI Skeleton - Define screen layouts and component hierarchy
2. **P5**: Tech Spec - Create detailed task breakdown
3. **P6**: Implementation - Build in order: EP-002 → EP-006 → EP-001 → EP-005 → EP-003 → EP-004 → EP-007

