# Refactoring Action Plan & Review

> **Created:** January 2026  
> **Purpose:** Action plan to review and improve file organization across the web app

## Current Status

✅ **Completed:** Major refactoring work (224 files changed, 17,954 insertions, 10,494 deletions)

## Action Items

### 1. Review Current Structure ✅

**Status:** Documentation created

**Created:**
- [FILE-ORGANIZATION-GUIDE.md](./FILE-ORGANIZATION-GUIDE.md) - Comprehensive guide for file organization
- [REFACTORING-REVIEW-PROCESS.md](./REFACTORING-REVIEW-PROCESS.md) - Review checklist and process

### 2. Audit Current File Organization 🔄

**Status:** Initial audit complete

**Files > 200 lines found:**
- `app/influencer/[id]/studio/page.tsx` - **1,290 lines** ⚠️ (Deprecated/unused - skip)
- `app/studio/hooks/useStudioHandlers.ts` - **128 lines** ✅ (Refactored - split into useImageActions, useGenerationActions, useUploadActions)
- `app/influencer/[id]/page.tsx` - **82 lines** ✅ (Refactored - extracted hooks & components)
- `app/settings/components/delete-account-dialog.tsx` - **141 lines** ✅ (Refactored - extracted step components and useDeleteAccountFlow hook)
- `app/api/finby/webhook/route.ts` - **297 lines** 🟡 (API route - acceptable)
- `app/buy-credits/page.tsx` - **160 lines** ✅ (Refactored - extracted modal, grid, upsell components and useCreditPurchase hook)
- `app/templates/page.tsx` - **275 lines** ✅ (Recently refactored)
- `app/auth/page.tsx` - **253 lines** ✅ (Recently refactored)
- `app/auth/hooks/use-auth-flow.ts` - **247 lines** 🟡 (Consider splitting)

**Tasks:**
- [x] Initial audit complete
- [ ] Review files > 200 lines
- [ ] Prioritize refactoring targets
- [ ] Document action plan for each file

### 3. Standardize Existing Code

**Priority Areas:**

#### High Priority
- [ ] **Pages > 200 lines**: Review and extract if needed
- [ ] **Components > 150 lines**: Extract sub-components
- [ ] **Missing barrel exports**: Add `index.ts` files
- [ ] **Inconsistent naming**: Standardize file names

#### Medium Priority
- [ ] **Shared utilities**: Move to `lib/utils/` if used across pages
- [ ] **Shared hooks**: Move to `lib/hooks/` if used across pages
- [ ] **Constants**: Extract magic values to constants files

#### Low Priority
- [ ] **Documentation**: Add JSDoc comments
- [ ] **Type definitions**: Extract to `types.ts` files
- [ ] **Test organization**: Align test files with source structure

### 4. Create Migration Scripts

**Tools needed:**
- [ ] Script to check file sizes
- [ ] Script to find files without barrel exports
- [ ] Script to detect inline components
- [ ] Script to find duplicate code

### 5. Establish CI Checks

**Automated checks:**
- [ ] File size limits (warn if > 150 lines)
- [ ] Missing barrel exports
- [ ] Naming convention violations
- [ ] Circular dependencies

## Review Checklist

### For Each Page (`app/[route]/`)

- [ ] Main `page.tsx` < 150 lines
- [ ] Components extracted to `components/` if needed
- [ ] Hooks extracted to `hooks/` if needed
- [ ] Utils extracted to `utils/` if needed
- [ ] Constants extracted to `constants.ts` if needed
- [ ] Barrel exports (`index.ts`) exist
- [ ] Follows naming conventions

### For Each Component (`components/[feature]/`)

- [ ] Main component < 150 lines
- [ ] Sub-components extracted if needed
- [ ] Hooks extracted if needed
- [ ] Utils extracted if needed
- [ ] Barrel exports exist
- [ ] Follows naming conventions

## Quick Wins

### 1. Add Missing Barrel Exports

**Find directories without `index.ts`:**
```bash
find apps/web/app apps/web/components -type d -exec test ! -f {}/index.ts \; -print
```

**Action:** Create `index.ts` files for easier imports

### 2. Standardize File Names

**Check for inconsistencies:**
- PascalCase vs kebab-case
- `use` prefix on hooks
- `constants.ts` vs `constants.tsx`

**Action:** Rename files to follow conventions

### 3. Extract Inline Components

**Find inline component definitions:**
```bash
grep -r "const.*=.*\(.*\) =>" apps/web/app apps/web/components | grep -v "use[A-Z]"
```

**Action:** Extract to separate files

## File Organization Standards

### Directory Structure

```
app/[route]/
├── page.tsx              # Main page (< 150 lines)
├── components/           # Page-specific components
│   ├── ComponentName.tsx
│   └── index.ts
├── hooks/                # Page-specific hooks
│   ├── useFeatureName.ts
│   └── index.ts
├── utils/                # Page-specific utilities
│   ├── helper-function.ts
│   └── index.ts
└── constants.ts          # Page-specific constants

components/[feature]/
├── FeatureName.tsx        # Main component (< 150 lines)
├── components/           # Sub-components
│   └── index.ts
├── hooks/                # Feature hooks
│   └── index.ts
└── index.ts              # Barrel export
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `UserProfile.tsx` |
| Hook | camelCase + `use` | `useUserProfile.ts` |
| Utility | camelCase | `formatDate.ts` |
| Constants | kebab-case | `constants.ts` |
| Directory | kebab-case | `user-profile/` |

## Next Steps

1. **Review documentation** - Read FILE-ORGANIZATION-GUIDE.md
2. **Run audit** - Check current file sizes and structure
3. **Prioritize** - Identify high-priority refactoring targets
4. **Execute** - Refactor incrementally, one feature at a time
5. **Verify** - Use REFACTORING-REVIEW-PROCESS.md checklist

## Resources

- [File Organization Guide](./FILE-ORGANIZATION-GUIDE.md)
- [Refactoring Review Process](./REFACTORING-REVIEW-PROCESS.md)
- [Refactoring Guide](./REFACTORING-GUIDE.md)
- [Refactoring Status](./REFACTORING-STATUS.md)

## Questions?

If unsure about file organization:
1. Check FILE-ORGANIZATION-GUIDE.md
2. Look at similar features for patterns
3. When in doubt, co-locate and extract later

