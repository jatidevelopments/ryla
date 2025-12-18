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
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Img src={brand.logo} alt="RYLA" style={baseStyles.logo} />

          <Heading style={baseStyles.heading}>Subscription Cancelled</Heading>

          <Text style={baseStyles.paragraph}>Hi {userName},</Text>

          <Text style={baseStyles.paragraph}>
            Your {planName} subscription has been cancelled.
          </Text>

          <Section style={baseStyles.card}>
            <Text
              style={{
                ...baseStyles.mutedText,
                margin: 0,
                marginBottom: '4px',
              }}
            >
              Access continues until
            </Text>
            <Text
              style={{
                ...baseStyles.paragraph,
                fontSize: '18px',
                fontWeight: '600',
                margin: 0,
              }}
            >
              {accessEndsDate}
            </Text>
          </Section>

          <Text style={baseStyles.paragraph}>
            After this date, you&apos;ll move to the free plan. Your account and
            creations stay safe.
          </Text>

          <Section style={baseStyles.center}>
            <Button href={resubscribeUrl} style={baseStyles.button}>
              Resubscribe
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            Feedback? Reply to this email—we&apos;d love to hear from you.
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

SubscriptionCancelledEmail.PreviewProps = {
  userName: 'Alex',
  planName: 'Pro',
  accessEndsDate: 'February 18, 2025',
} as SubscriptionCancelledEmailProps;

export default SubscriptionCancelledEmail;
