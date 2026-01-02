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

export interface BugReportNotificationEmailProps {
  bugReportId: string;
  description: string;
  userEmail?: string | null;
  userName?: string | null;
  hasScreenshot: boolean;
  hasLogs: boolean;
  browserInfo: string;
  url: string;
  viewUrl: string;
}

export function BugReportNotificationEmail({
  bugReportId,
  description,
  userEmail,
  userName,
  hasScreenshot,
  hasLogs,
  browserInfo,
  url,
  viewUrl,
}: BugReportNotificationEmailProps) {
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

          <Heading style={baseStyles.heading}>New Bug Report</Heading>

          <Text style={baseStyles.paragraph}>
            A new bug report has been submitted.
          </Text>

          <Section style={baseStyles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Report ID</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>{bugReportId}</td>
                </tr>
                {userName && (
                  <tr style={baseStyles.tableRow}>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>User</td>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>{userName}</td>
                  </tr>
                )}
                {userEmail && (
                  <tr style={baseStyles.tableRow}>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Email</td>
                    <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                      <Link href={`mailto:${userEmail}`} style={baseStyles.link}>
                        {userEmail}
                      </Link>
                    </td>
                  </tr>
                )}
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Browser</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>{browserInfo}</td>
                </tr>
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>URL</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                    <Link href={url} style={baseStyles.link}>
                      {url}
                    </Link>
                  </td>
                </tr>
                <tr style={baseStyles.tableRow}>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Screenshot</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                    {hasScreenshot ? '✅ Included' : '❌ Not included'}
                  </td>
                </tr>
                <tr>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellLabel }}>Console Logs</td>
                  <td style={{ ...baseStyles.tableCell, ...baseStyles.tableCellValue }}>
                    {hasLogs ? '✅ Included' : '❌ Not included'}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ ...baseStyles.card, marginTop: '24px' }}>
            <Text
              style={{
                ...baseStyles.mutedText,
                margin: 0,
                marginBottom: '8px',
                fontWeight: '600',
              }}
            >
              Description:
            </Text>
            <Text style={{ ...baseStyles.paragraph, margin: 0 }}>
              {description}
            </Text>
          </Section>

          <Section style={baseStyles.center}>
            <Button href={viewUrl} style={baseStyles.button}>
              View Bug Report
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

BugReportNotificationEmail.PreviewProps = {
  bugReportId: '550e8400-e29b-41d4-a716-446655440000',
  description:
    'The character generation failed when I tried to create a new influencer. The error message said "Invalid prompt" but my prompt was valid.',
  userEmail: 'user@example.com',
  userName: 'John Doe',
  hasScreenshot: true,
  hasLogs: true,
  browserInfo: 'Chrome 120.0.0.0 on macOS',
  url: 'https://app.ryla.ai/influencer/123/studio',
  viewUrl: 'https://app.ryla.ai/admin/bug-reports/550e8400-e29b-41d4-a716-446655440000',
} as BugReportNotificationEmailProps;

export default BugReportNotificationEmail;

