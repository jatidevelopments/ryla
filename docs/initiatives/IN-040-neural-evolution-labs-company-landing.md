# [INITIATIVE] IN-040: Neural Evolution Labs Company Landing Page

**Status**: Active  
**Created**: 2026-02-04  
**Last Updated**: 2026-02-04  
**Owner**: Product / Engineering  
**Stakeholders**: NEL (Neural Evolution Labs ÖÜ)

---

## Executive Summary

**One-sentence description**: Establish a public company site for Neural Evolution Labs ÖÜ (NEL) at neuralevolutionlabs.com to communicate mission, strengths, hiring, and contact, with compliant Imprint and Privacy placeholders.

**Business Impact**: E-CAC (professional presence), optional A-Activation/C-Core Value if used for hiring or product discovery.

---

## Why (Business Rationale)

### Problem Statement

- Neural Evolution Labs ÖÜ (Estonian entity) needs a clear public presence.
- No product name (e.g. RYLA) on this site; this is the company/entity site.

### Current State

- No dedicated NEL company website.

### Desired State

- Live company landing at **neuralevolutionlabs.com** (English only).
- Structure inspired by MiracleAI: About Us, Strengths, We Are Hiring, Advantages, Contact.
- Aceternity UI for strong UI/UX; NEL color palette (cyan + green on dark).
- Imprint and Privacy pages with placeholders (company Neural Evolution Labs ÖÜ, director Janis Tirtey).
- Logo: "NEL" text placeholder; no social links in footer.

### Business Drivers

- **E-CAC**: Professional entity presence for partnerships and compliance.
- **User Experience**: Clear, modern company site for talent and partners.

---

## How (Approach & Strategy)

### Strategy

1. New Next.js app `apps/nellab` in monorepo; own branding and deployment.
2. Content adapted from MiracleAI reference (Neural Evolution Labs, AI software lab, AI products/SaaS).
3. Aceternity UI free components: Floating Navbar, Aurora Background, Bento Grid/Focus Cards, Wobble Card, Moving Border, Signup Form (contact), custom footer.
4. SEO: default title/description, canonical, OG, keywords.
5. Legal: Imprint and Privacy with placeholders (address/registry/VAT placeholder until real data).

### Key Principles

- English only; no RYLA branding.
- Placeholder legal text until real data and legal review.

### Dependencies

- None on other RYLA apps.

### Constraints

- Domain neuralevolutionlabs.com to be documented in DOMAIN-REGISTRY when deploying.

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-02-04
- **Target Completion**: 2026-02

### Priority

**Priority Level**: P2

**Rationale**: Estonian entity presence and professional branding.

---

## Success Criteria

- Site live with all sections (Hero, About, Strengths, Hiring, Advantages, Contact) and legal pages (Imprint, Privacy).
- Placeholder legal text; responsive and on-brand (NEL palette, "NEL" logo placeholder).
- Domain documented in ops when deploying.

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| (TBD) | NEL company landing implementation | In progress | apps/nellab |

### Documentation

- Implementation plan: see plan "NEL Company Landing Initiative".
- Domain: [docs/ops/DOMAIN-REGISTRY.md](../ops/DOMAIN-REGISTRY.md) (add neuralevolutionlabs.com when deploying).

---

**Last Updated**: 2026-02-04
