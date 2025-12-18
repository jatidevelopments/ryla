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
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Img src={brand.logo} alt="RYLA" style={baseStyles.logo} />

          <Heading style={baseStyles.heading}>Sign in to RYLA</Heading>

          <Text style={baseStyles.paragraph}>
            Click below to sign in. This link expires in {expiresIn}.
          </Text>

          <Section style={baseStyles.center}>
            <Button href={verificationUrl} style={baseStyles.button}>
              Sign In
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>Or copy this link:</Text>

          <Text style={baseStyles.urlBox}>{verificationUrl}</Text>

          <Text style={{ ...baseStyles.mutedText, marginTop: '24px' }}>
            Didn&apos;t request this? Ignore this email.
          </Text>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} {brand.name}
            <br />
            <Link href={brand.website} style={{ color: colors.mutedForeground }}>
              ryla.ai
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

VerificationEmail.PreviewProps = {
  verificationUrl: 'https://app.ryla.ai/verify?token=abc123xyz789',
  expiresIn: '24 hours',
} as VerificationEmailProps;

export default VerificationEmail;
