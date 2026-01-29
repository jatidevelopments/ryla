---
name: epic-implementation
description: Implements complete epics following RYLA's 10-phase pipeline. Use when starting work on EP-XXX epics, implementing features, or when the user mentions epic implementation, feature development, or following the pipeline.
---

# Epic Implementation

Implements complete epics following RYLA's 10-phase development pipeline. This skill guides you through the systematic process from requirements to production validation.

## Quick Start

When implementing an epic:

1. **Check Initiative Context** - Read initiative document if epic is part of one
2. **Follow 10-Phase Pipeline** - Complete each phase before moving to next
3. **State Current Phase** - Always declare which phase you're in
4. **Validate Incrementally** - Check work after each step
5. **Update Status** - Update epic/initiative status as you progress

## Workflow

### Step 1: Task Understanding

**Before starting:**

1. **Identify task type:**
   - Initiative (IN-XXX) - Strategic business goal spanning multiple epics
   - Epic (EP-XXX) - Large feature
   - Story (ST-XXX) - Feature component
   - Task (TSK-XXX) - Specific implementation
   - Bug fix (BUG-XXX)
   - Refactoring
   - Documentation

2. **State current context:**
   ```
   Working in PHASE X – [NAME] on Epic EP-XXX, Story ST-XXX.
   Task: [Brief description]
   ```

3. **Gather required inputs:**
   - If working on Epic/Story: Check if part of Initiative (IN-XXX)
     - Read initiative document to understand "why" and success criteria
     - Ensure work aligns with initiative goals
   - Read related documentation (initiative, epic, story, architecture docs)
   - Review acceptance criteria
   - Check existing code patterns
   - Identify dependencies
   - List what you have vs. what's missing

4. **Stop if missing inputs:**
   - If inputs missing → STOP and ask user
   - Never guess or assume
   - List exactly what's needed

### Step 2: Task Breakdown

1. **Identify subtasks:**
   - List all steps required
   - Order by dependencies
   - Estimate complexity per step

2. **Identify files to change:**
   - Files to create
   - Files to modify
   - Files to review (for context)

3. **Identify dependencies:**
   - What needs to be done first?
   - What blocks this task?
   - What other tasks depend on this?

4. **Create execution plan:**
   ```
   Plan:
   1. [Step 1] - [Files affected]
   2. [Step 2] - [Files affected]
   3. [Step 3] - [Files affected]
   ```

### Step 3: Implementation

**For each sub-task:**

1. **Implement small changes:**
   - One concern at a time
   - Focused, atomic changes
   - No giant rewrites

2. **Validate incrementally:**
   - Check TypeScript types after each change
   - Verify imports resolve
   - Test logic in isolation when possible

3. **Handle edge cases:**
   - Consider null/undefined values
   - Handle error states
   - Validate inputs
   - Check boundary conditions

4. **Follow patterns:**
   - Use existing code patterns
   - Follow architecture layers
   - Apply relevant Cursor rules
   - Maintain consistency

### Step 4: Quality Checks

**Before marking complete:**

1. **Type safety:**
   - No TypeScript errors
   - All types properly defined
   - No `any` types (unless explicitly needed)

2. **Code quality:**
   - No linter errors
   - Follows code style guidelines
   - Proper error handling
   - No console.logs (use proper logging)

3. **Architecture compliance:**
   - Follows layered architecture (Apps → Business → Data)
   - No layer skipping
   - Proper imports (`@ryla/<lib>`)

4. **Testing:**
   - Critical paths have tests
   - Tests pass
   - Edge cases covered

5. **Documentation:**
   - Code is self-documenting
   - Complex logic has comments
   - Updated relevant docs if needed

### Step 5: Self-Review

**Systematic review checklist:**

1. **Functionality:**
   - [ ] Code works as expected
   - [ ] Edge cases handled
   - [ ] Error handling implemented
   - [ ] No breaking changes (or documented)

2. **Code quality:**
   - [ ] Follows style guidelines
   - [ ] No code duplication
   - [ ] Proper abstractions
   - [ ] Comments for complex logic

3. **Type safety:**
   - [ ] No TypeScript errors
   - [ ] Types properly defined
   - [ ] No implicit any

4. **Architecture:**
   - [ ] Follows layered architecture
   - [ ] No layer violations
   - [ ] Proper separation of concerns

5. **Testing:**
   - [ ] Tests added/updated
   - [ ] Tests pass
   - [ ] Coverage maintained

### Step 6: Acceptance Criteria Validation

**Check each acceptance criterion:**

```
[ACCEPTANCE CRITERIA STATUS]
1. {Criterion}: ✅/⚠️/❌ – [explanation]
2. {Criterion}: ✅/⚠️/❌ – [explanation]
3. {Criterion}: ✅/⚠️/❌ – [explanation]
```

**Status meanings:**
- ✅ Complete - Criterion fully met
- ⚠️ Partial - Criterion partially met, explain what's missing
- ❌ Not Met - Criterion not met, explain why and what's needed

**If criteria cannot be met:**
- State why clearly
- List what's missing
- Suggest alternatives if applicable
- Never mark complete if criteria not met

