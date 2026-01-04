# [EPIC] EP-022: Unified Login/Registration Page

## Overview

Transform the separate login and registration pages into a single, intelligent authentication page that automatically detects whether a user exists and adapts the form accordingly. This creates a modern, streamlined user experience that reduces friction and improves activation rates.

---

## Business Impact

**Target Metric**: A - Activation

**Hypothesis**: When users encounter a single, intelligent authentication page that automatically adapts to their account status, they will experience less friction and complete authentication at higher rates.

**Success Criteria**:
- Authentication completion rate: **>85%** (up from baseline)
- Time to authenticate: **<30 seconds** (reduced from current)
- Form abandonment: **<20%** (reduced from current)
- User satisfaction: **>4.5/5** (qualitative feedback)

---

## Features

### F1: Email-First Progressive Form

- Single email input field as initial entry point
- Real-time email validation (format check)
- Automatic email existence check on blur/enter (debounced)
- Smooth transition animations between states
- Visual feedback during email check (loading state)

**Flow:**
1. User enters email → format validation
2. On valid email + blur/enter → check if exists
3. If exists → reveal password field (login mode)
4. If not exists → reveal registration fields (signup mode)

### F2: Dynamic Form Adaptation

**Login Mode** (email exists):
- Email field (pre-filled, read-only or editable)
- Password field appears with smooth animation
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" button

