# [EPIC] EP-047: Retention Offer Before Account Deletion

## Overview

When a user attempts to delete their account, we should:
- Add a **double-confirm** safety flow (reduce accidental deletion)
- Ask a short **exit survey** ("Why are you leaving?", free-form feedback)
- Present a **retention offer** (e.g., **50% off**) before proceeding

> Note (captured from implementation): **Offer retention discount before deletion** — UX + tracking can be implemented, but **discount application is NOT implemented** until billing rules/mechanics are defined.

---

## Business Impact

**Target Metric**: B - Retention (churn reduction) / D - Conversion (retain paid subscribers)

**Hypothesis**: When we show a targeted retention offer and collect structured exit feedback at the moment of churn intent, we will reduce account deletions and improve subscription retention.

**Success Criteria** (Phase 2+):
- Account deletion completion rate decreases (for paid users) without increasing support burden
- Offer acceptance rate measured (CTR + redemption)
- Exit reasons collected with high coverage (>60% of deletion attempts)

---

## Scope

### In Scope
- 2-step delete-account confirmation modal (feedback → confirm)
- Exit survey fields stored (DB/event stream)
- Retention offer UI + tracking
- Discount redemption mechanism (once defined)

### Out of Scope
- Complex win-back campaigns (email sequences)
- Multi-variant experiments (handled under analytics/experimentation epic)

---

## Stories

### [STORY] ST-155: Prevent Accidental Account Deletion (Double Confirm)

**As a** user  
**I want to** clearly understand the impact of deleting my account and confirm twice  
**So that** I don’t delete my account by mistake

**Acceptance Criteria**
- [ ] Clicking “Delete account” opens a modal, not immediate deletion
- [ ] Final deletion requires:
  - [ ] Typing a confirmation word (e.g. `DELETE`)
  - [ ] Checking “I understand…” checkbox
  - [ ] Clicking a final “Permanently delete” action
- [ ] Closing the modal does not delete anything

---

### [STORY] ST-156: Collect Exit Feedback at Deletion Intent

**As a** user leaving the product  
**I want to** tell you why I’m leaving  
**So that** the product can improve

**Acceptance Criteria**
- [ ] Modal step 1 asks “Why are you leaving?” with structured choices
- [ ] Optional free-text fields are available (details + “what would make you come back?”)
- [ ] Data is captured in analytics and/or stored server-side
- [ ] Sensitive input is handled safely (rate limits, length limits, no PII prompts)

---

### [STORY] ST-157: Offer Retention Discount Before Deletion (Billing-Backed)

**As a** paid user trying to delete  
**I want to** see a meaningful offer before deleting  
**So that** I can stay if pricing is the issue

**Acceptance Criteria**
- [ ] Retention offer is shown before confirm step (e.g., “50% off”)
- [ ] Offer eligibility rules are defined (e.g., paid users only, tier-specific, etc.)
- [ ] Clicking “Get 50% off” triggers an actual billing-backed mechanism
- [ ] User can complete offer redemption and return to app without deleting
- [ ] **Important**: Discount application requires billing rules/mechanics:
  - [ ] Coupon/discount creation strategy
  - [ ] Duration/renewal behavior
  - [ ] Edge cases (existing discounts, cancellation pending, unpaid invoices)

---

## Analytics Events

Track at minimum:
- `account_deletion_modal_opened`
- `account_deletion_cancelled`
- `account_deletion_reason_selected`
- `account_deletion_feedback_submitted`
- `account_deletion_confirm_step_viewed`
- `account_deletion_started`
- `account_deleted`
- `retention_offer_shown`
- `retention_offer_clicked`
- `retention_offer_redeemed` (future)

---

## Dependencies

- Subscription management epic (EP-010) / billing integration (EP-003 funnel context)
- Analytics events (`@ryla/analytics`)


