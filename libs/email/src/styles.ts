import type { CSSProperties } from 'react';

// ============================================================================
// RYLA Brand Colors (Minimal Black & White)
// ============================================================================

export const colors = {
  // Dark theme (primary)
  background: '#0a0a0f',
  foreground: '#fafafa',

  // Light theme (email-safe)
  backgroundLight: '#ffffff',
  foregroundLight: '#0a0a0f',

  // Grays
  muted: '#18181b',
  mutedForeground: '#a1a1aa',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: '#e4e4e7',

  // Accents (minimal use)
  accent: '#27272a',
  accentForeground: '#fafafa',

  // Status (only when needed)
  success: '#22c55e',
  error: '#ef4444',
};

// ============================================================================
// Typography
// ============================================================================

export const fonts = {
  // DM Sans - RYLA's primary font (with email-safe fallbacks)
  sans: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"JetBrains Mono", Menlo, Monaco, "Courier New", monospace',
};

// ============================================================================
// Brand Assets
// ============================================================================

export const brand = {
  name: 'RYLA',
  tagline: 'Create Hyper-Realistic AI Influencers',
  logo: 'https://ryla.ai/logos/Ryla_Logo_white.png',
  logoWidth: 100,
  website: 'https://ryla.ai',
  app: 'https://app.ryla.ai',
  support: 'support@ryla.ai',
  twitter: '@RylaAI',
};

// ============================================================================
// Base Styles - RYLA Minimal Theme
// ============================================================================

export const baseStyles = {
  // Main wrapper
  body: {
    backgroundColor: colors.background,
    fontFamily: fonts.sans,
    margin: 0,
    padding: '40px 0',
    color: colors.foreground,
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  } as CSSProperties,

  // Container
  container: {
    margin: '0 auto',
    padding: '40px 32px',
    backgroundColor: colors.muted,
    maxWidth: '560px',
    borderRadius: '12px',
  } as CSSProperties,

  // Logo
  logo: {
    width: `${brand.logoWidth}px`,
    height: 'auto',
    margin: '0 auto 32px',
    display: 'block',
  } as CSSProperties,

  // Typography
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    color: colors.foreground,
    margin: '0 0 24px 0',
    textAlign: 'center' as const,
    letterSpacing: '-0.02em',
  } as CSSProperties,

  subheading: {
    fontSize: '18px',
    fontWeight: '600',
    color: colors.foreground,
    margin: '24px 0 16px 0',
    letterSpacing: '-0.01em',
  } as CSSProperties,

  paragraph: {
    fontSize: '15px',
    lineHeight: '24px',
    color: colors.foreground,
    margin: '0 0 16px 0',
  } as CSSProperties,

  mutedText: {
    fontSize: '13px',
    lineHeight: '20px',
    color: colors.mutedForeground,
    margin: '0 0 16px 0',
  } as CSSProperties,

  // Links
  link: {
    color: colors.foreground,
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  } as CSSProperties,

  // Primary Button (white on dark)
  button: {
    backgroundColor: colors.foreground,
    color: colors.background,
    padding: '14px 28px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    display: 'inline-block',
    textAlign: 'center' as const,
    letterSpacing: '-0.01em',
  } as CSSProperties,

  // Secondary Button (outline)
  buttonSecondary: {
    backgroundColor: 'transparent',
    color: colors.foreground,
    padding: '12px 26px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '15px',
    display: 'inline-block',
    textAlign: 'center' as const,
    border: `1px solid ${colors.foreground}`,
    letterSpacing: '-0.01em',
  } as CSSProperties,

  // Divider
  hr: {
    borderColor: colors.border,
    borderWidth: '1px 0 0 0',
    borderStyle: 'solid',
    margin: '32px 0',
  } as CSSProperties,

  // Footer
  footer: {
    color: colors.mutedForeground,
    fontSize: '12px',
    textAlign: 'center' as const,
    marginTop: '32px',
    lineHeight: '20px',
  } as CSSProperties,

  // Card/Info Box
  card: {
    backgroundColor: colors.accent,
    padding: '20px',
    borderRadius: '10px',
    margin: '24px 0',
  } as CSSProperties,

  // Table row
  tableRow: {
    borderBottom: `1px solid ${colors.border}`,
  } as CSSProperties,

  tableCell: {
    padding: '12px 0',
    fontSize: '14px',
  } as CSSProperties,

  tableCellLabel: {
    color: colors.mutedForeground,
    fontSize: '14px',
  } as CSSProperties,

  tableCellValue: {
    color: colors.foreground,
    fontWeight: '500',
    textAlign: 'right' as const,
    fontSize: '14px',
  } as CSSProperties,

  // Code/mono text
  code: {
    fontFamily: fonts.mono,
    fontSize: '13px',
    backgroundColor: colors.accent,
    padding: '2px 6px',
    borderRadius: '4px',
  } as CSSProperties,

  // URL display
  urlBox: {
    backgroundColor: colors.accent,
    padding: '12px 16px',
    borderRadius: '8px',
    wordBreak: 'break-all' as const,
    fontSize: '12px',
    fontFamily: fonts.mono,
    color: colors.mutedForeground,
    marginTop: '8px',
  } as CSSProperties,

  // Center wrapper
  center: {
    textAlign: 'center' as const,
    margin: '32px 0',
  } as CSSProperties,
};

// ============================================================================
// Utility function for button center wrapper
// ============================================================================

export const buttonWrapper: CSSProperties = {
  textAlign: 'center',
  margin: '32px 0',
};
