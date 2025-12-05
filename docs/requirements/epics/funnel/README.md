# Funnel Epics

Conversion and payment flow features.

## Scope

These epics handle **user acquisition → conversion** before they access the MVP product.

> ⚠️ **Separate workstream** from MVP Product development.

## Epics

| Epic | Name | Priority | Metric | Status |
|------|------|----------|--------|--------|
| [EP-003](./EP-003-payment.md) | Payment & Subscription | P0 | D-Conversion | 📝 Defined |

## User Journey

```
[Landing Page] → [Funnel Steps] → [Character Preview] → [Payment] → [MVP Product]
   EP-006          (funnel)           (funnel)          EP-003       (mvp/)
```

## Key Features

- Stripe checkout integration
- Subscription plans ($29/mo starting)
- Trust signals (testimonials, guarantees)
- Payment success/failure handling
- Webhook processing

## Known Issues

- ⚠️ Bug after character creation in funnel (Nov 2025)
- Payment drop-off may reflect bug, not conversion issues

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Payment conversion | TBD | Pending bug fix analysis |
| Funnel completion | >50% | Target |

---

📄 See [MVP-SCOPE.md](../../MVP-SCOPE.md) for scope separation details.

