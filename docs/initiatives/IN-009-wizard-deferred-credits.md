# [INITIATIVE] IN-009: Wizard Deferred Credit System

**Status**: Active  
**Created**: 2026-01-15  
**Last Updated**: 2026-01-15  
**Owner**: Product Team  
**Stakeholders**: Engineering, UX

---

## Executive Summary

**One-sentence description**: Move all credit deductions to the final "Create Character" step, eliminating wasted credits on abandoned wizards and improving conversion.

**Business Impact**: D-Conversion, A-Activation, C-Core Value

---

## Why (Business Rationale)

### Problem Statement
Credits are currently deducted at multiple points during the character creation wizard:
1. **Base Image Generation** (80 credits) - Deducted immediately when generating base images
2. **Profile Picture Set** (120 credits) - Deducted at character creation
3. **NSFW Extra** (50 credits) - Deducted at character creation (if enabled)

This creates poor UX and business problems:
- Users who run out of credits after base image generation can't complete the wizard
- Credits are "spent" on abandoned wizards (wasted cost)
- Users don't see total cost upfront, leading to surprise and frustration
- No clear path to recovery when credits are insufficient

### Current State
- Base images cost 80 credits, deducted immediately when generation starts
- If user can't afford the next step (profile pictures), they're stuck
- Wizard state persists in localStorage, but credit recovery path is unclear
- Users may leave frustrated, reducing conversion

### Desired State
- All credits deducted ONLY when clicking "Create Character" (final step)
- Total cost visible upfront throughout the wizard
- Clear "insufficient credits" modal with path to buy more
- User returns to same step after purchasing credits
- Zero wasted credits on abandoned wizards

### Business Drivers
- **Revenue Impact**: Improved conversion by removing friction points
- **Cost Impact**: Reduced support tickets, fewer wasted GPU cycles on abandoned wizards
- **Risk Mitigation**: Reduced user frustration and churn
- **Competitive Advantage**: Clearer pricing = trust building
- **User Experience**: Predictable costs, no surprises, easy recovery path

---

## How (Approach & Strategy)

### Strategy
Implement frontend-only deferred billing that tracks pending credit costs through the wizard and deducts all credits atomically at character creation.

### Key Principles
- **Single deduction point**: All credits deducted at final "Create" button
- **Transparency**: Show running cost throughout wizard
- **Recovery path**: Clear modal with link to buy credits when insufficient
- **State preservation**: User returns to same step after credit purchase
- **Backward compatibility**: Existing generation endpoints continue to work

### Phases

1. **Phase 1: Backend Changes** - Add `skipCreditDeduction` option to base image endpoint - 1 day
2. **Phase 2: Frontend Credit Tracking** - Calculate total cost, update finalize step - 1 day
3. **Phase 3: Enhanced Modal & Recovery** - Improved modal, return path from buy-credits - 1 day

### Dependencies
- EP-009 (Credits System) - Must be complete ✅
- Wizard state persistence working ✅
- Buy credits page functional ✅

### Constraints
- Must maintain backward compatibility with existing API calls
- No database schema changes (use existing credit tables)
- Implementation must be quick (< 1 week)

---

## When (Timeline & Priority)

### Timeline
- **Start Date**: 2026-01-15
- **Target Completion**: 2026-01-17
- **Key Milestones**:
  - Backend changes complete: 2026-01-15
  - Frontend credit tracking: 2026-01-16
  - Enhanced modal & testing: 2026-01-17

### Priority
**Priority Level**: P1

**Rationale**: Directly impacts conversion (D) and user activation (A). Users hitting this friction point are high-intent users we're losing.

### Resource Requirements
- **Team**: 1 fullstack developer
- **Budget**: N/A (internal work)
- **External Dependencies**: None

---

## Who (Stakeholders & Ownership)

### Initiative Owner
**Name**: Product Team  
**Role**: Product Lead  
**Responsibilities**: Define requirements, validate implementation, measure success

