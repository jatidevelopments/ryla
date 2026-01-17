# MVP Product Epics

Core product features for character creation and management.

## Scope

These epics define the **MVP Product** — what users interact with after conversion.

## Epics

| Epic | Name | Priority | Metric | Status |
|------|------|----------|--------|--------|
| [EP-001](./EP-001-influencer-wizard.md) | Character Creation Wizard | P0 | A-Activation | 📝 Defined |
| [EP-002](./EP-002-authentication.md) | User Authentication & Settings | P0 | A-Activation | 📝 Defined |
| [EP-004](./EP-004-dashboard.md) | Character Management | P0 | B-Retention | 📝 Defined |
| [EP-005](./EP-005-content-studio.md) | Image Generation Engine | P0 | C-Core Value | 📝 Defined |
| [EP-007](./EP-007-emails.md) | Emails & Notifications | P1 | A-Activation | 📝 Defined |
| [EP-008](./EP-008-gallery.md) | Image Gallery & Downloads | P0 | C-Core Value | 📝 Defined |
| [EP-009](./EP-009-credits.md) | Generation Credits & Limits | P0 | D-Conversion | 📝 Defined |
| [EP-010](./EP-010-subscription.md) | Subscription Management | P0 | B-Retention | 📝 Defined |
| [EP-011](./EP-011-legal.md) | Legal & Compliance | P0 | Risk | 📝 Defined |
| [EP-012](./EP-012-onboarding.md) | Onboarding & First-Time UX | P1 | A-Activation | 📝 Defined |
| [EP-013](./EP-013-education.md) | Education Hub | P1 | B-Retention | 📝 Defined |
| [EP-015](./EP-015-image-generation-speed-benchmarking.md) | Image Generation Speed-First Flow + Benchmarking | P0 | A-Activation | 📝 Defined |
| [EP-016](./EP-016-activity-audit-log.md) | Generation Activity + Credit Audit Log | P0 | B-Retention | 📝 Defined |
| [EP-017](./EP-017-in-app-notifications.md) | In-App Notifications (Inbox + Navbar Indicator) | P1 | B-Retention | 📝 Defined |
| [EP-018](./EP-018-influencer-settings.md) | AI Influencer Settings | P1 | B-Retention | 📝 Defined |
| [EP-019](./EP-019-report-a-bug.md) | Report a Bug | P1 | B-Retention | 📝 Defined |
| [EP-020](./EP-020-template-gallery.md) | Template Gallery & Library | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-021](./EP-021-multi-piece-outfit-gallery.md) | Multi-Piece Outfit Gallery | P1 | C-Core Value | 📝 Defined |
| [EP-022](./EP-022-unified-auth-page.md) | Unified Login/Registration Page | P1 | A-Activation | 📝 Defined |
| [EP-023](./EP-023-prompt-builder-optimization.md) | Prompt Builder Optimization | P1 | C-Core Value | 📝 Defined |
| [EP-024](./EP-024-contextual-page-tutorials.md) | Contextual Page Tutorials | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-026](./EP-026-lora-training.md) | LoRA Training for Character Consistency | P1 | C-Core Value | 📝 Defined |
| [EP-027](./EP-027-hide-nsfw-for-non-pro-users.md) | Hide NSFW Toggles for Non-Pro Users (Phase 1) | P1 | D-Conversion, A-Activation | 📝 Defined |
| [EP-028](./EP-028-dna-foundation-auto-generation.md) | DNA Foundation & Auto-Generation Engine | P1 | C-Core Value | 📝 Defined |
| [EP-029](./EP-029-enhanced-prompt-builder.md) | Enhanced Prompt Builder | P1 | C-Core Value | 📝 Defined |
| [EP-030](./EP-030-dna-integration-base-images.md) | DNA Integration - Base Image Generation | P1 | C-Core Value, A-Activation | 📝 Defined |
| [EP-031](./EP-031-dna-integration-studio-profile.md) | DNA Integration - Studio & Profile Sets | P1 | C-Core Value | 📝 Defined |
| [EP-032](./EP-032-progressive-disclosure-wizard.md) | Progressive Disclosure Wizard | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-033](./EP-033-base-character-image-generation.md) | Base Character Image Generation | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-034](./EP-034-ethnicity-image-generation.md) | Ethnicity Image Generation | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-035](./EP-035-body-type-image-generation.md) | Body Type Image Generation | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-036](./EP-036-ethnicity-specific-feature-images.md) | Ethnicity-Specific Feature Images | P1 | A-Activation, C-Core Value | 📝 Defined |
| [EP-037](./EP-037-profile-picture-generation-from-detail-page.md) | Profile Picture Generation from Detail Page | P1 | B-Retention, C-Core Value | 📝 Defined |
| [EP-038](./EP-038-lora-usage-in-generation.md) | LoRA Usage in Image Generation | P1 | C-Core Value | 📝 Defined |
| [EP-039](./EP-039-comfyui-dependency-management.md) | ComfyUI Dependency Management & Versioning | P1 | E-CAC, C-Core Value | 📝 Defined |
| [EP-042](./EP-042-wizard-single-selection-layout.md) | Wizard Single Selection & Layout Optimization | P1 | A-Activation, C-Core Value | 📝 Defined |

## User Journey

```
[Auth] → [Onboarding] → [Dashboard] → [Create Character] → [Generate] → [Gallery]
EP-002     EP-012         EP-004         EP-001            EP-005       EP-008
           ↓
        [Education] ← [Subscription] ← [Credits]
           EP-013       EP-010          EP-009
```

## Key Features

- 6-step character creation wizard with identity
- NSFW toggle (72% enable)
- Consistent face generation
- Image gallery & downloads
- Character management
- Credit system with plan limits
- Subscription management
- Education hub (tutorials, guides)
- Legal compliance (ToS, Privacy, 18+ gate)
- Onboarding (welcome modal, tour)

## Success Metrics

| Metric | Target |
|--------|--------|
| Generation success | >95% |
| D7 retention | >15% |
| Characters/user | >2 |
| Time to 1st character | <10min |
| Downloads/character | >3 |

---

📄 See [MVP-SCOPE.md](../../MVP-SCOPE.md) for full scope definition.

