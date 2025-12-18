# RYLA - Ideal Customer Profile (ICP) & Personas

> **Last Updated**: December 5, 2025
> **Data Source**: Ghost test funnel (Nov 2025) - 64 US users, 44 global funnel entries

---

## Executive Summary

Our funnel users are **first-time AI creators with clear NSFW/OnlyFans intent**. They're beginners to AI tools but know exactly what they want to create. The funnel successfully validates demand and user preferences.

> ⚠️ **Note**: A bug after character creation prevented users from proceeding to payment.
> Payment conversion data may not reflect actual conversion intent.

### Target Customer Segments (Business View)

We have **multiple target segments**, but we’re deliberately shipping MVP around the **fastest-to-serve, highest-intent** segment first.

#### Segment A (MVP Primary): First-time AI creator (no technical background)

- Wants to “get into it” but faces a high barrier: tooling complexity + lack of technical experience
- Needs a simple, guided workflow to **create AI influencers** and **generate/regenerate/manage** images and content quickly
- Core value: “I can start without knowing AI tools”

#### Segment B (MVP Secondary): Creator optimizer (some experience, wants speed + quality)

- Already creates content (or manages an existing content workflow) and wants:
  - higher-quality outputs
  - more angles/variants
  - more automation and faster iteration
- Core value: “I can produce more (and better) content with less effort”

#### Segment C (Post‑MVP / Enterprise-leaning): Agencies (e.g. OnlyFans agencies)

- Manages multiple profiles and needs standardized workflows, approvals, and scale
- Core value: “We can operate a multi-model content pipeline efficiently”

#### Segment D (Post‑MVP): Brands / marketing teams

- Wants to create or operate synthetic creators for campaigns/UGC-style content
- Core value: “We can generate consistent branded creative at scale”

#### Important MVP Constraint: No “Import Existing Influencer/Account” Yet

Adding an existing real influencer/account for training or content generation is **not in the MVP**.

- **Reason**: compliance/rights management — we must be able to verify that the user **owns the account** or has **explicit permission** to create/train/operate that likeness and content.
- **Status**: planned for a later phase once verification and permissions are fully specified and enforced.

---

## Key Data Insights

### User Composition

| Metric                 | US       | Global | Insight                              |
| ---------------------- | -------- | ------ | ------------------------------------ |
| Funnel entries         | 36 (82%) | 44     | US is dominant market                |
| Character completions  | 19 (70%) | 27     | US converts well through creation    |
| Payment step reached   | 4 (57%)  | 7      | US drops at payment more than global |
| **First-timers**       | **93%**  | 88%    | Beginners but with intent            |
| **AI OnlyFans intent** | **39%**  | 21%    | 2x NSFW interest vs global           |
| **NSFW enabled**       | **72%**  | 69%    | Clear adult content focus            |

### Funnel Performance

| Stage                     | US Users | Drop-off | Analysis                  |
| ------------------------- | -------- | -------- | ------------------------- |
| Started (Step 0)          | 64       | -        | Strong initial interest   |
| Entered funnel (Step 1)   | 36       | 44%      | Partnership proof filters |
| Mid-funnel (Steps 4-15)   | 24→19    | 21%      | **Very stable**           |
| Late funnel (Steps 15-33) | 19-21    | ~0%      | **Extremely stable**      |
| **Payment step**          | 4        | **81%**  | 🔴 **Critical drop-off**  |
| Email entered             | 1        | 75%      | Trust barrier at payment  |

### Critical Finding

> **The funnel validates demand. Users complete character creation.**
>
> - Mid-funnel: Only 21% attrition (excellent)
> - Late funnel: Stable at 19-21 users (great)
> - Character creation: Users love the result
> - ⚠️ **Payment data affected by bug** - needs re-evaluation

---

## Primary ICP: US NSFW Creator Aspirant

### Demographics

