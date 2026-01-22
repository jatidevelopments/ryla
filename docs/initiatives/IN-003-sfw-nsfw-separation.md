# [INITIATIVE] IN-003: SFW/NSFW Content Separation for Growth & Marketability

**Status**: Active  
**Created**: 2026-01-XX  
**Last Updated**: 2026-01-XX  
**Owner**: Product Team  
**Stakeholders**: Growth, Engineering, Design

---

## Executive Summary

**One-sentence description**: Separate SFW and NSFW content generation into distinct experiences, gate NSFW behind Pro tier, and remove NSFW from "Upload a Real Person" feature to make the product more marketable and influencer-friendly.

**Business Impact**: A-Activation (influencer onboarding), D-Conversion (tier upgrades), E-CAC (growth channel expansion)

---

## Why (Business Rationale)

### Problem Statement

Current product positioning limits growth opportunities:

- **Influencer Promotion Barriers**: Many influencers won't promote products with "adult content" prominently featured
- **Platform Review Limitations**: YouTube videos, platform reviews, and social media promotion become difficult when adult content is visible
- **Marketability Gap**: Product is not "salon-ready" (presentable in professional settings) due to adult content visibility
- **Onboarding Friction**: Cannot safely onboard influencers on low-tier plans if adult content is accessible
- **Wording Issues**: "Adult content" terminology is off-putting and unprofessional

### Current State

- NSFW toggle exists in Studio UI with "Adult Content" wording
- NSFW is tied to character settings (`nsfwEnabled` flag)
- NSFW affects model selection (only ComfyUI models when enabled)
- NSFW option exists in funnel onboarding flow
- "Upload a Real Person" feature allows NSFW generation
- Pricing tiers: Free, Starter ($29), Pro ($49), Unlimited ($99)
- NSFW is available to all tiers (only gated by character settings)

### Desired State

- **Separate Generators**: SFW Image Generator (all tiers) and NSFW Generator (Pro tier only)
- **Clear Separation**: NSFW in separate tab/section, not mixed with SFW
- **Tier-Based Access**: NSFW only available in Pro tier and above
- **Clean Wording**: Remove "adult content" terminology, use neutral language
- **Real Person Upload**: NSFW completely removed until product has traction
- **Marketability**: Product is "salon-ready" - safe for influencer promotion, YouTube reviews, professional settings
- **Growth Enablement**: Can onboard all influencers on low-tier plans safely

### Business Drivers

- **Revenue Impact**:
  - Pro tier upgrades driven by NSFW access
  - Increased conversion from Starter → Pro
  - More influencers can be onboarded (lower barrier)
- **Cost Impact**: Minimal (UI/UX changes, feature gating logic)
- **Risk Mitigation**:
  - Reduces platform policy violations
  - Protects brand reputation
  - Enables broader marketing channels
- **Competitive Advantage**:
  - More marketable product
  - Better influencer partnerships
  - Access to YouTube, TikTok, Instagram promotion
- **User Experience**:
  - Clearer product positioning
  - Less confusion about content types
  - Professional, polished experience

---

## How (Approach & Strategy)

### Strategy

**Three-Pillar Approach**:

1. **Content Separation**: Create distinct SFW and NSFW generation experiences
2. **Tier Gating**: Restrict NSFW to Pro tier and above
3. **Feature Cleanup**: Remove NSFW from "Upload a Real Person" feature

### Key Principles

- **Zero Disruption**: Existing users with NSFW enabled should retain access (grandfathering)
- **Clear Communication**: Transparent about tier requirements and feature availability
- **Incremental Rollout**: Phase 1 (wording + separation), Phase 2 (tier gating), Phase 3 (real person cleanup)
- **Data-Driven**: Track conversion rates, tier upgrades, influencer onboarding metrics

### Phases

1. **Phase 1: Hide NSFW for Non-Pro Users** - [Timeline: 1 week] ✅ **ACTIVE**

   - Hide NSFW toggles in Character Creation Wizard for non-Pro users
   - Hide NSFW toggle in Influencer Settings for non-Pro users
   - Hide NSFW toggle in Content Studio for non-Pro users
   - Quick win: Makes product immediately more marketable
   - **Epic**: [EP-027](../requirements/epics/mvp/EP-027-hide-nsfw-for-non-pro-users.md)