### Key Stakeholders
| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Engineering | Dev | High | Implementation |
| UX | Design | Medium | Modal design review |
| Product | PM | High | Requirements, validation |

### Teams Involved
- Engineering: Full implementation
- UX: Review enhanced modal design

### Communication Plan
- **Updates Frequency**: Daily during implementation
- **Update Format**: Slack #mvp-ryla-dev
- **Audience**: Engineering, Product

---

## Success Criteria

### Primary Success Metrics
| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Wizard completion rate | +10% | Analytics: wizard_completed / wizard_started | 1 week post-launch |
| "Insufficient credits" → purchase conversion | 50% | Analytics: buy_credits_from_modal / modal_shown | 1 week post-launch |
| Abandoned wizard credits wasted | 0 | Check: credits deducted without character created | Immediate |

### Business Metrics Impact
**Target Metric**: [x] A-Activation [x] D-Conversion [ ] B-Retention [x] C-Core Value [ ] E-CAC

**Expected Impact**:
- D-Conversion: +10% wizard completion rate
- A-Activation: Reduced frustration for new users hitting credit limits
- C-Core Value: Users create more characters (not blocked by confusing credit flow)

### Leading Indicators
- Zero credits deducted on abandoned wizards
- Modal shown when insufficient credits
- Users successfully returning from buy-credits page

### Lagging Indicators
- Increased wizard completion rate
- Reduced support tickets about "lost credits"
- Higher buy-credits conversion from modal

---

## Definition of Done

### Initiative Complete When:
- [x] All success criteria met
- [x] All related epics completed
- [x] Documentation updated
- [x] Stakeholders notified
- [x] Post-mortem/retrospective completed
- [x] Metrics validated
- [x] Lessons learned documented

### Not Done Criteria
**This initiative is NOT done if:**
- [ ] Credits still deducted during base image generation
- [ ] Total cost not shown at finalize step
- [ ] Modal doesn't link to buy-credits
- [ ] User can't return to wizard after purchasing credits
- [ ] Regression in existing wizard functionality

---

## Related Work

### Epics
| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-043 | Wizard Deferred Credit System | Draft | [EP-043](../requirements/epics/mvp/EP-043-wizard-deferred-credits.md) |
| EP-009 | Credits System | Complete | [EP-009](../requirements/epics/mvp/EP-009-credits.md) |
| EP-001 | Influencer Wizard | Complete | [EP-001](../requirements/epics/mvp/EP-001-influencer-wizard.md) |

### Dependencies
- **Blocks**: None
- **Blocked By**: None (all dependencies met)
- **Related Initiatives**: IN-004 (Wizard Image Generation)

### Documentation
- [Technical Design](../technical/systems/wizard-deferred-credits.md) - Detailed implementation plan
- [Credit Pricing](../../libs/shared/src/credits/pricing.ts) - Credit cost definitions

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Backend changes break existing clients | Low | High | Add optional flag, maintain backward compatibility |
| Users confused by cost breakdown | Low | Medium | Clear UI design, test with users |
| State lost between buy-credits and wizard | Low | High | Zustand persist already handles this, verify in testing |

---

## Progress Tracking

### Current Phase
**Phase**: Phase 1 - Planning & Epic Creation  
**Status**: On Track

### Recent Updates
- **2026-01-15**: Initiative created, technical design complete

### Next Steps
1. Create EP-043 epic with full requirements
2. Begin Phase 1 implementation (backend changes)
3. Complete Phase 2 (frontend credit tracking)
4. Complete Phase 3 (enhanced modal)

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well
- [TBD]

### What Could Be Improved
- [TBD]

### Recommendations for Future Initiatives
- [TBD]

---

## References

- [Technical Design Doc](../technical/WIZARD-DEFERRED-CREDITS.md)
- [Credit System Epic](../requirements/epics/mvp/EP-009-credits.md)
- [Wizard Epic](../requirements/epics/mvp/EP-001-influencer-wizard.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-15