| Attribute      | Value                       | Data Source            |
| -------------- | --------------------------- | ---------------------- |
| Location       | **US (82% of users)**       | Funnel data            |
| Age            | 25-40 (estimated)           | Facebook ad targeting  |
| Device         | Mobile-first                | m.facebook.com traffic |
| Income         | $30-80K                     | Side hustle interest   |
| AI Experience  | **None (93% first-timers)** | Step 2 selection       |
| Primary Intent | **AI OnlyFans (39%)**       | Step 3 selection       |

### Psychographics

| Attribute          | Value                                              |
| ------------------ | -------------------------------------------------- |
| **Motivation**     | Make money with AI + OnlyFans without showing face |
| **Knowledge**      | Beginner to AI, but knows OnlyFans exists          |
| **Expectation**    | Create AI influencer → post on OF → make money     |
| **Barrier**        | Payment trust, not understanding                   |
| **Decision Style** | Needs social proof and guarantees before paying    |

### Use Case Distribution (US)

| Use Case        | US %    | Global % | Index |
| --------------- | ------- | -------- | ----- |
| **AI OnlyFans** | **39%** | 21%      | 1.9x  |
| Not sure yet    | 24%     | 34%      | 0.7x  |
| AI Influencer   | 24%     | 24%      | 1.0x  |
| AI UGC          | 11%     | 11%      | 1.0x  |
| AI Courses      | 3%      | 10%      | 0.3x  |

**Key Insight**: US users have clearer intent—they know they want NSFW content.

---

## Primary Persona: "NSFW Natalie"

### Profile

```
Name: Natalie
Age: 29
Location: Texas, USA
Job: Healthcare worker, wants side income
Device: iPhone (Facebook user)
Income: $48K/year
AI Experience: None (used ChatGPT once)
Goal: Create AI OnlyFans model without showing her face
```

### Story

Natalie heard about people making money on OnlyFans without showing their face using AI. She saw a Facebook ad for RYLA and was intrigued. She went through the entire wizard, created a character she loved, but hesitated at the payment step.

**She didn't pay because:**

- No testimonials from real users
- Unclear what she gets for $29
- No money-back guarantee visible
- Payment form felt unfamiliar

### Natalie's Journey (Actual Data)

```
1. Sees Facebook ad → "AI OnlyFans without showing face? Yes!"
2. Enters funnel → Excited, moves quickly through steps
3. Step 2: Selects "Never created AI influencer" (93%)
4. Step 3: Selects "AI OnlyFans" (39%)
5. Mid-funnel → Stable, engaged, completes all steps
6. Creates character → Loves the result
7. Reaches payment → Hesitates
8. Sees $29/mo → "Is this legit? What do I actually get?"
9. Leaves without paying (81% drop-off)
```

### What Natalie Needs to Convert

| Need                 | Current State | Fix                               |
| -------------------- | ------------- | --------------------------------- |
| **Trust signals**    | None visible  | Testimonials, user count, badges  |
| **Clear value**      | Unclear       | "Here's exactly what you get"     |
| **Risk reduction**   | No guarantee  | Money-back guarantee, free trial  |
| **Familiar payment** | Custom form?  | Stripe, PayPal, known processors  |
| **Social proof**     | None          | "500 creators already using RYLA" |

### Character Preferences (US Data)

| Attribute | Top Choice            | Second Choice    |
| --------- | --------------------- | ---------------- |
| Ethnicity | Caucasian (57%)       | Latina (26%)     |
| Skin      | Medium (67%)          | Tan (24%)        |
| Body type | **Thick (37%)**       | Athletic (26%)   |
| Hair      | Long (60%)            | Curly-long (20%) |
| Outfit    | Date night glam (31%) | Athleisure (25%) |
| Voice     | Voice3 (37%)          | Voice1 (37%)     |

**US vs Global Shift**: US users prefer thicker/curvier body types (37% vs 27% global) and date night glam outfits (31% vs 22% global).

---

## Secondary Persona: "Side Hustle Sam"

### Profile

```
Name: Sam
Age: 34
Location: UK
Job: Marketing freelancer
Device: Android + Desktop
Income: £40K/year
AI Experience: Used Midjourney once
Goal: General AI influencer, not specifically NSFW
```

### How Sam Differs

