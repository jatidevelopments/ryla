# RYLA - Product Hypothesis

## Product Vision

**RYLA** = AI Influencer Creation & Management Platform

---

## The Problem

**Target Users**: Content creators, marketers, and entrepreneurs who want to create and monetize AI influencers (for OnlyFans, TikTok, Instagram, etc.)

**Problem Statement**:
Creating and managing AI influencers is fragmented, frustrating, and inconsistent. Users bounce between 5+ separate tools (image gen, voice, video, lip-sync, scheduling) with no unified workflow, leading to:

- Inconsistent character appearance across generations
- Hours wasted on manual file juggling
- No persistent character memory or backstory
- Low-quality outputs that look fake
- No direct path to monetization platforms

**Evidence**:

- Ghost test funnel: **~54% payment intent conversion** (generation → payment)
- **128 WAUs** in first 2 weeks of testing
- **77 unique users** in week 1, **51** in week 2
- Primary traffic: Facebook (73 users), Direct (43), Instagram (6)
- Course seller research identified 10 core pain points

---

## Core Hypothesis

> **We believe** content creators who want AI influencers **have** fragmented tooling, inconsistent outputs, and no character continuity.
>
> **If we build** a unified platform that generates consistent AI personas, maintains character memory, and provides one-click export to monetization platforms,
>
> **They will** complete the funnel and pay for subscriptions.
>
> **We'll know we're right when** funnel-to-payment conversion exceeds **20%** and D7 retention reaches **15%**.

---

## User Pain Points (Validated)

| #   | Pain Point                                                                         | Severity    | RYLA Solution                                            |
| --- | ---------------------------------------------------------------------------------- | ----------- | -------------------------------------------------------- |
| 1   | **Model quality & realism** - outputs look fake, face inconsistency, glitchy hands | 🔴 Critical | Curated model selection, consistent seed/style locking   |
| 2   | **Prompt inconsistency** - same prompt = different results                         | 🔴 Critical | Saved character profiles with locked parameters          |
| 3   | **Character memory/continuity** - AI forgets backstory, personality breaks         | 🔴 Critical | Persistent character profiles with traits, history, tone |
| 4   | **Tooling & workflow** - too many separate tools, manual file juggling             | 🔴 Critical | All-in-one: image, voice, video, lip-sync, export        |
| 5   | **Generation speed & stability** - slow renders, timeouts                          | 🟡 High     | Optimized pipelines, queue management, fallbacks         |
| 6   | **Voice & lip-sync** - voice mismatch, robotic sync                                | 🟡 High     | Voice cloning + sync models, preview before render       |
| 7   | **Copyright/rights uncertainty** - commercial use concerns                         | 🟡 High     | Clear licensing, 100% synthetic faces, terms clarity     |
| 8   | **Platform integration gaps** - no easy export to social/OF                        | 🟡 High     | One-click export, format presets, scheduling             |
| 9   | **Pricing frustration** - expensive, confusing credits                             | 🟠 Medium   | Simple subscription tiers, transparent usage             |
| 10  | **NSFW/moderation constraints** - filters too strict                               | 🟠 Medium   | Tiered content controls with safety boundaries           |

---

## Key Differentiators (Validated in Funnel)

These features were explicitly sold in the ghost test funnel and showed high engagement:

| Feature                   | What We Sell                               | Pain It Solves                     | Funnel Step |
| ------------------------- | ------------------------------------------ | ---------------------------------- | ----------- |
| **Hyper Realistic Skin**  | AI skin indistinguishable from real photos | "Outputs look fake/uncanny"        | Step 5      |
| **Perfect Hands**         | Solved the #1 AI image problem             | "Hands always glitch/look wrong"   | Step 16     |
| **Character Consistency** | Same face across ALL your content          | "Face changes every generation"    | Step 12     |
| **Outfit Customization**  | Dress your character in any style          | "Can't control appearance details" | Step 20-21  |
| **Lipsync**               | Realistic talking videos                   | "Lip-sync robotic/out of sync"     | Step 29     |
| **NSFW Toggle**           | Creator-controlled content boundaries      | "Filters too strict"               | Step 27-28  |

### Why These Matter

1. **Hyper Realistic Skin + Perfect Hands** → Direct response to "AI looks fake" objection
2. **Character Consistency** → The #1 pain point from course seller research
3. **Outfit Customization** → Enables varied content without losing character identity
4. **Lipsync** → Key for video content (Phase 2, but validated demand)

---

## MVP Scope

### In Scope (MVP)

- Character creation wizard (funnel)
- Consistent face generation
- Character profile persistence
- Basic voice selection
- Image pack generation
- Payment integration
- Export to common formats

### Out of Scope (Phase 2+)

