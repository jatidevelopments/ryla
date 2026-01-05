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
  Link,
} from '@react-email/components';
import { baseStyles, colors, brand } from '../styles';

export interface InfluencerRequestNotificationEmailProps {
  requestId: string;
  userEmail: string;
  userName?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  description?: string | null;
  viewUrl: string;
}

export function InfluencerRequestNotificationEmail({
  requestId,
  userEmail,
  userName,
  instagram,
  tiktok,
  description,
  viewUrl,
}: InfluencerRequestNotificationEmailProps) {
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
          <Heading style={baseStyles.heading}>New Influencer Request</Heading>

          <Text style={baseStyles.paragraph}>
            A user has submitted a request to create an AI influencer from an existing person.
          </Text>

          <Section style={baseStyles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Request ID</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>{requestId}</td>
                </tr>
                {userName && (
                  <tr style={baseStyles.tableRow}>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>User</td>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>{userName}</td>
                  </tr>
                )}
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Email</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                    <Link href={`mailto:${userEmail}`} style={baseStyles.link}>
                      {userEmail}
                    </Link>
                  </td>
                </tr>
                {instagram && (
                  <tr style={baseStyles.tableRow}>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Instagram</td>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                      <Link
                        href={`https://instagram.com/${instagram.replace('@', '')}`}
                        style={baseStyles.link}
                        target="_blank"
                      >
                        {instagram}
                      </Link>
                    </td>
                  </tr>
                )}
                {tiktok && (
                  <tr style={baseStyles.tableRow}>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>TikTok</td>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                      <Link
                        href={`https://tiktok.com/@${tiktok.replace('@', '')}`}
                        style={baseStyles.link}
                        target="_blank"
                      >
                        {tiktok}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Consent</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>✅ Provided</td>
                </tr>
              </tbody>
            </table>
          </Section>

          {description && (
            <Section style={{ ...baseStyles.card, marginTop: '24px' }}>
              <Text
                style={{
                  ...baseStyles.mutedText,
                  margin: 0,
                  marginBottom: '8px',
                  fontWeight: '600',
                }}
              >
                Additional Details:
              </Text>
              <Text style={{ ...baseStyles.paragraph, margin: 0 }}>
                {description}
              </Text>
            </Section>
          )}

          <Section style={baseStyles.center}>
            <Button href={viewUrl} style={baseStyles.button}>
              Review Request
            </Button>
          </Section>

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

InfluencerRequestNotificationEmail.PreviewProps = {
  requestId: '550e8400-e29b-41d4-a716-446655440000',
  userEmail: 'user@example.com',
  userName: 'John Doe',
  instagram: '@johndoe',
  tiktok: '@johndoe',
  description: 'I would like to create an AI influencer based on this person. They have given me consent to use their likeness.',
  viewUrl: 'https://app.ryla.ai/admin/influencer-requests/550e8400-e29b-41d4-a716-446655440000',
} as InfluencerRequestNotificationEmailProps;

export default InfluencerRequestNotificationEmail;

