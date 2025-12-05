# Project Reference Index

> Analyzed project documentation for RYLA MVP development.
> Generated: 2025-12-04

## Source Projects

| Project | Path | Purpose |
|---------|------|---------|
| funnel-adult-v3 | `/Users/admin/Documents/Projects/funnel-adult-v3` | Conversion funnel patterns |
| mdc-next-frontend | `/Users/admin/Documents/Projects/MDC/mdc-next-frontend` | Frontend architecture |
| mdc-backend | `/Users/admin/Documents/Projects/MDC/mdc-backend` | Backend architecture |

---

## Documentation Map

### Funnel Documentation
| Document | Description |
|----------|-------------|
| [FUNNEL-ARCHITECTURE.md](./FUNNEL-ARCHITECTURE.md) | Tech stack, data flow, design patterns |
| [FUNNEL-STEPS.md](./FUNNEL-STEPS.md) | All 36 steps with form fields & validation |
| [FUNNEL-ANALYTICS.md](./FUNNEL-ANALYTICS.md) | PostHog event specification |
| [FUNNEL-MVP-REQUIREMENTS.md](./FUNNEL-MVP-REQUIREMENTS.md) | Extracted feature requirements |

### MDC Platform Documentation
| Document | Description |
|----------|-------------|
| [MDC-FRONTEND-ARCHITECTURE.md](./MDC-FRONTEND-ARCHITECTURE.md) | Next.js 15, Zustand, TanStack Query |
| [MDC-BACKEND-ARCHITECTURE.md](./MDC-BACKEND-ARCHITECTURE.md) | NestJS, TypeORM, Bull queues |
| [MDC-COPY-GUIDE.md](../technical/MDC-COPY-GUIDE.md) | **Frontend code to copy from MDC** |
| [MDC-BACKEND-COPY-GUIDE.md](../technical/MDC-BACKEND-COPY-GUIDE.md) | **Backend code to copy from MDC** |

### Architecture Decisions
| Document | Description |
|----------|-------------|
| [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md) | **Custom Postgres vs Supabase decision** |

### Research & Market Analysis
| Document | Description |
|----------|-------------|
| [COMPETITORS.md](../research/COMPETITORS.md) | Competitive landscape, categorized competitors |

### Requirements & Epics
| Document | Description |
|----------|-------------|
| [MVP-SCOPE.md](../requirements/MVP-SCOPE.md) | MVP product scope definition |
| [PRODUCT-HYPOTHESIS.md](../requirements/PRODUCT-HYPOTHESIS.md) | Product vision & validation |
| [ICP-PERSONAS.md](../requirements/ICP-PERSONAS.md) | Target user personas |

### Epic Documentation (by Scope)

| Scope | Path | Epics |
|-------|------|-------|
| **MVP Product** | `docs/requirements/epics/mvp/` | EP-001, EP-002, EP-004, EP-005, EP-007 |
| **Funnel** | `docs/requirements/epics/funnel/` | EP-003 |
| **Landing Page** | `docs/requirements/epics/landing/` | EP-006 |
| **Future (P2+)** | `docs/requirements/epics/future/` | Planned features |

---

## Quick Reference: Tech Stack Comparison

| Layer | Funnel | MDC Frontend | MDC Backend | RYLA Target |
|-------|--------|--------------|-------------|-------------|
| Framework | Next.js 14 | Next.js 15 | NestJS 10 | Next.js + NestJS |
| State | Zustand | Zustand + TanStack | - | Zustand + TanStack |
| Forms | React Hook Form + Zod | React Hook Form + Zod | class-validator | React Hook Form + Zod |
| Styling | Tailwind | Tailwind | - | Tailwind |
| UI | shadcn/ui | shadcn/ui | - | shadcn/ui |
| Database | Supabase | - | PostgreSQL + TypeORM | **PostgreSQL + TypeORM** (MDC pattern) |
| Analytics | PostHog | PostHog | Mixpanel | PostHog |
| Auth | - | Supabase SSR | Passport + JWT | **JWT (Passport)** - email only |
| Real-time | - | Socket.io | Socket.io | Not needed for MVP |
| Payments | Finby/Shift4 | Stripe | Stripe/Shift4/PayPal | **Finby** |
| Storage | - | - | AWS S3 | AWS S3 or Supabase Storage |
| i18n | next-intl (16) | next-intl (16) | - | next-intl (P2) |

> **Note**: RYLA uses Custom Postgres + TypeORM (MDC patterns) instead of Supabase BaaS.
> See [ADR-001](../decisions/ADR-001-database-architecture.md) for rationale.

---

## Reusable Patterns Summary

### Frontend Patterns (from MDC)

#### 1. Service Layer
```typescript
// services/featureService.ts
export const featureService = {
    getAll: async () => axios.get('/feature'),
    create: async (data) => axios.post('/feature', data),
};
```

#### 2. TanStack Query Hooks
```typescript
// hooks/queries/use-feature.ts
export const useFeature = (id: number) =>
    useQuery({
        queryKey: ['feature', id],
        queryFn: () => featureService.getOne(id),
    });
```

