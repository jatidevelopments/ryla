# @ryla/email

React Email templates and utilities for transactional emails.

## Templates

- **WelcomeEmail** - Sent after user signup
- **VerificationEmail** - Magic link / email verification
- **PasswordResetEmail** - Password reset link
- **SubscriptionConfirmationEmail** - Payment confirmation
- **SubscriptionCancelledEmail** - Subscription cancelled
- **GenerationCompleteEmail** - AI generation finished

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
# SMTP Configuration
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_USER=your@email.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM="RYLA <noreply@ryla.ai>"
```

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
