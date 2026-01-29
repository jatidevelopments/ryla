# OpenCode Research - Learnings for RYLA

**Date**: 2026-01-22  
**Source**: [OpenCode Repository](https://github.com/anomalyco/opencode)  
**Purpose**: Identify patterns, practices, and tools that could benefit RYLA

---

## Executive Summary

OpenCode is an open-source AI coding agent with a focus on terminal UI (TUI), client/server architecture, and provider-agnostic AI models. Key learnings for RYLA include:

1. **Performance Specs System** - Structured approach to performance improvements
2. **Feature Flags for Gradual Rollout** - Safe deployment of optimizations
3. **Phased Implementation Roadmaps** - Clear sequencing of improvements
4. **Dev-Only Performance Monitoring** - Metrics collection without production overhead
5. **Spec-Driven Development** - Detailed specs before implementation
6. **Contributing Guidelines** - Clear PR expectations and issue-first policy

---

## 1. Performance Specs System

### What They Do

OpenCode maintains a `specs/` directory with detailed performance improvement specifications:

- `01-persist-payload-limits.md` - Storage size limits and blob store migration
- `02-cache-eviction.md` - LRU/TTL cache eviction strategies
- `03-request-throttling.md` - Debouncing and request cancellation
- `04-scroll-spy-optimization.md` - Scroll performance improvements
- `05-modularize-and-dedupe.md` - Code organization improvements
- `perf-roadmap.md` - Phased delivery plan tying all specs together

### Key Pattern

Each spec includes:
- **Summary** - Brief overview
- **Goals** - What we're trying to achieve
- **Non-goals** - What we're explicitly not doing
- **Current state** - What exists today
- **Proposed approach** - How to solve it
- **Phased implementation steps** - Step-by-step plan
- **Risk + mitigations** - Known risks and how to handle them
- **Validation plan** - How to verify it works
- **Rollout plan** - How to deploy safely
- **Open questions** - Things to figure out

### Application to RYLA

**Recommendation**: Create similar performance specs for RYLA's known performance issues:

1. **Image Generation Performance**
   - Current: Large image payloads, slow generation times
   - Spec: Image payload limits, blob storage, lazy loading
   - Location: `docs/specs/performance/01-image-generation-optimization.md`

2. **Database Query Performance**
   - Current: N+1 queries, missing indexes
   - Spec: Query optimization, caching strategies
   - Location: `docs/specs/performance/02-database-optimization.md`

3. **Frontend Bundle Size**
   - Current: Large initial bundle, slow page loads
   - Spec: Code splitting, lazy loading, tree shaking
   - Location: `docs/specs/performance/03-bundle-optimization.md`

4. **API Response Times**
   - Current: Slow API responses, no request deduplication
   - Spec: Request throttling, caching, response optimization
   - Location: `docs/specs/performance/04-api-optimization.md`

**Template**: Create `docs/specs/performance/PERFORMANCE-SPEC-TEMPLATE.md` based on OpenCode's format.

---

## 2. Feature Flags for Gradual Rollout

### What They Do

OpenCode uses feature flags extensively for performance optimizations:

```typescript
// Example flags from their specs
persist.payloadLimits      // Storage size limits
persist.imageBlobs         // Image blob storage
cache.eviction.files        // File cache eviction
requests.debounce.fileSearch // File search debouncing
session.scrollSpyOptimized   // Optimized scroll spy
```

**Pattern**:
- Flags default to `off` initially
- Enable incrementally after validation
- Quick rollback by disabling flags
- Dev-only metrics/logs for monitoring

### Application to RYLA

**Recommendation**: Implement feature flags for risky optimizations:

1. **Create feature flag system**:
   - Location: `libs/shared/src/feature-flags.ts`
   - Support: Environment-based, user-based, gradual rollout
   - Integration: PostHog for analytics, Infisical for config

2. **Flags for performance optimizations**:
   - `performance.imageLazyLoading` - Lazy load images
   - `performance.queryCaching` - Enable query caching
   - `performance.bundleSplitting` - Aggressive code splitting
   - `performance.requestDeduplication` - Deduplicate API calls

3. **Flags for new features**:
   - `features.newStudioUI` - New studio interface
   - `features.advancedFilters` - Advanced filtering
   - `features.realTimeUpdates` - Real-time updates

**Implementation**:
```typescript
// libs/shared/src/feature-flags.ts
export const featureFlags = {
  performance: {
    imageLazyLoading: process.env.NEXT_PUBLIC_FEATURE_IMAGE_LAZY_LOADING === 'true',
    queryCaching: process.env.NEXT_PUBLIC_FEATURE_QUERY_CACHING === 'true',
  },
  // ... more flags
} as const;
```

---

## 3. Phased Implementation Roadmaps

### What They Do

OpenCode's `perf-roadmap.md` provides a sequenced delivery plan:

- **Phase 0**: Baseline + flags (prep)
- **Phase 1**: Stop worst "jank generators" (storage + request storms)
- **Phase 2**: Bound memory growth (in-memory eviction)
- **Phase 3**: Large session scroll scalability
- **Phase 4**: "Make it easy to keep fast" (modularity + dedupe)

Each phase has:
- **Goal** - What we're trying to achieve
- **Work items** - Specific tasks
- **Exit criteria** - How we know we're done
- **Effort / risk** - Estimation

### Application to RYLA

**Recommendation**: Create phased roadmaps for major improvements:

1. **Performance Roadmap**:
   - Location: `docs/specs/performance/PERFORMANCE-ROADMAP.md`
   - Phases: Quick wins → Performance boost → Optimization
   - Ties together: All performance specs

2. **Architecture Roadmap**:
   - Location: `docs/architecture/ARCHITECTURE-ROADMAP.md`
   - Phases: Current state → Target state → Migration plan

3. **Feature Roadmap**:
   - Location: `docs/requirements/ROADMAP.md`
   - Phases: MVP → Phase 2 → Phase 3

**Example Structure**:
```markdown
## Phase 1: Quick Wins (Week 1)
- Resource preloading
- Fixed image dimensions
- Critical CSS inlining

**Exit Criteria**: LCP < 2.5s, FID < 100ms

## Phase 2: Performance Boost (Week 2)
- HTML prefetching
- Service Worker
- Performance monitoring

**Exit Criteria**: Repeat visit load < 100ms
```

---

## 4. Dev-Only Performance Monitoring

### What They Do

OpenCode adds dev-only counters/logs for performance metrics:

- Persist oversize detections
- Request aborts/stale drops
- Eviction counts and retained sizes
- Scroll-spy compute time per second

**Pattern**: Metrics only in dev, not in production to avoid overhead.

### Application to RYLA

**Recommendation**: Add dev-only performance monitoring:

1. **Performance utilities**:
   - Location: `libs/shared/src/performance.ts`
   - Functions: `mark()`, `measure()`, `logMetrics()`
   - Integration: Only active in dev mode

2. **Metrics to track**:
   - Image generation times
   - Database query times
   - API response times
   - Bundle load times
   - Component render times

3. **Dev dashboard**:
   - Location: `apps/web/app/dev/performance/page.tsx`
   - Display: Real-time metrics, charts, warnings
   - Access: Only in dev mode, behind auth

**Implementation**:
```typescript
// libs/shared/src/performance.ts
export const perf = {
  mark: (name: string) => {
    if (process.env.NODE_ENV === 'development') {
      performance.mark(name);
    }
  },
  measure: (name: string, start: string, end: string) => {
    if (process.env.NODE_ENV === 'development') {
      performance.measure(name, start, end);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`[PERF] ${name}: ${measure.duration.toFixed(2)}ms`);
    }
  },
};
```

---

## 5. Spec-Driven Development

### What They Do

OpenCode writes detailed specs before implementation:

- Clear problem statement
- Current state analysis
- Proposed solution with code sketches
- Phased implementation plan
- Risk assessment
- Validation plan

**Benefit**: Reduces ambiguity, enables parallel work, improves code review.

### Application to RYLA

**Recommendation**: Strengthen spec-driven development:

1. **Spec template**:
   - Location: `docs/templates/PERFORMANCE-SPEC-TEMPLATE.md`
   - Based on: OpenCode's spec format
   - Required sections: Summary, Goals, Non-goals, Current state, Proposed approach, Phased steps, Risks, Validation, Rollout

2. **Spec review process**:
   - Create spec before implementation
   - Review spec with team
   - Update spec as implementation evolves
   - Link spec to epic/story

3. **Spec locations**:
   - Performance: `docs/specs/performance/`
   - Architecture: `docs/architecture/specs/`
   - Features: `docs/specs/epics/` (already exists)

---

## 6. Contributing Guidelines

### What They Do

OpenCode has very clear contributing guidelines:

- **Issue-first policy**: All PRs must reference an existing issue
- **Small PRs**: Keep PRs focused and reviewable
- **Screenshots for UI**: Include before/after for UI changes
- **Verification for logic**: Explain how you verified non-UI changes
- **No AI-generated walls of text**: Short, focused descriptions
- **Conventional commits**: `feat:`, `fix:`, `docs:`, etc.

### Application to RYLA

**Recommendation**: Enhance RYLA's contributing guidelines:

1. **Update CONTRIBUTING.md**:
   - Add issue-first policy
   - Add screenshot requirements for UI changes
   - Add verification requirements for logic changes
   - Add PR size guidelines

2. **PR template**:
   - Location: `.github/pull_request_template.md`
   - Sections: Description, Related issues, Type of change, Acceptance criteria, Testing, Screenshots, Checklist

3. **Enforce in CI**:
   - Check PR has linked issue
   - Check PR description length (not too long)
   - Check conventional commit format

---

## 7. Style Guide Patterns

### What They Do

OpenCode has a very opinionated style guide:

- **Avoid `let`**: Prefer `const` with ternary
- **Avoid `else`**: Prefer early returns
- **Single-word naming**: Prefer `foo` over `fooBar`
- **Avoid unnecessary destructuring**: Use `obj.a` instead of `const { a } = obj`
- **Avoid `try/catch`**: Prefer `.catch()` when possible
- **Avoid `any`**: Use precise types

### Application to RYLA

**Note**: RYLA already has style guidelines in `.cursor/rules/code-style.mdc`. Consider:

1. **Review current style guide**:
   - Compare with OpenCode's patterns
   - Identify gaps or conflicts
   - Update if beneficial

2. **Add specific patterns**:
   - Early returns (already recommended)
   - Single-word naming (consider for RYLA)
   - Avoid unnecessary destructuring (consider for RYLA)

3. **Enforce with linter**:
   - ESLint rules for `let` usage
   - ESLint rules for `else` usage
   - TypeScript strict mode (already enabled)

---

## 8. Testing Patterns

### What They Do

OpenCode uses Playwright for E2E tests with good configuration:

- Reuse existing server in dev
- Retries in CI
- Trace on first retry
- Screenshot/video on failure
- Parallel execution

### Application to RYLA

**Recommendation**: Review and improve RYLA's Playwright setup:

1. **Compare configurations**:
   - RYLA: `playwright/playwright.config.ts`
   - OpenCode: `packages/app/playwright.config.ts`
   - Identify improvements

2. **Consider improvements**:
   - Server reuse in dev (already implemented)
   - Retry strategy (already implemented)
   - Trace/screenshot/video (already implemented)
   - Parallel execution (already implemented)

**Status**: RYLA's Playwright setup is already quite good. No major changes needed.

---

## 9. Monorepo Patterns

### What They Do

OpenCode uses:
- **Bun workspaces** (vs RYLA's Nx)
- **Turbo** for task orchestration
- **Workspace catalog** for dependency management
- **Patched dependencies** for fixes

### Application to RYLA

**Note**: RYLA uses Nx, which is more feature-rich than Turbo. However:

1. **Consider workspace catalog**:
   - OpenCode uses `catalog` in `package.json` for shared versions
   - RYLA could benefit from similar pattern
   - Location: `package.json` workspaces catalog

2. **Patched dependencies**:
   - OpenCode uses `patchedDependencies` in `package.json`
   - RYLA could use this for dependency fixes
   - Alternative: Use `patch-package` (already available)

**Status**: RYLA's Nx setup is more advanced. No major changes needed.

---

## 10. Infrastructure Patterns

### What They Do

OpenCode uses:
- **SST** for infrastructure as code
- **Cloudflare** as primary provider
- **PlanetScale** for database
- **Stripe** for payments

### Application to RYLA

**Note**: RYLA uses different infrastructure (Fly.io, Supabase, Finby). However:

1. **Infrastructure as code**:
   - OpenCode uses SST (TypeScript-based)
   - RYLA could benefit from similar approach
   - Consider: Terraform, Pulumi, or SST for RYLA

2. **Multi-provider support**:
   - OpenCode supports multiple providers
   - RYLA already uses multiple providers (Fly.io, Supabase, Cloudflare)
   - Consider: Unified infrastructure config

**Status**: RYLA's infrastructure is different but functional. Consider IaC improvements.

---

## Actionable Recommendations

### High Priority

1. **Create performance specs system**:
   - Create `docs/specs/performance/` directory
   - Create performance spec template
   - Write first spec for image generation optimization

2. **Implement feature flags**:
   - Create `libs/shared/src/feature-flags.ts`
   - Add flags for performance optimizations
   - Integrate with PostHog/Infisical

3. **Add dev-only performance monitoring**:
   - Create `libs/shared/src/performance.ts`
   - Add performance marks/measures
   - Create dev dashboard

### Medium Priority

4. **Create performance roadmap**:
   - Create `docs/specs/performance/PERFORMANCE-ROADMAP.md`
   - Define phases and exit criteria
   - Link to performance specs

5. **Enhance contributing guidelines**:
   - Update `CONTRIBUTING.md` with issue-first policy
   - Add PR template
   - Add screenshot requirements

6. **Review style guide**:
   - Compare with OpenCode patterns
   - Update if beneficial
   - Add linter rules

### Low Priority

7. **Consider workspace catalog**:
   - Evaluate for dependency management
   - Implement if beneficial

8. **Consider infrastructure as code**:
   - Evaluate SST/Terraform/Pulumi
   - Implement if beneficial

---

## 11. Codebase Setup & Tooling

### What They Do

OpenCode uses **Bun** as their primary toolchain:

1. **Package Manager**: Bun workspaces (vs RYLA's pnpm)
2. **Runtime**: Bun runtime for scripts and builds
3. **Bundler**: Bun's built-in bundler for builds
4. **Task Runner**: Turbo for task orchestration (vs RYLA's Nx)
5. **TypeScript**: Native TypeScript support via Bun
6. **Workspace Catalog**: Centralized dependency versions

### Key Patterns

#### 1. Workspace Catalog

OpenCode uses a `catalog` in `package.json` for shared dependency versions:

```json
{
  "workspaces": {
    "catalog": {
      "@types/bun": "1.3.5",
      "@octokit/rest": "22.0.0",
      "typescript": "5.8.2",
      "zod": "4.1.8"
    }
  }
}
```

Then packages reference via `catalog:`:
```json
{
  "dependencies": {
    "typescript": "catalog:",
    "zod": "catalog:"
  }
}
```

**Benefit**: Single source of truth for versions, easier updates.

#### 2. Bun-Specific Features

- **Native TypeScript**: No `ts-node` needed, just `bun run script.ts`
- **Built-in bundler**: No separate webpack/esbuild config for simple builds
- **Fast installs**: Bun is faster than npm/pnpm for installs
- **Built-in test runner**: `bun test` instead of Jest/Vitest
- **Shell integration**: `$` template tag for shell commands

#### 3. Build Scripts

OpenCode uses TypeScript scripts for complex builds:

```typescript
// script/build.ts
#!/usr/bin/env bun
import { $ } from "bun"

await $`rm -rf dist`
await Bun.build({
  entrypoints: ["./src/index.ts"],
  outfile: "dist/index.js",
  // ... config
})
```

**Benefit**: Type-safe build scripts, easier to maintain than shell scripts.

#### 4. Bunfig Configuration

OpenCode uses `bunfig.toml` for Bun-specific config:

```toml
[install]
exact = true

[test]
root = "./do-not-run-tests-from-root"
preload = ["./test/preload.ts"]
timeout = 10000
coverage = true
```

**Benefit**: Centralized Bun configuration, similar to `.npmrc` but more powerful.

#### 5. Script Organization

OpenCode keeps scripts in `script/` directory:
- `build.ts` - Build script
- `publish.ts` - Publish script
- `generate.ts` - Code generation
- `changelog.ts` - Changelog generation

**Benefit**: Organized, type-safe scripts vs scattered shell scripts.

### Application to RYLA

**Current State**: RYLA uses:
- **pnpm** for package management
- **Nx** for task orchestration
- **TypeScript** via `tsx` for scripts
- **Vitest** for testing
- **Next.js** for builds

**Recommendations**:

#### 1. Consider Workspace Catalog (High Value, Low Risk)

RYLA could adopt a similar catalog pattern:

```json
{
  "pnpm": {
    "overrides": {
      "typescript": "~5.9.2",
      "zod": "^3.25.67",
      "@supabase/supabase-js": "^2.50.0"
    }
  }
}
```

Or use pnpm's workspace protocol more consistently.

**Action**: Review dependency versions across packages, create shared catalog.

#### 2. TypeScript Scripts (Medium Value, Low Risk)

RYLA already uses `tsx` for scripts, but could organize better:

**Current**: Scripts scattered in `scripts/` directory
**OpenCode Pattern**: Organized by purpose, type-safe

**Action**: Consider organizing scripts by purpose:
- `scripts/build/` - Build scripts
- `scripts/generate/` - Code generation
- `scripts/test/` - Test utilities
- `scripts/deploy/` - Deployment scripts

#### 3. Build Script Improvements (Medium Value, Medium Risk)

RYLA could improve build scripts:

**Current**: Mix of shell scripts and TypeScript
**OpenCode Pattern**: TypeScript scripts with Bun's `$` template tag

**Action**: Consider using a shell library for TypeScript scripts:
- `execa` - Better than raw shell scripts
- `zx` - Google's shell scripting library
- Or stick with `tsx` + shell scripts (current approach is fine)

#### 4. Bun Evaluation (Low Priority, High Risk)

**Should RYLA switch to Bun?**

**Pros**:
- Faster installs and builds
- Native TypeScript support
- Built-in test runner
- Simpler toolchain

**Cons**:
- Less mature ecosystem
- Team familiarity (RYLA team knows pnpm/Nx)
- Nx integration (RYLA heavily uses Nx features)
- Production stability (Bun is newer)

**Recommendation**: **Don't switch yet**. RYLA's current stack (pnpm + Nx) is:
- More mature and stable
- Better integrated with Next.js
- Team is already familiar
- Nx provides valuable features (affected, caching, etc.)

**Future Consideration**: Monitor Bun's maturity. If it becomes more stable and Nx adds better support, consider evaluating again in 6-12 months.

#### 5. Script Organization (High Value, Low Risk)

RYLA could improve script organization:

**Current**: `scripts/` has many subdirectories
**OpenCode Pattern**: Clear organization by purpose

**Action**: Review and reorganize scripts:
- Group related scripts
- Add README per directory
- Document script purposes
- Consider script naming conventions

#### 6. Configuration Files (Low Value, Low Risk)

RYLA could add configuration files for tooling:

**OpenCode Pattern**: `bunfig.toml` for Bun config
**RYLA Pattern**: Could add `.pnpmrc`, `.nxrc`, etc.

**Action**: Document configuration files, ensure they're in version control.

---

## Comparison: OpenCode vs RYLA

| Aspect | OpenCode | RYLA | Recommendation |
|--------|----------|------|---------------|
| **Package Manager** | Bun workspaces | pnpm workspaces | ✅ Keep pnpm (more mature) |
| **Task Runner** | Turbo | Nx | ✅ Keep Nx (more features) |
| **Script Runtime** | Bun native | tsx | ✅ Keep tsx (works well) |
| **Test Runner** | Bun test | Vitest | ✅ Keep Vitest (more features) |
| **Build Tool** | Bun bundler | Next.js/esbuild | ✅ Keep Next.js (required) |
| **Workspace Catalog** | ✅ Yes | ❌ No | ⚠️ Consider adding |
| **Script Organization** | ✅ Organized | ⚠️ Scattered | ⚠️ Improve organization |
| **TypeScript Scripts** | ✅ Native | ✅ Via tsx | ✅ Keep tsx approach |

---

## Conclusion

OpenCode provides excellent patterns for:
- **Performance optimization** (specs, flags, monitoring)
- **Gradual rollout** (feature flags, phased roadmaps)
- **Code quality** (style guide, contributing guidelines)
- **Developer experience** (dev tools, monitoring)
- **Codebase setup** (workspace catalog, script organization)

RYLA can benefit most from:
1. Performance specs system
2. Feature flags for gradual rollout
3. Dev-only performance monitoring
4. Phased implementation roadmaps
5. Workspace catalog for dependency management
6. Better script organization

**Tooling Decision**: RYLA should **keep current stack** (pnpm + Nx) but adopt organizational patterns (catalog, script organization).

These patterns align well with RYLA's existing architecture and can be implemented incrementally without major disruption.

---

## References

- [OpenCode Repository](https://github.com/anomalyco/opencode)
- [OpenCode Performance Roadmap](https://github.com/anomalyco/opencode/blob/main/specs/perf-roadmap.md)
- [OpenCode Contributing Guide](https://github.com/anomalyco/opencode/blob/main/CONTRIBUTING.md)
- [OpenCode Style Guide](https://github.com/anomalyco/opencode/blob/main/STYLE_GUIDE.md)
- [Bun Documentation](https://bun.sh/docs)
- [Turbo Documentation](https://turbo.build/repo/docs)
