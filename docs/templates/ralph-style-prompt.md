# [Feature Name] - Iterative Development Prompt

**Use this template when implementing complex features that require iterative development.**

---

## Task Overview

**Feature**: [Feature Name]
**Epic**: EP-XXX
**Story**: ST-XXX
**Phase**: P6 (Implementation)

---

## Completion Conditions

**Task is ONLY complete when ALL of the following are true**:

- [ ] **Tests**: All tests in `[test-file-paths]` pass
  - Functional tests: [X] passing
  - Integration tests: [X] passing
  - E2E tests: [X] passing (if applicable)

- [ ] **Screenshots** (if UI feature): All screenshots in `[screenshot-folder]` verified
  - Total screenshots: [N]
  - Verified: [N]
  - Issues found: [List]

- [ ] **Code Quality**: 
  - [ ] No TypeScript errors
  - [ ] No linter errors
  - [ ] No console errors in browser

- [ ] **Acceptance Criteria**: All met
  - [ ] AC 1: [Description]
  - [ ] AC 2: [Description]
  - [ ] AC 3: [Description]

- [ ] **Integration**: 
  - [ ] Doesn't break existing functionality
  - [ ] All related tests still pass
  - [ ] No regression issues

---

## Max Iterations

**Limit**: [N] iterations
- Simple feature: 5
- Complex feature: 10
- Critical feature: 15

**Current**: Iteration [0]

---

## Current Status

### Tests
- Passing: [0/X]
- Failing: [X]
- Test files: `[list test files]`

### Screenshots (if UI)
- Total: [N]
- Verified: [0]
- Folder: `[path]`

### Issues
- [List any known issues]

---

## Workflow

### Step 1: Write Tests First (TDD)
- Create/update test files
- Tests should fail initially (expected)
- Tests define requirements

### Step 2: Implement Code
- Write minimum code to pass tests
- Small, focused changes
- One concern at a time

### Step 3: Run Verification
```bash
# Run tests
pnpm nx test [project]

# Check linter
pnpm nx lint [project]

# Type check
pnpm nx type-check [project]  # if available
```

### Step 4: Verify Screenshots (if UI)
- Review all screenshots in folder
- Mark verified: Add "verified" prefix to filename
- Document issues found
- **First iteration**: Mark screenshots, DON'T complete yet
- **Second iteration**: Confirm all verified

### Step 5: Check Completion Conditions
- Review each condition above
- Document status
- List any issues

### Step 6: Decision
- **If ALL conditions met**: Output "✅ TASK COMPLETE - All conditions met"
- **If conditions NOT met**: Continue to next iteration
- **If max iterations reached**: Document what's missing and escalate

---

## State Tracking

### Iteration [N]

**Status**:
- Tests: [X/Y] passing
- Screenshots: [X/Y] verified
- Linter: [Errors/None]
- Issues: [List]

**Changes Made**:
- [Change 1]
- [Change 2]

**Next Steps**:
- [Action 1]
- [Action 2]

---

## Files to Create/Modify

### Test Files
- `[test-file-1]` - [Purpose]
- `[test-file-2]` - [Purpose]

### Implementation Files
- `[file-1]` - [Purpose]
- `[file-2]` - [Purpose]

### Screenshot Folder (if UI)
- `[screenshot-folder]/` - UI verification screenshots

---

## Acceptance Criteria Reference

[Link to or paste acceptance criteria from epic/story]

---

## Notes

[Any additional context, constraints, or considerations]

---

## Completion Statement

**Only output this when ALL conditions are met**:

```
✅ TASK COMPLETE - All conditions met

- Iteration: [N]
- Tests: All [X] passing
- Screenshots: All [N] verified
- Linter: No errors
- Acceptance Criteria: All met
- Files Modified: [List]
```

---

## Related Documentation

- Epic: `docs/requirements/epics/[epic-file].md`
- Story: `docs/requirements/epics/[story-file].md`
- Testing: `docs/testing/BEST-PRACTICES.md`
- Iterative Pattern: `.cursor/rules/ralph.mdc` (use `@ralph` to reference)
