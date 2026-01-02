# @ryla/email

React Email templates and utilities for transactional emails.

## Templates

- **WelcomeEmail** - Sent after user signup
- **VerificationEmail** - Magic link / email verification
- **PasswordResetEmail** - Password reset link
- **SubscriptionConfirmationEmail** - Payment confirmation
- **SubscriptionCancelledEmail** - Subscription cancelled
- **GenerationCompleteEmail** - AI generation finished
- **BugReportNotificationEmail** - Sent to team when a bug is reported

## Usage

### Sending Emails

```typescript
import { sendEmail, WelcomeEmail } from '@ryla/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Welcome to RYLA!',
  template: WelcomeEmail,
  props: {
    userName: 'John',
    loginUrl: 'https://app.ryla.ai/login',
  },
});
```

### Using Templates Directly

```typescript
import { render } from '@react-email/render';
import { WelcomeEmail } from '@ryla/email';

const html = await render(WelcomeEmail({ userName: 'John' }));
```

### Development Preview

Start the email preview server:

```bash
pnpm nx dev email
# or
pnpm email:dev
```

Then open http://localhost:3333 to preview templates.

## Configuration

Set environment variables:

```env
# Resend Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM="RYLA <noreply@ryla.ai>"

# Bug Report Notifications
BUG_REPORT_NOTIFICATION_EMAIL=team@ryla.ai
```

**Setup Steps:**
1. Create a Resend account at https://resend.com
2. Get your API key from https://resend.com/api-keys
3. Verify your domain (ryla.ai) in the Resend dashboard
4. Set `RESEND_API_KEY` in your environment variables

## Adding New Templates

1. Create a new template in `src/templates/`
2. Export it from `src/templates/index.ts`
3. Add preview props for the dev server

```tsx
// src/templates/my-template.tsx
import { Html, Body, Container, Heading, Text } from '@react-email/components';
import { baseStyles } from '../styles';

interface MyTemplateProps {
  userName: string;
}

export function MyTemplate({ userName }: MyTemplateProps) {
  return (
    <Html>
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading>Hello, {userName}!</Heading>
        </Container>
      </Body>
    </Html>
  );
}

// Preview props for dev server
MyTemplate.PreviewProps = {
  userName: 'John Doe',
};
```
