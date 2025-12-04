# MVP Principles

## Core Philosophy
Build fast, validate early, iterate based on data.

## Development Principles

### 1. Mobile First
- Design for mobile screens first
- Progressive enhancement for larger screens
- Touch-friendly interactions as default

### 2. Universal Compatibility
- Target >98% browser/device support
- Use widely-supported technologies only
- Graceful degradation for edge cases
- Test on real devices, not just emulators

### 3. Pareto Focus (80/20 Rule)
- 80% of value from 20% of features
- Prioritize functionality over aesthetics
- Business value > cool animations
- Time to first result > perfect UX

### 4. Speed to Value
- Ship working features fast
- Minimal viable, not minimal broken
- User sees value immediately
- Reduce time-to-first-interaction

### 5. Data-Driven Decisions
- Measure before optimizing
- PostHog analytics from day one
- Funnel tracking for key flows
- A/B test assumptions

## Technical Constraints

### Must Have
- Works on all modern browsers (Chrome, Safari, Firefox, Edge)
- Mobile responsive (iOS Safari, Android Chrome)
- Page load < 3 seconds
- Core functionality works offline-first where possible

### Avoid
- Bleeding-edge APIs (< 95% support)
- Heavy JavaScript frameworks for simple features
- Complex animations that slow performance
- Features that require specific browser extensions

## Decision Framework

When evaluating features/approaches:

```
1. Does this solve a user problem?
   - No → Don't build
   - Yes → Continue

2. Is this the simplest solution?
   - No → Simplify
   - Yes → Continue

3. Can we ship in < 1 week?
   - No → Break down smaller
   - Yes → Build it

4. Can we measure success?
   - No → Define metrics first
   - Yes → Ship and track
```

## MVP Scope Boundaries

### In Scope
- Core user flow (problem → solution)
- Basic authentication
- Essential data persistence
- Analytics tracking
- Error handling

### Out of Scope (Phase 2+)
- Advanced customization
- Complex integrations
- Performance optimization beyond basics
- Comprehensive admin features
- Multi-language support