2. **Phase 2: Wording & UI Separation** - [Timeline: 2 weeks]

   - Remove "adult content" wording throughout app
   - Replace with neutral terminology (e.g., "Mature Content", "18+ Content", or just "NSFW")
   - Create separate UI sections/tabs for SFW vs NSFW
   - Update Studio UI to show clear separation
   - Update funnel onboarding flow

3. **Phase 3: Tier-Based Access Control & Upgrade Prompts** - [Timeline: 3 weeks]

   - Add upgrade prompts when non-Pro users try to access NSFW
   - Update pricing page to highlight NSFW as Pro feature
   - Grandfather existing users (allow current NSFW users to keep access)

4. **Phase 4: Real Person Upload Cleanup** - [Timeline: 1 week]
   - Remove NSFW toggle/option from "Upload a Real Person" feature
   - Ensure all real person uploads are SFW-only
   - Update UI to reflect SFW-only nature
   - Add messaging: "Lifestyle-focused generation" or similar

### Dependencies

- Pricing structure finalization (Monday meeting with Jonas)
- Subscription tier system (already exists)
- UI/UX design for separated generators
- Feature flag system for gradual rollout

### Constraints

- Must maintain backward compatibility for existing users
- Cannot break existing NSFW-enabled characters
- Must align with Monday pricing discussion outcomes
- Timeline: Should complete before major growth push

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-XX (after Monday pricing meeting)
- **Target Completion**: 2026-02-XX (4-6 weeks total)
- **Key Milestones**:
  - Pricing structure finalized: 2026-01-XX (Monday meeting)
  - Phase 1 complete (wording + separation): 2026-01-XX
  - Phase 2 complete (tier gating): 2026-02-XX
  - Phase 3 complete (real person cleanup): 2026-02-XX

### Priority

**Priority Level**: P1 (High Priority)

**Rationale**:

- Critical for growth strategy (influencer onboarding)
- Enables new marketing channels (YouTube, TikTok)
- Directly impacts conversion (Pro tier upgrades)
- Addresses immediate marketability concerns

### Resource Requirements

- **Team**: Product, Engineering, Design
- **Budget**: Minimal (UI/UX changes, no external dependencies)
- **External Dependencies**: None (all internal changes)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Product Team  
**Role**: Product Management  
**Responsibilities**:

- Define requirements and acceptance criteria
- Coordinate with Growth team on influencer strategy
- Track metrics and success criteria
- Ensure alignment with pricing strategy

### Key Stakeholders

| Name        | Role        | Involvement | Responsibilities                          |
| ----------- | ----------- | ----------- | ----------------------------------------- |
| Jonas       | Growth      | High        | Pricing strategy, growth channel strategy |
| Janis       | Product     | High        | Requirements, feature definition          |
| Engineering | Development | High        | Implementation, technical architecture    |
| Design      | UX/UI       | Medium      | UI/UX design for separated generators     |

### Teams Involved

- **Product Team**: Requirements, acceptance criteria, metrics
- **Engineering Team**: Implementation, tier gating, feature flags
- **Design Team**: UI/UX for separated generators, upgrade prompts
- **Growth Team**: Pricing strategy, influencer onboarding strategy

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status update in #mvp-ryla-pm
- **Audience**: Product, Engineering, Growth teams

---

## Success Criteria

### Primary Success Metrics

| Metric                     | Target           | Measurement Method                            | Timeline            |
| -------------------------- | ---------------- | --------------------------------------------- | ------------------- |
| Influencer Onboarding Rate | +50% increase    | Track new influencer signups on Starter tier  | 30 days post-launch |
| Starter → Pro Conversion   | +20% increase    | Track tier upgrades from Starter to Pro       | 60 days post-launch |
| NSFW Feature Usage (Pro)   | 40% of Pro users | Track NSFW generator usage in Pro tier        | 90 days post-launch |
| YouTube/Platform Reviews   | 5+ reviews       | Track external reviews mentioning product     | 90 days post-launch |
| Wording Compliance         | 100%             | Audit all UI text for "adult content" removal | Phase 1 completion  |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [ ] B-Retention [ ] C-Core Value [x] D-Conversion [x] E-CAC

**Expected Impact**:

- **A-Activation**: +50% influencer onboarding (lower barrier, more marketable)
- **D-Conversion**: +20% Starter → Pro upgrades (NSFW as upgrade driver)
- **E-CAC**: -30% CAC (more marketing channels, influencer partnerships)

### Leading Indicators

