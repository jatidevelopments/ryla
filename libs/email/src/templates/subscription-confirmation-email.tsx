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

export interface SubscriptionConfirmationEmailProps {
  userName: string;
  planName: string;
  amount: string;
  interval: 'month' | 'year';
  nextBillingDate: string;
  dashboardUrl?: string;
}

export function SubscriptionConfirmationEmail({
  userName,
  planName,
  amount,
  interval,
  nextBillingDate,
  dashboardUrl = 'https://app.ryla.ai/settings/billing',
}: SubscriptionConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            🎉 Welcome to {planName}!
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              Hi {userName},
            </Text>

            <Text style={baseStyles.paragraph}>
              Thank you for subscribing to RYLA {planName}! Your payment has been
              processed successfully.
            </Text>
          </Section>

          <Section style={baseStyles.card}>
            <Text style={{ ...baseStyles.subheading, marginTop: 0 }}>
              Subscription Details
            </Text>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.textMuted }}>Plan</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                    {planName}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.textMuted }}>Amount</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                    {amount}/{interval}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.textMuted }}>Next billing</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                    {nextBillingDate}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section>
            <Text style={baseStyles.paragraph}>
              You now have access to all {planName} features. Start creating amazing content!
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={dashboardUrl} style={baseStyles.button}>
              View Your Subscription →
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            Need to manage your subscription? Visit your{' '}
            <Link href={dashboardUrl} style={baseStyles.link}>
              billing settings
            </Link>
            .
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

SubscriptionConfirmationEmail.PreviewProps = {
  userName: 'John',
  planName: 'Pro',
  amount: '$29.90',
  interval: 'month',
  nextBillingDate: 'January 15, 2025',
} as SubscriptionConfirmationEmailProps;

export default SubscriptionConfirmationEmail;
