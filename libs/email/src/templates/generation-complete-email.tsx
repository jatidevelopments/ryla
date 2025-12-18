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

export interface GenerationCompleteEmailProps {
  userName: string;
  characterName: string;
  imageCount: number;
  previewImageUrl?: string;
  viewUrl: string;
}

export function GenerationCompleteEmail({
  userName,
  characterName,
  imageCount,
  previewImageUrl,
  viewUrl,
}: GenerationCompleteEmailProps) {
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

          <Heading style={baseStyles.heading}>Generation Complete</Heading>

          <Text style={baseStyles.paragraph}>Hi {userName},</Text>

          <Text style={baseStyles.paragraph}>
            Your generation for <strong>{characterName}</strong> is ready.{' '}
            {imageCount} {imageCount === 1 ? 'image' : 'images'} created.
          </Text>

          {previewImageUrl && (
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Img
                src={previewImageUrl}
                alt={characterName}
                style={{
                  maxWidth: '100%',
                  width: '320px',
                  borderRadius: '10px',
                }}
              />
            </Section>
          )}

          <Section style={baseStyles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr style={baseStyles.tableRow}>
                  <td style={baseStyles.tableCellLabel}>Character</td>
                  <td style={baseStyles.tableCellValue}>{characterName}</td>
                </tr>
                <tr>
                  <td style={baseStyles.tableCellLabel}>Images</td>
                  <td style={baseStyles.tableCellValue}>{imageCount}</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={baseStyles.center}>
            <Button href={viewUrl} style={baseStyles.button}>
              View Images
            </Button>
          </Section>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} {brand.name}
            <br />
            <Link href={brand.website} style={{ color: colors.mutedForeground }}>
              ryla.ai
            </Link>
            {' · '}
            <Link
              href="https://app.ryla.ai/settings/notifications"
              style={{ color: colors.mutedForeground }}
            >
              Notification settings
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

GenerationCompleteEmail.PreviewProps = {
  userName: 'Alex',
  characterName: 'Luna',
  imageCount: 5,
  previewImageUrl: 'https://placehold.co/320x320/18181b/fafafa?text=Luna',
  viewUrl: 'https://app.ryla.ai/characters/123/images',
} as GenerationCompleteEmailProps;

export default GenerationCompleteEmail;
