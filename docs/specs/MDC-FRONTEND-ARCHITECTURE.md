# MDC Frontend Architecture

> Source: `/Users/admin/Documents/Projects/MDC/mdc-next-frontend`
> Last analyzed: 2025-12-04

## Overview

The MDC (My Dream Companion) frontend is a full-featured Next.js 15 application with AI character chat, image generation, subscriptions, and creator tools.

## Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.1 |
| React | React | 19 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | shadcn/ui + Radix | Latest |
| State Management | Zustand | 5.x |
| Server State | TanStack Query | 5.80 |
| Forms | React Hook Form + Zod | 7.58 / 3.25 |
| HTTP Client | Axios | 1.10 |
| i18n | next-intl | 4.3 |
| CMS | Sanity | 4.6 |
| Animation | Motion (Framer) | 12.x |
| Real-time | Socket.io | 4.8 |
| Auth | Supabase SSR | 0.6 |
| Monitoring | Sentry | 10 |

---

## Directory Structure

```
mdc-next-frontend/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n routes
│   │   ├── (protected)/   # Auth-required routes
│   │   └── (public)/      # Public routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # shadcn/ui primitives
│   ├── auth/             # Auth components
│   ├── chat/             # Chat interface
│   ├── character/        # Character display
│   ├── create-character/ # Character creation flow
│   ├── modals/           # Modal dialogs
│   └── layouts/          # Page layouts
├── hooks/                 # Custom hooks
│   ├── queries/          # TanStack Query hooks
│   ├── mutations/        # Mutation hooks
│   ├── forms/            # Form hooks
│   └── socket/           # WebSocket hooks
├── services/             # API service layer
├── store/                # Zustand stores
│   └── states/           # Store slices
├── lib/                  # Utilities
│   ├── axios.ts          # HTTP client config
│   └── store/            # Store utilities
├── constants/            # App constants
├── types/                # TypeScript types
├── utils/                # Helper functions
├── providers/            # React context providers
├── messages/             # i18n translations (16 languages)
└── sanity/               # CMS schema
```

---

## State Management Architecture

### Zustand Store Structure

```typescript
// store/state.ts
interface IStore {
    app: IAppState;           // Global app state
    auth: IAuthState;         // Authentication
    chat: IChatState;         // Chat interface
    modal: IModalState;       // Modal management
    createCharacter: ICreateCharacterState;
    contentGeneration: IContentGenerationState;
    characterCreationMode: ICharacterCreationModeState;
}

// Usage pattern
export const store = createStore<IStore>()(
    immer(
        devtools(
            (...a) => ({
                app: createAppStore(...a),
                auth: createAuthStore(...a),
                // ... other slices
            }),
            { name: "MDC Store" },
        ),
    ),
);
```

### Store Access Patterns

```typescript
// Hook usage (reactive)
const user = useStore((state) => state.auth.user);

// Direct access (non-reactive)
const token = getStore().auth.authToken;
```

---

## Data Fetching Patterns

### Service Layer

```typescript
// services/authService.ts
export const authService = {
    signUp: async (data: SignUpPayload): Promise<AuthResponse> => {
        const { data: res } = await axios.post<AuthResponse>("/auth/signup", data);
        return res;
    },
    
    getMe: async (): Promise<User> => {
        const { data: res } = await axios.get<User>("/auth/me", {
            withCredentials: true,
        });
        return res;
    },
};
```

### TanStack Query Hooks

```typescript
// hooks/queries/use-auth.ts
export const useMe = (enabled: boolean) =>
    useQuery({
        queryKey: ["me"],
        queryFn: () => authService.getMe(),
        enabled: enabled,
    });

// hooks/mutations/use-payment.ts
export const useConfirmPayment = () =>
    useMutation<PaymentResponse, AxiosError<ApiError>, number>({
        mutationFn: (productId: number) => paymentServices.confirmPayment(productId),
    });
```

### Query Invalidation

