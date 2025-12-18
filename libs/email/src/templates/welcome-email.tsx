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

export interface WelcomeEmailProps {
  userName: string;
  loginUrl?: string;
}

export function WelcomeEmail({
  userName,
  loginUrl = 'https://app.ryla.ai/login',
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            Welcome to RYLA! 🎉
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              Hi {userName},
            </Text>

            <Text style={baseStyles.paragraph}>
              We&apos;re thrilled to have you join RYLA! You&apos;re now part of a community
              of creators using AI to bring their ideas to life.
            </Text>

            <Text style={baseStyles.paragraph}>
              Here&apos;s what you can do next:
            </Text>

            <ul style={{ ...baseStyles.paragraph, paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Create your first character</strong> – Choose from endless customization options
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Generate stunning images</strong> – Our AI creates high-quality visuals
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Share your creations</strong> – Show off your work to the world
              </li>
            </ul>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={loginUrl} style={baseStyles.button}>
              Get Started →
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            Need help? Reply to this email or check out our{' '}
            <Link href="https://ryla.ai/help" style={baseStyles.link}>
              help center
            </Link>
            .
          </Text>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} RYLA. All rights reserved.
            <br />
            <Link href="https://ryla.ai/unsubscribe" style={{ color: colors.textLight }}>
              Unsubscribe
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

WelcomeEmail.PreviewProps = {
  userName: 'John Doe',
  loginUrl: 'https://app.ryla.ai/login',
} as WelcomeEmailProps;

export default WelcomeEmail;
