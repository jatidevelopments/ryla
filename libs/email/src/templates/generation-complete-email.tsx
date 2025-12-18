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
import { baseStyles, colors } from '../styles';

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
      <Head />
      <Body style={baseStyles.body}>
        <Container style={baseStyles.container}>
          <Heading style={baseStyles.heading}>
            ✨ Your Images Are Ready!
          </Heading>

          <Section>
            <Text style={baseStyles.paragraph}>
              Hi {userName},
            </Text>

            <Text style={baseStyles.paragraph}>
              Great news! Your AI generation for <strong>{characterName}</strong> is
              complete. {imageCount} {imageCount === 1 ? 'image has' : 'images have'} been
              created and are waiting for you.
            </Text>
          </Section>

          {previewImageUrl && (
            <Section style={{ textAlign: 'center', margin: '24px 0' }}>
              <Img
                src={previewImageUrl}
                alt={`Preview of ${characterName}`}
                style={{
                  maxWidth: '100%',
                  width: '400px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
            </Section>
          )}

          <Section style={baseStyles.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.textMuted }}>Character</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                    {characterName}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', color: colors.textMuted }}>Images Generated</td>
                  <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '600' }}>
                    {imageCount}
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section style={{ textAlign: 'center', margin: '32px 0' }}>
            <Button href={viewUrl} style={baseStyles.button}>
              View Your Images →
            </Button>
          </Section>

          <Text style={baseStyles.mutedText}>
            These images will be saved to your library. You can download, share,
            or use them anytime.
          </Text>

          <Hr style={baseStyles.hr} />

          <Text style={baseStyles.footer}>
            © {new Date().getFullYear()} RYLA. All rights reserved.
            <br />
            <Link
              href="https://app.ryla.ai/settings/notifications"
              style={{ color: colors.textLight }}
            >
              Manage notification preferences
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

GenerationCompleteEmail.PreviewProps = {
  userName: 'John',
  characterName: 'Luna',
  imageCount: 5,
  previewImageUrl: 'https://placehold.co/400x400/5059FE/white?text=Preview',
  viewUrl: 'https://app.ryla.ai/characters/123/images',
} as GenerationCompleteEmailProps;

export default GenerationCompleteEmail;
