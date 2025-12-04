# Way of Work

## Communication Principles

### Efficiency First
- Every message = cost (human time / AI tokens)
- Be concise, not verbose
- No unnecessary communication
- Async by default, sync when blocked

### Documentation Style
- On point, not full sentences
- Keep detail needed for clarity
- Bullet points > paragraphs
- Examples > explanations

### Writing Format

**Good:**
```
- Auth: JWT tokens, 24h expiry
- Storage: PostgreSQL, Redis cache
- Deploy: GitHub Actions → Vercel
```

**Bad:**
```
We will be using JWT tokens for authentication with a 24-hour
expiry time. For storage, we have decided to go with PostgreSQL
as our primary database and Redis for caching purposes...
```

## Task Management

### Issue Writing
```
Title: [TYPE] Short description

Context:
- Current: [what exists]
- Problem: [what's wrong]
- Goal: [what we need]

Acceptance:
- [ ] Criteria 1
- [ ] Criteria 2

Notes:
- Technical considerations
- Dependencies
```

### Commit Messages
- One line, max 72 chars
- Start with type prefix
- Present tense, imperative mood
- Reference issue if applicable

### PR/MR Descriptions
- What changed (bullet points)
- Why it changed
- How to test
- Screenshots if UI

## Meetings

### When to Meet
- Blocked > 30 minutes
- Complex decision needed
- Multiple stakeholders affected
- Design review required

### When NOT to Meet
- Status updates (use async)
- Simple questions (use Slack)
- Code review (use GitHub)
- Documentation (write it down)

## Decision Making

### RAPID Framework (Simplified)
- **R**ecommend: Who proposes
- **A**gree: Who must sign off
- **P**erform: Who executes
- **I**nput: Who provides info
- **D**ecide: Who has final say

### Default: Bias to Action
- If reversible → decide and move
- If irreversible → gather input, then decide
- Document decisions in GitHub issues

## Knowledge Management

### Where Things Live
| Type | Location |
|------|----------|
| Code | GitHub repo |
| Docs | `/docs` folder |
| Decisions | GitHub issues/discussions |
| Learnings | `#learnings` Slack → GitHub |
| Audit log | `#audit` Slack |

### Learning Loop
1. Do the work
2. Note what worked/didn't
3. Post to `#learnings`
4. Weekly: consolidate to docs
5. Update processes

## Daily Workflow

### Start of Day
1. Check blocked items
2. Review PR requests
3. Pick highest priority task
4. Update status if needed

### End of Day
1. Commit/push work in progress
2. Update task status
3. Note blockers for tomorrow
4. Log learnings if any

## Code Reviews

### Reviewer Checklist
- [ ] Works as described
- [ ] Tests pass
- [ ] No obvious bugs
- [ ] Follows conventions
- [ ] No security issues

### Response Times
- PR review: < 24h
- Blocking questions: < 4h
- Non-blocking: < 24h

