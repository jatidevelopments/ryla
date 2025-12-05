# MVP Product Epics

Core product features for character creation and management.

## Scope

These epics define the **MVP Product** — what users interact with after conversion.

## Epics

| Epic | Name | Priority | Metric | Status |
|------|------|----------|--------|--------|
| [EP-001](./EP-001-character-wizard.md) | Character Creation Wizard | P0 | A-Activation | 📝 Defined |
| [EP-002](./EP-002-authentication.md) | User Authentication & Settings | P0 | A-Activation | 📝 Defined |
| [EP-004](./EP-004-dashboard.md) | Character Management | P0 | B-Retention | 📝 Defined |
| [EP-005](./EP-005-generation.md) | Image Generation Engine | P0 | C-Core Value | 📝 Defined |
| [EP-007](./EP-007-emails.md) | Emails & Notifications | P1 | A-Activation | 📝 Defined |
| [EP-008](./EP-008-gallery.md) | Image Gallery & Downloads | P0 | C-Core Value | 📝 Defined |
| [EP-009](./EP-009-credits.md) | Generation Credits & Limits | P0 | D-Conversion | 📝 Defined |
| [EP-010](./EP-010-subscription.md) | Subscription Management | P0 | B-Retention | 📝 Defined |
| [EP-011](./EP-011-legal.md) | Legal & Compliance | P0 | Risk | 📝 Defined |
| [EP-012](./EP-012-onboarding.md) | Onboarding & First-Time UX | P1 | A-Activation | 📝 Defined |
| [EP-013](./EP-013-education.md) | Education Hub | P1 | B-Retention | 📝 Defined |

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

