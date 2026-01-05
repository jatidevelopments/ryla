# EP-024: Contextual Page Tutorials - Phase 2 Scoping

**Phase**: P2 - Scoping  
**Epic**: EP-024  
**Status**: In Progress

---

## Phase 2 Outputs Checklist

- [x] Feature list (from epic)
- [x] Epic created (EP-024)
- [x] Acceptance criteria (AC-1 to AC-6)
- [x] Analytics AC defined
- [x] Non-MVP items listed
- [x] User stories defined (ST-120 to ST-124)
- [ ] Story breakdown with tasks (this document)

---

## Story Breakdown

### ST-120: See Tutorial on First Studio Visit

**Story**: As a user visiting the Studio for the first time, I want to see a contextual tutorial, so that I understand how to use the Studio features.

**Acceptance Criteria**: AC-4, AC-5

**Tasks**:
- **TSK-120-001**: Create tutorial step definitions for Studio (5 steps)
- **TSK-120-002**: Implement tutorial auto-start logic on Studio page
- **TSK-120-003**: Add data attributes to Studio UI elements for targeting
- **TSK-120-004**: Integrate tutorial overlay into Studio page component
- **TSK-120-005**: Test tutorial appears on first visit only

**Dependencies**: 
- Tutorial components must exist (ST-124)
- Studio page must be accessible

**Definition of Done**:
- Tutorial automatically starts when user first visits `/studio`
- Tutorial doesn't show if user has already completed it
- All 5 steps are properly defined and target correct UI elements
- Tutorial state persists in localStorage

---

### ST-121: Navigate Through Tutorial Steps

**Story**: As a user in a tutorial, I want to move through steps with clear navigation, so that I can learn at my own pace.

**Acceptance Criteria**: AC-2, AC-3

**Tasks**:
- **TSK-121-001**: Implement step navigation (next button functionality)
- **TSK-121-002**: Add step indicator display ("X of Y")
- **TSK-121-003**: Implement smooth transitions between steps
- **TSK-121-004**: Add pointer animation and positioning logic
- **TSK-121-005**: Ensure tutorial doesn't block critical UI interactions
- **TSK-121-006**: Test keyboard navigation (Enter to proceed)

**Dependencies**:
- Tutorial overlay component (ST-124)
- Tutorial pointer component (ST-124)

**Definition of Done**:
- Users can click "Got it" to move to next step
- Step indicator updates correctly
- Transitions are smooth and visually appealing
- Pointer accurately points to target elements
- Tutorial can be navigated with keyboard

---

### ST-122: Skip Tutorial If Not Needed

**Story**: As a user who already knows how to use the Studio, I want to skip the tutorial, so that I can use the product immediately.

**Acceptance Criteria**: AC-3, AC-5

**Tasks**:
- **TSK-122-001**: Add "Skip tutorial" link to tutorial overlay
- **TSK-122-002**: Implement skip functionality (dismisses tutorial)
- **TSK-122-003**: Store skip state in localStorage
- **TSK-122-004**: Track skip analytics event
- **TSK-122-005**: Ensure skip works from any step

**Dependencies**:
- Tutorial overlay component (ST-124)
- Tutorial state management (ST-124)

