# [EPIC] EP-007: Emails & Notifications

## Overview

Transactional email delivery for user lifecycle events. Essential for authentication flows and payment confirmations.

---

## Business Impact

**Target Metric**: A - Activation, D - Conversion

**Hypothesis**: Timely email notifications increase user trust and reduce support requests.

**Success Criteria**:
- Email delivery rate: **>98%**
- Password reset completion: **>80%**

---

## Features

### F1: Authentication Emails
- Welcome email on signup
- Email verification (optional for MVP)
- Password reset email

### F2: Payment Emails
- Payment receipt/confirmation
- Subscription activation confirmation
- Payment failed notification

### F3: Product Emails
- Character generation complete (download ready)
- Image pack ready for download

---

## Acceptance Criteria

### AC-1: Welcome Email
- [ ] Email sent within 30s of signup
- [ ] Contains user's email and next steps
- [ ] Links to dashboard/wizard

### AC-2: Password Reset
- [ ] Reset link sent within 30s
- [ ] Link expires after 1 hour
- [ ] Single-use token

### AC-3: Payment Receipt
- [ ] Sent immediately after successful payment
- [ ] Contains amount, plan, and date
- [ ] Includes link to dashboard

### AC-4: Download Ready
- [ ] Sent when image pack generation completes
- [ ] Contains direct download link
- [ ] Link expires after 7 days

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `email_sent` | Email dispatched | `type`, `recipient_id` |
| `email_opened` | Email opened (if tracked) | `type`, `recipient_id` |
| `email_clicked` | Link clicked | `type`, `link_type` |

---

## User Stories

### ST-007-001: Receive Welcome Email
**As a** new user  
**I want to** receive a welcome email  
**So that** I know my account is created

### ST-007-002: Reset Password
**As a** user who forgot password  
**I want to** receive a reset link  
**So that** I can regain access

### ST-007-003: Payment Confirmation
**As a** paying user  
**I want to** receive a receipt  
**So that** I have proof of payment

---

## Dependencies

- Resend account setup
- Email templates designed
- `RESEND_API_KEY` configured

---

## Technical Notes

### Email Provider
- **Service**: Resend
- **SDK**: `resend` npm package

### Templates (MVP)
1. `welcome` - Welcome to RYLA
2. `password-reset` - Reset your password
3. `payment-receipt` - Payment confirmation
4. `download-ready` - Your images are ready

### API Endpoints
```
POST /api/emails/send - Internal email trigger
POST /api/webhooks/resend - Delivery status (optional)
```

---

## Non-Goals (Phase 2+)

- Marketing emails
- Email preferences/unsubscribe
- Rich HTML templates
- Multi-language emails

---

## Phase Checklist

- [x] P1: Requirements
- [x] P2: Scoping (this doc)
- [ ] P3: Architecture
- [ ] P4: UI Skeleton
- [ ] P5: Tech Spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

