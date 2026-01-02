# Email Templates Summary

## Overview

All transactional email templates for RYLA MVP, using Resend and React Email.

---

## Available Templates

### 1. **WelcomeEmail** ✅
- **Purpose**: Sent after user signup
- **Trigger**: `auth.signup_completed` (EP-002)
- **Props**: `userName`, `loginUrl?`
- **Status**: Implemented

### 2. **VerificationEmail** ✅
- **Purpose**: Magic link / email verification
- **Trigger**: Email verification flow
- **Props**: `verificationUrl`, `expiresIn?`
- **Status**: Implemented

### 3. **PasswordResetEmail** ✅
- **Purpose**: Password reset link
- **Trigger**: `auth.password_reset_requested` (EP-002)
- **Props**: `resetUrl`, `userName?`, `expiresIn?`
- **Status**: Implemented

### 4. **SubscriptionConfirmationEmail** ✅
- **Purpose**: Payment confirmation
- **Trigger**: Subscription created (EP-003)
- **Props**: `userName`, `planName`, `amount`, `interval`, `nextBillingDate`, `dashboardUrl?`
- **Status**: Implemented

### 5. **SubscriptionCancelledEmail** ✅
- **Purpose**: Subscription cancelled notification
- **Trigger**: Subscription cancelled (EP-003)
- **Props**: `userName`, `planName`, `accessEndsDate`, `resubscribeUrl?`
- **Status**: Implemented

### 6. **GenerationCompleteEmail** ✅
- **Purpose**: AI generation finished notification
- **Trigger**: `generation.pack_completed` (EP-005)
- **Props**: `userName`, `characterName`, `imageCount`, `previewImageUrl?`, `viewUrl`
- **Status**: Implemented

### 7. **BugReportNotificationEmail** ✅ NEW
- **Purpose**: Sent to team when a bug is reported
- **Trigger**: Bug report submitted (EP-019)
- **Props**: `bugReportId`, `description`, `userEmail?`, `userName?`, `hasScreenshot`, `hasLogs`, `browserInfo`, `url`, `viewUrl`
- **Status**: Implemented
- **Recipient**: `BUG_REPORT_NOTIFICATION_EMAIL` env variable

---

## Environment Variables

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="RYLA <noreply@ryla.ai>"

# Bug Report Notifications
BUG_REPORT_NOTIFICATION_EMAIL=team@ryla.ai
```

---

## Usage Example

### Sending a Bug Report Notification

```typescript
import { sendEmail, BugReportNotificationEmail } from '@ryla/email';

const notificationEmail = process.env['BUG_REPORT_NOTIFICATION_EMAIL'];
if (!notificationEmail) {
  throw new Error('BUG_REPORT_NOTIFICATION_EMAIL not configured');
}

await sendEmail({
  to: notificationEmail,
  subject: `[Bug Report] ${bugReportId}`,
  template: BugReportNotificationEmail,
  props: {
    bugReportId: report.id,
    description: report.description,
    userEmail: report.email,
    userName: user?.name,
    hasScreenshot: !!report.screenshotUrl,
    hasLogs: report.consoleLogs?.length > 0,
    browserInfo: `${report.browserMetadata.browser} on ${report.browserMetadata.platform}`,
    url: report.browserMetadata.url,
    viewUrl: `https://app.ryla.ai/admin/bug-reports/${report.id}`,
  },
});
```

---

## Email Requirements by Epic

| Epic | Email Template | Status |
|------|---------------|--------|
| EP-002 (Auth) | WelcomeEmail | ✅ |
| EP-002 (Auth) | PasswordResetEmail | ✅ |
| EP-002 (Auth) | VerificationEmail | ✅ |
| EP-003 (Payment) | SubscriptionConfirmationEmail | ✅ |
| EP-003 (Payment) | SubscriptionCancelledEmail | ✅ |
| EP-005 (Generation) | GenerationCompleteEmail | ✅ |
| EP-019 (Bug Reports) | BugReportNotificationEmail | ✅ |

---

## Future Email Templates (Phase 2+)

- Credit low balance warning
- Monthly credit refresh notification
- Account deletion confirmation
- Feature announcement emails
- Marketing newsletters

---

## Testing

Run the test script to send all templates:

```bash
tsx scripts/test-email-templates.ts
```

Or test individual templates using the email preview server:

```bash
pnpm email:dev
# Then open http://localhost:3333
```

---

## Notes

- All emails use Resend for delivery
- Templates use React Email for rendering
- Domain must be verified in Resend dashboard for production
- For testing, use `onboarding@resend.dev` as `EMAIL_FROM`

