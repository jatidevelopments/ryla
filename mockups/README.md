# RYLA MVP Mockups

## Overview

Single clickable wireframe version with **decision callouts** for key UX choices.

**Focus**: Character creation & management (not funnel/landing - separate workstream)

---

## How to View

```bash
open /Users/admin/Documents/Projects/RYLA/mockups/mvp/index.html
```

Or open any HTML file in a browser.

---

## Screen Inventory

| Screen | File | Purpose |
|--------|------|---------|
| **Dashboard** | `index.html` | Character grid, entry point (user arrives from funnel) |
| **Dashboard (Empty)** | `empty-state.html` | First-time user experience |
| **Login** | `login.html` | Returning user login |
| **Wizard Step 1** | `wizard-1.html` | Gender + Style |
| **Wizard Step 2** | `wizard-2.html` | Ethnicity + Age |
| **Wizard Step 3** | `wizard-3.html` | Hair + Eyes |
| **Wizard Step 4** | `wizard-4.html` | Body Type |
| **Wizard Step 5** | `wizard-5.html` | Outfit + Personality |
| **Wizard Step 6** | `wizard-6.html` | Review + Generation Options |
| **Generating** | `generating.html` | Progress state |
| **Character Detail** | `character.html` | Gallery, regenerate, download |
| **Settings** | `settings.html` | Account, preferences |
| **Subscription** | `subscription.html` | Plan management, billing |
| **Education** | `education.html` | Help & guides |
| **Legal** | `legal.html` | ToS, Privacy, etc. |

---

## Decision Callouts

Yellow boxes in mockups mark decisions to make:

### Dashboard (`index.html`)
- **Layout**: Character grid vs Hero character vs Stats-driven

### Wizard Step 1 (`wizard-1.html`)
- **Option Selection UI**: Text cards vs Image previews vs Large tiles

### Wizard Step 6 (`wizard-6.html`)
- **Generation Controls Layout**: All visible vs Collapsed "Advanced" vs Sidebar
- **NSFW Toggle Placement**: Prominent vs Inside options vs In Step 1

### Character Detail (`character.html`)
- **Gallery Actions**: Select + bulk download vs Hover actions vs Lightbox

### Empty State (`empty-state.html`)
- **First-Time UX**: Welcome banner vs Auto-start wizard vs Guided tour

---

## User Flow

```
[From Funnel (paid)] 
    → Login (if returning)
    → Dashboard (empty-state if new)
    → Create Character (wizard-1 → wizard-6)
    → Generating
    → Character Detail
    → Regenerate / Download
```

---

## Data-Driven Callouts

Some mockups include data insights from funnel testing:

- **US users prefer Curvy (37%)** → Shown in body type step
- **"Date night glam" most popular (31%)** → Shown in outfit step
- **72% enable NSFW** → NSFW toggle prominent
- **Latina popular** → "Popular" badge on ethnicity

---

## MVP Product Scope (Not Funnel)

These mockups cover:
- ✅ EP-001: Character Creation Wizard (6 steps)
- ✅ EP-002: User Authentication (login)
- ✅ EP-004: Character Dashboard
- ✅ EP-005: Image Generation Engine
- ✅ EP-008: Image Gallery & Downloads
- ✅ EP-009: Generation Credits & Limits
- ✅ EP-010: Subscription Management
- ✅ EP-011: Legal & Compliance
- ✅ EP-012: Onboarding & First-Time UX
- ✅ EP-013: Education Hub

**Not included** (separate funnel workstream):
- Landing page (EP-006)
- Payment flow (EP-003)
- Funnel optimization

---

## Next Steps

1. Review mockups in browser
2. Make decisions on callouts
3. Proceed to P5 - Tech Spec
