# RYLA MVP Wireframe Mockups

## How to View

Open any HTML file in your browser. No server needed.

```bash
# Example: Open Version A landing page
open mockups/version-a/index.html
```

---

## 3 Versions to Compare

| Version | Concept | Best For | Trade-off |
|---------|---------|----------|-----------|
| **A** | Linear Funnel | Maximizing wizard completion | Payment before seeing full result |
| **B** | Dashboard-First | Return user experience | Higher signup friction |
| **C** | Preview-Heavy | Reducing payment anxiety | More infrastructure (preview generation) |

---

## Version A: Linear Funnel

**Flow**: Landing → Wizard (10 steps) → Generating → Paywall → Dashboard

**Key characteristics**:
- Wizard is full-screen, no distractions
- User completes all steps before seeing paywall
- Payment gate shows blurred preview
- No account needed until payment

**Files**: `version-a/` (18 files)

---

## Version B: Dashboard-First

**Flow**: Landing → Signup → Dashboard (empty) → Wizard → Generating → Dashboard

**Key characteristics**:
- Account creation first
- Dashboard is home base
- Free tier with watermarks
- Upgrade prompts throughout

**Files**: `version-b/` (11 files)

---

## Version C: Preview-Heavy

**Flow**: Landing → Wizard with live preview → Paywall with comparison → Dashboard

**Key characteristics**:
- Side-by-side preview during wizard
- Shows multiple variations before payment
- Low-res vs HD comparison on paywall
- "See before you pay" messaging

**Files**: `version-c/` (9 files)

---

## Screen Inventory

### All Versions

| Screen | Version A | Version B | Version C |
|--------|-----------|-----------|-----------|
| Landing | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ |
| Signup | - | ✓ | - |
| Forgot Password | ✓ | - | - |
| Wizard Steps | 10 | 2 (simplified) | 3 (with preview) |
| Generating | ✓ | ✓ | - |
| Paywall | ✓ | - | ✓ |
| Payment Success | ✓ | - | ✓ |
| Dashboard | ✓ | ✓ (empty + with char) | ✓ |
| Character Detail | ✓ | ✓ | - |
| Settings | ✓ | - | - |
| Pricing | - | ✓ | - |

---

## Design Principles

- **Black & white only** - No color decisions yet
- **System fonts** - No loading, maximum compatibility
- **Mobile-first** - 480px base width
- **Pure HTML/CSS** - No JavaScript frameworks
- **Clickable** - Real links between pages

---

## User Flows Documented

See `docs/architecture/USER-FLOWS.md` for:
- Primary conversion flow
- Return user flow
- Password reset flow
- Guest conversion flow
- Screen inventory with routes

---

## Decision Points

After reviewing all 3 versions, decide:

1. **Wizard approach**: Full steps (A) vs simplified (B/C)?
2. **Account timing**: Before wizard (B) or at payment (A/C)?
3. **Preview strategy**: None (A), watermarked (B), or side-by-side (C)?
4. **Free tier**: Yes (B) or no (A/C)?

---

## Next Steps

1. Review all 3 versions in browser
2. Choose approach (or hybrid)
3. Document decision in `docs/decisions/`
4. Proceed to P5 (Tech Spec)

