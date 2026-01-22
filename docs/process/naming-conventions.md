# Naming Conventions

## Issue IDs

| Type | Format | Example |
|------|--------|---------|
| Epic | EP-XXX | EP-001 |
| Story | ST-XXX | ST-010 |
| Task | TSK-XXX | TSK-120 |
| Bug | BUG-XXX | BUG-015 |

---

## Git Branches

```
<type>/<id>-<short-description>
```

| Type | Use Case | Example |
|------|----------|---------|
| `epic` | Epic work | `epic/ep-001-user-auth` |
| `feat` | Feature/story | `feat/st-010-login-form` |
| `fix` | Bug fix | `fix/bug-015-null-check` |
| `refactor` | Code restructure | `refactor/tsk-120-api-cleanup` |
| `docs` | Documentation | `docs/ep-001-requirements` |

---

## Commits

```
<type>(<epic> <story>): <description>
```

**Examples:**
```
feat(ep-001 st-010): add login form validation
fix(ep-001 st-012): handle null user response
refactor(ep-002): simplify auth middleware
docs(ep-001): update requirements
test(st-010): add login integration tests
```

---

## GitHub Issues

### Epic
```
[EPIC] EP-XXX: Title

## Business Impact
**Target Metric**: [ ] A [ ] B [ ] C [ ] D [ ] E
**Hypothesis**: ...

## Scope
- ST-XXX: Story 1
- ST-XXX: Story 2

## Acceptance Criteria
- [ ] AC 1
- [ ] AC 2

## Analytics AC
- [ ] Event X fires on action Y
- [ ] Funnel Z shows step A → B
```

### Story
```
[STORY] ST-XXX: Title (EP-XXX)

## Context
Parent: EP-XXX

## Tasks
- [ ] TSK-XXX: Task 1
- [ ] TSK-XXX: Task 2

## Acceptance Criteria
- [ ] AC 1

## Analytics AC
- [ ] Event fires
```

### Task
```
[TASK] TSK-XXX: Title (ST-XXX)

## Work
- What to do

## Done When
- [ ] Criteria met
```

---

## Slack Messages

### Channels
```
#mvp-ryla-pm      → Project management
#mvp-ryla-dev     → Development discussion
#mvp-ryla-log     → Audit only (read-only)
#mvp-ryla-learnings → Knowledge capture
```

### Event Formats
```
[EVENT=PR_MERGED] repo=ryla issues=EP-001,ST-010 phase=P6 author=@user
[EVENT=DEPLOY] env=staging version=v1.2.3 status=success
[EVENT=TEST_FAILED] suite=e2e test=login count=2
[EVENT=FUNNEL_DROP] funnel=activation step=signup→core drop=15%
```

### Learnings
```
LEARNING area=testing source=playwright text="mock external APIs at boundary"
LEARNING area=analytics source=posthog text="track time_to_first_action"
```

### Status
```
STATUS: EP-001 ST-010 phase=P6 status=in-progress
BLOCKED: ST-010 reason="waiting on API spec"
DONE: ST-010 summary="login form complete"
```

---

## Files

### Code
```
kebab-case.ts
```
Examples: `user-service.ts`, `auth-middleware.ts`

### Documentation
```
UPPER-CASE.md (root docs)
EP-XXX-description.md (epic-specific)
```

### Tests
```
<name>.test.ts (unit)
<name>.spec.ts (integration)
<name>.e2e.ts (playwright)
```

---

## Database

| Type | Convention | Example |
|------|------------|---------|
| Tables | snake_case plural | `users`, `user_sessions` |
| Columns | snake_case | `created_at`, `user_id` |
| Indexes | `idx_<table>_<cols>` | `idx_users_email` |

---

## Environment Variables

```
<CATEGORY>_<NAME>=value

DB_HOST=localhost
API_SECRET_KEY=xxx
ANALYTICS_POSTHOG_KEY=xxx
SLACK_WEBHOOK_LOG=xxx
```
