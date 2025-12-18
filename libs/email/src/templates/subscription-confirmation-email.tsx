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
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Img src={brand.logo} alt="RYLA" style={baseStyles.logo} />

          <Heading style={baseStyles.heading}>
            You&apos;re on {planName}
          </Heading>

          <Text style={baseStyles.paragraph}>Hi {userName},</Text>

          <Text style={baseStyles.paragraph}>
            Payment confirmed. You now have full access to all {planName}{' '}
            features.
          </Text>

          <Section style={baseStyles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={baseStyles.tableRow}>
                  <td style={baseStyles.tableCellLabel}>Plan</td>
                  <td style={baseStyles.tableCellValue}>{planName}</td>
                </tr>
                <tr style={baseStyles.tableRow}>
                  <td style={baseStyles.tableCellLabel}>Amount</td>
                  <td style={baseStyles.tableCellValue}>
                    {amount}/{interval}
                  </td>
                </tr>
                <tr>
                  <td style={baseStyles.tableCellLabel}>Next billing</td>
                  <td style={baseStyles.tableCellValue}>{nextBillingDate}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={baseStyles.center}>
            <Button href={dashboardUrl} style={baseStyles.button}>
              View Subscription
            </Button>
          </Section>

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

SubscriptionConfirmationEmail.PreviewProps = {
  userName: 'Alex',
  planName: 'Pro',
  amount: '$29',
  interval: 'month',
  nextBillingDate: 'January 18, 2025',
} as SubscriptionConfirmationEmailProps;

export default SubscriptionConfirmationEmail;
