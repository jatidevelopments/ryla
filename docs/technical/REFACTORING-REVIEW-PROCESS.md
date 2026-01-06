# Refactoring Review Process

> **Purpose:** Standardize the review process for refactoring work to ensure quality and consistency

## Pre-Refactoring Checklist

Before starting any refactoring:

- [ ] **Read the file organization guide**: [FILE-ORGANIZATION-GUIDE.md](./FILE-ORGANIZATION-GUIDE.md)
- [ ] **Identify the problem**: What makes this code hard to maintain?
- [ ] **Check current structure**: Understand existing organization
- [ ] **Plan the refactoring**: Map out what will be extracted where
- [ ] **Document current behavior**: Ensure you understand what it does
- [ ] **Check for tests**: Are there existing tests? Will they need updates?

## Refactoring Steps

### Step 1: Analysis

**Questions to answer:**
1. What is the current file size?
2. How many responsibilities does it have?
3. What can be extracted? (components, hooks, utils, constants)
4. Where should extracted files live?
5. What dependencies exist?

**Document your findings:**
```markdown
## Refactoring Plan: [Component/Page Name]

**Current State:**
- File: `path/to/file.tsx`
- Lines: XXX
- Responsibilities: [list]

**Proposed Structure:**
- Components: [list]
- Hooks: [list]
- Utils: [list]
- Constants: [list]

**Target Reduction:** XXX → XXX lines (XX% reduction)
```

### Step 2: Extract Incrementally

**Order of extraction:**
1. **Constants** (easiest, no dependencies)
2. **Utilities** (pure functions, easy to test)
3. **Hooks** (state/logic, may depend on utils)
4. **Components** (UI, may depend on hooks/utils)

**After each extraction:**
- [ ] Verify functionality still works
- [ ] Check linter passes
- [ ] Update imports
- [ ] Test manually

### Step 3: Organize Files

**Create directory structure:**
```
[feature]/
├── components/     # If extracting components
├── hooks/          # If extracting hooks
├── utils/           # If extracting utilities
└── constants.ts     # If extracting constants
```

**Create barrel exports:**
- Always create `index.ts` files for easy imports
- Export all public APIs

### Step 4: Update Imports

**Check all imports:**
- [ ] Update relative imports
- [ ] Use barrel exports where possible
- [ ] Verify no circular dependencies
- [ ] Check TypeScript compilation

### Step 5: Verify

**Run checks:**
```bash
# Linter
nx lint web

# Type check
nx type-check web

# Build (if applicable)
nx build web
```

**Manual testing:**
- [ ] Test all user flows
- [ ] Check for visual regressions
- [ ] Verify functionality unchanged
- [ ] Test edge cases

## Post-Refactoring Review

### File Size Check

| File Type | Target | Max | Status |
|-----------|--------|-----|--------|
| Page Component | < 100 | 150 | [ ] |
| Feature Component | < 80 | 120 | [ ] |
| UI Component | < 60 | 100 | [ ] |
| Hook | < 100 | 150 | [ ] |
| Utility | < 50 | 100 | [ ] |

### Structure Check

- [ ] Files follow naming conventions
- [ ] Files are in correct locations
- [ ] Barrel exports exist (`index.ts`)
- [ ] No circular dependencies
- [ ] Related files are co-located

### Code Quality Check

- [ ] No linter errors
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Proper error handling
- [ ] Proper TypeScript types
- [ ] JSDoc comments where needed

### Functionality Check

- [ ] All features work as before
- [ ] No visual regressions
- [ ] Performance not degraded
- [ ] Edge cases handled
- [ ] Error states work

## Review Checklist Template

```markdown
## Refactoring Review: [Component/Page Name]

### Before
- File: `path/to/file.tsx`
- Lines: XXX
- Issues: [list]

### After
- Main file: `path/to/file.tsx` (XXX lines)
- Components: [list with line counts]
- Hooks: [list with line counts]
- Utils: [list with line counts]
- Constants: [list]

### Verification
- [ ] File sizes meet targets
- [ ] Structure follows patterns
- [ ] Linter passes
- [ ] TypeScript compiles
- [ ] Functionality verified
- [ ] No regressions

### Notes
[Any additional notes or concerns]
```

## Common Issues & Solutions

### Issue: File Still Too Large

**Solution:**
- Extract more sub-components
- Extract more hooks
- Consider if file has too many responsibilities

### Issue: Circular Dependencies

**Solution:**
- Move shared code to common location
- Use dependency injection
- Restructure to avoid cycles

### Issue: Import Paths Too Long

**Solution:**
- Use barrel exports (`index.ts`)
- Create aliases if needed
- Co-locate related files

### Issue: Tests Break

**Solution:**
- Update test imports
- Update test mocks
- Ensure test structure matches new structure

## Refactoring Best Practices

### Do's ✅

- Extract incrementally (one thing at a time)
- Test after each extraction
- Use barrel exports for clean imports
- Co-locate related files
- Follow naming conventions
- Document complex logic
- Maintain backward compatibility

### Don'ts ❌

- Don't extract everything at once
- Don't skip testing
- Don't create deep folder structures (> 3 levels)
- Don't mix concerns in extracted files
- Don't break existing functionality
- Don't ignore linter warnings
- Don't create circular dependencies

## Review Process

### Self-Review

Before requesting review:
1. Complete all checklists above
2. Run all checks (linter, type-check, build)
3. Test functionality manually
4. Document what was changed

### Peer Review

When requesting review, provide:
1. Summary of changes
2. Before/after file sizes
3. Structure diagram (if complex)
4. Testing notes
5. Any concerns or questions

### Review Criteria

Reviewer should check:
- [ ] Structure follows patterns
- [ ] File sizes meet targets
- [ ] Code quality is good
- [ ] Functionality is preserved
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)

## Examples

### ✅ Good Refactoring

**Before:**
```
app/studio/page.tsx (1,111 lines)
```

**After:**
```
app/studio/
├── page.tsx (127 lines)
├── components/ (4 components, ~50 lines each)
├── hooks/ (8 hooks, ~80 lines each)
└── utils/ (4 utils, ~30 lines each)
```

**Result:** 1,111 → 127 lines (89% reduction)

### ❌ Bad Refactoring

**Before:**
```
app/studio/page.tsx (1,111 lines)
```

**After:**
```
app/studio/
├── page.tsx (1,000 lines)  # Still too large
├── components/
│   └── OneComponent.tsx (111 lines)  # Only extracted one thing
```

**Issues:**
- Main file still too large
- Didn't extract enough
- No hooks or utils extracted

## Related Documentation

- [File Organization Guide](./FILE-ORGANIZATION-GUIDE.md) - Where files should go
- [Refactoring Guide](./REFACTORING-GUIDE.md) - How to refactor
- [Refactoring Status](./REFACTORING-STATUS.md) - What's been done

