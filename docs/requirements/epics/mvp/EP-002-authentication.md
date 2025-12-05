# [EPIC] EP-002: User Authentication

## Overview

User authentication system enabling signup, login, session management, and age verification for NSFW content.

---

## Business Impact

**Target Metric**: A - Activation

**Hypothesis**: When users can easily create accounts and persist their data, they will return and engage more.

**Success Criteria**:
- Signup completion: **>80%**
- Login success rate: **>95%**
- Session persistence: Works across browser refreshes
- Age verification: **100%** before NSFW access

---

## Features

### F1: Email/Password Signup

- Email input with validation
- Password with strength requirements (8+ chars)
- Create account in Supabase Auth
- Auto-login after signup
- Error handling (duplicate email, etc.)

### F2: Email/Password Login

- Email + password form
- Error handling (wrong password, no account)
- Remember me option
- Redirect to intended destination

### F3: Session Management

- JWT token storage (Supabase handles)
- Auto-refresh tokens
- Logout functionality
- Session timeout handling (24h default)

### F4: Password Reset

- "Forgot password" link
- Email with reset link (via EP-007)
- Reset password form
- Confirmation message

### F5: Age Verification (18+)

- Required before enabling NSFW content
- Simple confirmation dialog ("I am 18+")
- State stored in user profile
- Blocks NSFW toggle without verification
- One-time verification per account

### F6: Protected Routes

- Dashboard requires authentication
- Redirect unauthenticated users to login
- Remember intended destination after login
- Handle expired sessions gracefully

### F7: Settings & Account Management (NEW)

- **Account Settings Page** accessible from dashboard
- **Change Password**: Update password with current password confirmation
- **Update Email**: Change email address (requires verification)
- **Delete Account**: Self-service account deletion with confirmation
- **Profile Info**: View account creation date, email

**Settings Page Sections:**
| Section | Features |
|---------|----------|
| Profile | Email (read-only or editable), created date |
| Security | Change password, logout all devices |
| Danger Zone | Delete account (with "type to confirm") |

> **Note**: Subscription management is handled in EP-010.

---

## Acceptance Criteria

### AC-1: Signup Flow

- [ ] User can enter email and password
- [ ] Email format is validated
- [ ] Password meets minimum requirements (8+ chars)
- [ ] Account is created in Supabase
- [ ] User is automatically logged in after signup
- [ ] Errors are clearly displayed

### AC-2: Login Flow

- [ ] User can login with email/password
- [ ] Invalid credentials show clear error
- [ ] Successful login redirects appropriately
- [ ] Session persists across page refreshes

### AC-3: Session Handling

- [ ] Auth state is available throughout app
- [ ] Protected routes redirect to login
- [ ] Logout clears session completely
- [ ] Token refresh works automatically

### AC-4: Password Reset

- [ ] User can request password reset
- [ ] Email is sent with reset link
- [ ] Reset link works and allows new password
- [ ] User can login with new password

### AC-5: Age Verification

- [ ] 18+ confirmation required before NSFW toggle
- [ ] Confirmation dialog is clear and legal
- [ ] Verification state stored in user profile
- [ ] Cannot enable NSFW without verification
- [ ] Only prompted once per account

### AC-6: Protected Routes

- [ ] Dashboard (/dashboard) requires auth
- [ ] Unauthenticated users redirected to /login
- [ ] After login, user returns to intended page
- [ ] Expired sessions handled gracefully

### AC-7: Settings & Account

- [ ] Settings page accessible from dashboard header
- [ ] User can view their email and account info
- [ ] User can change password (with current password)
- [ ] User can request account deletion
- [ ] Delete requires typing confirmation phrase
- [ ] Delete removes all user data

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `auth_signup_started` | Signup form opened | `source` |
| `auth_signup_completed` | Account created | `method` |
| `auth_signup_failed` | Signup error | `error_type` |
| `auth_login_started` | Login form opened | - |
| `auth_login_completed` | Login success | `method` |
| `auth_login_failed` | Login error | `error_type` |
| `auth_logout` | User logs out | - |
| `auth_password_reset_requested` | Reset email sent | - |
| `auth_password_reset_completed` | Password changed | - |
| `age_verification_shown` | 18+ dialog displayed | - |
| `age_verification_confirmed` | User confirms 18+ | - |
| `age_verification_declined` | User declines | - |
| `settings_viewed` | Settings page opened | - |
| `password_changed` | Password updated | - |
| `account_deletion_started` | Delete button clicked | - |
| `account_deleted` | Account deleted | - |

---

## User Stories

### ST-006: Sign Up

**As a** new visitor  
**I want to** create an account with my email  
**So that** I can save my characters and access them later

**AC**: AC-1

### ST-007: Log In

**As a** returning user  
**I want to** log in to my account  
**So that** I can access my saved characters

**AC**: AC-2

### ST-008: Reset Password

**As a** user who forgot my password  
**I want to** reset it via email  
**So that** I can regain access to my account

**AC**: AC-4

### ST-009: Verify Age for NSFW

**As a** user who wants NSFW content  
**I want to** confirm I'm 18+  
**So that** I can enable adult content generation

**AC**: AC-5

---

## Technical Notes

### Supabase Auth Integration

```typescript
// libs/business/src/services/auth.service.ts
import { createClient } from '@supabase/supabase-js'

export const authService = {
  signUp: (email, password) => supabase.auth.signUp({ email, password }),
  signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  resetPassword: (email) => supabase.auth.resetPasswordForEmail(email),
  getSession: () => supabase.auth.getSession(),
  getUser: () => supabase.auth.getUser(),
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
}
```

### Age Verification Storage

```typescript
// Store in user metadata
await supabase.auth.updateUser({
  data: { 
    age_verified: true,
    age_verified_at: new Date().toISOString()
  }
})

// Check before NSFW toggle
const { data: { user } } = await supabase.auth.getUser()
const isVerified = user?.user_metadata?.age_verified === true
```

### Protected Route Pattern

```typescript
// apps/web/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && isProtectedRoute(request.pathname)) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  return res
}

const PROTECTED_ROUTES = ['/dashboard', '/character', '/generate']
const isProtectedRoute = (path: string) => 
  PROTECTED_ROUTES.some(route => path.startsWith(route))
```

---

## Non-Goals (Phase 2+)

- Social login (Google, Apple, etc.)
- Two-factor authentication (2FA)
- Email verification requirement
- Account deletion self-service
- Multiple sessions management
- Magic link login

---

## Dependencies

- Supabase project configured
- Email service for password reset (EP-007)
- PostHog for analytics

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