- NSFW generator access attempts by non-Pro users (shows demand)
- Upgrade prompt click-through rates (shows conversion intent)
- Influencer signup rate on Starter tier (shows marketability improvement)
- Support tickets about NSFW access (shows confusion reduction)

### Lagging Indicators

- Pro tier subscription rate (confirms conversion impact)
- Influencer promotion mentions (confirms marketability)
- YouTube/TikTok review count (confirms channel expansion)
- Overall revenue growth (confirms business impact)

---

## Definition of Done

### Initiative Complete When:

- [ ] All "adult content" wording removed from app
- [ ] SFW and NSFW generators clearly separated in UI
- [ ] NSFW gated behind Pro tier (with grandfathering)
- [ ] "Upload a Real Person" is SFW-only
- [ ] Pricing page updated to highlight NSFW as Pro feature
- [ ] Upgrade prompts implemented for non-Pro users
- [ ] All acceptance criteria met
- [ ] Metrics dashboard tracking success criteria
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Post-launch metrics validated (30/60/90 days)

### Not Done Criteria

**This initiative is NOT done if:**

- [ ] "Adult content" wording still exists anywhere
- [ ] NSFW is accessible to non-Pro users (except grandfathered)
- [ ] "Upload a Real Person" allows NSFW generation
- [ ] UI doesn't clearly separate SFW/NSFW
- [ ] Metrics not tracked or validated
- [ ] Pricing structure not aligned with strategy

---

## Related Work

### Epics

| Epic                                                                      | Name                                                       | Status     | Link   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------- | ------ |
| [EP-027](../requirements/epics/mvp/EP-027-hide-nsfw-for-non-pro-users.md) | Hide NSFW Toggles for Non-Pro Users (Phase 1)              | 📝 Defined | Active |
| EP-XXX                                                                    | SFW/NSFW Generator Separation (Phase 2)                    | TBD        | TBD    |
| EP-XXX                                                                    | Tier-Based NSFW Access Control & Upgrade Prompts (Phase 3) | TBD        | TBD    |
| EP-XXX                                                                    | Real Person Upload SFW-Only (Phase 4)                      | TBD        | TBD    |
| EP-XXX                                                                    | Pricing Structure Updates                                  | TBD        | TBD    |

### Dependencies

- **Blocks**: Influencer growth campaigns, YouTube/TikTok marketing
- **Blocked By**: Monday pricing meeting (pricing structure finalization)
- **Related Initiatives**: None currently

### Documentation

- Current NSFW Implementation: `docs/technical/models/MVP-STUDIO-MODEL-SELECTION.md`
- Pricing Structure: `libs/shared/src/credits/pricing.ts`
- Subscription System: `libs/trpc/src/routers/subscription.router.ts`

---

## Risks & Mitigation

| Risk                               | Probability | Impact | Mitigation Strategy                                                              |
| ---------------------------------- | ----------- | ------ | -------------------------------------------------------------------------------- |
| Existing users lose NSFW access    | Medium      | High   | Grandfather existing users, allow current NSFW-enabled characters to keep access |
| Confusion about tier requirements  | Medium      | Medium | Clear UI messaging, upgrade prompts, help documentation                          |
| Pricing structure changes          | High        | Medium | Wait for Monday meeting, design flexible system that can adapt                   |
| Technical complexity of separation | Low         | Medium | Incremental rollout, feature flags, thorough testing                             |
| Backlash from NSFW users           | Low         | Low    | Grandfathering, clear communication about changes                                |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed (Pre-Implementation)  
**Status**: Waiting for Pricing Meeting

### Recent Updates

- **2026-01-XX**: Initiative created based on Jonas feedback
- **2026-01-XX**: Waiting for Monday pricing meeting to finalize structure

### Next Steps

1. ✅ **COMPLETE**: Created EP-027 for Phase 1 (hide NSFW for non-Pro)
2. **IN PROGRESS**: Implement EP-027 (hide NSFW toggles)
3. Attend Monday pricing meeting with Jonas
4. Finalize pricing structure and tier definitions
5. Create epics for Phase 2 (wording + separation)
6. Design UI/UX for separated generators

---

## Solution Proposal

### Current State Analysis

**NSFW Implementation Today**:

- Toggle in Studio UI: "Adult Content: Enabled/Disabled"
- Character-level setting: `nsfwEnabled` flag
- Model filtering: Only ComfyUI models when NSFW enabled
- Funnel onboarding: NSFW option in character creation
- Real Person Upload: NSFW toggle available
- Pricing: No tier restrictions

