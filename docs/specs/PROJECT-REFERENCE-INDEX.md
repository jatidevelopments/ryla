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

---

## Quick Reference: Tech Stack Comparison

| Layer | Funnel | MDC Frontend | MDC Backend | RYLA Target |
|-------|--------|--------------|-------------|-------------|
| Framework | Next.js 14 | Next.js 15 | NestJS 10 | Next.js + NestJS |
| State | Zustand | Zustand + TanStack | - | Zustand + TanStack |
| Forms | React Hook Form + Zod | React Hook Form + Zod | class-validator | React Hook Form + Zod |
| Styling | Tailwind | Tailwind | - | Tailwind |
| UI | shadcn/ui | shadcn/ui | - | shadcn/ui |
| Database | Supabase | - | PostgreSQL + TypeORM | Supabase |
| Analytics | PostHog | PostHog | Mixpanel | PostHog |
| Auth | - | Supabase SSR | Passport + JWT | Supabase Auth |
| Real-time | - | Socket.io | Socket.io | Supabase Realtime |
| Payments | Finby/Shift4 | Stripe | Stripe/Shift4/PayPal | Stripe |
| i18n | next-intl (16) | next-intl (16) | - | next-intl |

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
- [ ] Configure Supabase (auth, database)
- [ ] Set up PostHog analytics
- [ ] Configure Tailwind + shadcn/ui
- [ ] Implement Zustand store pattern
- [ ] Set up TanStack Query

### Phase 2: Auth & User
- [ ] Email/password auth (Supabase)
- [ ] OAuth providers (Google)
- [ ] User profile management
- [ ] Session persistence

### Phase 3: Funnel Flow
- [ ] Wizard framework (from funnel-adult-v3)
- [ ] Step configuration system
- [ ] Form validation per step
- [ ] Session persistence
- [ ] Analytics events

### Phase 4: Payments
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Webhook handling

### Phase 5: Polish
- [ ] i18n setup
- [ ] Error handling
- [ ] Loading states
- [ ] Mobile optimization

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

### From MDC to RYLA

1. **Replace PostgreSQL + TypeORM** → Supabase
   - Use Supabase JS client instead of TypeORM
   - Leverage Supabase RLS for auth
   - Use Supabase edge functions if needed

2. **Simplify Auth** → Supabase Auth
   - Remove Passport strategies
   - Use Supabase SSR patterns
   - Keep JWT for API validation

3. **Retain Patterns**
   - Service layer abstraction
   - Query/mutation hooks
   - Zustand store slices
   - Form validation with Zod

### From Funnel to RYLA

1. **Generalize Wizard Framework**
   - Make step types configurable
   - Support custom components
   - Add progress persistence options

2. **Adapt Analytics**
   - Keep PostHog integration
   - Customize events for RYLA domain
   - Add A/B testing support

3. **Simplify Payment**
   - Single provider (Stripe) for MVP
   - Subscription-first model