- Video generation
- Lip-sync
- Platform scheduling (OF, TikTok auto-post)
- Multi-character scenes
- Voice cloning
- Advanced NSFW controls
- API access

---

## Success Metrics

### Primary (North Star)

| Metric                                      | Target | Current | Timeline |
| ------------------------------------------- | ------ | ------- | -------- |
| **C - Core Value**: Characters created/user | >3     | TBD     | 30 days  |
| **D - Conversion**: Funnel → Payment        | >20%   | ~54%\*  | 30 days  |

\*54% is generation→payment, full funnel TBD

### Secondary

| Metric                  | Category       | Target  | Current       |
| ----------------------- | -------------- | ------- | ------------- |
| Start → Generation      | A - Activation | >60%    | TBD           |
| D7 Return Rate          | B - Retention  | >15%    | 5% (week 1→2) |
| Time to first character | A - Activation | <10 min | TBD           |
| Support tickets/user    | Quality        | <0.1    | TBD           |

---

## Funnel Data (Ghost Test - Nov 2025)

### Traffic Sources

| Source         | Users (14d) |
| -------------- | ----------- |
| m.facebook.com | 53          |
| Direct         | 43          |
| l.facebook.com | 19          |
| instagram.com  | 6           |
| google.com     | 2           |

### Weekly Metrics

| Week         | WAUs | New Users       |
| ------------ | ---- | --------------- |
| Nov 23-29    | 77   | 77 (first week) |
| Nov 30-Dec 4 | 51   | 47              |

### Retention (Week 1 → Week 2)

- Week 0: 77 users
- Week 1: 4 returned (**5.2% retention**)
- Goal: **15% retention**

---

## Competitive Landscape

| Competitor                            | Strengths            | Weaknesses                            | RYLA Opportunity          |
| ------------------------------------- | -------------------- | ------------------------------------- | ------------------------- |
| Generic AI tools (Midjourney, DALL-E) | Quality, flexibility | No character persistence, no workflow | Unified workflow + memory |
| Character.AI                          | Personality, chat    | No image gen, no monetization path    | Full content pipeline     |
| OnlyFans agencies                     | Business model       | Manual, expensive, human-dependent    | Automation + AI           |
| Fanvue AI                             | NSFW focus           | Limited tooling                       | Better UX, more features  |

---

## Risks & Mitigations

| Risk                          | Likelihood | Impact | Mitigation                                       |
| ----------------------------- | ---------- | ------ | ------------------------------------------------ |
| Model quality not good enough | Medium     | High   | Use best-in-class models, user feedback loop     |
| Copyright/legal issues        | Low        | High   | 100% synthetic, clear terms, legal review        |
| Platform bans (OF, social)    | Medium     | Medium | Diversify platforms, compliance guidelines       |
| High compute costs            | High       | Medium | Tiered pricing, optimization, caching            |
| Low retention                 | Medium     | High   | Character memory, content library, notifications |

---

## Validation Plan

### Phase 1: Ghost Test (✅ Complete)

- Landing page + funnel
- Payment intent capture
- Traffic from ads
- **Result**: 54% payment intent, 128 WAUs

### Phase 2: MVP Launch (Next)

- Full character generation
- Real payment processing
- Basic dashboard
- **Success**: >20% paid conversion, >15% D7 retention

### Phase 3: Iteration

- Add voice/video based on feedback
- Platform integrations
- Scale acquisition

---

## Decision Log

| Date     | Decision                             | Rationale                                          |
| -------- | ------------------------------------ | -------------------------------------------------- |
| Nov 2025 | Focus on character consistency first | #1 and #2 pain points from research                |
| Nov 2025 | Skip video for MVP                   | Complexity vs. value; image packs validate demand  |
| Nov 2025 | Subscription model                   | Predictable revenue, aligns with creator economics |
| Dec 2025 | Nx monorepo                          | Multiple apps (web, admin), shared libs            |

---

## Open Questions

1. ~~What's the optimal price point?~~ → **$29/mo** (validated in ghost test, A/B test later)
2. How many images per character pack for MVP? → **TBD during P3** (likely 5-10)
3. Which voice provider has best quality/cost ratio? → **TBD** (basic selection for MVP)
4. What's the minimum character consistency users accept? → **Validate during P10**
5. ~~Should we offer free tier or trial?~~ → **No free tier for MVP** (paid only, validate demand)

---

## Next Steps

1. **P1**: Complete this hypothesis doc ✅
2. **P2**: Define all MVP epics (EP-001 to EP-007) ✅
3. **P3**: Architecture for character persistence ← NEXT
4. **P4**: UI skeleton for wizard flow
5. **P5**: Tech spec and task breakdown