**Issues Identified**:

1. "Adult content" wording is off-putting
2. NSFW mixed with SFW (no clear separation)
3. All tiers can access NSFW (no upgrade incentive)
4. Real Person Upload allows NSFW (growth blocker)
5. Not "salon-ready" for influencer promotion

### Proposed Solution

#### 1. Content Separation

**UI Structure**:

```
Studio
├── SFW Generator (Default Tab)
│   ├── All models available
│   ├── Lifestyle, fashion, professional content
│   └── Available to all tiers
│
└── NSFW Generator (Separate Tab - Pro Only)
    ├── ComfyUI models only
    ├── 18+ content generation
    └── Requires Pro tier (upgrade prompt for others)
```

**Implementation**:

- Add tab/section switcher in Studio UI
- Default to SFW tab
- NSFW tab shows upgrade prompt for non-Pro users
- Clear visual distinction between tabs

#### 2. Tier-Based Access

**Access Control**:

- **Free/Starter**: SFW Generator only
- **Pro/Unlimited**: SFW + NSFW Generators
- **Grandfathering**: Existing users with NSFW-enabled characters keep access

**Upgrade Flow**:

- Non-Pro user clicks NSFW tab → Upgrade modal
- Message: "NSFW Generator available in Pro tier"
- CTA: "Upgrade to Pro" button
- Pricing comparison shown

#### 3. Wording Changes

**Replace "Adult Content" with**:

- Option 1: "Mature Content" (more professional)
- Option 2: "18+ Content" (clear age restriction)
- Option 3: "NSFW" (industry standard, neutral)
- Option 4: "Premium Content" (marketing-friendly)

**Recommendation**: Use "NSFW" or "18+ Content" - clear, neutral, industry-standard

#### 4. Real Person Upload Cleanup

**Changes**:

- Remove NSFW toggle completely
- All real person uploads are SFW-only
- Add messaging: "Lifestyle-focused generation"
- Update UI to reflect SFW-only nature

**Rationale**:

- Most users use it as "lifestyle machine" anyway
- Removes growth blocker
- Makes feature more marketable

#### 5. Pricing Page Updates

**Highlight NSFW as Pro Feature**:

- Add "NSFW Generator" to Pro tier features
- Show comparison: Starter (SFW only) vs Pro (SFW + NSFW)
- Clear value proposition: "Unlock NSFW generation with Pro"

### Technical Implementation

**Files to Modify**:

1. `apps/web/components/studio/` - UI separation
2. `apps/web/lib/hooks/use-subscription.ts` - Tier checks
3. `libs/shared/src/credits/pricing.ts` - Feature definitions
4. `apps/web/components/wizard/` - Remove NSFW from real person flow
5. `apps/funnel/features/funnel/` - Update onboarding flow

**New Components Needed**:

- `StudioTabSwitcher.tsx` - SFW/NSFW tab switcher
- `NSFWUpgradePrompt.tsx` - Upgrade modal for non-Pro users
- `TierFeatureGate.tsx` - Reusable component for tier gating

**Database Changes**:

- None required (subscription tier already exists)
- May need to track NSFW access attempts for metrics

### Metrics to Track

**Conversion Metrics**:

- NSFW tab clicks by tier
- Upgrade prompt → Pro conversion rate
- Starter → Pro upgrades (before/after)

**Growth Metrics**:

- Influencer signups on Starter tier
- YouTube/TikTok review mentions
- Social media promotion mentions

**Usage Metrics**:

- SFW vs NSFW generator usage
- NSFW usage by tier (should be 0% for non-Pro)
- Real person upload usage (should be 100% SFW)

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [Learning 1]
- [Learning 2]

### What Could Be Improved

- [Learning 1]
- [Learning 2]

### Recommendations for Future Initiatives

- [Recommendation 1]
- [Recommendation 2]

---

## References

- **Feedback Source**: Jonas (Growth) - 2026-01-XX
- **Current NSFW Implementation**: `docs/technical/models/MVP-STUDIO-MODEL-SELECTION.md`
- **Pricing Structure**: `libs/shared/src/credits/pricing.ts`
- **Subscription System**: `libs/trpc/src/routers/subscription.router.ts`
- **Studio UI**: `apps/web/app/influencer/[id]/studio/page.tsx`
- **Real Person Upload**: `libs/trpc/src/routers/user.router.ts` (uploadObjectImage)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-XX
