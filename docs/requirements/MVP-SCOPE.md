# RYLA MVP Scope

## MVP Objective

> Enable users to create consistent AI influencer characters, generate image packs, and pay for subscriptions.
> 
> **Success**: >20% funnel→payment conversion, >15% D7 retention

---

## What's IN the MVP

### Core User Journey
```
Landing → Wizard → Generate Character → Payment → Dashboard → Download Images
```

### Epics (Priority Order)

| Epic | Name | Priority | Metric | Status |
|------|------|----------|--------|--------|
| EP-001 | Character Creation Wizard | P0 | A - Activation | 📝 Defined |
| EP-002 | User Authentication | P0 | A - Activation | ⬜ TODO |
| EP-003 | Payment & Subscription | P0 | D - Conversion | ⬜ TODO |
| EP-004 | Character Dashboard | P1 | B - Retention | ⬜ TODO |
| EP-005 | Image Generation Engine | P0 | C - Core Value | ⬜ TODO |
| EP-006 | Landing Page | P0 | A - Activation | ⬜ TODO |

### Features per Epic

#### EP-001: Character Creation Wizard ✅
- Multi-step wizard with validation
- Character configuration (ethnicity, age, body, style)
- Progress persistence (localStorage + server)
- Preview before generation

#### EP-002: User Authentication
- Email/password signup
- Email/password login
- Session management
- Password reset (basic)
- Guest → registered conversion

#### EP-003: Payment & Subscription
- Stripe Checkout integration
- Subscription plans (1-2 tiers)
- Payment success/failure handling
- Subscription status in UI
- Basic billing portal link

#### EP-004: Character Dashboard
- List saved characters
- View character details
- Regenerate character images
- Download image packs
- Delete character

#### EP-005: Image Generation Engine
- AI model integration (Replicate/Fal/etc)
- Consistent face generation (seed locking)
- Image pack generation (5-10 images)
- Queue management
- Error handling & retries

#### EP-006: Landing Page
- Hero with value prop
- Feature highlights
- Social proof (if available)
- CTA to wizard
- Mobile responsive

---

## What's NOT in MVP (Phase 2+)

### Explicitly Out of Scope

| Feature | Reason | Phase |
|---------|--------|-------|
| Video generation | Complexity, validate images first | P2 |
| Lip-sync / talking head | Depends on video | P2 |
| Voice cloning | Complexity | P2 |
| Platform posting (OF, TikTok) | Integration complexity | P2 |
| Content scheduling | Needs platform integration | P2 |
| Multi-character scenes | Complexity | P2 |
| Character chat/personality | Different product direction | P3 |
| API access | B2B, not MVP focus | P3 |
| Team/agency features | B2B | P3 |
| Advanced NSFW controls | Start with simple on/off | P2 |
| Referral system | Optimize CAC later | P2 |
| Mobile app | Web-first | P3 |
| i18n (multi-language) | English only for MVP | P2 |

### Simplified for MVP

| Feature | MVP Version | Full Version (Later) |
|---------|-------------|---------------------|
| Auth | Email/password only | + Social login, 2FA |
| Pricing | 1-2 plans | Multiple tiers, annual |
| Character editing | Regenerate only | Full attribute editing |
| Images per pack | 5-10 | Unlimited/configurable |
| Export formats | PNG/ZIP | Multiple formats, sizes |
| Analytics | PostHog only | Custom dashboard |

---

## MVP User Personas

### Primary: First-Time Creator
- Never created AI content before
- Wants to try AI influencers
- Price sensitive, needs free trial/low entry
- Needs guidance through process

### Secondary: Experienced Creator  
- Already using multiple AI tools
- Frustrated with workflow
- Willing to pay for efficiency
- Wants consistency

---

## MVP Technical Constraints

| Constraint | Requirement |
|------------|-------------|
| Browser support | >98% global coverage |
| Mobile | Responsive web (no native app) |
| Page load | <3s on 3G |
| Generation time | <60s per character |
| Uptime | 99% (acceptable for MVP) |

---

## MVP Launch Checklist

### Must Have Before Launch
- [ ] User can sign up and log in
- [ ] User can complete wizard flow
- [ ] Character generates with consistent face
- [ ] Payment processes successfully
- [ ] User can download image pack
- [ ] Analytics tracking all key events
- [ ] Error handling doesn't crash app
- [ ] Mobile responsive

### Nice to Have
- [ ] Email confirmation
- [ ] Forgot password flow
- [ ] Character editing
- [ ] Multiple pricing tiers

### Not Needed for Launch
- Video features
- Platform integrations
- Advanced customization
- Admin dashboard

---

## Success Metrics (MVP)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Funnel completion | >60% | PostHog funnel |
| Payment conversion | >20% | Stripe + PostHog |
| D7 retention | >15% | PostHog cohort |
| Time to first character | <10 min | PostHog timing |
| Generation success rate | >95% | Backend logs |
| Payment success rate | >90% | Stripe dashboard |

---

## Timeline Estimate

| Week | Focus | Epics |
|------|-------|-------|
| 1-2 | Foundation | EP-002 (Auth), EP-006 (Landing) |
| 2-3 | Core | EP-001 (Wizard), EP-005 (Generation) |
| 3-4 | Money | EP-003 (Payment), EP-004 (Dashboard) |
| 4-5 | Polish | Integration, testing, fixes |
| 5 | Launch | Deploy, monitor, iterate |

---

## Decision Log

| Decision | Rationale |
|----------|-----------|
| Email auth only | Fastest to implement, social login adds complexity |
| 1-2 pricing tiers | Simple choice, optimize later |
| No video for MVP | Images validate demand, video is 10x complexity |
| Web only | Faster iteration than native apps |
| Stripe only | Market leader, best docs, handles complexity |

