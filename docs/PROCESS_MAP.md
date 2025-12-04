# Process Map

## Overview
Development lifecycle from requirements to production.

---

## Phase 1: Requirements

### 1.1 Capture Requirements
```
INPUT:  User need / business goal
OUTPUT: GitHub Issue [FEATURE] or [EPIC]
```
- Create issue with context, problem, goal
- Define acceptance criteria
- Add labels: priority, layer, type
- Notify: `#ryla-pm`

### 1.2 Break Down Epic
```
INPUT:  [EPIC] issue
OUTPUT: Multiple [FEATURE] or [TASK] issues
```
- Split into implementable chunks
- Each task < 1 week
- Link child issues to epic
- Define dependencies

---

## Phase 2: Design

### 2.1 Technical Design
```
INPUT:  [FEATURE] issue
OUTPUT: Design notes in issue comments
```
- Architecture decisions
- Data model changes
- API contracts
- Dependencies identified

### 2.2 Acceptance Criteria
```
INPUT:  Design notes
OUTPUT: Testable acceptance criteria
```
- [ ] Specific, measurable outcomes
- [ ] Edge cases covered
- [ ] Error scenarios defined

---

## Phase 3: Implementation

### 3.1 Branch Creation
```
INPUT:  Issue ready for dev
OUTPUT: Feature branch
```
- Branch: `feat/RYLA-XX-description`
- Status: `STATUS: RYLA-XX in-progress`

### 3.2 Development
```
INPUT:  Feature branch
OUTPUT: Committed code
```
- Follow layer architecture
- Write tests alongside code
- Commit: `feat(scope): description [#RYLA-XX]`

### 3.3 Local Testing
```
INPUT:  Implemented feature
OUTPUT: Passing tests
```
- Unit tests pass
- Integration tests pass
- Manual smoke test

---

## Phase 4: Review

### 4.1 Pull Request
```
INPUT:  Completed feature branch
OUTPUT: PR ready for review
```
- PR template filled
- Screenshots if UI
- Tests included
- Linked to issue

### 4.2 Code Review
```
INPUT:  PR submitted
OUTPUT: Approved or changes requested
```
- Reviewer checklist completed
- Feedback addressed
- Tests pass in CI

---

## Phase 5: Testing

### 5.1 Automated Tests
```
INPUT:  Merged code
OUTPUT: CI test results
```
- Unit tests (business layer)
- Integration tests (layer interactions)
- E2E tests (Playwright)

### 5.2 Staging Deploy
```
INPUT:  Passing tests
OUTPUT: Staging environment updated
```
- Auto-deploy to staging
- Notify: `DEPLOY: staging vX.X.X success`

### 5.3 QA Validation
```
INPUT:  Staging deployment
OUTPUT: QA sign-off
```
- Acceptance criteria verified
- Regression check
- Analytics events firing

---

## Phase 6: Analytics

### 6.1 Event Verification
```
INPUT:  Feature in staging
OUTPUT: PostHog events confirmed
```
- Track key user actions
- Funnel steps recorded
- Error events captured

### 6.2 Baseline Metrics
```
INPUT:  Analytics events
OUTPUT: Pre-launch metrics baseline
```
- Document current state
- Define success criteria
- Set up alerts

---

## Phase 7: Production

### 7.1 Production Deploy
```
INPUT:  QA approved
OUTPUT: Live in production
```
- Deploy via GitHub Actions
- Notify: `DEPLOY: production vX.X.X success`
- Monitor error rates

### 7.2 Verification
```
INPUT:  Production deployment
OUTPUT: Confirmed working
```
- Smoke test in production
- Check analytics flowing
- Monitor alerts

### 7.3 Close Issue
```
INPUT:  Verified in production
OUTPUT: Issue closed
```
- Update issue status
- Notify: `DONE: RYLA-XX description`
- Archive branch

---

## Phase 8: Learn

### 8.1 Capture Learnings
```
INPUT:  Completed feature
OUTPUT: Learning documented
```
- What worked well
- What didn't
- Process improvements
- Post to `#ryla-learnings`

### 8.2 Update Docs
```
INPUT:  Learnings captured
OUTPUT: Documentation updated
```
- Update relevant docs
- Add to knowledge base
- Improve processes

---

## Sub-Processes

### Bug Fix Process
```
1. [BUG] issue created
2. Reproduce locally
3. Write failing test
4. Fix code
5. Verify test passes
6. PR → Review → Merge
7. Deploy → Verify
8. Close issue
```

### Hotfix Process
```
1. [BUG] priority:critical
2. Branch: hotfix/RYLA-XX-description
3. Fix + test
4. Fast-track review
5. Deploy to production immediately
6. Backport to main
7. Post-mortem if needed
```

### Spike/Research Process
```
1. [SPIKE] issue created
2. Time-boxed research (1-3 days)
3. Document findings in issue
4. Recommendation made
5. Follow-up issues created
6. Close spike
```

---

## Process Metrics

| Metric | Target |
|--------|--------|
| Issue → In Progress | < 2 days |
| In Progress → PR | < 5 days |
| PR → Merged | < 1 day |
| Merged → Production | < 1 day |
| Cycle Time (total) | < 1 week |

