import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Text,
  Hr,
  Section,
  Button,
  Img,
  Link,
} from '@react-email/components';
import { baseStyles, colors, brand } from '../styles';

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
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Img src={brand.logo} alt="RYLA" style={baseStyles.logo} />

          <Heading style={baseStyles.heading}>Reset Your Password</Heading>

          {userName && <Text style={baseStyles.paragraph}>Hi {userName},</Text>}

          <Text style={baseStyles.paragraph}>
            We received a password reset request. Click below to set a new
            password. This link expires in {expiresIn}.
          </Text>

          <Section style={baseStyles.center}>
            <Button href={resetUrl} style={baseStyles.button}>
              Reset Password
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>Or copy this link:</Text>

          <Text style={baseStyles.urlBox}>{resetUrl}</Text>

          <Text style={{ ...baseStyles.mutedText, marginTop: '24px' }}>
            Didn&apos;t request this? Ignore this email.
          </Text>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} {brand.name}
            <br />
            <Link
              href={brand.website}
              style={{ color: colors.mutedForeground }}
            >
              ryla.ai
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetUrl: 'https://app.ryla.ai/reset-password?token=abc123xyz789',
  userName: 'Alex',
  expiresIn: '1 hour',
} as PasswordResetEmailProps;

export default PasswordResetEmail;
