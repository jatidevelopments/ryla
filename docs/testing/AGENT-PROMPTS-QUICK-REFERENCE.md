# Quick Reference: Agent Prompts for 100% Coverage

**Copy and paste these prompts to start separate agents for each app/lib.**

---

## 🎯 Apps/Web

```
You are implementing 100% unit test coverage for apps/web as part of EP-062 (IN-026). Goal: 100% test coverage. Test infrastructure exists: apps/web/lib/test/, apps/web/src/test/setup.tsx. Create .spec.ts/.spec.tsx files for ALL components (apps/web/components/), ALL utilities (apps/web/lib/utils/), ALL hooks, ALL services, ALL API clients. Follow .cursor/rules/testing-standards.mdc. Use MSW for network mocking. Colocate tests. Use .spec.ts/.spec.tsx extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test web → 100% coverage. All tests must pass.
```

---

## 🎯 Apps/API

```
You are implementing 100% unit test coverage for apps/api as part of EP-062 (IN-026). Goal: 100% test coverage. Test infrastructure exists: apps/api/src/test/utils/. Create .spec.ts files for ALL services (apps/api/src/modules/*/services/), ALL controllers, ALL utilities, ALL guards/filters/interceptors. Follow .cursor/rules/testing-standards.mdc. Use pglite for database tests. Use createTestingModule() for NestJS. Colocate tests. Use .spec.ts extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test api → 100% coverage. All tests must pass.
```

---

## 🎯 Apps/Funnel

```
You are implementing 100% unit test coverage for apps/funnel as part of EP-062 (IN-026). Goal: 100% test coverage. Test infrastructure exists: apps/funnel/src/lib/test/, apps/funnel/src/test/setup.tsx. Create .spec.ts/.spec.tsx files for ALL components (apps/funnel/src/components/), ALL utilities, ALL hooks, ALL services, ALL API clients. Follow .cursor/rules/testing-standards.mdc. Use MSW for network mocking. Colocate tests. Use .spec.ts/.spec.tsx extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test funnel → 100% coverage. All tests must pass.
```

---

## 🎯 Apps/Landing

```
You are implementing 100% unit test coverage for apps/landing as part of EP-062 (IN-026). Goal: 100% test coverage. Test infrastructure exists: apps/landing/src/lib/test/, apps/landing/src/test/setup.tsx. Create .spec.ts/.spec.tsx files for ALL components (apps/landing/src/components/), ALL utilities, ALL hooks, ALL sections. Follow .cursor/rules/testing-standards.mdc. Use MSW for network mocking. Colocate tests. Use .spec.ts/.spec.tsx extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test landing → 100% coverage. All tests must pass.
```

---

## 🎯 Apps/Admin

```
You are implementing 100% unit test coverage for apps/admin as part of EP-062 (IN-026). Goal: 100% test coverage. Test infrastructure exists. Create .spec.ts/.spec.tsx files for ALL components (apps/admin/app/, apps/admin/components/), ALL utilities, ALL hooks. Verify ALL tRPC routers have tests (mostly done). Follow .cursor/rules/testing-standards.mdc. Use MSW for network mocking. Colocate tests. Use .spec.ts/.spec.tsx extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test admin → 100% coverage. All tests must pass.
```

---

## 🎯 Libs/Business

```
You are implementing 100% unit test coverage for libs/business as part of EP-062 (IN-026). Goal: 100% test coverage. Create .spec.ts files for ALL services (libs/business/src/services/), ALL models, ALL utilities. Follow .cursor/rules/testing-standards.mdc. Use pglite for database tests. Mock external dependencies. Colocate tests. Use .spec.ts extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test business → 100% coverage. All tests must pass.
```

---

## 🎯 Libs/UI

```
You are implementing 100% unit test coverage for libs/ui as part of EP-062 (IN-026). Goal: 100% test coverage. Example tests exist: button.spec.tsx, dialog.spec.tsx. Create .spec.tsx files for ALL components (libs/ui/src/components/), ALL hooks, ALL utilities. Follow .cursor/rules/testing-standards.mdc. Use MSW for network mocking. Colocate tests. Use .spec.tsx extensions. Update vitest.config.ts thresholds to 100%. Verify: pnpm nx test ui → 100% coverage. All tests must pass.
```

---

## 🎯 Libs/Shared

```
You are implementing 100% unit test coverage for libs/shared as part of EP-062 (IN-026). Goal: 100% test coverage. Create .spec.ts files for ALL utilities (libs/shared/src/utils/), ALL validators, ALL helpers with logic. Follow .cursor/rules/testing-standards.mdc. Test edge cases (null, undefined, empty, invalid). Colocate tests. Use .spec.ts extensions. Create/update vitest.config.ts with 100% thresholds. Verify: pnpm nx test shared → 100% coverage. All tests must pass.
```

---

## 🎯 Libs/TRPC

```
You are implementing 100% unit test coverage for libs/trpc as part of EP-062 (IN-026). Goal: 100% test coverage. Create .spec.ts files for ALL routers (libs/trpc/src/routers/), ALL utilities, ALL middleware. Follow .cursor/rules/testing-standards.mdc. Test procedures with mocked context. Test RBAC, validation, error handling. Colocate tests. Use .spec.ts extensions. Create/update vitest.config.ts with 100% thresholds. Verify: pnpm nx test trpc → 100% coverage. All tests must pass.
```

---

## 📋 Verification Commands

```bash
# Test each app/lib
pnpm nx test web
pnpm nx test api
pnpm nx test funnel
pnpm nx test landing
pnpm nx test admin
pnpm nx test business
pnpm nx test ui
pnpm nx test shared
pnpm nx test trpc

# View coverage reports
open coverage/apps/web/index.html
open coverage/apps/api/index.html
# etc.
```

---

**Full Details**: See [AGENT-PROMPTS-100-PERCENT-COVERAGE.md](./AGENT-PROMPTS-100-PERCENT-COVERAGE.md)
