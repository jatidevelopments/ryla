# Funnel MVP Requirements

> Extracted requirements from funnel-adult-v3 for RYLA MVP development.

## Related Documentation

- [Funnel Architecture](./FUNNEL-ARCHITECTURE.md) - Technical architecture and patterns
- [Funnel Steps](./FUNNEL-STEPS.md) - Complete step reference
- [Funnel Analytics](./FUNNEL-ANALYTICS.md) - PostHog event tracking

---

## MVP Feature Requirements

### FR-001: Multi-Step Wizard Framework
**Priority**: P0 (Must Have)

A reusable step-based wizard framework that supports:
- [ ] Step configuration via single source of truth
- [ ] Auto-indexing of steps
- [ ] Step type classification (input, info, loader, payment, social-proof)
- [ ] Form field to step mapping
- [ ] Conditional step visibility

**Implementation Reference**: `features/funnel/config/steps.ts`

---

### FR-002: Form State Management
**Priority**: P0 (Must Have)

Persistent form state with:
- [ ] React Hook Form integration
- [ ] Zod schema validation
- [ ] Step-specific validation triggers
- [ ] Local storage persistence
- [ ] Server-side session sync (debounced)

**Implementation Reference**: `features/funnel/hooks/useFunnelForm.tsx`

---

### FR-003: Step-by-Step Validation
**Priority**: P0 (Must Have)

Validation that:
- [ ] Only validates current step's field(s)
- [ ] Clears previous step errors
- [ ] Prevents advancement on failure
- [ ] Tracks validation failures in analytics

**Key Pattern**:
```typescript
// Only validate the current step's formField
const fieldsToValidate = currentStep.formField
    ? Array.isArray(currentStep.formField)
        ? currentStep.formField
        : [currentStep.formField]
    : [];
```

---

### FR-004: Session Persistence
**Priority**: P1 (Should Have)

Session management:
- [ ] UUID session ID in localStorage
- [ ] Session creation on funnel start
- [ ] Step progress tracking
- [ ] Form data sync (2.5s debounce)
- [ ] Resume capability on return

---

### FR-005: Analytics Integration
**Priority**: P0 (Must Have)

PostHog tracking for:
- [ ] Step viewed events
- [ ] Step completed events
- [ ] Validation failures
- [ ] Option selections
- [ ] Form data updates
- [ ] Generation events
- [ ] Payment events

**Events**: See [FUNNEL-ANALYTICS.md](./FUNNEL-ANALYTICS.md)

---

### FR-006: Dynamic Option Filtering
**Priority**: P1 (Should Have)

Options that adapt based on previous selections:
- [ ] Ethnicity-based skin color filtering
- [ ] Ethnicity-based eye color filtering
- [ ] Ethnicity-based hair color/style filtering

**Implementation Reference**: `constants/ethnicity-options.ts`

---

### FR-007: Info/Social Proof Steps
**Priority**: P1 (Should Have)

Non-input steps for engagement:
- [ ] Feature demonstrations (Hyper Realistic Skin, Perfect Hands)
- [ ] Social proof (Partnership, Reviews)
- [ ] Video content previews
- [ ] No validation required

---

### FR-008: Character Generation Flow
**Priority**: P0 (Must Have)

Generation experience:
- [ ] Loading state with progress indication
- [ ] Form data submission to generation service
- [ ] Success state with character preview
- [ ] Error handling with retry

---

### FR-009: Payment Flow
**Priority**: P0 (Must Have)

Payment integration:
- [ ] Subscription plan selection
- [ ] Email capture
- [ ] Payment processor integration
- [ ] Success/failure handling
- [ ] Receipt/confirmation

---

### FR-010: Internationalization
**Priority**: P2 (Nice to Have)

Multi-language support:
- [ ] 16 language translations
- [ ] RTL support (Arabic)
- [ ] Locale-based routing
- [ ] next-intl integration

---

## Data Model Requirements

### DM-001: Funnel Session
```typescript
interface FunnelSession {
    id: string;              // UUID
    session_id: string;      // Client-generated UUID
    current_step: number;
    created_at: Date;
    updated_at: Date;
    completed_at?: Date;
    
    // User identification
    email?: string;
    
    // Form data as JSON
    options: FunnelFormData;
    
    // UTM tracking
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
}
```