#### 3. Zustand Store Slices
```typescript
// store/states/feature.ts
export const createFeatureStore: IStoreState<IFeatureState> = (set) => ({
    items: [],
    setItems: (items) => set({ items }),
});
```

#### 4. Axios Interceptors
```typescript
// Auto-attach token
axiosInstance.interceptors.request.use((config) => {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
});
```

### Backend Patterns (from MDC)

#### 1. NestJS Module Structure
```
modules/feature/
├── feature.module.ts
├── feature.controller.ts
├── services/feature.service.ts
├── dto/req/*.dto.ts
└── dto/res/*.dto.ts
```

#### 2. TypeORM Entities
```typescript
@Entity('features')
export class FeatureEntity extends BaseModel {
    @Column('text')
    name: string;
    
    @ManyToOne(() => UserEntity)
    user: UserEntity;
}
```

#### 3. Auth Guards
```typescript
@UseGuards(JwtAccessGuard)
@Get('protected')
getProtected(@CurrentUser() user) {}
```

### Funnel Patterns

#### 1. Step Configuration
```typescript
const FUNNEL_STEPS: StepInfo[] = [
    { name: "Step Name", type: "input", formField: "field_name", component: StepComponent },
];
```

#### 2. Step-Specific Validation
```typescript
const fieldsToValidate = currentStep.formField;
await form.trigger(fieldsToValidate);
```

#### 3. Analytics Tracking
```typescript
safePostHogCapture('funnel_step_completed', {
    step_index: current,
    step_name: stepName,
    form_data: formData,
});
```

---

## MVP Development Checklist

### Phase 1: Core Infrastructure
- [ ] Set up Nx monorepo structure
- [ ] Copy MDC backend structure (see [Backend Copy Guide](../technical/MDC-BACKEND-COPY-GUIDE.md))
- [ ] Configure PostgreSQL + TypeORM
- [ ] Set up PostHog analytics
- [ ] Configure Tailwind + shadcn/ui
- [ ] Implement Zustand store pattern
- [ ] Set up TanStack Query

### Phase 2: Backend (from MDC)
- [ ] Copy core entities (User, Character, Image)
- [ ] Copy auth module (JWT, simplified)
- [ ] Copy character module
- [ ] Copy image module
- [ ] Configure S3/storage

### Phase 3: Auth & User
- [ ] Email/password auth (JWT)
- [ ] Session management
- [ ] User profile management
- [ ] Age verification for NSFW

### Phase 4: Wizard Flow
- [ ] Copy wizard components (see [Frontend Copy Guide](../technical/MDC-COPY-GUIDE.md))
- [ ] 6-step character wizard
- [ ] Form validation per step
- [ ] localStorage persistence
- [ ] Analytics events

### Phase 5: Payments
- [ ] Finby integration (new module)
- [ ] Subscription management
- [ ] Webhook handling

### Phase 6: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile optimization
- [ ] i18n (P2)

---

## Key Files to Reference

### Funnel
- `features/funnel/config/steps.ts` - Step configuration
- `features/funnel/hooks/useFunnelForm.tsx` - Form + navigation
- `features/funnel/validation.ts` - Zod schema
- `lib/analytics/posthog-utils.ts` - Analytics helpers

### MDC Frontend
- `store/state.ts` - Store composition
- `lib/axios.ts` - HTTP client setup
- `hooks/queries/use-auth.ts` - Query pattern
- `hooks/mutations/use-payment.ts` - Mutation pattern
- `services/authService.ts` - Service pattern

### MDC Backend
- `modules/app.module.ts` - Module composition
- `modules/auth/auth.module.ts` - Auth module
- `database/entities/user.entity.ts` - Entity pattern
- `guards/jwt-access.guard.ts` - Guard pattern

---

## Migration Path

### From MDC Backend to RYLA

> **Decision**: Keep PostgreSQL + TypeORM (don't migrate to Supabase)
> See [ADR-001](../decisions/ADR-001-database-architecture.md)

1. **Keep PostgreSQL + TypeORM** (MDC pattern)
   - Copy NestJS project structure
   - Copy core entities (User, Character, Image)
   - Simplify for MVP (fewer entities)

2. **Simplify Auth** (from MDC)
   - Keep JWT + Passport patterns
   - Remove OAuth strategies (Google, Discord, Twitter)
   - Email/password only for MVP

3. **Retain Backend Patterns**
   - NestJS module structure
   - TypeORM entity patterns
   - Service layer abstraction
   - Guard patterns

4. **Replace Payment Providers**
   - Remove Stripe, PayPal, TrustPay, Shift4
   - Add Finby integration (new module)

### From MDC Frontend to RYLA

1. **Copy Wizard Components**
   - Character creation wizard flow
   - Step navigation patterns
   - Form state persistence (localStorage)

2. **Retain Frontend Patterns**
   - Service layer abstraction
   - Query/mutation hooks
   - Zustand store slices
   - Form validation with Zod

3. **Copy UI Components**
   - shadcn/ui components
   - Character option constants
   - Image generation UI

### From Funnel to RYLA

1. **Adapt Analytics**
   - Keep PostHog integration
   - Customize events for RYLA domain
   - Add A/B testing support

2. **Use Finby** (from funnel)
   - Payment integration pattern
   - Webhook handling

