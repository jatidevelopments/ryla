# Naming Conventions

## Purpose
Consistent naming enables MCP tools to parse and automate workflows.

---

## Git Branches

### Format
```
<type>/<issue-id>-<short-description>
```

### Types
| Type | Use Case |
|------|----------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactor |
| `docs` | Documentation |
| `test` | Tests |
| `chore` | Maintenance |
| `hotfix` | Production fix |

### Examples
```
feat/RYLA-42-user-auth
fix/RYLA-103-login-redirect
refactor/RYLA-55-api-cleanup
docs/RYLA-12-readme-update
hotfix/RYLA-200-payment-crash
```

---

## Commits

### Format
```
<type>(<scope>): <description> [#issue-id]
```

### Rules
- Lowercase type
- Scope optional (layer/module)
- Description: imperative, present tense
- Max 72 characters total
- Reference issue at end

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code restructure |
| `docs` | Documentation |
| `test` | Add/update tests |
| `chore` | Maintenance |
| `style` | Formatting |
| `perf` | Performance |
| `ci` | CI/CD changes |

### Examples
```
feat(auth): add JWT token validation [#RYLA-42]
fix(api): handle null user response [#RYLA-103]
refactor(data): simplify repository pattern
docs: update API documentation
test(business): add payment service tests
chore: update dependencies
```

---

## GitHub Issues

### Title Format
```
[TYPE] Short description
```

### Types
| Type | Use Case |
|------|----------|
| `[FEATURE]` | New functionality |
| `[BUG]` | Something broken |
| `[TASK]` | General work item |
| `[EPIC]` | Large feature set |
| `[SPIKE]` | Research/investigation |
| `[DOCS]` | Documentation |
| `[INFRA]` | Infrastructure |

### Examples
```
[FEATURE] User authentication flow
[BUG] Login fails on Safari mobile
[TASK] Setup PostHog analytics
[EPIC] Payment processing system
[SPIKE] Evaluate caching strategies
```

### Labels
```
priority:critical
priority:high
priority:medium
priority:low

layer:presentation
layer:business
layer:data
layer:management

status:blocked
status:in-progress
status:review
status:done

type:feature
type:bug
type:task
type:epic
```

---

## Slack Messages

### Channel Naming
```
#ryla-<purpose>
```

| Channel | Purpose |
|---------|---------|
| `#ryla-dev` | Development discussion |
| `#ryla-pm` | Project management |
| `#ryla-audit` | Automated audit logs |
| `#ryla-learnings` | Knowledge capture |
| `#ryla-alerts` | System alerts |
| `#ryla-deploys` | Deployment notifications |

### Message Formats (for MCP parsing)

#### Status Updates
```
STATUS: [issue-id] [status]
Example: STATUS: RYLA-42 in-progress
```

#### Blockers
```
BLOCKED: [issue-id] [reason]
Example: BLOCKED: RYLA-42 waiting on API spec
```

#### Completed
```
DONE: [issue-id] [summary]
Example: DONE: RYLA-42 user auth implemented
```

#### Learnings
```
LEARNING: [category] [insight]
Example: LEARNING: testing - mock external APIs at service boundary
```

#### Deploy
```
DEPLOY: [env] [version] [status]
Example: DEPLOY: staging v1.2.3 success
```

---

## File Naming

### Code Files
```
kebab-case.ts
```
Examples: `user-service.ts`, `auth-middleware.ts`

### Test Files
```
<filename>.test.ts
<filename>.spec.ts
```
Examples: `user-service.test.ts`, `auth.spec.ts`

### Documentation
```
UPPER_CASE.md (root docs)
kebab-case.md (detailed docs)
```
Examples: `README.md`, `api-reference.md`

---

## Database

### Tables
```
snake_case (plural)
```
Examples: `users`, `user_sessions`, `payment_transactions`

### Columns
```
snake_case
```
Examples: `created_at`, `user_id`, `is_active`

### Indexes
```
idx_<table>_<columns>
```
Examples: `idx_users_email`, `idx_orders_user_id_status`

---

## Environment Variables

### Format
```
UPPER_SNAKE_CASE
```

### Prefixes
| Prefix | Purpose |
|--------|---------|
| `DB_` | Database |
| `API_` | API keys |
| `AUTH_` | Authentication |
| `ANALYTICS_` | Analytics |
| `SLACK_` | Slack integration |
| `GITHUB_` | GitHub integration |

### Examples
```
DB_HOST=localhost
DB_PORT=5432
API_SECRET_KEY=xxx
AUTH_JWT_SECRET=xxx
ANALYTICS_POSTHOG_KEY=xxx
SLACK_WEBHOOK_URL=xxx
```

