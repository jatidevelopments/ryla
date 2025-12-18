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

export interface VerificationEmailProps {
  verificationUrl: string;
  expiresIn?: string;
}

export function VerificationEmail({
  verificationUrl,
  expiresIn = '24 hours',
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            🔐 Sign in to RYLA
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              Click the button below to sign in to your RYLA account.
              This link will expire in {expiresIn}.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={verificationUrl} style={baseStyles.button}>
              Sign In to RYLA →
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
            {verificationUrl}
          </Text>

          <Text style={baseStyles.mutedText}>
            If you didn&apos;t request this email, you can safely ignore it.
            Someone might have typed your email address by mistake.
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

VerificationEmail.PreviewProps = {
  verificationUrl: 'https://app.ryla.ai/verify?token=abc123xyz',
  expiresIn: '24 hours',
} as VerificationEmailProps;

export default VerificationEmail;