| Attribute        | Natalie (US)       | Sam (Global)       |
| ---------------- | ------------------ | ------------------ |
| NSFW intent      | 39%                | 21%                |
| Body preference  | Thick (37%)        | Athletic (32%)     |
| Use case clarity | High (AI OnlyFans) | Lower ("Not sure") |
| Payment convert  | Lower (81% drop)   | Higher (71% drop)  |

---

## What This Means for MVP Product

### ✅ VALIDATED - Keep/Prioritize

| Feature              | Validation                           |
| -------------------- | ------------------------------------ |
| **NSFW support**     | 72% enable, 39% specifically want OF |
| **Character wizard** | Mid-funnel is stable, users love it  |
| **OF/Fanvue focus**  | 39% explicitly select AI OnlyFans    |
| **Curvy body types** | 37% prefer thick (use in previews)   |
| **First-timer UX**   | 93% are beginners, wizard works      |

### ⚠️ NEEDS INVESTIGATION (Funnel Workstream)

| Issue             | Data             | Status                      |
| ----------------- | ---------------- | --------------------------- |
| Payment drop-off  | 81% drop         | ⚠️ Bug may have caused this |
| Email capture     | Only 1/4 entered | ⚠️ Need clean data          |
| Price sensitivity | Unknown          | ⚠️ Test after bug fix       |

### Key Learnings

| Assumption                  | Reality                            |
| --------------------------- | ---------------------------------- |
| Users need education        | ❌ They complete funnel fine (21%) |
| Users are confused          | ❌ Users know what they want (39%) |
| Beginners need hand-holding | ❌ Wizard flow is intuitive        |
| Payment is the problem      | ❓ Bug may have caused drop-off    |

---

## MVP Product Priorities

### Priority 1: Core Product (Character Creation & Management)

- [ ] Character wizard with NSFW toggle
- [ ] Consistent face generation
- [ ] Dashboard for managing characters
- [ ] Image download functionality
- [ ] Regeneration capability

### Priority 2: Quality & Retention

- [ ] Generation success >95%
- [ ] D7 retention >15%
- [ ] Characters/user >2

### Priority 3: User Preferences (from funnel data)

- [ ] Feature curvy body types (37% preference)
- [ ] Support date night glam outfits (31%)
- [ ] NSFW toggle prominent (72% enable)

---

## Funnel/Landing Priorities (Separate Workstream)

- [ ] Fix bug preventing payment progression
- [ ] Re-collect clean payment conversion data
- [ ] Optimize based on actual conversion issues
- [ ] Marketing: Lead with AI OnlyFans (39% US)

---

## Success Metrics

### MVP Product

| Metric                 | Current | Target | Priority |
| ---------------------- | ------- | ------ | -------- |
| **D7 retention**       | 5.2%    | >15%   | P0       |
| **Characters/user**    | TBD     | >2     | P0       |
| **Generation success** | TBD     | >95%   | P0       |
| NSFW toggle adoption   | 72%     | >70%   | Maintain |

### Funnel (Separate)

| Metric               | Current | Target | Notes        |
| -------------------- | ------- | ------ | ------------ |
| Mid-funnel attrition | 21%     | <25%   | ✅ Good      |
| Payment conversion   | 19%     | TBD    | Bug affected |

---

## Key Takeaway

> **Our users are motivated first-timers who know exactly what they want (AI OnlyFans).** > **They complete character creation successfully. The funnel validates demand.**
>
> **MVP Focus**: Deliver great character creation & management experience.
> **Funnel Focus (separate)**: Fix bug, then optimize payment conversion.

---

## Data Appendix

### US User Event Totals

| Event Type          | US Count | % of Global |
| ------------------- | -------- | ----------- |
| Funnel steps viewed | 1,468    | 73%         |
| Steps completed     | 652      | 74%         |
| Form data updates   | 816      | 72%         |
| Option selections   | 496      | 84%         |

### Feature Adoption (US)

| Feature      | Adoption |
| ------------ | -------- |
| NSFW content | 72%      |
| Viral videos | 98%      |
| Faceswap     | ~100%    |
| Lipsync      | ~100%    |
| Selfies      | ~100%    |