### Step 7: Completion

**Only mark complete when:**

1. **All quality checks pass:**
   - TypeScript: No errors
   - Linter: No errors
   - Tests: All passing
   - Architecture: Compliant

2. **All acceptance criteria met:**
   - All criteria marked ✅
   - No ⚠️ or ❌ statuses

3. **Documentation updated:**
   - Code comments added
   - Relevant docs updated
   - README updated if needed

4. **Next steps identified:**
   - Clear next action or phase
   - Dependencies documented
   - Blockers identified (if any)

## 10-Phase Pipeline Reference

This skill implements the 10-phase pipeline. Reference `pipeline-enforcement.mdc` rule for phase details:

- **P1-P2**: Requirements & Scoping
- **P3**: Architecture
- **P4**: UI Skeleton
- **P5**: Technical Spec
- **P6**: Implementation (this skill)
- **P7**: Testing & QA
- **P8**: Integration
- **P9**: Deployment Prep
- **P10**: Production Validation

**Always state current phase:**
```
Working in PHASE X – [NAME] on Epic EP-XXX, Story ST-XXX.
```

## Task Type Workflows

### New Feature (Epic/Story)

1. **Check initiative context:**
   - If epic is part of initiative: Read initiative document first
   - Understand the "why" and success criteria
   - Ensure epic contributes to initiative goals

2. **Follow 10-Phase Pipeline:**
   - Start at appropriate phase
   - Complete phase outputs before moving to next
   - Never skip phases

3. **Architecture first:**
   - Design data model
   - Define API contracts
   - Plan component structure

4. **Implementation:**
   - Start with data layer → business logic → presentation layer
   - Follow Apps → Business → Data flow
   - Use Infisical for secrets (see `infisical.mdc` rule)

5. **Testing:**
   - Write tests as you go (TDD when applicable)
   - Test critical paths
   - Verify analytics events

### Bug Fix

1. **Reproduce bug:**
   - Understand the issue
   - Identify root cause
   - Create test case that reproduces bug

2. **Fix:**
   - Implement minimal fix
   - Don't refactor unnecessarily
   - Fix root cause, not symptoms

3. **Verify:**
   - Test case now passes
   - No regressions introduced
   - Edge cases handled

### Refactoring

1. **Identify scope:**
   - What needs refactoring?
   - Why? (maintainability, performance, etc.)
   - What's the target state?

2. **Plan refactoring:**
   - Break into small steps
   - Ensure tests exist first
   - Refactor incrementally

3. **Verify:**
   - All tests still pass
   - Functionality unchanged
   - Code quality improved

## Quality Gates

**Gate 1: Input Validation**
- ✅ All required inputs available
- ✅ Task clearly understood
- ✅ Dependencies identified

**Gate 2: Planning**
- ✅ Task broken down
- ✅ Files identified
- ✅ Execution plan created

**Gate 3: Implementation**
- ✅ Code implemented
- ✅ Incremental validation done
- ✅ Edge cases handled

**Gate 4: Quality**
- ✅ TypeScript: No errors
- ✅ Linter: No errors
- ✅ Tests: Passing
- ✅ Architecture: Compliant

**Gate 5: Acceptance**
- ✅ All AC met
- ✅ Self-review complete
- ✅ Documentation updated

## Handling Blockers

**When you encounter a blocker:**

1. **Identify blocker:**
   - What's blocking progress?
   - Why is it blocking?
   - What's needed to unblock?

2. **Document blocker:**
   ```
   BLOCKER: [Description]
   Reason: [Why it's blocking]
   Required: [What's needed]
   Workaround: [If any]
   ```

3. **Escalate if needed:**
   - If blocker requires user input → ask user
   - If blocker requires external dependency → document and continue other work
   - If blocker is architectural → discuss with team

4. **Continue other work:**
   - Work on unblocked parts
   - Don't wait idly
   - Make progress where possible

## Completion Checklist

**Before marking any task complete:**
- [ ] All required inputs were available
- [ ] Task was broken down properly
- [ ] Implementation follows patterns
- [ ] TypeScript: No errors
- [ ] Linter: No errors
- [ ] Tests: All passing
- [ ] Architecture: Compliant
- [ ] Self-review: Complete
- [ ] Acceptance criteria: All met
- [ ] Documentation: Updated
- [ ] Next steps: Identified
- [ ] No blockers remaining

## Best Practices

- **Start small** - Break tasks into smallest possible units
- **Validate often** - Check work incrementally
- **Ask early** - Don't wait until stuck to ask questions
- **Document decisions** - Explain why, not just what
- **Follow patterns** - Use existing code as reference
- **Test critical paths** - Ensure main flows work
- **Handle edge cases** - Consider null, empty, error states
- **Review systematically** - Use checklists, don't skip steps

## Related Resources

- **Pipeline Details**: See `pipeline-enforcement.mdc` rule for 10-phase pipeline
- **Process Documentation**: `docs/process/10-PHASE-PIPELINE.md`
- **Initiative Guidelines**: See `initiatives.mdc` rule
- **Architecture Patterns**: See `architecture.mdc` rule
- **Secrets Management**: See `infisical.mdc` rule
