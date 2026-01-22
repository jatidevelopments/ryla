# [EPIC] EP-050: Forgot Password Feature Completion (IN-025)

**Status**: In Progress  
**Phase**: P7  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21  
**Initiative**: IN-025

---

## Overview

Complete the forgot password feature by adding UI integration into the auth modal, implementing rate limiting, adding retry functionality, ensuring proper email service connection, and creating the reset password page.

This epic extends EP-002 (Authentication) by completing the password reset flow that was partially implemented. Includes both the forgot password request flow and the reset password page.

---

## Business Impact

**Target Metric**: A - Activation, B - Retention

**Hypothesis**: When users can easily recover forgotten passwords through an integrated auth flow with proper rate limiting and retry functionality, they will successfully reset passwords and continue using the platform instead of churning.

**Success Criteria**:
- Forgot password requests: **>0** (feature is being used)
- Rate limit effectiveness: **0 abuse incidents**
- Email delivery rate: **>95%**
- User completion rate: **>80%** (request → email → reset)

---

## Features

### F1: Forgot Password UI in Auth Modal

- Add "forgot-password" mode to auth modal
- Email input form with validation
- Submit button with loading state
- Success message after submission
- Link back to login form
- Error handling and display

### F2: Rate Limiting on Forgot Password Endpoint

- Multi-tiered rate limiting:
  - 3 requests per 15 minutes per IP
  - 5 requests per hour per IP
- Proper error messages when rate limited
- Rate limit headers in response
- Redis-based throttling (using existing throttler)

### F3: Retry Functionality

- "Resend code" button after initial request
- Cooldown timer (60 seconds) before retry allowed
- Visual countdown display
- Proper state management (disabled during cooldown)
- Max retry attempts (3 per hour)

### F4: Email Service Integration

- Verify Resend email service connection
- Ensure password reset emails are sent
- Verify email template rendering
- Handle email delivery failures gracefully
- Log email delivery status

### F5: Frontend-Backend Integration

- Connect frontend form to `/auth/forgot-password` endpoint
- Handle API responses (success/error)
- Display appropriate messages to users
- Security: Don't reveal if email exists (always show success)

### F6: Reset Password Page

- Create `/reset-password` page that accepts token from URL
- Password reset form with new password and confirm password fields
- Password strength validation
- Connect to `/auth/reset-password` endpoint
- Success state with redirect to login
- Error handling for invalid/expired tokens
- Styled similar to auth page with promotional images

---

## User Stories

### ST-XXX: Forgot Password from Login Form

**As a** user who forgot my password  
**I want to** click "Forgot password?" on the login form  
**So that** I can reset my password and regain access

**AC**:
- AC-1: "Forgot password?" link visible on login form
- AC-2: Clicking link opens forgot password form in auth modal
- AC-3: Form has email input and submit button
- AC-4: After submission, success message is shown
- AC-5: Link back to login form is available

### ST-XXX: Request Password Reset

**As a** user on the forgot password form  
**I want to** enter my email and submit  
**So that** I receive a password reset email

**AC**:
- AC-1: Email input validates format
- AC-2: Submit button is disabled during request
- AC-3: Success message shown regardless of email existence (security)
- AC-4: Error message shown if request fails (network, etc.)
- AC-5: Rate limit error shown if too many requests

### ST-XXX: Retry Sending Reset Code

**As a** user who didn't receive the reset email  
**I want to** click "Resend code"  
**So that** I can receive the email again

**AC**:
- AC-1: "Resend code" button available after initial request
- AC-2: Button is disabled during cooldown (60 seconds)
- AC-3: Countdown timer shows remaining cooldown time
- AC-4: Button re-enables after cooldown
- AC-5: Max 3 retries per hour (rate limited)

### ST-XXX: Rate Limiting Protection

**As a** system administrator  
**I want** forgot password requests to be rate limited  
**So that** the system is protected from abuse and email enumeration attacks

**AC**:
- AC-1: 3 requests per 15 minutes per IP address
- AC-2: 5 requests per hour per IP address
- AC-3: Rate limit errors return 429 status code
- AC-4: Rate limit info in response headers
- AC-5: Redis-based throttling (persistent across restarts)

### ST-XXX: Reset Password Page

**As a** user who received a password reset email  
**I want to** click the reset link and set a new password  
**So that** I can regain access to my account

