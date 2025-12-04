# AI Heuristics

Learnings that improve agent behavior. Updated from Slack → GitHub.

---

## Architecture

- Keep layers separate: presentation → business → data
- Never skip layers for "convenience"
- Management layer can access all layers

## Code

- One file, one purpose
- Functions < 30 lines
- Max 3 nesting levels
- Explicit error handling, no swallowing

## Testing

- Mock external APIs at service boundary, not in tests
- Test business logic first, presentation later
- E2E tests for critical paths only
- Analytics verification in Playwright

## Analytics

- Track time_to_first_action for activation
- Every user-facing error → error.occurred event
- Funnel drops > 20% = immediate investigation

## Communication

- Status updates in Slack, not meetings
- Blockers posted within 30 min of discovery
- Learnings posted same day

## Process

- No phase skipped in 10-phase pipeline
- Small PRs (< 400 lines)
- Review within 24h

## Decisions

- Fast if reversible
- Document if irreversible (ADR)
- Data > opinions

---

## Adding Heuristics

```
LEARNING area=<area> source=<source> text="<insight>"
```

Areas: architecture, code, testing, analytics, communication, process, decisions

Sources: playwright, posthog, review, incident, discussion

