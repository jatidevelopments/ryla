# Epic Requirements Prompt

Use this to generate P1 requirements document.

---

## Prompt

```
Generate a requirements document for: [EPIC DESCRIPTION]

Before generating, reason through this step by step:

UNDERSTAND: What problem are we solving? Who has it? Why does it matter?
ANALYZE: What are the key constraints, dependencies, and success factors?
REASON: How do user needs, technical constraints, and business goals interact?
SYNTHESIZE: What is the minimum viable solution that validates the hypothesis?
CONCLUDE: What should the requirements document contain?

Now generate the requirements document following this structure:

# EP-XXX: [Epic Name] - Requirements

## Problem Statement
What problem are we solving? Who has it? Why does it matter?

## MVP Objective
What is the minimum we need to build to validate?

## Non-Goals
What are we explicitly NOT building in this epic?

## Business Metric
Which metric does this move? (A/B/C/D/E)
- [ ] A - Activation
- [ ] B - Retention
- [ ] C - Core Value
- [ ] D - Conversion
- [ ] E - CAC

## Hypothesis
When we [change], users will [behavior], measured by [metric] improving by [X%].

## Success Criteria
- Metric X improves by Y%
- Funnel step A → B improves by Z%

## Constraints
- Mobile first
- >98% browser compatibility
- Ship in < 1 week

## Dependencies
- [List any blockers or dependencies]

## Open Questions
- [Questions to resolve before P2]
```

---

## Example Output

```markdown
# EP-001: User Authentication - Requirements

## Problem Statement
Users cannot access the app without authentication. No way to persist user data or personalize experience.

## MVP Objective
Email/password signup and login. Session persistence. Basic profile.

## Non-Goals
- Social login (OAuth)
- 2FA
- Password recovery (manual for MVP)
- Email verification (trust for MVP)

## Business Metric
- [x] A - Activation

## Hypothesis
When we add authentication, users will complete signup and return, measured by D7 retention improving from 0% to 30%.

## Success Criteria
- 50%+ signup completion rate
- 30%+ D7 return rate
- < 60s time to signup

## Constraints
- Mobile first
- >98% browser compatibility
- Ship in 5 days

## Dependencies
- Database setup (done)
- Email service (not needed for MVP)

## Open Questions
- Password requirements?
- Session duration?
```