```typescript
export const useSaveOnboarding = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => authService.saveOnboardingDetails(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
    });
};
```

---

## HTTP Client Configuration

```typescript
// lib/axios.ts
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 300000,  // 5 minutes for long operations
    headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach token
axiosInstance.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Response interceptor - handle 401
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            getStore().auth.logoutUser();
            getStore().modal.setOpen({ trigger: ModalTriggers.AUTH_USER });
        }
        return Promise.reject(error);
    },
);
```

---

## Form Management

### Form Hook Pattern

```typescript
// hooks/forms/use-chat-form.ts
export const useChatForm = () => {
    const form = useForm<ChatSchema>({
        resolver: zodResolver(chatSchema),
        defaultValues: { message: "" },
    });
    
    return { form };
};
```

### With Validation Schema

```typescript
const chatSchema = z.object({
    message: z.string().min(1, "Message required"),
});

type ChatSchema = z.infer<typeof chatSchema>;
```

---

## Authentication Flow

### OAuth Providers
- Google
- Discord
- Twitter

### Auth State Management

```typescript
// Store slice
interface IAuthState {
    user: User | null;
    authToken: string | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logoutUser: () => void;
}
```

### Protected Routes

```typescript
// hooks/useAuthGuard.ts
export const useAuthGuard = () => {
    const isAuthenticated = useStore((state) => state.auth.isAuthenticated);
    const router = useRouter();
    
    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated]);
};
```

---

## Real-time Features

### Socket.io Integration

```typescript
// hooks/socket/use-socket.ts
const socket = io(WS_URL, {
    auth: { token },
    transports: ["websocket"],
});

// Event handling
socket.on("message", (data) => {
    // Update chat state
});
```

---

## UI Component Library

### shadcn/ui Components
- Dialog, Drawer, Sheet
- Form inputs (Input, Select, Checkbox)
- Button, Badge, Avatar
- Tooltip, Popover
- Carousel (Embla)

### Custom Components
- `SmartImage` - Optimized image loading
- `CustomInput` - Enhanced form input
- `AlertToast` - Toast notifications (Sonner)
- `LanguageSwitcher` - i18n selector
- `SaleBanner` - Promotional banner

---

## Internationalization

### Supported Languages (16)
English, German, French, Spanish, Italian, Portuguese, Dutch, Polish, Russian, Ukrainian, Turkish, Arabic, Hindi, Japanese, Korean, Chinese

### Implementation

```typescript
// i18n/routing.ts
export const routing = defineRouting({
    locales: ['en', 'de', 'fr', ...],
    defaultLocale: 'en',
});

// Usage
import { useTranslations } from 'next-intl';
const t = useTranslations('Chat');
```

---

## Key Patterns for MVP

### 1. Service → Query → Component

```
services/authService.ts
    ↓
hooks/queries/use-auth.ts
    ↓
components/auth/LoginForm.tsx
```

### 2. Zustand for UI State, TanStack for Server State

```typescript
// UI state (Zustand)
const isModalOpen = useStore((state) => state.modal.isOpen);

// Server state (TanStack Query)
const { data: user } = useMe(true);
```

### 3. Form Hooks for Complex Forms

```typescript
const { form } = useCharacterBasicInfoForm();
// Contains validation, defaults, submission logic
```

### 4. Guard Hooks for Access Control

```typescript
useAuthGuard();      // Auth required
useCoinsGuard();     // Coins balance check
useSubscriptionGuard(); // Premium check
```

---

## Environment Variables

```bash
# API
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=

# CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=

# Payments
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=
```

---

## Reusable Patterns for RYLA

1. **Service layer abstraction** - Clean API calls
2. **Query/Mutation hooks** - TanStack Query wrappers
3. **Zustand store slices** - Modular state management
4. **Axios interceptors** - Auth token injection + error handling
5. **Form hooks** - Reusable form logic with Zod
6. **Guard hooks** - Route/feature protection
7. **i18n routing** - Multi-language support

