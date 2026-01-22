# [EPIC] EP-007: Emails & Notifications

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Transactional email delivery for user lifecycle events. Essential for authentication flows and user engagement.

> **Note**: Payment-related emails are handled in EP-003 (funnel/).

---

## Business Impact

**Target Metric**: A - Activation

**Hypothesis**: Timely email notifications increase user trust and reduce support requests.

**Success Criteria**:
- Email delivery rate: **>98%**
- Password reset completion: **>80%**
- Welcome email open rate: **>40%**

---

## Features

### F1: Welcome Email

- Sent immediately after signup
- Contains user's name/email
- Links to dashboard and wizard
- Sets tone for product experience

### F2: Password Reset Email

- Triggered by "Forgot password" request
- Contains secure reset link
- Link expires after 1 hour
- Single-use token

### F3: Generation Complete Email (P1)

- Sent when image pack generation completes
- Contains character name and image count
- Links to dashboard to view/download
- Optional - user can enable/disable

---

## Acceptance Criteria

### AC-1: Welcome Email

- [ ] Email sent within 30s of signup
- [ ] Contains user's email
- [ ] Links to dashboard
- [ ] Professional, on-brand design

### AC-2: Password Reset Email

- [ ] Reset link sent within 30s of request
- [ ] Link expires after 1 hour
- [ ] Single-use token (invalid after used)
- [ ] Clear instructions in email

### AC-3: Generation Complete (P1)

- [ ] Sent when image pack ready
- [ ] Contains character name
- [ ] Links to dashboard
- [ ] User can opt-out

---

## Email Templates

### 1. Welcome Email

```
Subject: Welcome to RYLA! 🎨

Hi [name/email],

Welcome to RYLA! You're ready to create your first AI influencer.

[Create Your First Character] → /dashboard

Questions? Reply to this email.

– The RYLA Team
```

### 2. Password Reset

```
Subject: Reset your RYLA password

Hi,

Click below to reset your password. This link expires in 1 hour.

[Reset Password] → /reset-password?token=xxx

If you didn't request this, ignore this email.

– The RYLA Team
```

### 3. Generation Complete (P1)

```
Subject: Your character [name] is ready! 🎉

Hi,

Your image pack for [character name] is ready!

[View Images] → /dashboard/characters/xxx

Generated: [X] images
Quality: [Draft/High Quality]

– The RYLA Team
```

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `email_sent` | Email dispatched | `type`, `user_id` |
| `email_delivered` | Delivery confirmed | `type`, `user_id` |
| `email_opened` | Email opened | `type`, `user_id` |
| `email_clicked` | Link clicked | `type`, `link_type` |
| `email_bounced` | Delivery failed | `type`, `bounce_type` |

---

## User Stories

### ST-020: Receive Welcome Email

**As a** new user  
**I want to** receive a welcome email  
**So that** I know my account is created

**AC**: AC-1

### ST-021: Receive Password Reset

**As a** user who forgot password  
**I want to** receive a reset link  
**So that** I can regain access

**AC**: AC-2

### ST-022: Receive Generation Notification (P1)

**As a** user who generated images  
**I want to** be notified when ready  
**So that** I know I can download them

**AC**: AC-3

---

## Technical Notes

### Email Provider

- **Service**: Resend
- **SDK**: `resend` npm package
- **Pricing**: Free tier (100 emails/day)

### Implementation

```typescript
// libs/business/src/services/email.service.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const emailService = {
  sendWelcome: async (to: string, name?: string) => {
    return resend.emails.send({
      from: 'RYLA <hello@ryla.ai>',
      to,
      subject: 'Welcome to RYLA! 🎨',
      html: renderWelcomeTemplate({ name }),
    })
  },
  
  sendPasswordReset: async (to: string, resetUrl: string) => {
    return resend.emails.send({
      from: 'RYLA <hello@ryla.ai>',
      to,
      subject: 'Reset your RYLA password',
      html: renderPasswordResetTemplate({ resetUrl }),
    })
  },
  
  sendGenerationComplete: async (to: string, character: CharacterSummary) => {
    return resend.emails.send({
      from: 'RYLA <hello@ryla.ai>',
      to,
      subject: `Your character ${character.name} is ready! 🎉`,
      html: renderGenerationCompleteTemplate({ character }),
    })
  },
}
```

### Trigger Points

| Email | Triggered By | Location |
|-------|-------------|----------|
| Welcome | `auth.signup_completed` | EP-002 |
| Password Reset | `auth.password_reset_requested` | EP-002 |
| Generation Complete | `generation.pack_completed` | EP-005 |

---

## Non-Goals (Phase 2+)

- Marketing emails / newsletters
- Email preferences / unsubscribe center
- Rich HTML templates with images
- Multi-language emails
- Payment emails (handled in EP-003)
- SMS notifications

---

## Dependencies

- Resend account setup
- `RESEND_API_KEY` environment variable
- Verified sending domain (ryla.ai)
- User authentication (EP-002)

---

## Environment Variables

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=hello@ryla.ai
```

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton (N/A for emails)
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
