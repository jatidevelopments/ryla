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

export interface SubscriptionCancelledEmailProps {
  userName: string;
  planName: string;
  accessEndsDate: string;
  resubscribeUrl?: string;
}

export function SubscriptionCancelledEmail({
  userName,
  planName,
  accessEndsDate,
  resubscribeUrl = 'https://ryla.ai/#pricing',
}: SubscriptionCancelledEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            Subscription Cancelled
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              Hi {userName},
            </Text>

            <Text style={baseStyles.paragraph}>
              We&apos;re sorry to see you go! Your {planName} subscription has been cancelled.
            </Text>
          </Section>

          <Section style={baseStyles.card}>
            <Text style={{ ...baseStyles.paragraph, marginBottom: 0 }}>
              <strong>Your access continues until:</strong>
              <br />
              <span style={{ fontSize: '18px', color: colors.primary }}>
                {accessEndsDate}
              </span>
            </Text>
          </Section>

          <Section>
            <Text style={baseStyles.paragraph}>
              After this date, you&apos;ll be moved to our free plan. Your account and
              all your creations will remain safe – you just won&apos;t have access to
              premium features.
            </Text>

            <Text style={baseStyles.paragraph}>
              Changed your mind? You can resubscribe anytime to regain full access.
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={resubscribeUrl} style={baseStyles.button}>
              Resubscribe →
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            We&apos;d love to hear why you cancelled. Reply to this email with any
            feedback – it helps us improve!
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

SubscriptionCancelledEmail.PreviewProps = {
  userName: 'John',
  planName: 'Pro',
  accessEndsDate: 'January 15, 2025',
} as SubscriptionCancelledEmailProps;

export default SubscriptionCancelledEmail;
