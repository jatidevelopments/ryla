# [EPIC] EP-002: User Authentication

## Overview

User authentication system enabling signup, login, session management, and guest-to-user conversion.

---

## Business Impact

**Target Metric**: [x] A - Activation

**Hypothesis**: When users can easily create accounts and persist their data, they will return and convert at higher rates.

**Success Criteria**:
- Signup completion: **>80%**
- Login success rate: **>95%**
- Session persistence: Works across browser refreshes

---

## Features

### F1: Email/Password Signup
- Email input with validation
- Password with strength requirements
- Create account in Supabase Auth
- Auto-login after signup

### F2: Email/Password Login
- Email + password form
- Error handling (wrong password, no account)
- Remember me option
- Redirect to intended destination

### F3: Session Management
- JWT token storage
- Auto-refresh tokens
- Logout functionality
- Session timeout handling

### F4: Password Reset
- "Forgot password" link
- Email with reset link
- Reset password form
- Confirmation message

### F5: Guest to User Conversion
- Save wizard progress without account
- Prompt to create account before payment
- Migrate guest data to user account

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

### AC-5: Guest Conversion
- [ ] Guest can use wizard without account
- [ ] Guest progress is saved locally
- [ ] Signup migrates guest data to account
- [ ] No data loss during conversion

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
| `auth_guest_converted` | Guest → user | `had_progress` |

---

## User Stories

### ST-006: Sign Up
**As a** new visitor  
**I want to** create an account with my email  
**So that** I can save my characters and access them later

### ST-007: Log In
**As a** returning user  
**I want to** log in to my account  
**So that** I can access my saved characters

### ST-008: Reset Password
**As a** user who forgot my password  
**I want to** reset it via email  
**So that** I can regain access to my account

### ST-009: Continue as Guest
**As a** visitor not ready to commit  
**I want to** try the wizard without signing up  
**So that** I can evaluate the product first

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
  onAuthStateChange: (callback) => supabase.auth.onAuthStateChange(callback),
}
```

### Protected Route Pattern
```typescript
// apps/web/middleware.ts
export function middleware(request: NextRequest) {
  const session = request.cookies.get('sb-access-token')
  if (!session && isProtectedRoute(request.pathname)) {
    return NextResponse.redirect('/login')
  }
}
```

---

## Non-Goals (Phase 2+)

- Social login (Google, Apple, etc.)
- Two-factor authentication (2FA)
- Email verification requirement
- Account deletion self-service
- Multiple sessions management

---

## Dependencies

- Supabase project configured
- Email service for password reset
- PostHog for analytics

