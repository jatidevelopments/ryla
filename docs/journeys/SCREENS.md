# Screen Inventory

## Overview

This document provides a high-level overview of screens across all RYLA apps. For detailed app-specific screen inventories and user journeys, see the app-specific journey documentation.

---

## App-Specific Screen Documentation

| App | Documentation | Domain |
|-----|---------------|--------|
| **Web App** | [`web-app-journey.md`](./web-app-journey.md) | `app.ryla.ai` |
| **Admin App** | [`admin-app-journey.md`](./admin-app-journey.md) | Admin dashboard |
| **Funnel App** | [`funnel-app-journey.md`](./funnel-app-journey.md) | `goviral.ryla.ai` |
| **Landing App** | [`landing-app-journey.md`](./landing-app-journey.md) | `www.ryla.ai` |

---

## Screen Categories

| Category | Description | Apps |
|----------|-------------|------|
| Public | Accessible without auth | Landing, Funnel, Web (partial) |
| Auth | Authentication flows | Web, Admin |
| Onboarding | First-time user experience | Web |
| Core | Main application features | Web, Admin |
| Settings | User configuration | Web, Admin |
| Admin | Administrative functions | Admin only |
| Funnel | Conversion and payment | Funnel only |
| Marketing | Marketing and SEO | Landing only |

---

## Quick Reference by App

### Web App (`app.ryla.ai`)

**Key Screens**: Dashboard, Studio, Wizard, Templates, Activity, Influencer Detail, Settings

**See**: [`web-app-journey.md`](./web-app-journey.md) for complete screen inventory

### Admin App

**Key Screens**: Dashboard, Users, Billing, Content, Jobs, Analytics, Settings

**See**: [`admin-app-journey.md`](./admin-app-journey.md) for complete screen inventory

### Funnel App (`goviral.ryla.ai`)

**Key Screens**: Wizard steps, Payment, Success

**See**: [`funnel-app-journey.md`](./funnel-app-journey.md) for complete screen inventory

### Landing App (`www.ryla.ai`)

**Key Screens**: Homepage, Landing variants

**See**: [`landing-app-journey.md`](./landing-app-journey.md) for complete screen inventory

---

## Screen Template

```markdown
## [Screen Name]

**ID**: X-XX
**Route**: `/path`
**Category**: [Public/Auth/Onboarding/Core/Settings/Admin]

### Purpose
[What this screen does]

### User Goals
- Goal 1
- Goal 2

### Entry Points
- From [Screen X] via [action]
- Direct link

### Exit Points
- To [Screen Y] via [action]
- To [Screen Z] via [action]

### Components
- [Component 1]
- [Component 2]

### Events
| Event | Trigger |
|-------|---------|
| `screen.viewed` | Page load |
| `screen.action` | User action |

### States
- Loading
- Empty
- Populated
- Error

### Mobile Considerations
- [Responsive behavior]
```

---

## Navigation Map

```
                    ┌─────────────┐
                    │   Landing   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │  Signup  │ │  Login   │ │ Pricing  │
        └────┬─────┘ └────┬─────┘ └──────────┘
             │            │
             ▼            ▼
        ┌─────────────────────────────┐
        │        Onboarding           │
        └──────────────┬──────────────┘
                       │
                       ▼
        ┌─────────────────────────────┐
        │         Dashboard           │
        └──────────────┬──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐   ┌─────────┐
   │Feature 1│   │Feature 2│   │Settings │
   └─────────┘   └─────────┘   └─────────┘
```

---

## Adding New Screens

1. Add to this inventory with ID
2. Define route and purpose
3. Map events to tracking plan
4. Add to navigation map
5. Create user journey if complex