**Registration Mode** (email doesn't exist):
- Email field (pre-filled, editable)
- Full name field
- Username (public name) field
- Password field with strength indicator
- Confirm password field
- Terms of Service checkbox
- "Create Account" button

### F3: Enhanced UI/UX Design

- **Modern Visual Design**:
  - Clean, minimalist layout
  - Smooth micro-interactions and transitions
  - Glassmorphism effects (consistent with existing MagicCard)
  - Gradient accents (purple-to-pink, consistent with brand)
  - Subtle animations for state changes

- **User Experience Enhancements**:
  - Clear visual hierarchy
  - Helpful inline validation messages
  - Password strength indicator (registration mode)
  - Password match indicator (registration mode)
  - Loading states for all async operations
  - Error states with clear messaging
  - Success states with confirmation

- **Accessibility**:
  - Keyboard navigation support
  - ARIA labels for screen readers
  - Focus management
  - High contrast mode support
  - Mobile-responsive design

### F4: Social Authentication (Always Visible)

- Google OAuth button always visible at bottom
- Consistent placement regardless of login/registration mode
- Clear "OR CONTINUE WITH" separator
- Proper error handling for OAuth failures
- Loading states during OAuth flow

### F5: Email Existence Check API

- New API endpoint: `GET /api/auth/check-email?email={email}`
- Returns: `{ exists: boolean }`
- Debounced client-side (300ms)
- Rate limiting to prevent abuse
- Security: Returns generic response to prevent enumeration (optional, can be relaxed for UX)

### F6: State Management & Transitions

- Smooth transitions between login/registration modes
- Form state persistence (localStorage) for better UX
- Ability to switch modes manually (e.g., "Already have account?" / "Don't have account?")
- Preserve entered data when switching modes
- Clear visual indicators of current mode

---

## Acceptance Criteria

### AC-1: Email-First Entry

- [ ] User sees single email input field on page load
- [ ] Email format validation works in real-time
- [ ] Invalid email format shows clear error message
- [ ] Valid email triggers existence check on blur or Enter key
- [ ] Loading indicator shows during email check
- [ ] Email check is debounced (300ms) to prevent excessive API calls

### AC-2: Login Mode (Email Exists)

- [ ] Password field appears with smooth animation after email check
- [ ] Email field is pre-filled (read-only or editable based on design)
- [ ] "Remember me" checkbox is visible
- [ ] "Forgot password?" link is visible and functional
- [ ] "Sign In" button is enabled when password is entered
- [ ] Login flow works correctly (redirects, session management)
- [ ] Error handling for wrong password works correctly

### AC-3: Registration Mode (Email Doesn't Exist)

- [ ] Registration fields appear with smooth animation after email check
- [ ] All required fields are visible: email, full name, username, password, confirm password
- [ ] Password strength indicator works correctly
- [ ] Password match indicator works correctly
- [ ] Terms of Service checkbox is visible and required
- [ ] "Create Account" button is enabled when all fields are valid
- [ ] Registration flow works correctly (redirects, session management)
- [ ] Error handling for duplicate email/username works correctly

### AC-4: Mode Switching

- [ ] User can manually switch between login/registration modes
- [ ] Switching modes preserves email field value
- [ ] Switching modes clears password/registration-specific fields
- [ ] Clear visual indicators show current mode
- [ ] Smooth transitions between modes

### AC-5: Social Authentication

- [ ] Google OAuth button is always visible at bottom
- [ ] "OR CONTINUE WITH" separator is visible
- [ ] Google OAuth flow works correctly
- [ ] OAuth errors are handled gracefully
- [ ] Loading states show during OAuth flow
- [ ] OAuth success redirects correctly

### AC-6: UI/UX Quality

- [ ] All animations are smooth (60fps)
- [ ] Loading states are clear and non-blocking
- [ ] Error messages are helpful and actionable
- [ ] Success states provide clear feedback
- [ ] Design is consistent with existing Ryla.ai brand
- [ ] Mobile responsive (works on all screen sizes)
- [ ] Keyboard navigation works correctly
- [ ] Focus management is proper (no focus traps)

### AC-7: API Integration

- [ ] Email existence check endpoint works correctly
- [ ] API calls are properly debounced
- [ ] Rate limiting is respected
- [ ] Error handling for API failures works correctly
- [ ] Network errors show user-friendly messages

### AC-8: Accessibility

- [ ] All form fields have proper labels
- [ ] ARIA attributes are correct
- [ ] Keyboard navigation works for all interactive elements
- [ ] Screen reader announcements work correctly
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG AA standards

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `auth_page_viewed` | Unified auth page loaded | `source`, `returnUrl` |
| `auth_email_entered` | User enters email | `email_length` |
| `auth_email_checked` | Email existence check completes | `exists`, `response_time_ms` |
| `auth_mode_detected` | Login/registration mode determined | `mode` (login/register) |
| `auth_mode_switched` | User manually switches mode | `from_mode`, `to_mode` |
| `auth_login_started` | Login form submitted | `method` (email/google) |
| `auth_login_completed` | Login success | `method`, `remember_me` |
| `auth_login_failed` | Login error | `error_type` |
| `auth_signup_started` | Registration form submitted | - |
| `auth_signup_completed` | Registration success | - |
| `auth_signup_failed` | Registration error | `error_type` |
| `auth_oauth_started` | OAuth button clicked | `provider` (google) |
| `auth_oauth_completed` | OAuth success | `provider` |
| `auth_oauth_failed` | OAuth error | `provider`, `error_type` |
| `auth_form_abandoned` | User leaves page without completing | `mode`, `fields_completed` |

---

## User Stories

### ST-075: Enter Email on Unified Auth Page

**As a** new or returning user  
**I want to** enter my email on a single, unified authentication page  
**So that** the system automatically detects whether I have an account and shows the appropriate form

**AC**: AC-1, AC-2, AC-3

### ST-076: Automatic Form Detection

**As a** user entering my email  
**I want to** see the form automatically adapt based on whether my email exists  
**So that** I don't have to choose between login and registration manually

**AC**: AC-1, AC-2, AC-3

### ST-077: Smooth Form Transitions

**As a** user entering my email  
**I want to** see smooth animations when the form adapts to login or registration mode  
**So that** the experience feels polished and modern

**AC**: AC-2, AC-3, AC-6

### ST-078: Login with Existing Account

**As a** returning user with an existing account  
**I want to** see only the password field after entering my email  
**So that** I can quickly sign in without seeing unnecessary registration fields

**AC**: AC-2

### ST-079: Register New Account

**As a** new user without an account  
**I want to** see the full registration form after entering my email  
**So that** I can create an account with all required information

**AC**: AC-3

### ST-080: Manual Mode Switching

**As a** user who made a mistake or wants to switch modes  
**I want to** manually switch between login and registration modes  
**So that** I can correct my path without losing my entered email

**AC**: AC-4

### ST-081: Social Login Always Available

**As a** user  
**I want to** see Google login option always visible at the bottom of the form  
**So that** I can quickly authenticate without filling forms, regardless of login or registration mode

**AC**: AC-5

### ST-082: Real-Time Email Validation

**As a** user entering my email  
**I want to** see immediate feedback if my email format is invalid  
**So that** I can correct errors before submitting

**AC**: AC-1

### ST-083: Password Strength Indicator

**As a** new user registering  
**I want to** see a password strength indicator as I type  
**So that** I can create a secure password that meets requirements

**AC**: AC-3

### ST-084: Password Match Confirmation

**As a** new user registering  
**I want to** see visual confirmation when my password and confirm password fields match  
**So that** I know my passwords are correctly entered

**AC**: AC-3

### ST-085: Access Forgot Password

**As a** user trying to log in  
**I want to** access the forgot password link when in login mode  
**So that** I can reset my password if I've forgotten it

**AC**: AC-2

### ST-086: Remember Me Option

**As a** returning user logging in  
**I want to** use the "Remember me" checkbox  
**So that** I stay logged in across browser sessions

**AC**: AC-2

---

## Technical Notes

### Email Existence Check Endpoint

```typescript
// apps/api/src/modules/auth/auth.controller.ts
@Get('check-email')
@SkipAuth()
@ApiOperation({ summary: 'Check if email exists' })
public async checkEmail(
  @Query('email') email: string,
): Promise<{ exists: boolean }> {
  // Optional: Add rate limiting per IP
  const exists = await this.authService.checkEmailExists(email);
  return { exists };
}
```

### Client-Side Email Check

```typescript
// apps/web/lib/auth.ts or apps/web/hooks/use-email-check.ts
const checkEmailExists = async (email: string): Promise<boolean> => {
  const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
  const data = await response.json();
  return data.exists;
};

// With debouncing
const debouncedCheckEmail = debounce(checkEmailExists, 300);
```

### Form State Management

```typescript
// apps/web/app/auth/page.tsx
type AuthMode = 'email' | 'login' | 'register';

const [mode, setMode] = useState<AuthMode>('email');
const [email, setEmail] = useState('');
const [emailExists, setEmailExists] = useState<boolean | null>(null);
const [isCheckingEmail, setIsCheckingEmail] = useState(false);

// On email blur/enter
const handleEmailCheck = async () => {
  if (!isValidEmail(email)) return;
  
  setIsCheckingEmail(true);
  const exists = await checkEmailExists(email);
  setEmailExists(exists);
  setIsCheckingEmail(false);
  
  setMode(exists ? 'login' : 'register');
};
```

### Animation Transitions

```typescript
// Use Framer Motion or CSS transitions
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {mode === 'login' && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Login fields */}
    </motion.div>
  )}
  {mode === 'register' && (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Registration fields */}
    </motion.div>
  )}
</AnimatePresence>
```

### Route Structure

```
/app/auth/page.tsx  (new unified page)
/app/login/page.tsx (redirect to /auth?mode=login)
/app/register/page.tsx (redirect to /auth?mode=register)
```

---

## Non-Goals (Phase 2+)

- Additional social providers (Apple, GitHub, etc.)
- Magic link authentication
- Two-factor authentication (2FA)
- Biometric authentication
- Account recovery via phone number
- Email verification requirement before login

---

## Dependencies

- EP-002: User Authentication & Settings (existing auth system)
- Supabase Auth (for OAuth integration)
- Existing UI components from `@ryla/ui`
- PostHog for analytics

---

## Design References

- Current login/register pages for visual consistency
- Modern auth flows (Linear, Vercel, Stripe)
- Glassmorphism and gradient design patterns
- Smooth animation libraries (Framer Motion or CSS transitions)

---

---

## P3: Architecture Design

### Component Architecture

```
apps/web/app/auth/
  ├── page.tsx                    # Main unified auth page
  └── components/
      ├── EmailInput.tsx          # Email input with validation
      ├── LoginForm.tsx           # Login mode form (password, remember me)
      ├── RegisterForm.tsx        # Registration mode form (all fields)
      ├── SocialAuth.tsx          # Google OAuth button (always visible)
      └── ModeSwitcher.tsx        # Manual mode switching component

apps/web/lib/
  ├── auth.ts                     # Existing auth functions (extend)
  └── hooks/
      └── use-email-check.ts      # Email existence check hook

apps/web/components/
  └── password-strength.tsx       # Existing (reuse)
```

### API Architecture

**New Endpoint:**
```
GET /api/auth/check-email?email={email}
Response: { exists: boolean }
```

**Implementation:**
- Add to `apps/api/src/modules/auth/auth.controller.ts`
- Add `checkEmailExists()` method to `AuthService`
- Use existing `UsersRepository.findByEmail()`
- Add rate limiting (optional, for security)

### State Management Flow

```
1. Initial State: mode = 'email'
   - Only email input visible
   - Social auth button visible

2. User enters email → validate format
   - If invalid: show error, stay in 'email' mode
   - If valid: trigger email check (debounced 300ms)

3. Email Check Loading: mode = 'email', isCheckingEmail = true
   - Show loading indicator
   - Disable form inputs

4. Email Check Complete:
   - If exists: mode = 'login', show password field
   - If not exists: mode = 'register', show registration fields
   - Preserve email value

5. Form Submission:
   - Login mode: call login() → redirect
   - Register mode: call register() → redirect
```

### Data Flow Diagram

```
User Input (Email)
    ↓
Email Validation (client-side)
    ↓
Debounced API Call (300ms)
    ↓
GET /api/auth/check-email
    ↓
AuthService.checkEmailExists()
    ↓
UsersRepository.findByEmail()
    ↓
Response: { exists: boolean }
    ↓
Update UI State
    ↓
Show Login Form OR Registration Form
```

### Integration Points

1. **Existing Auth System** (`apps/web/lib/auth.ts`)
   - Extend with `checkEmailExists()` function
   - Reuse `login()` and `register()` functions
   - Maintain token management

2. **Auth Context** (`apps/web/lib/auth-context.tsx`)
   - Update `PUBLIC_ROUTES` to include `/auth`
   - Redirect logic remains the same

3. **UI Components** (`@ryla/ui`)
   - Reuse: `Input`, `Label`, `RylaButton`, `MagicCard`, `FadeInUp`
   - Reuse: `Button` for Google OAuth

4. **Password Strength** (`apps/web/components/password-strength.tsx`)
   - Reuse existing component
   - Already has validation logic

### Route Updates

```typescript
// apps/web/app/login/page.tsx
// Redirect to unified auth page
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    router.replace(`/auth?mode=login&${searchParams.toString()}`);
  }, []);
  return null;
}

// apps/web/app/register/page.tsx
// Redirect to unified auth page
export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    router.replace(`/auth?mode=register&${searchParams.toString()}`);
  }, []);
  return null;
}
```

---

## P4: UI Skeleton & Mockups

### Layout Structure

```
┌─────────────────────────────────────┐
│         Ryla.ai Logo               │
│    "Create Your AI Influencer"     │
│                                     │
│  ┌─────────────────────────────┐  │
│  │   MagicCard Container        │  │
│  │                             │  │
│  │   [Email Input Field]       │  │
│  │   [Loading/Error States]    │  │
│  │                             │  │
│  │   ┌─────────────────────┐  │  │
│  │   │  Login Form         │  │  │
│  │   │  OR                 │  │  │
│  │   │  Register Form      │  │  │
│  │   └─────────────────────┘  │  │
│  │                             │  │
│  │   ─── OR CONTINUE WITH ─── │  │
│  │                             │  │
│  │   [Google OAuth Button]     │  │
│  │                             │  │
│  └─────────────────────────────┘  │
│                                     │
│   [Mode Switch Link]               │
└─────────────────────────────────────┘
```

### Component States

**1. Initial State (Email Only)**
- Email input field (focused)
- Placeholder: "you@example.com"
- No other fields visible
- Google button visible at bottom

**2. Email Check Loading**
- Email input (disabled)
- Loading spinner next to email field
- Text: "Checking..."
- Google button visible (disabled)

**3. Login Mode (Email Exists)**
- Email field (pre-filled, editable)
- Password field (appears with animation)
- "Remember me" checkbox
- "Forgot password?" link
- "Sign In" button
- Google button visible

**4. Registration Mode (Email Doesn't Exist)**
- Email field (pre-filled, editable)
- Full name field (appears with animation)
- Username field (appears with animation)
- Password field (appears with animation)
- Password strength indicator
- Confirm password field
- Password match indicator
- Terms checkbox
- "Create Account" button
- Google button visible

**5. Error States**
- Email format error: Red border, error message below
- Email check error: Error message in card
- Login error: Error message above form
- Registration error: Error message above form

### Animation Specifications

**Form Transition:**
- Duration: 200ms
- Easing: ease-out
- Effect: Fade + Slide (opacity 0→1, translateY 10px→0)

**Field Appearance:**
- Stagger delay: 50ms per field
- Same animation as form transition

**Loading State:**
- Spinner: 1s rotation
- Pulse effect on email field

### Responsive Design

**Mobile (< 640px):**
- Full width form (padding: 1rem)
- Stacked fields
- Larger touch targets (min 44px)
- Simplified animations

**Tablet (640px - 1024px):**
- Max width: 28rem
- Standard spacing

**Desktop (> 1024px):**
- Max width: 28rem
- Centered layout

---

## P5: Tech Spec

### File Structure

```
apps/web/
├── app/
│   ├── auth/
│   │   └── page.tsx                    # NEW: Unified auth page
│   ├── login/
│   │   └── page.tsx                    # MODIFY: Redirect to /auth
│   └── register/
│       └── page.tsx                    # MODIFY: Redirect to /auth
├── lib/
│   ├── auth.ts                         # MODIFY: Add checkEmailExists()
│   └── hooks/
│       └── use-email-check.ts         # NEW: Email check hook
└── components/
    └── password-strength.tsx           # EXISTING: Reuse

apps/api/
└── src/
    └── modules/
        └── auth/
            ├── auth.controller.ts      # MODIFY: Add check-email endpoint
            └── services/
                └── auth.service.ts     # MODIFY: Add checkEmailExists()
```

### API Specification

**Endpoint: `GET /api/auth/check-email`**

**Request:**
```typescript
Query Parameters:
  email: string (required, validated email format)
```

**Response:**
```typescript
Success (200):
{
  exists: boolean
}

Error (400):
{
  message: string  // "Invalid email format"
}

Error (429):
{
  message: string  // "Too many requests"
}
```

**Rate Limiting:**
- 10 requests per minute per IP
- Use existing rate limiting middleware

### Component Specifications

**1. `apps/web/app/auth/page.tsx`**

```typescript
Props: None
State:
  - mode: 'email' | 'login' | 'register'
  - email: string
  - emailExists: boolean | null
  - isCheckingEmail: boolean
  - formData: LoginFormData | RegisterFormData
  - error: string | null
  - isLoading: boolean

Functions:
  - handleEmailChange(email: string)
  - handleEmailCheck()
  - handleModeSwitch(mode: 'login' | 'register')
  - handleLoginSubmit()
  - handleRegisterSubmit()
  - handleGoogleAuth()
```

**2. `apps/web/lib/hooks/use-email-check.ts`**

```typescript
export function useEmailCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const checkEmail = useCallback(
    debounce(async (email: string): Promise<boolean> => {
      // Implementation
    }, 300),
    []
  );
  
  return { checkEmail, isChecking, error };
}
```

**3. `apps/web/lib/auth.ts` (Extension)**

```typescript
export async function checkEmailExists(email: string): Promise<boolean> {
  const response = await fetch(
    `${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to check email');
  }
  
  const data = await response.json();
  return data.exists;
}
```

### Dependencies

**New Dependencies:**
- `framer-motion` (for animations) - OR use CSS transitions
- No new dependencies if using CSS transitions

**Existing Dependencies:**
- `@ryla/ui` (UI components)
- `next/navigation` (routing)
- `react` (hooks, state)

### Environment Variables

No new environment variables required. Uses existing:
- `NEXT_PUBLIC_API_URL` (for API calls)

---

## P6: Implementation Plan

### Task Breakdown

**TSK-001: Backend API - Email Check Endpoint**
- [ ] Add `checkEmailExists()` method to `AuthService`
- [ ] Add `GET /api/auth/check-email` endpoint to `AuthController`
- [ ] Add rate limiting (10 req/min per IP)
- [ ] Add Swagger documentation
- [ ] Write unit tests

**TSK-002: Frontend - Email Check Hook**
- [ ] Create `apps/web/lib/hooks/use-email-check.ts`
- [ ] Implement debounced email check (300ms)
- [ ] Add error handling
- [ ] Add loading states

**TSK-003: Frontend - Auth Library Extension**
- [ ] Add `checkEmailExists()` to `apps/web/lib/auth.ts`
- [ ] Add proper error handling
- [ ] Add TypeScript types

**TSK-004: Frontend - Unified Auth Page**
- [ ] Create `apps/web/app/auth/page.tsx`
- [ ] Implement email-first flow
- [ ] Add mode state management
- [ ] Integrate email check hook
- [ ] Add form validation

**TSK-005: Frontend - Login Form Component**
- [ ] Extract login form to separate component (optional)
- [ ] Add password field with animation
- [ ] Add "Remember me" checkbox
- [ ] Add "Forgot password?" link
- [ ] Integrate with existing login function

**TSK-006: Frontend - Registration Form Component**
- [ ] Extract registration form to separate component (optional)
- [ ] Add all registration fields with animation
- [ ] Integrate password strength indicator
- [ ] Add password match validation
- [ ] Add terms checkbox
- [ ] Integrate with existing register function

**TSK-007: Frontend - Social Auth Component**
- [ ] Create reusable `SocialAuth` component
- [ ] Add Google OAuth button (placeholder for now)
- [ ] Ensure always visible at bottom
- [ ] Add loading states

**TSK-008: Frontend - Animations**
- [ ] Implement form transition animations
- [ ] Add field appearance animations
- [ ] Add loading state animations
- [ ] Test performance (60fps target)

**TSK-009: Frontend - Route Redirects**
- [ ] Update `/login` to redirect to `/auth?mode=login`
- [ ] Update `/register` to redirect to `/auth?mode=register`
- [ ] Update `PUBLIC_ROUTES` in auth-context
- [ ] Test redirect with returnUrl parameter

**TSK-010: Frontend - Error Handling**
- [ ] Add email format validation
- [ ] Add API error handling
- [ ] Add form submission error handling
- [ ] Add user-friendly error messages

**TSK-011: Frontend - Accessibility**
- [ ] Add ARIA labels to all inputs
- [ ] Ensure keyboard navigation works
- [ ] Add focus management
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA

**TSK-012: Frontend - Responsive Design**
- [ ] Test on mobile (< 640px)
- [ ] Test on tablet (640px - 1024px)
- [ ] Test on desktop (> 1024px)
- [ ] Ensure touch targets are adequate

### Implementation Order

1. **Backend First** (TSK-001)
   - API endpoint must be ready before frontend

2. **Frontend Foundation** (TSK-002, TSK-003)
   - Hooks and utilities before components

3. **Core Page** (TSK-004)
   - Main unified auth page structure

4. **Forms** (TSK-005, TSK-006)
   - Login and registration forms

5. **Enhancements** (TSK-007, TSK-008, TSK-009, TSK-010)
   - Social auth, animations, redirects, errors

6. **Polish** (TSK-011, TSK-012)
   - Accessibility and responsive design

### Estimated Effort

- Backend: 2-3 hours
- Frontend Core: 4-6 hours
- Forms: 3-4 hours
- Enhancements: 3-4 hours
- Polish: 2-3 hours
- **Total: 14-20 hours**

---

## P7: Testing

### Unit Tests

**Backend:**
```typescript
// apps/api/src/modules/auth/services/auth.service.spec.ts
describe('AuthService.checkEmailExists', () => {
  it('should return true if email exists', async () => {});
  it('should return false if email does not exist', async () => {});
  it('should handle invalid email format', async () => {});
  it('should respect rate limiting', async () => {});
});
```

**Frontend:**
```typescript
// apps/web/lib/hooks/__tests__/use-email-check.test.ts
describe('useEmailCheck', () => {
  it('should debounce email checks', async () => {});
  it('should handle API errors', async () => {});
  it('should set loading state correctly', async () => {});
});
```

### Integration Tests

**API Integration:**
```typescript
// apps/api/src/modules/auth/auth.controller.spec.ts
describe('GET /api/auth/check-email', () => {
  it('should return exists: true for existing email', async () => {});
  it('should return exists: false for new email', async () => {});
  it('should validate email format', async () => {});
  it('should enforce rate limiting', async () => {});
});
```

**Frontend Integration:**
```typescript
// apps/web/app/auth/__tests__/page.test.tsx
describe('AuthPage', () => {
  it('should show login form when email exists', async () => {});
  it('should show registration form when email does not exist', async () => {});
  it('should handle mode switching', async () => {});
  it('should submit login form correctly', async () => {});
  it('should submit registration form correctly', async () => {});
});
```

### E2E Tests (Playwright)

```typescript
// apps/web-e2e/tests/auth.spec.ts
describe('Unified Auth Page', () => {
  it('should detect existing email and show login form', async () => {});
  it('should detect new email and show registration form', async () => {});
  it('should allow manual mode switching', async () => {});
  it('should complete login flow', async () => {});
  it('should complete registration flow', async () => {});
  it('should handle form validation errors', async () => {});
  it('should redirect after successful auth', async () => {});
});
```

### Test Coverage Goals

- Unit tests: >80% coverage
- Integration tests: All critical paths
- E2E tests: Happy paths + error cases

### Manual Testing Checklist

- [ ] Email format validation works
- [ ] Email check debouncing works (300ms)
- [ ] Login form appears for existing emails
- [ ] Registration form appears for new emails
- [ ] Mode switching works correctly
- [ ] Password strength indicator works
- [ ] Password match validation works
- [ ] Form submissions work (login & register)
- [ ] Error messages are clear
- [ ] Animations are smooth (60fps)
- [ ] Mobile responsive design works
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Google OAuth button visible (placeholder)

---

## P8: Integration

### Integration Points

**1. Existing Auth System**
- ✅ Reuse `login()` and `register()` from `apps/web/lib/auth.ts`
- ✅ Reuse `AuthContext` for user state
- ✅ Maintain token management flow
- ✅ Keep redirect logic consistent

**2. Route System**
- ✅ Update `/login` and `/register` to redirect
- ✅ Update `PUBLIC_ROUTES` in auth-context
- ✅ Maintain `returnUrl` parameter support

**3. UI Components**
- ✅ Reuse existing `@ryla/ui` components
- ✅ Maintain design consistency
- ✅ Use existing `MagicCard` and `RylaButton`

**4. Analytics**
- ✅ Add PostHog events (see Analytics Events section)
- ✅ Track email checks, mode switches, form submissions

**5. Error Handling**
- ✅ Use existing error handling patterns
- ✅ Maintain consistent error message format

### Migration Strategy

**Phase 1: Add New Page (Non-Breaking)**
- Create `/auth` page
- Keep `/login` and `/register` working
- Test new page in parallel

**Phase 2: Redirect Old Routes**
- Update `/login` to redirect to `/auth?mode=login`
- Update `/register` to redirect to `/auth?mode=register`
- Test redirects work correctly

**Phase 3: Monitor & Optimize**
- Monitor analytics for usage
- Gather user feedback
- Optimize based on data

### Rollback Plan

If issues arise:
1. Revert route redirects (restore original pages)
2. Keep `/auth` page for testing
3. Fix issues in isolation
4. Re-deploy when ready

### Integration Checklist

- [ ] Backend API endpoint deployed and tested
- [ ] Frontend hooks and utilities implemented
- [ ] Unified auth page created and tested
- [ ] Old routes redirect correctly
- [ ] Auth context updated
- [ ] Analytics events firing
- [ ] Error handling integrated
- [ ] All tests passing
- [ ] E2E tests passing
- [ ] Manual testing complete

---

## P9: Deployment

### Pre-Deployment Checklist

**Backend:**
- [ ] API endpoint tested in staging
- [ ] Rate limiting configured
- [ ] Swagger documentation updated
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] No breaking changes to existing endpoints

**Frontend:**
- [ ] All components tested
- [ ] Animations performant (60fps)
- [ ] Responsive design verified
- [ ] Accessibility verified
- [ ] Unit tests passing
- [ ] E2E tests passing
- [ ] No console errors
- [ ] No TypeScript errors

**Environment:**
- [ ] Environment variables verified
- [ ] API URL configured correctly
- [ ] CORS settings correct (if needed)

### Deployment Steps

**1. Backend Deployment**
```bash
# Deploy API changes
cd apps/api
pnpm build
# Deploy to production (follow existing deployment process)
```

**2. Frontend Deployment**
```bash
# Build frontend
cd apps/web
pnpm build
# Deploy to Vercel (or existing deployment process)
```

**3. Verification**
- [ ] Test `/auth` page loads
- [ ] Test email check works
- [ ] Test login flow works
- [ ] Test registration flow works
- [ ] Test redirects work
- [ ] Check analytics events

### Post-Deployment Monitoring

**Metrics to Monitor:**
- Authentication completion rate
- Email check API response times
- Error rates (4xx, 5xx)
- Form abandonment rate
- Page load times

**Alerts:**
- API error rate > 5%
- Email check endpoint down
- Authentication success rate < 80%

### Deployment Checklist

- [ ] Code reviewed and approved
- [ ] All tests passing
- [ ] Staging deployment successful
- [ ] Staging testing complete
- [ ] Production deployment scheduled
- [ ] Deployment executed
- [ ] Smoke tests passed
- [ ] Monitoring active
- [ ] Team notified

---

## P10: Validation

### Success Metrics

**Primary Metrics:**
- Authentication completion rate: **>85%** (target)
- Time to authenticate: **<30 seconds** (target)
- Form abandonment: **<20%** (target)

**Secondary Metrics:**
- Email check API response time: **<200ms** (p95)
- Page load time: **<2s** (target)
- Error rate: **<1%**

### User Feedback

**Qualitative Feedback:**
- User satisfaction: **>4.5/5** (target)
- Ease of use rating
- Design/appearance rating
- Speed/performance rating

**Feedback Collection:**
- Post-authentication survey (optional)
- User interviews (if possible)
- Support ticket analysis

### Analytics Validation

**Events to Verify:**
- `auth_page_viewed` - Firing correctly
- `auth_email_checked` - Firing with correct properties
- `auth_mode_detected` - Firing with correct mode
- `auth_login_completed` - Firing correctly
- `auth_signup_completed` - Firing correctly

**Dashboards:**
- Create PostHog dashboard for auth flow
- Track conversion funnel: page_view → email_check → form_submit → auth_complete

### A/B Testing (Optional)

If baseline metrics exist:
- Compare new unified page vs old separate pages
- Measure completion rates
- Measure time to authenticate
- Measure user satisfaction

### Validation Checklist

- [ ] Authentication completion rate meets target (>85%)
- [ ] Time to authenticate meets target (<30s)
- [ ] Form abandonment below target (<20%)
- [ ] API response times acceptable (<200ms p95)
- [ ] Page load time acceptable (<2s)
- [ ] Error rate acceptable (<1%)
- [ ] All analytics events firing correctly
- [ ] User feedback positive (>4.5/5)
- [ ] No critical bugs reported
- [ ] Performance metrics acceptable

### Learnings & Iterations

**Document:**
- What worked well
- What didn't work
- User feedback themes
- Performance bottlenecks
- Areas for improvement

**Next Steps:**
- Plan iterations based on data
- Prioritize improvements
- Schedule follow-up work

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [x] P2: Stories created (ST-075 through ST-086)
- [x] P3: Architecture design
- [x] P4: UI skeleton & mockups
- [x] P5: Tech spec
- [x] P6: Implementation plan
- [x] P7: Testing
- [x] P8: Integration
- [x] P9: Deployment
- [x] P10: Validation

---

## Related Epics

- **EP-002**: User Authentication & Settings (foundation)
- **EP-012**: Onboarding (post-authentication flow)

