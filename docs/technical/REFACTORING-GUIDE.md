# React/Next.js Refactoring Best Practices

> Comprehensive guide for refactoring RYLA codebase components, hooks, and pages.

## Table of Contents

1. [Component Guidelines](#1-component-guidelines)
2. [Custom Hooks Guidelines](#2-custom-hooks-guidelines)
3. [File Organization](#3-file-organization)
4. [State Management Patterns](#4-state-management-patterns)
5. [React Context Best Practices](#5-react-context-best-practices)
6. [Refactoring Process](#6-refactoring-process)
7. [Performance Patterns](#7-performance-patterns)
8. [Error Handling Patterns](#8-error-handling-patterns)
9. [TypeScript Patterns](#9-typescript-patterns)
10. [Data Fetching Patterns](#10-data-fetching-patterns)
11. [Form Patterns](#11-form-patterns)
12. [Next.js Server vs Client Components](#12-nextjs-server-vs-client-components)
13. [Tailwind Organization](#13-tailwind-organization)
14. [Constants & Magic Values](#14-constants--magic-values)
15. [Accessibility Checklist](#15-accessibility-checklist)
16. [Refactoring Examples](#16-refactoring-examples)

---

## 1. Component Guidelines

### Size & Responsibility

| Metric | Good | Bad |
|--------|------|-----|
| Lines | < 150 (prefer < 100) | > 200 |
| Responsibilities | Single, clear purpose | Multiple concerns mixed |
| Props | ≤ 5 props | > 7 props (prop drilling smell) |
| Nesting depth | Max 2 levels JSX nesting | Deeply nested conditionals |

### Component Types

```
┌─────────────────────────────────────────────────────────┐
│  Page Component (apps/web/app/**/page.tsx)              │
│  - Data fetching (Server Component or useEffect)        │
│  - Layout composition                                   │
│  - Error boundaries                                     │
│  - NO business logic                                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Feature Component (components/features/*)              │
│  - Orchestrates UI + logic                              │
│  - Uses hooks for state/effects                         │
│  - May contain local state                              │
│  - 100-200 lines max                                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  UI Component (libs/ui or components/ui/*)              │
│  - Pure presentation                                    │
│  - Props in, JSX out                                    │
│  - No side effects                                      │
│  - < 80 lines ideal                                     │
└─────────────────────────────────────────────────────────┘
```

### Good Component Checklist

- [ ] Single responsibility (does ONE thing well)
- [ ] Clear, descriptive name (verb for actions, noun for display)
- [ ] Props are typed with interface (not inline)
- [ ] Default values for optional props
- [ ] No inline styles (use Tailwind classes)
- [ ] Event handlers named `handle*` (handleClick, handleSubmit)
- [ ] Loading/error states handled
- [ ] Accessible (aria labels, keyboard nav)

---

## 2. Custom Hooks Guidelines

### When to Extract a Hook

Extract when you see:
- `useState` + `useEffect` working together
- Logic reused across 2+ components
- Complex state updates
- API calls / async operations

### Hook Naming & Structure

```typescript
// ✅ Good: Verb + Noun, returns object
function useCharacterGeneration(characterId: string) {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [error, setError] = useState<Error | null>(null);
  
  const generate = useCallback(async () => { /* ... */ }, []);
  const cancel = useCallback(() => { /* ... */ }, []);
  
  return { status, error, generate, cancel, isLoading: status === 'loading' };
}

// ❌ Bad: Unclear name, returns array
function useGen() {
  return [data, loading, error, fetch, reset];
}
```

### Hook Categories

| Type | Purpose | Example |
|------|---------|---------|
| **Data hooks** | Fetch/cache data | `useCharacters()`, `useGallery(id)` |
| **Action hooks** | Trigger operations | `useGenerateImage()`, `useDeleteCharacter()` |
| **UI hooks** | Manage UI state | `useModal()`, `useToast()`, `useMediaQuery()` |
| **Form hooks** | Form state/validation | `useCharacterForm()`, `useLoginForm()` |

### Hook Rules

- [ ] Prefix with "use"
- [ ] Return object (not array) for > 2 values
- [ ] Handle loading, error, success states
- [ ] Provide reset/cancel methods when applicable
- [ ] Memoize callbacks with useCallback
- [ ] Memoize computed values with useMemo (only if expensive)
- [ ] Clean up side effects (return cleanup fn from useEffect)

---

## 3. File Organization

### Component File Structure

```
components/
  features/
    character-generator/
      CharacterGenerator.tsx      # Main component
      CharacterGeneratorForm.tsx  # Sub-component
      useCharacterGenerator.ts    # Feature hook
      types.ts                    # Local types
      index.ts                    # Barrel export
  ui/
    Button/
      Button.tsx
      index.ts
```

### Single File Component (when small)

```typescript
// Good for < 100 line components
// components/ui/Badge.tsx

interface BadgeProps {
  variant: 'success' | 'warning' | 'error';
  children: React.ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  const variantClasses = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800', 
    error: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-sm ${variantClasses[variant]}`}>
      {children}
    </span>
  );
}
```

---

## 4. State Management Patterns

### State Location Decision Tree

```
Is state used by ONE component only?
  └─ YES → useState in that component
  └─ NO → Is it shared by parent + children?
           └─ YES → Lift to nearest common ancestor
           └─ NO → Is it app-wide? (user, theme, etc.)
                    └─ YES → Context or Zustand
                    └─ NO → Props or composition
```

### Avoid Prop Drilling

```typescript
// ❌ Prop drilling (3+ levels)
<Page>
  <Section user={user}>
    <Card user={user}>
      <Avatar user={user} />
    </Card>
  </Section>
</Page>

// ✅ Context or composition
<UserProvider>
  <Page>
    <Section>
      <UserCard /> {/* Uses useUser() hook */}
    </Section>
  </Page>
</UserProvider>
```

---

## 5. React Context Best Practices

### When to Use Context

```
✅ USE Context for:
├── Auth state (user, session, permissions)
├── Theme/appearance settings
├── Locale/i18n
├── Feature flags
├── Modal/toast managers
└── Data that changes RARELY but is needed EVERYWHERE

❌ DON'T USE Context for:
├── Frequently changing data (causes re-renders everywhere)
├── Server state (use React Query/SWR instead)
├── Form state (use form libs or local state)
├── Data only needed in a subtree (just pass props)
└── "Avoiding prop drilling" when composition works
```

### Context Performance: Split by Update Frequency

```typescript
// ❌ BAD: Everything re-renders on ANY change
const AppContext = createContext({ user, theme, notifications, cart });

// ✅ GOOD: Split by update frequency
const AuthContext = createContext<AuthState>(null);      // Rarely changes
const ThemeContext = createContext<ThemeState>(null);    // Rarely changes
const NotificationContext = createContext<NotificationState>(null); // Changes often → isolate
```

### Separate State from Dispatch

```typescript
// ✅ Prevents unnecessary re-renders

// State context - components that READ subscribe here
const CharacterStateContext = createContext<CharacterState | null>(null);

// Dispatch context - components that WRITE subscribe here
const CharacterDispatchContext = createContext<CharacterDispatch | null>(null);

function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(characterReducer, initialState);
  
  return (
    <CharacterStateContext.Provider value={state}>
      <CharacterDispatchContext.Provider value={dispatch}>
        {children}
      </CharacterDispatchContext.Provider>
    </CharacterStateContext.Provider>
  );
}

// Consumer hooks
function useCharacterState() {
  const ctx = useContext(CharacterStateContext);
  if (!ctx) throw new Error('useCharacterState must be used within CharacterProvider');
  return ctx;
}

function useCharacterDispatch() {
  const ctx = useContext(CharacterDispatchContext);
  if (!ctx) throw new Error('useCharacterDispatch must be used within CharacterProvider');
  return ctx;
}
```

### Context File Structure

```
libs/shared/src/contexts/
  auth/
    AuthContext.tsx       # Provider + context creation
    useAuth.ts            # Consumer hook
    types.ts              # AuthState, AuthActions
    index.ts              # Barrel export
  theme/
    ThemeContext.tsx
    useTheme.ts
    index.ts
```

### Composition Over Context

Often you don't need Context — use composition:

```typescript
// ❌ Prop drilling problem
function Page() {
  const user = useUser();
  return <Layout user={user}><Sidebar user={user}><Avatar user={user} /></Sidebar></Layout>;
}

// ✅ Composition: Pass the component, not the data
function Page() {
  const user = useUser();
  return (
    <Layout>
      <Sidebar avatar={<Avatar user={user} />} />
    </Layout>
  );
}
```

### RYLA Recommended Contexts

```
✅ AuthContext       → User session, login/logout
✅ ThemeContext      → Dark/light mode
✅ ToastContext      → Global notifications/toasts
✅ ModalContext      → Modal management (optional)

❌ CharacterContext  → Use React Query (server state)
❌ GalleryContext    → Use React Query (server state)
❌ GenerationContext → Use local state + hooks (page-specific)
```

---

## 6. Refactoring Process

### Step-by-Step Approach

1. **IDENTIFY** → Find code smells (see below)
2. **TEST** → Ensure existing behavior is covered
3. **EXTRACT** → Pull out one piece at a time
4. **SIMPLIFY** → Remove duplication, clarify naming
5. **VERIFY** → Run tests, manual smoke test
6. **DOCUMENT** → Update types, add JSDoc if complex

### Code Smells to Target

| Smell | Signal | Action |
|-------|--------|--------|
| **God Component** | > 300 lines | Split into feature + UI components |
| **Prop Drilling** | > 3 levels | Extract context or compose |
| **Copy-Paste Logic** | Same code 2+ places | Extract hook or util |
| **Mixed Concerns** | Fetch + render + business logic | Separate into layers |
| **Inline Callbacks** | `onClick={() => ...}` everywhere | Extract handlers |
| **Magic Strings** | `status === 'PENDING_REVIEW'` | Use const/enum |
| **Nested Ternaries** | `a ? b ? c : d : e` | Extract to function or early return |

### Refactoring Priorities

```
HIGH PRIORITY (do first):
├── Security issues
├── Bugs caused by complexity
├── Pages with > 500 lines
└── Duplicated business logic

MEDIUM PRIORITY:
├── Components with > 10 props
├── Hooks doing too much
└── Inconsistent patterns

LOW PRIORITY (nice to have):
├── Minor naming improvements
├── Code style consistency
└── Micro-optimizations
```

---

## 7. Performance Patterns

### Memoization Rules

```typescript
// ✅ useMemo: Expensive computation
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// ✅ useCallback: Stable reference for child props
const handleDelete = useCallback((id: string) => {
  deleteItem(id);
}, [deleteItem]);

// ❌ Don't memoize cheap operations
const fullName = useMemo(() => `${first} ${last}`, [first, last]); // Overkill
const fullName = `${first} ${last}`; // Just do it
```

### When to Use React.memo

```typescript
// ✅ Use when:
// - Component renders often due to parent re-renders
// - Component receives stable props but parent changes
// - Component is expensive to render

export const ExpensiveList = memo(function ExpensiveList({ items }: Props) {
  return <>{items.map(renderItem)}</>;
});

// ❌ Don't use when:
// - Props change on every render anyway
// - Component is cheap to render
// - Premature optimization
```

---

## 8. Error Handling Patterns

### Component Error Boundaries

```typescript
// libs/ui/src/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Async Error Handling in Hooks

```typescript
function useGenerateImage() {
  const [state, setState] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    data: Image | null;
    error: Error | null;
  }>({ status: 'idle', data: null, error: null });

  const generate = useCallback(async (params: GenerateParams) => {
    setState({ status: 'loading', data: null, error: null });
    try {
      const result = await api.generate(params);
      setState({ status: 'success', data: result, error: null });
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, []);

  return { ...state, generate, isLoading: state.status === 'loading' };
}
```

### Consistent Error Display

```typescript
interface ErrorMessageProps {
  error: Error | string | null;
  retry?: () => void;
}

function ErrorMessage({ error, retry }: ErrorMessageProps) {
  if (!error) return null;
  
  const message = typeof error === 'string' ? error : error.message;
  
  return (
    <div role="alert" className="rounded-lg bg-red-50 p-4 text-red-800">
      <p>{message}</p>
      {retry && (
        <button onClick={retry} className="mt-2 text-sm underline">
          Try again
        </button>
      )}
    </div>
  );
}
```

---

## 9. TypeScript Patterns

### Props Interfaces

```typescript
// ✅ Export props interface (allows extension)
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

// ✅ Extend HTML attributes when wrapping native elements
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}
```

### Discriminated Unions for State

```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// TypeScript knows: if status === 'success', data exists
```

### Type Guards

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

function isSuccess<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
  return response.success === true;
}
```

### Avoid

```typescript
// ❌ any
const data: any = await fetch(...);

// ❌ Type assertions without validation
const user = data as User;

// ❌ Non-null assertions without checks
const name = user!.name;

// ✅ Runtime validation with Zod
const user = UserSchema.parse(data);
```

---

## 10. Data Fetching Patterns

### Server State vs Client State

```
Server State (use React Query/SWR):
├── Characters list
├── Gallery images
├── User profile
├── Prompts
└── Any data from API

Client State (use useState/useReducer):
├── Form inputs
├── UI toggles (modals, dropdowns)
├── Selected items
├── Local filters/search
└── Wizard/stepper progress
```

### React Query Pattern

```typescript
// hooks/useCharacters.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    queryFn: () => api.getCharacters(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: ['characters', id],
    queryFn: () => api.getCharacter(id),
    enabled: !!id,
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCharacterInput) => api.createCharacter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['characters'] });
    },
  });
}
```

---

## 11. Form Patterns

### Simple Forms (< 5 fields)

```typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      setError('Invalid credentials');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      {error && <ErrorMessage error={error} />}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Complex Forms (> 5 fields, validation)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const characterSchema = z.object({
  name: z.string().min(1, 'Required').max(50),
  age: z.number().min(18).max(80),
  style: z.enum(['realistic', 'anime']),
  bio: z.string().max(500).optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

function CharacterForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
  });
  
  const onSubmit = async (data: CharacterFormData) => {
    await createCharacter(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

---

## 12. Next.js Server vs Client Components

### Decision Matrix

| Use SERVER Component when: | Use CLIENT Component when: |
|----------------------------|----------------------------|
| Fetching data | useState, useEffect, useContext |
| Accessing backend resources directly | Event handlers (onClick, onChange) |
| Keeping sensitive info on server | Browser APIs (localStorage, window) |
| Large dependencies that don't need client JS | Custom hooks with state |
| Static content | Third-party libs that use React state |

### Pattern: Server Parent, Client Children

```typescript
// app/studio/page.tsx (Server Component)
import { getCharacters } from '@ryla/data';
import { StudioClient } from './StudioClient';

export default async function StudioPage() {
  const characters = await getCharacters();
  return <StudioClient initialCharacters={characters} />;
}

// app/studio/StudioClient.tsx (Client Component)
'use client';

export function StudioClient({ initialCharacters }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  // Interactive logic here
}
```

---

## 13. Tailwind Organization

### Class Order Convention

```typescript
// Consistent order: Layout → Sizing → Spacing → Visual → Interactive → Responsive
<div className="
  flex flex-col              // Layout
  w-full max-w-md            // Sizing  
  p-4 gap-2                  // Spacing
  bg-white rounded-lg shadow // Visual
  hover:shadow-lg            // Interactive
  md:flex-row md:p-6         // Responsive
">
```

### Use cn() Helper

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<button className={cn(
  'px-4 py-2 rounded-lg font-medium transition-colors',
  variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
  variant === 'secondary' && 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  disabled && 'opacity-50 cursor-not-allowed',
)}>
```

### Avoid Dynamic Classes

```typescript
// ❌ Breaks Tailwind purge
<div className={`text-${color}-500`}>

// ✅ Use explicit classes
const colorClasses = {
  red: 'text-red-500',
  blue: 'text-blue-500',
};
<div className={colorClasses[color]}>
```

---

## 14. Constants & Magic Values

```typescript
// ❌ Magic strings scattered everywhere
if (status === 'pending_review') { ... }

// ✅ Centralized constants
// libs/shared/src/constants/generation.ts

export const GENERATION_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type GenerationStatus = typeof GENERATION_STATUS[keyof typeof GENERATION_STATUS];

// Usage
if (status === GENERATION_STATUS.PENDING) { ... }
```

---

## 15. Accessibility Checklist

### Every Interactive Component

- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Focus visible indicator
- [ ] Appropriate ARIA role/labels
- [ ] Color contrast ≥ 4.5:1

### Forms

- [ ] Labels linked to inputs (htmlFor + id)
- [ ] Error messages linked (aria-describedby)
- [ ] Required fields marked (aria-required)

### Images

- [ ] Alt text (or alt="" for decorative)

### Modals

- [ ] Focus trap
- [ ] Escape to close
- [ ] Return focus on close
- [ ] aria-modal="true"

---

## 16. Refactoring Examples

### Before: God Component (400+ lines)

```typescript
// ❌ Mixed concerns, too many state variables
export default function StudioPage() {
  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [pose, setPose] = useState(null);
  // ... 20 more state variables
  
  useEffect(() => { /* fetch characters */ }, []);
  useEffect(() => { /* polling logic */ }, []);
  useEffect(() => { /* analytics */ }, []);
  
  const handleGenerate = async () => { /* 50 lines */ };
  const handleSelectPose = () => { /* 30 lines */ };
  // ... 10 more handlers
  
  return (
    <div>
      {/* 200 lines of JSX with inline conditionals */}
    </div>
  );
}
```

### After: Composed Structure

```typescript
// ✅ Page: ~50 lines, orchestrates features
export default function StudioPage() {
  return (
    <StudioLayout>
      <CharacterSelector />
      <GenerationPanel />
      <GalleryPreview />
    </StudioLayout>
  );
}

// ✅ Feature component: ~100 lines
function GenerationPanel() {
  const { character } = useSelectedCharacter();
  const { generate, status, error } = useImageGeneration();
  const { prompt, pose, setPrompt, setPose } = usePromptBuilder();
  
  return (
    <Card>
      <PromptInput value={prompt} onChange={setPrompt} />
      <PoseSelector value={pose} onChange={setPose} />
      <GenerateButton onClick={generate} loading={status === 'loading'} />
      {error && <ErrorMessage error={error} />}
    </Card>
  );
}

// ✅ Hook: ~60 lines, encapsulates logic
function useImageGeneration() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // ... clean, focused logic
  return { generate, status, error, cancel };
}
```

---

## Acceptance Criteria for Refactored Code

Before merging any refactor:

- [ ] Component < 200 lines (prefer < 100)
- [ ] Single responsibility (can describe in one sentence)
- [ ] Props interface defined and exported
- [ ] No prop drilling > 2 levels
- [ ] Hooks extracted for reusable logic
- [ ] Loading/error states handled
- [ ] No TypeScript `any` types
- [ ] Tailwind classes used (no inline styles)
- [ ] Existing tests still pass
- [ ] No console errors/warnings
- [ ] Accessible (keyboard nav, aria labels where needed)

---

## Related Documentation

- [Code Style Rules](../../.cursor/rules/code-style.md)
- [Architecture Rules](../../.cursor/rules/architecture.mdc)
- [Testing Guidelines](./TESTING-GUIDE.md)