**AC**:
- AC-1: Reset password page accessible at `/reset-password?token=...`
- AC-2: Form has new password and confirm password fields
- AC-3: Password strength validation (8+ chars, lowercase, number)
- AC-4: Success message after password reset
- AC-5: Redirects to login page after successful reset
- AC-6: Error handling for invalid/expired tokens
- AC-7: Styled similar to auth page with promotional images

---

## Acceptance Criteria

### AC-1: Forgot Password UI in Auth Modal
- [ ] "Forgot password?" link visible on login form
- [ ] Clicking link switches auth modal to "forgot-password" mode
- [ ] Forgot password form displays with email input
- [ ] Submit button with loading state
- [ ] Success message after submission
- [ ] Link back to login form

### AC-2: Rate Limiting Implementation
- [ ] Rate limiting added to `/auth/forgot-password` endpoint
- [ ] 3 requests per 15 minutes per IP
- [ ] 5 requests per hour per IP
- [ ] 429 status code returned when rate limited
- [ ] Rate limit headers in response
- [ ] Redis-based throttling working

### AC-3: Retry Functionality
- [ ] "Resend code" button after initial request
- [ ] 60-second cooldown timer
- [ ] Visual countdown display
- [ ] Button disabled during cooldown
- [ ] Max 3 retries per hour enforced

### AC-4: Email Service Integration
- [ ] Resend email service connected
- [ ] Password reset emails sent successfully
- [ ] Email template renders correctly
- [ ] Email delivery failures handled gracefully
- [ ] Email delivery logged

### AC-5: Frontend-Backend Integration
- [x] Frontend form calls `/auth/forgot-password` endpoint
- [x] API responses handled correctly
- [x] Success/error messages displayed appropriately
- [x] Security: Don't reveal if email exists

### AC-6: Reset Password Page
- [x] Reset password page created at `/reset-password`
- [x] Token extracted from URL query parameter
- [x] Password and confirm password fields
- [x] Password strength validation
- [x] Connected to `/auth/reset-password` endpoint
- [x] Success state with redirect to login
- [x] Error handling for invalid/expired tokens
- [x] Styled similar to auth page

---

## Technical Notes

### Auth Modal Mode Extension

```typescript
// apps/web/app/auth/constants.ts
export type AuthMode = 'email' | 'login' | 'register' | 'forgot-password';
```

### Rate Limiting Configuration

```typescript
// apps/api/src/modules/throttler/constants/default-throttler-constants.ts
export const FORGOT_PASSWORD_THROTTLE = [
  {
    ttl: 900000, // 15 minutes
    limit: 3, // 3 requests per 15 minutes
  },
  {
    ttl: 3600000, // 1 hour
    limit: 5, // 5 requests per hour
  },
];
```

### Frontend API Call

```typescript
// apps/web/lib/auth.ts or similar
export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    throw new Error('Failed to send reset email');
  }
}
```

### Retry Cooldown State

```typescript
// In forgot password component
const [cooldownSeconds, setCooldownSeconds] = useState(0);
const [canRetry, setCanRetry] = useState(false);

// After successful request
setCooldownSeconds(60);
setCanRetry(false);

// Countdown timer
useEffect(() => {
  if (cooldownSeconds > 0) {
    const timer = setTimeout(() => {
      setCooldownSeconds(cooldownSeconds - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else {
    setCanRetry(true);
  }
}, [cooldownSeconds]);
```

---

## Dependencies

- **EP-002**: User Authentication & Settings (extends password reset feature)
- **EP-007**: Emails & Notifications (uses email service)
- Backend forgot password endpoint (exists)
- Throttler module (exists, needs forgot-password throttle)
- Resend email service (configured)

---

## Non-Goals (Phase 2+)

- Magic link login (different feature)
- SMS-based password reset
- Two-factor authentication
- Password reset via security questions
- Account recovery via support

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [x] P2: Stories created
- [x] P3: Architecture & API design
- [x] P4: UI screens & interactions
- [x] P5: File plan & task breakdown
- [x] P6: Implementation
- [x] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment configuration
- [ ] P10: Validation & learnings

---

**Related**: [IN-025](../initiatives/IN-025-forgot-password-feature.md) | [EP-002](./EP-002-authentication.md) | [EP-007](./EP-007-emails.md)