### DM-002: Funnel Form Data
```typescript
interface FunnelFormData {
    // Entry
    ai_influencer_experience: string;
    use_cases: string[];
    
    // Basic Appearance
    influencer_ethnicity: string;
    influencer_age: number;
    influencer_skin_color: string;
    influencer_eye_color: string;
    influencer_hair_style: string;
    influencer_hair_color: string;
    influencer_face_shape: string;
    
    // Skin Features
    influencer_freckles: string;
    influencer_scars: string;
    influencer_beauty_marks: string;
    
    // Body
    influencer_body_type: string;
    influencer_ass_size: string;
    influencer_breast_type: string;
    influencer_outfit?: string;
    
    // Modifications
    influencer_piercings: string;
    influencer_tattoos: string;
    
    // Voice & Content
    influencer_voice: string;
    video_content_options: string[];
    enable_nsfw: boolean;
    
    // Feature flags
    enable_selfies: boolean;
    enable_viral_videos: boolean;
    enable_lipsync: boolean;
    enable_faceswap: boolean;
}
```

---

## UI/UX Requirements

### UX-001: Step Progress Indicator
- Visual progress through funnel
- Step count/total display
- Back navigation capability

### UX-002: Option Selection UI
- Image cards for visual options
- Single/multi-select support
- Selected state indication
- Disabled state for unavailable options

### UX-003: Info Step Layout
- Video/image demonstration area
- Feature headline
- Supporting copy
- Continue CTA

### UX-004: Loading States
- Character generation progress
- Form submission feedback
- Payment processing indication

### UX-005: Error Handling
- Validation error display
- Network error recovery
- Payment failure messaging

---

## Analytics Metrics (A-E)

### A - Activation
| Metric | Target | Current |
|--------|--------|---------|
| Start → Step 4 | >80% | TBD |
| Step 4 → Step 11 | >60% | TBD |

### B - Retention
| Metric | Target | Current |
|--------|--------|---------|
| Session resume rate | >20% | TBD |
| Repeat visit rate | >10% | TBD |

### C - Core Value
| Metric | Target | Current |
|--------|--------|---------|
| Generation completion | >90% | ~100% |
| Time to generation | <10min | TBD |

### D - Conversion
| Metric | Target | Current |
|--------|--------|---------|
| Generation → Payment | >20% | ~54% |
| Payment initiated → Success | >80% | TBD |

### E - Efficiency
| Metric | Target | Current |
|--------|--------|---------|
| Avg steps to conversion | <35 | 35 |
| Drop-off recovery | >5% | TBD |

---

## Implementation Phases

### Phase 1: Core Wizard (Week 1-2)
- [ ] Step configuration system
- [ ] Basic navigation
- [ ] Form state management
- [ ] Local persistence

### Phase 2: Validation & Analytics (Week 2-3)
- [ ] Zod validation
- [ ] Step-specific validation
- [ ] PostHog integration
- [ ] Error tracking

### Phase 3: Session & Payment (Week 3-4)
- [ ] Supabase session sync
- [ ] Payment integration
- [ ] Email capture
- [ ] Success flow

### Phase 4: Polish (Week 4-5)
- [ ] Loading states
- [ ] Error handling
- [ ] Mobile optimization
- [ ] A/B test setup

---

## Tech Debt & Improvements

### From Current Implementation

1. **Race Condition Handling**
   - Current: Uses refs to track step during async validation
   - Improvement: Consider using state machine (XState)

2. **Session Sync Debounce**
   - Current: 2.5s debounce
   - Consider: Optimistic updates with background sync

3. **Validation Triggers**
   - Current: Hardcoded step-to-field mapping
   - Improvement: Derive from step config

4. **Analytics Service**
   - Current: Mixpanel disabled, PostHog direct
   - Improvement: Unified analytics service layer

---

## Success Criteria

### MVP Launch
- [ ] Users can complete full funnel flow
- [ ] Form data persists across sessions
- [ ] Payment successfully processes
- [ ] Key analytics events tracked
- [ ] <3s page load time

### Post-Launch (30 days)
- [ ] >50% funnel completion rate
- [ ] >20% payment conversion
- [ ] <5% error rate
- [ ] NPS >30

