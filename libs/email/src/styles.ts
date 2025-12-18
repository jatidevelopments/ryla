import type { CSSProperties } from 'react';

// ============================================================================
// Colors
// ============================================================================

export const colors = {
  primary: '#5059FE',
  primaryHover: '#4048ed',
  background: '#f6f9fc',
  white: '#ffffff',
  text: '#1a1a1a',
  textMuted: '#666666',
  textLight: '#8898aa',
  border: '#e5e7eb',
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
};

// ============================================================================
// Fonts
// ============================================================================

export const fonts = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
  mono: 'Menlo, Monaco, "Courier New", monospace',
};

// ============================================================================
// Base Styles
// ============================================================================

export const baseStyles = {
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.sans,
    margin: 0,
    padding: 0,
  } as CSSProperties,

  container: {
    margin: '0 auto',
    padding: '20px 25px 48px',
    backgroundColor: colors.white,
    maxWidth: '600px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  } as CSSProperties,

  heading: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: colors.text,
    marginTop: '32px',
    marginBottom: '24px',
    textAlign: 'center' as const,
  } as CSSProperties,

  subheading: {
    fontSize: '20px',
    fontWeight: '600',
    color: colors.text,
    marginTop: '24px',
    marginBottom: '16px',
  } as CSSProperties,

  paragraph: {
    fontSize: '16px',
    lineHeight: '26px',
    color: colors.text,
    marginBottom: '16px',
  } as CSSProperties,

  mutedText: {
    fontSize: '14px',
    lineHeight: '22px',
    color: colors.textMuted,
    marginBottom: '16px',
  } as CSSProperties,

  link: {
    color: colors.primary,
    textDecoration: 'underline',
  } as CSSProperties,

  button: {
    backgroundColor: colors.primary,
    color: colors.white,
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    display: 'inline-block',
    textAlign: 'center' as const,
  } as CSSProperties,

  buttonSecondary: {
    backgroundColor: colors.white,
    color: colors.primary,
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '16px',
    display: 'inline-block',
    textAlign: 'center' as const,
    border: `2px solid ${colors.primary}`,
  } as CSSProperties,

  hr: {
    borderColor: colors.border,
    borderWidth: '1px 0 0 0',
    borderStyle: 'solid',
    margin: '32px 0',
  } as CSSProperties,

  footer: {
    color: colors.textLight,
    fontSize: '12px',
    marginTop: '48px',
    textAlign: 'center' as const,
  } as CSSProperties,

  logo: {
    width: '120px',
    height: 'auto',
    margin: '0 auto 24px',
    display: 'block',
  } as CSSProperties,

  card: {
    backgroundColor: colors.background,
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '16px',
  } as CSSProperties,

  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
  } as CSSProperties,

  badgeSuccess: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  } as CSSProperties,

  badgeError: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  } as CSSProperties,

  badgeWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  } as CSSProperties,
};
