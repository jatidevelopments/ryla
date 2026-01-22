# RYLA Web App - File Organization Guide

> **Last Updated:** January 2026  
> **Purpose:** Standardize file organization patterns across the web app for maintainability and consistency

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [File Organization Patterns](#file-organization-patterns)
4. [Naming Conventions](#naming-conventions)
5. [Refactoring Checklist](#refactoring-checklist)
6. [Migration Guide](#migration-guide)
7. [Examples](#examples)

---

## Overview

### Principles

1. **Co-location**: Related files should be grouped together
2. **Single Responsibility**: Each file should have one clear purpose
3. **Discoverability**: File locations should be predictable
4. **Scalability**: Structure should support growth without reorganization

### When to Extract Files

Extract when:
- Component exceeds **150 lines** (target: < 100)
- Logic is reused in **2+ places**
- File has **multiple responsibilities**
- Testing becomes difficult due to complexity

---

## Directory Structure

### App Router Pages (`apps/web/app/`)

```
app/
├── [route]/
│   ├── page.tsx              # Main page component (< 150 lines)
│   ├── components/           # Page-specific components
│   │   ├── ComponentName.tsx
│   │   └── index.ts          # Barrel export
│   ├── hooks/                # Page-specific hooks
│   │   ├── useFeatureName.ts
│   │   └── index.ts          # Barrel export
│   ├── utils/                # Page-specific utilities
│   │   ├── helper-function.ts
│   │   └── index.ts          # Barrel export
│   └── constants.ts          # Page-specific constants
```

**Examples:**
- `app/studio/` - Studio page with components, hooks, utils
- `app/templates/` - Templates page with filter components
- `app/onboarding/` - Onboarding page with form components

### Shared Components (`apps/web/components/`)

```
components/
├── feature-name/             # Feature-specific components
│   ├── FeatureComponent.tsx  # Main component
│   ├── components/           # Sub-components
│   │   ├── SubComponent.tsx
│   │   └── index.ts
│   ├── hooks/                # Feature-specific hooks
│   │   ├── useFeatureHook.ts
│   │   └── index.ts
│   ├── utils/                # Feature-specific utilities
│   │   └── index.ts
│   └── index.ts              # Barrel export
```

**Examples:**
- `components/studio/` - Studio-related components
- `components/wizard/` - Wizard components
- `components/image-gallery/` - Image gallery feature

### Shared Utilities (`apps/web/lib/`)

```
lib/
├── hooks/                    # Shared hooks (used across multiple pages)
│   ├── use-shared-hook.ts
│   └── index.ts
├── utils/                    # Shared utilities
│   ├── helper-function.ts
│   └── index.ts
├── api/                      # API clients
└── types/                    # Shared TypeScript types
```

---

## File Organization Patterns

### Pattern 1: Page with Extracted Components

**When:** Page has multiple UI sections or complex layout

```
app/feature-page/
├── page.tsx                  # Main page (orchestration only)
├── components/
│   ├── FeatureHeader.tsx
│   ├── FeatureContent.tsx
│   ├── FeatureFooter.tsx
│   └── index.ts
├── hooks/
│   ├── useFeatureData.ts
│   ├── useFeatureActions.ts
│   └── index.ts
└── constants.ts              # If needed
```

**Example:** `app/studio/` - Studio page with multiple sections

### Pattern 2: Feature Component with Sub-components

**When:** Component has multiple sub-components or complex UI

```
components/feature-name/
├── FeatureName.tsx           # Main component (< 150 lines)
├── components/
│   ├── FeatureSection.tsx
│   ├── FeatureActions.tsx
│   └── index.ts
├── hooks/
│   ├── useFeatureLogic.ts
│   └── index.ts
└── index.ts
```

**Example:** `components/studio/generation/` - Generation bar with pickers

### Pattern 3: Simple Page (No Extraction Needed)

**When:** Page is simple (< 150 lines) with minimal logic

```
app/simple-page/
└── page.tsx                  # All code in one file
```

**Example:** `app/dashboard/page.tsx` - Simple dashboard

### Pattern 4: Shared Feature Component

**When:** Component is used across multiple pages

```
components/shared-feature/
├── SharedFeature.tsx
├── components/               # If needed
├── hooks/                    # If needed
└── index.ts
```

**Example:** `components/image-gallery/` - Used in multiple places

---

## Naming Conventions

### Files

| Type | Convention | Example |
|------|-----------|---------|
| **Component** | PascalCase | `UserProfile.tsx` |
| **Hook** | camelCase with `use` prefix | `useUserProfile.ts` |
| **Utility** | camelCase | `formatDate.ts` |
| **Constants** | kebab-case | `constants.ts` or `api-constants.ts` |
| **Types** | kebab-case | `types.ts` or `user-types.ts` |
| **Index** | `index.ts` | `index.ts` |

### Directories

| Type | Convention | Example |
|------|-----------|---------|
| **Feature** | kebab-case | `user-profile/` |
| **Page Route** | kebab-case | `studio/`, `templates/` |
| **Sub-folders** | kebab-case | `components/`, `hooks/`, `utils/` |

### Exports

**Always use barrel exports (`index.ts`):**

```typescript
// components/feature/index.ts
export { FeatureComponent } from './FeatureComponent';
export { useFeatureHook } from './hooks/useFeatureHook';
export type { FeatureProps } from './types';
```

---

## Refactoring Checklist

### Before Refactoring

- [ ] **Identify the problem**: What makes this file hard to maintain?
- [ ] **Check file size**: Is it > 150 lines?
- [ ] **Check responsibilities**: Does it do more than one thing?
- [ ] **Check reusability**: Is logic duplicated elsewhere?
- [ ] **Document current behavior**: Ensure you understand what it does

### During Refactoring

- [ ] **Extract components**: Break UI into logical components
- [ ] **Extract hooks**: Move state/logic to custom hooks
- [ ] **Extract utilities**: Move pure functions to utils
- [ ] **Extract constants**: Move magic values to constants
- [ ] **Create barrel exports**: Add `index.ts` files
- [ ] **Update imports**: Fix all import paths
- [ ] **Maintain functionality**: Ensure behavior is unchanged

### After Refactoring

- [ ] **Verify functionality**: Test manually
- [ ] **Check file sizes**: All files < 150 lines (target < 100)
- [ ] **Check linter**: No errors or warnings
- [ ] **Update documentation**: Update any relevant docs
- [ ] **Review structure**: Does it follow patterns?
- [ ] **Check imports**: All imports resolve correctly

### File Size Targets

| File Type | Target | Max |
|-----------|--------|-----|
| **Page Component** | < 100 lines | 150 lines |
| **Feature Component** | < 80 lines | 120 lines |
| **UI Component** | < 60 lines | 100 lines |
| **Hook** | < 100 lines | 150 lines |
| **Utility Function** | < 50 lines | 100 lines |

---

## Migration Guide

### Step 1: Identify What to Extract

Look for:
- Large components (> 150 lines)
- Inline components (defined inside other components)
- Repeated logic
- Complex state management
- Utility functions mixed with components

### Step 2: Plan the Structure

Decide:
- Where should extracted files live? (`components/`, `hooks/`, `utils/`)
- What should be extracted? (components, hooks, utilities, constants)
- What should stay? (main component/page)

### Step 3: Extract Incrementally

1. Extract one thing at a time
2. Test after each extraction
3. Commit after each successful extraction

### Step 4: Organize Files

1. Create appropriate directories (`components/`, `hooks/`, `utils/`)
2. Move files to correct locations
3. Create barrel exports (`index.ts`)
4. Update all imports

### Step 5: Verify

1. Run linter: `nx lint web`
2. Check TypeScript: `nx type-check web`
3. Test functionality manually
4. Review file sizes

---

## Examples

### ✅ Good: Well-Organized Page

```
app/studio/
├── page.tsx                  # 127 lines - Orchestration only
├── components/
│   ├── StudioBackground.tsx
│   ├── StudioMainContent.tsx
│   ├── StudioDetailPanels.tsx
│   └── index.ts
├── hooks/
│   ├── useStudioState.ts
│   ├── useStudioHandlers.ts
│   ├── useStudioEffects.ts
│   └── index.ts
├── utils/
│   ├── image-selection.ts
│   ├── image-upload.ts
│   └── index.ts
└── constants.ts
```

**Why it's good:**
- Main page is focused on orchestration
- Components are co-located
- Hooks are separated by concern
- Utils are pure functions
- Everything is discoverable

### ❌ Bad: Monolithic Page

```
app/studio/
└── page.tsx                  # 1,111 lines - Everything in one file
```

**Why it's bad:**
- Too large to maintain
- Multiple responsibilities
- Hard to test
- Hard to reuse logic

### ✅ Good: Feature Component

```
components/studio/generation/
├── StudioGenerationBar.tsx   # 240 lines - Main component
├── components/
│   ├── PromptInputRow.tsx
│   ├── ControlButtonsRow.tsx
│   └── index.ts
├── hooks/
│   ├── useGenerationSettings.ts
│   ├── usePickerState.ts
│   └── index.ts
└── index.ts
```

**Why it's good:**
- Main component orchestrates sub-components
- Sub-components are reusable
- Hooks encapsulate logic
- Clear separation of concerns

### ❌ Bad: Inline Components

```typescript
// ❌ Bad: Inline component definition
function StudioPage() {
  const FilterPill = ({ label }) => (
    <button>{label}</button>
  );
  
  return <FilterPill label="All" />;
}
```

**Why it's bad:**
- Can't reuse component
- Harder to test
- Clutters main component
- Violates single responsibility

### ✅ Good: Extracted Component

```typescript
// ✅ Good: Separate component file
// components/filters/FilterPill.tsx
export function FilterPill({ label }: FilterPillProps) {
  return <button>{label}</button>;
}
```

---

## Common Patterns

### Pattern: Page with Filters

```
app/feature-page/
├── page.tsx
├── components/
│   ├── FeatureFilters.tsx
│   ├── FeatureList.tsx
│   └── index.ts
├── hooks/
│   ├── useFeatureFilters.ts    # Filter state + logic
│   └── index.ts
└── constants.ts                 # Filter options
```

**Example:** `app/templates/` - Templates page with filters

### Pattern: Form Page

```
app/form-page/
├── page.tsx
├── components/
│   ├── FormSection.tsx
│   ├── FormActions.tsx
│   └── index.ts
├── hooks/
│   ├── useFormState.ts         # Form state + validation
│   └── index.ts
└── constants.ts                 # Form options/constants
```

**Example:** `app/onboarding/` - Onboarding form

### Pattern: Wizard Step

```
components/wizard/step-name/
├── StepName.tsx
├── components/
│   ├── StepHeader.tsx
│   ├── StepContent.tsx
│   └── index.ts
├── hooks/
│   ├── useStepLogic.ts
│   └── index.ts
└── utils/
    └── step-helpers.ts
```

**Example:** `components/wizard/step-base-image-selection/`

---

## Decision Tree

```
Is this a page route?
├─ YES → app/[route]/
│   ├─ Is it simple (< 150 lines)?
│   │   ├─ YES → Just page.tsx
│   │   └─ NO → Extract to components/, hooks/, utils/
│   └─ Is it used by multiple pages?
│       └─ NO → Keep in app/[route]/
│
└─ NO → Is it a shared component?
    ├─ YES → components/[feature]/
    │   ├─ Is it complex?
    │   │   ├─ YES → Extract to components/, hooks/
    │   │   └─ NO → Single file
    │   └─ Is it used in 2+ places?
    │       └─ YES → components/[feature]/
    │
    └─ NO → Is it a utility?
        ├─ YES → lib/utils/ or [feature]/utils/
        └─ NO → Is it a hook?
            ├─ YES → lib/hooks/ or [feature]/hooks/
            └─ NO → Review: Should it be extracted?
```

---

## Quick Reference

### File Locations

| What | Where | Example |
|------|-------|---------|
| **Page component** | `app/[route]/page.tsx` | `app/studio/page.tsx` |
| **Page-specific component** | `app/[route]/components/` | `app/studio/components/` |
| **Page-specific hook** | `app/[route]/hooks/` | `app/studio/hooks/` |
| **Page-specific util** | `app/[route]/utils/` | `app/studio/utils/` |
| **Shared component** | `components/[feature]/` | `components/studio/` |
| **Shared hook** | `lib/hooks/` | `lib/hooks/use-studio-filters.ts` |
| **Shared util** | `lib/utils/` | `lib/utils/format-date.ts` |
| **Constants** | `[feature]/constants.ts` | `app/studio/constants.ts` |

### Extraction Rules

| Condition | Action |
|-----------|--------|
| Component > 150 lines | Extract sub-components |
| Logic reused 2+ times | Extract to hook/util |
| Inline component | Extract to separate file |
| Magic values | Extract to constants |
| Complex state | Extract to hook |
| Pure function | Extract to util |

---

## Related Documentation

- [Refactoring Guide](./REFACTORING-GUIDE.md) - Detailed refactoring patterns
- [Refactoring Status](./REFACTORING-STATUS.md) - Completed refactoring tasks
- [Code Style Rules](../../.cursor/rules/code-style.md) - Code style guidelines
- [Architecture Rules](../../.cursor/rules/architecture.mdc) - Architecture patterns

---

## Questions?

If you're unsure where a file should go:

1. **Is it page-specific?** → `app/[route]/`
2. **Is it shared across pages?** → `components/[feature]/`
3. **Is it a pure function?** → `lib/utils/` or `[feature]/utils/`
4. **Is it a hook?** → `lib/hooks/` or `[feature]/hooks/`
5. **Is it a constant?** → `[feature]/constants.ts`

When in doubt, **co-locate** with related files and **extract later** if needed.

