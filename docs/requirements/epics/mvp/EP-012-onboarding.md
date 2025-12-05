# [EPIC] EP-012: Onboarding & First-Time Experience

## Overview

Welcome experience for new users including welcome modal, product tour, and first-character guidance. Designed to activate users quickly and reduce confusion.

---

## Business Impact

**Target Metric**: A - Activation

**Hypothesis**: When new users receive guided onboarding, they complete their first character faster and have higher retention.

**Success Criteria**:
- First character creation: **>60%** within first session
- Time to first character: **<10 minutes**
- Onboarding completion: **>80%**
- D7 retention improvement: **+20%** vs no onboarding

---

## Features

### F1: Welcome Modal

Shown immediately after first login.

**Content:**
- Welcome message with user's name
- What RYLA does (1-2 sentences)
- What they can create
- CTA: "Create Your First Character"

**Design:**
- Friendly, not overwhelming
- Single action focus
- Skip option available

### F2: Product Tour (Optional)

3-5 step guided tour highlighting key areas.

**Steps:**
1. Dashboard overview
2. Create character button
3. Character gallery
4. Settings location
5. Help/support access

**Behavior:**
- Tooltip-style highlights
- Next/Skip buttons
- Progress dots
- Can be dismissed
- Can be restarted from settings

### F3: First Character Prompt

If user has 0 characters:
- Empty state with illustration
- "Create your first AI influencer"
- Benefits list (3 bullets)
- Prominent CTA button

### F4: Wizard Guidance

First-time wizard experience:
- Tooltips on first step
- "What's this?" help icons
- Example selections shown
- Encouragement messages

### F5: Success Celebration

After first character generation:
- Celebration animation (confetti/sparkle)
- "Your first character is ready!"
- Quick tips for next steps
- Share achievement (optional)

### F6: Progress Indicators

New user checklist:
- [ ] Create account ✅
- [ ] Create first character
- [ ] Generate first images
- [ ] Download images

Shown in sidebar or as floating widget.

---

## Acceptance Criteria

### AC-1: Welcome Modal

- [ ] Modal shows on first login only
- [ ] Personalized with user name/email
- [ ] Clear CTA to create character
- [ ] Can be dismissed
- [ ] Doesn't show again after dismissed

### AC-2: Product Tour

- [ ] Tour available for new users
- [ ] 3-5 steps with tooltips
- [ ] Can skip at any time
- [ ] Progress is visible
- [ ] Can restart from settings

### AC-3: Empty State

- [ ] Shown when user has 0 characters
- [ ] Compelling illustration
- [ ] Clear CTA to wizard
- [ ] Benefits are listed

### AC-4: Wizard Help

- [ ] Help icons on first wizard experience
- [ ] Tooltips explain each section
- [ ] Examples shown where helpful

### AC-5: Success Celebration

- [ ] Animation on first character creation
- [ ] Congratulations message
- [ ] Next steps suggested
- [ ] Dismissible

### AC-6: Progress Checklist

- [ ] Checklist visible for new users
- [ ] Items check off automatically
- [ ] Disappears after all complete
- [ ] Can be hidden manually

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `welcome_modal_shown` | Modal displayed | - |
| `welcome_modal_dismissed` | User closes modal | `action` (cta/skip) |
| `product_tour_started` | Tour begins | - |
| `product_tour_step` | Each step viewed | `step_number`, `step_name` |
| `product_tour_completed` | Tour finished | `steps_viewed` |
| `product_tour_skipped` | Tour skipped | `skipped_at_step` |
| `empty_state_cta_clicked` | Create character from empty | - |
| `first_character_celebration` | Success shown | `time_to_first` |
| `checklist_item_completed` | Checklist progress | `item` |
| `checklist_hidden` | User hides checklist | `items_remaining` |

---

## User Stories

### ST-060: See Welcome Message

**As a** new user  
**I want to** see a welcome message  
**So that** I feel oriented and know what to do

**AC**: AC-1

### ST-061: Take Product Tour

**As a** new user unfamiliar with the product  
**I want to** take a guided tour  
**So that** I understand how to use the features

**AC**: AC-2

### ST-062: Get Started with First Character

**As a** new user with no characters  
**I want to** see a clear prompt to create one  
**So that** I know how to get value from the product

**AC**: AC-3

### ST-063: Get Help in Wizard

**As a** user going through the wizard for the first time  
**I want to** see helpful tips  
**So that** I make good choices

**AC**: AC-4

### ST-064: Celebrate My First Character

**As a** user who just created their first character  
**I want to** feel a sense of accomplishment  
**So that** I'm motivated to continue

**AC**: AC-5

---

## UI Wireframes

### Welcome Modal

```
┌─────────────────────────────────────────────────────┐
│                                              [X]    │
│                                                      │
│              🎨 Welcome to RYLA!                     │
│                                                      │
│     Create stunning AI influencers in minutes.      │
│                                                      │
│     With RYLA, you can:                             │
│     ✓ Design unique character appearances           │
│     ✓ Generate consistent, high-quality images      │
│     ✓ Build your AI influencer brand                │
│                                                      │
│           [Create Your First Character]              │
│                                                      │
│              or skip for now                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Product Tour Tooltip

```
        ┌─────────────────────────────────┐
        │  This is your dashboard where   │
        │  all your characters live.      │
        │                                 │
        │  [Next]  [Skip tour]  ○○●○○    │
        └────────────────┬────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│  RYLA Dashboard        ★ highlighted area ★         │
├─────────────────────────────────────────────────────┤
```

### Success Celebration

```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                    🎉 🎉 🎉                          │
│                                                      │
│          Your first character is ready!             │
│                                                      │
│            [Character Preview Image]                │
│                                                      │
│     Luna is waiting for you in your dashboard.      │
│                                                      │
│     What's next?                                    │
│     • Generate more images                          │
│     • Download your content                         │
│     • Create another character                      │
│                                                      │
│              [Go to Dashboard]                       │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Progress Checklist

```
┌──────────────────────────┐
│  Getting Started         │
│  ─────────────────────── │
│  ✅ Create account       │
│  ✅ First character      │
│  ⬜ Generate images      │
│  ⬜ Download content     │
│                          │
│  [Hide checklist]        │
└──────────────────────────┘
```

---

## Technical Notes

### User State Tracking

```typescript
interface OnboardingState {
  welcome_modal_seen: boolean;
  product_tour_completed: boolean;
  first_character_created: boolean;
  first_generation_completed: boolean;
  first_download_completed: boolean;
  checklist_hidden: boolean;
}

// Store in user metadata
const updateOnboardingState = async (userId: string, updates: Partial<OnboardingState>) => {
  await supabase.auth.updateUser({
    data: { onboarding: { ...currentState, ...updates } }
  });
};
```

### Tour Library

Consider using:
- `react-joyride` - Feature-rich tour library
- `intro.js` - Lightweight alternative
- Custom implementation for full control

---

## Non-Goals (Phase 2+)

- Video tutorials in onboarding
- Personalized onboarding paths
- A/B testing different flows
- Re-engagement onboarding for churned users

---

## Dependencies

- User authentication (EP-002)
- Dashboard (EP-004)
- Character wizard (EP-001)

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Design mockups
- [ ] P4: Implementation
- [ ] P5: Testing
- [ ] P6: Launch

