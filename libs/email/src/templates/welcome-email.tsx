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
  Img,
} from '@react-email/components';
import { baseStyles, colors, brand } from '../styles';

export interface WelcomeEmailProps {
  userName: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName,
  loginUrl = 'https://app.ryla.ai',
}: WelcomeEmailProps) {
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

          <Heading style={baseStyles.heading}>Welcome to RYLA</Heading>

          <Text style={baseStyles.paragraph}>Hi {userName},</Text>

          <Text style={baseStyles.paragraph}>
            You&apos;re in. Create hyper-realistic AI influencers with perfect
            character consistency. Generate images, videos, and content for any
            platform.
          </Text>

          <Section style={baseStyles.center}>
            <Button href={loginUrl} style={baseStyles.button}>
              Open RYLA
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            Questions? Reply to this email or reach us at{' '}
            <Link href={`mailto:${brand.support}`} style={baseStyles.link}>
              {brand.support}
            </Link>
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

WelcomeEmail.PreviewProps = {
  userName: 'Alex',
  loginUrl: 'https://app.ryla.ai',
} as WelcomeEmailProps;

export default WelcomeEmail;
