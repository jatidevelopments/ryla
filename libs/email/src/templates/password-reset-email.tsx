import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Hr,
  Section,
  Button,
} from '@react-email/components';
import { baseStyles, colors } from '../styles';

export interface PasswordResetEmailProps {
  resetUrl: string;
  userName?: string;
  expiresIn?: string;
}

export function PasswordResetEmail({
  resetUrl,
  userName,
  expiresIn = '1 hour',
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            🔑 Reset Your Password
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              {userName ? `Hi ${userName},` : 'Hi,'}
            </Text>

            <Text style={baseStyles.paragraph}>
              We received a request to reset your password. Click the button below
              to choose a new password. This link will expire in {expiresIn}.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={resetUrl} style={baseStyles.button}>
              Reset Password →
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            Or copy and paste this link into your browser:
          </Text>

          <Text
            style={{
              ...baseStyles.mutedText,
              backgroundColor: colors.background,
              padding: '12px',
              borderRadius: '4px',
              wordBreak: 'break-all',
              fontSize: '12px',
            }}
          >
            {resetUrl}
          </Text>

          <Text style={baseStyles.mutedText}>
            If you didn&apos;t request a password reset, you can safely ignore this email.
            Your password will remain unchanged.
          </Text>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} RYLA. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetUrl: 'https://app.ryla.ai/reset-password?token=abc123xyz',
  userName: 'John',
  expiresIn: '1 hour',
} as PasswordResetEmailProps;

export default PasswordResetEmail;