**Definition of Done**:
- "Skip tutorial" link is visible on all steps
- Clicking skip dismisses tutorial immediately
- Skip state is saved (tutorial won't show again)
- Analytics event fires with step number where skipped

---

### ST-123: Restart Tutorial Later

**Story**: As a user who skipped the tutorial, I want to restart it later, so that I can learn when I'm ready.

**Acceptance Criteria**: AC-3, AC-5

**Tasks**:
- **TSK-123-001**: Add "Show tutorial" option in Studio settings/menu
- **TSK-123-002**: Implement tutorial reset functionality
- **TSK-123-003**: Clear localStorage state when restarting
- **TSK-123-004**: Track restart analytics event
- **TSK-123-005**: Test restart works after completion and skip

**Dependencies**:
- Tutorial state management (ST-124)
- Studio page settings/menu (may need to add)

**Definition of Done**:
- Users can restart tutorial from settings or menu
- Restart clears previous completion state
- Tutorial starts from step 1 when restarted
- Analytics event fires on restart

---

### ST-124: Use Tutorial Components on Other Pages

**Story**: As a developer, I want to use reusable tutorial components, so that I can add tutorials to other pages easily.

**Acceptance Criteria**: AC-1

**Tasks**:
- **TSK-124-001**: Create `TutorialOverlay` component in `@ryla/ui`
- **TSK-124-002**: Create `TutorialPointer` component in `@ryla/ui`
- **TSK-124-003**: Create `useTutorial` hook in `@ryla/ui`
- **TSK-124-004**: Define TypeScript types for tutorial steps
- **TSK-124-005**: Export components from `@ryla/ui` index
- **TSK-124-006**: Write component documentation and usage examples
- **TSK-124-007**: Add responsive design (mobile + desktop)
- **TSK-124-008**: Add accessibility features (keyboard nav, screen readers)
- **TSK-124-009**: Test components in isolation
- **TSK-124-010**: Ensure components match design system

**Dependencies**: None (foundational)

**Definition of Done**:
- All tutorial components exist in `libs/ui/src/components/tutorial/`
- Components are exported from `@ryla/ui`
- Components are fully typed with TypeScript
- Components are responsive and accessible
- Components match RYLA design system (dark theme, purple/pink accents)
- Documentation includes usage examples

---

## Task Summary

| Task ID | Story | Description | Priority |
|---------|-------|-------------|----------|
| TSK-124-001 to TSK-124-010 | ST-124 | Create reusable tutorial components | P0 (foundational) |
| TSK-120-001 to TSK-120-005 | ST-120 | Studio tutorial implementation | P0 |
| TSK-121-001 to TSK-121-006 | ST-121 | Step navigation | P0 |
| TSK-122-001 to TSK-122-005 | ST-122 | Skip functionality | P1 |
| TSK-123-001 to TSK-123-005 | ST-123 | Restart functionality | P1 |

**Total Tasks**: 31

---

## Implementation Order

### Phase 1: Foundation (ST-124)
1. Create tutorial component library
2. Build reusable components
3. Export from `@ryla/ui`
4. Test in isolation

### Phase 2: Studio Integration (ST-120, ST-121)
1. Define Studio tutorial steps
2. Add data attributes to Studio UI
3. Integrate tutorial into Studio page
4. Test auto-start and navigation

### Phase 3: Polish (ST-122, ST-123)
1. Add skip functionality
2. Add restart functionality
3. Final testing and refinement

---

## Acceptance Criteria Mapping

| AC | Stories | Tasks |
|----|---------|-------|
| AC-1: Tutorial Components Library | ST-124 | TSK-124-001 to TSK-124-010 |
| AC-2: Tutorial Overlay UI | ST-121 | TSK-121-001 to TSK-121-006 |
| AC-3: Tutorial State Management | ST-121, ST-122, ST-123 | TSK-121-003, TSK-122-003, TSK-123-003 |
| AC-4: Studio Tutorial Steps | ST-120 | TSK-120-001, TSK-120-003 |
| AC-5: Studio Tutorial Behavior | ST-120, ST-122, ST-123 | TSK-120-002, TSK-120-004, TSK-122-001, TSK-123-001 |
| AC-6: Analytics Integration | All | Analytics events in each task |

---

## Analytics Events Mapping

| Event | Trigger Location | Task |
|-------|------------------|------|
| `tutorial_started` | Tutorial begins | TSK-120-002 |
| `tutorial_step_viewed` | Each step shown | TSK-121-001 |
| `tutorial_completed` | Tutorial finishes | TSK-121-001 |
| `tutorial_skipped` | User skips | TSK-122-002 |
| `tutorial_restarted` | User restarts | TSK-123-002 |

---

## Non-MVP Items (Phase 2+)

- Video tutorials
- Interactive tutorials (click-to-complete steps)
- Multi-page tutorials (spanning multiple routes)
- Personalized tutorials based on user behavior
- A/B testing different tutorial flows
- Tutorial analytics dashboard
- Admin UI for managing tutorials
- Tutorial templates/configurations stored in database
- Tutorial translations/i18n

---

## Dependencies

### External Dependencies
- `@ryla/ui` - Component library (must exist)
- `@ryla/analytics` - Analytics library (must exist)
- LocalStorage API - Browser API (always available)

### Internal Dependencies
- Studio page (EP-005) - Target page for first implementation
- User authentication (EP-002) - For user-specific tutorial state (optional)

### Blocking Dependencies
- None - Tutorial components can be built independently

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Tutorial components too complex | High | Start simple, iterate. Use existing UI patterns. |
| Pointer positioning inaccurate | Medium | Test on multiple screen sizes. Use viewport calculations. |
| Tutorial interferes with page usage | Medium | Ensure overlay doesn't block critical actions. Add skip option. |
| Performance impact | Low | Use React.memo, lazy loading. Test with many steps. |
| Mobile experience poor | Medium | Mobile-first design. Test on real devices. |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tutorial completion rate | >70% | Analytics: `tutorial_completed` / `tutorial_started` |
| Tutorial skip rate | <20% | Analytics: `tutorial_skipped` / `tutorial_started` |
| Feature discovery improvement | +40% | Compare feature usage with/without tutorial |
| Time to first action | -30% | Compare time to generate first image |
| Studio feature usage | +50% | Track usage of advanced features after tutorial |

---

## Next Phase: P3 - Architecture

After Phase 2 completion, move to Phase 3 to define:
- Component architecture (file structure)
- Data model (tutorial state storage)
- API contracts (if any backend needed)
- Event schema (analytics events)
- Integration points (Studio page, settings)

---

## Phase 2 Completion Checklist

- [x] Feature list complete
- [x] Epic created (EP-024)
- [x] Acceptance criteria defined (AC-1 to AC-6)
- [x] Analytics events defined
- [x] User stories defined (ST-120 to ST-124)
- [x] Stories broken down into tasks (31 tasks)
- [x] Task dependencies identified
- [x] Implementation order defined
- [x] Non-MVP items listed
- [x] Risks identified
- [x] Success metrics defined

**Phase 2 Status**: ✅ Complete

**Ready for Phase 3**: Architecture & API Design

