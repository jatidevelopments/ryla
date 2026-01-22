# User Journeys Documentation

This directory contains user journey documentation organized by app. Each app has its own journey documentation that details user flows, screens, touchpoints, and analytics events.

---

## Documentation Structure

### High-Level Overview

- **[CUSTOMER-JOURNEY.md](./CUSTOMER-JOURNEY.md)** - Macro customer journey (AAARRR funnel) across all apps
- **[SCREENS.md](./SCREENS.md)** - High-level screen inventory with links to app-specific docs
- **[TOUCHPOINTS.md](./TOUCHPOINTS.md)** - High-level touchpoint matrix with links to app-specific docs
- **[USER-JOURNEY-TEMPLATE.md](./USER-JOURNEY-TEMPLATE.md)** - Template for creating new journey documentation

### App-Specific Journeys

- **[web-app-journey.md](./web-app-journey.md)** - Web app (`app.ryla.ai`) user journeys
- **[admin-app-journey.md](./admin-app-journey.md)** - Admin app user journeys
- **[funnel-app-journey.md](./funnel-app-journey.md)** - Funnel app (`goviral.ryla.ai`) user journeys
- **[landing-app-journey.md](./landing-app-journey.md)** - Landing app (`www.ryla.ai`) user journeys

---

## Quick Reference

| App | Domain | Purpose | Key Flows |
|-----|--------|---------|-----------|
| **Web** | `app.ryla.ai` | Main authenticated app | Character creation, content generation, management |
| **Admin** | Internal | Administrative interface | User management, content moderation, analytics |
| **Funnel** | `goviral.ryla.ai` | Payment & conversion | Character creation wizard, payment flow |
| **Landing** | `www.ryla.ai` | Marketing website | Brand awareness, SEO, lead generation |

---

## Journey Stages by App

### Awareness → Acquisition
- **Landing App**: Homepage views, CTA clicks
- **Funnel App**: Wizard starts, character creation

### Activation
- **Web App**: First character created, first image generated
- **Funnel App**: Wizard completed

### Revenue
- **Funnel App**: Payment completed
- **Web App**: Credits purchased, subscription upgraded

### Retention
- **Web App**: Return visits, content generation
- **Funnel App**: Returning user flows

### Core Value
- **Web App**: Image generation, template usage
- **Admin App**: Operational efficiency

---

## Business Metrics Mapping

| Metric | Primary App | Key Events |
|--------|-------------|------------|
| **A (Activation)** | Web, Funnel | `influencer.created`, `studio.generation_completed` |
| **B (Retention)** | Web | `session.started`, `studio.generation_started` |
| **C (Core Value)** | Web | `studio.generation_completed`, `templates.template_used` |
| **D (Conversion)** | Funnel, Web | `funnel.payment.completed`, `credits.purchased` |
| **E (CAC)** | Landing, Funnel | `landing.viewed`, `funnel.started` |

---

## Related Documentation

- **Architecture**: `docs/architecture/general/USER-FLOWS.md`
- **Analytics**: `docs/analytics/TRACKING-PLAN.md`
- **Requirements**: `docs/requirements/epics/`

---

## Updating Journey Documentation

When adding new features or flows:

1. **Update app-specific journey doc** - Add new flows to the relevant app journey
2. **Update SCREENS.md** - Add new screens to the app-specific section
3. **Update TOUCHPOINTS.md** - Add new touchpoints to the app-specific section
4. **Update analytics** - Ensure events are tracked in tracking plan

Use the [USER-JOURNEY-TEMPLATE.md](./USER-JOURNEY-TEMPLATE.md) for creating new journey documentation.
