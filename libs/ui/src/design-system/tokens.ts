/**
 * RYLA Design System - TypeScript Design Tokens
 * Single source of truth for all design values
 * Based on RYLA landing page purple/pink gradient theme
 *
 * Categories:
 * - Colors
 * - Typography
 * - Spacing
 * - Border Radius
 * - Shadows
 * - Animations
 */

// =============================================================================
// COLORS - RYLA Purple Theme
// =============================================================================

export const colors = {
  // Background Colors
  background: {
    primary: '#0A0A0B',
    elevated: '#111113',
    hover: '#1A1A1D',
    subtle: '#16161A',
  },

  // Purple Accent Colors
  purple: {
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    DEFAULT: '#A855F7',
  },

  // Pink Accent Colors
  pink: {
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    DEFAULT: '#EC4899',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    muted: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.25)',
  },

  // Border Colors
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.15)',
    active: 'rgba(255, 255, 255, 0.25)',
    purple: 'rgba(168, 85, 247, 0.5)',
    purpleStrong: 'rgba(168, 85, 247, 0.8)',
  },

  // Semantic Colors
  success: {
    DEFAULT: '#22C55E',
    muted: 'rgba(34, 197, 94, 0.2)',
  },

  error: {
    DEFAULT: '#EF4444',
    muted: 'rgba(239, 68, 68, 0.2)',
  },

  // Legacy color mappings for compatibility
  neutral: {
    black: '#0A0A0B',
    black2: '#111113',
    smoothGray: '#1A1A1D',
    gray1: 'rgba(255, 255, 255, 0.4)',
    gray2: '#16161A',
    white: '#FFFFFF',
  },
} as const;

// =============================================================================
// GRADIENTS
// =============================================================================

export const gradients = {
  // Primary Purple-Pink Gradient
  primary: 'linear-gradient(135deg, #9333EA 0%, #EC4899 100%)',
  primaryHover: 'linear-gradient(135deg, #A855F7 0%, #F472B6 100%)',

  // Text Gradient
  text: 'linear-gradient(135deg, #C084FC 0%, #EC4899 100%)',

  // Card Border Gradient
  cardBorder: 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)',

  // Glow Effects
  glow: 'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)',
  glowCenter: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 60%)',

  // Fade Masks for Marquee
  fadeLeft: 'linear-gradient(90deg, #0A0A0B 0%, transparent 10%)',
  fadeRight: 'linear-gradient(90deg, transparent 90%, #0A0A0B 100%)',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['DM Sans', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.875rem', // 14px
    base: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.75rem', // 28px
    '4xl': '2.25rem', // 36px
    '5xl': '2.5rem', // 40px
    '6xl': '3.5rem', // 56px
  },

  // Font Weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line Heights
  lineHeight: {
    tight: '1.1',
    snug: '1.2',
    normal: '1.5',
    relaxed: '1.6',
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.02em',
    snug: '-0.01em',
    normal: '0',
    wide: '0.02em',
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px

  // Section Spacing
  sectionMobile: '5rem', // 80px
  sectionDesktop: '7.5rem', // 120px

  // Container
  containerMax: '75rem', // 1200px
  containerPadding: '1.5rem', // 24px

  // Component Gaps
  cardGap: '1.5rem', // 24px
  elementGap: '1rem', // 16px
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
  full: '9999px',
} as const;

// =============================================================================
// SHADOWS
// =============================================================================

export const shadows = {
  none: 'none',

  // Glow Effects
  glowPurple: '0 0 30px rgba(168, 85, 247, 0.4)',
  glowPurpleSm: '0 0 20px rgba(168, 85, 247, 0.3)',
  glowPurpleLg: '0 0 60px rgba(168, 85, 247, 0.3)',
  glowPurpleXl: '0 0 100px rgba(168, 85, 247, 0.25)',

  // Card Shadows
  card: '0 4px 24px rgba(0, 0, 0, 0.2)',
  cardHover: '0 8px 32px rgba(0, 0, 0, 0.3)',

  // Elevation
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
} as const;

// =============================================================================
// TRANSITIONS & ANIMATIONS
// =============================================================================

export const transitions = {
  // Durations
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '600ms',
    stat: '2000ms',
  },

  // Timing Functions
  easing: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    linear: 'linear',
  },

  // Stagger
  staggerDelay: '100ms',
  staggerMax: '500ms',
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
} as const;

// =============================================================================
// BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// =============================================================================
// COMPONENT SIZES
// =============================================================================

export const componentSizes = {
  // Navigation
  navHeight: '4rem', // 64px

  // Button heights
  button: {
    sm: '36px',
    md: '44px',
    lg: '48px',
    xl: '56px',
  },

  // Input heights
  input: {
    sm: '32px',
    md: '40px',
    lg: '48px',
  },

  // Avatar sizes
  avatar: {
    xs: '32px',
    sm: '36px',
    md: '40px',
    lg: '48px',
    xl: '64px',
    '2xl': '80px',
  },

  // Icon sizes
  icon: {
    xs: '12px',
    sm: '16px',
    md: '20px',
    lg: '24px',
    xl: '32px',
  },

  // Card sizes
  card: {
    sm: '280px',
    md: '320px',
    lg: '400px',
  },
} as const;

// =============================================================================
// BLUR VALUES
// =============================================================================

export const blur = {
  sm: 'blur(4px)',
  md: 'blur(8px)',
  lg: 'blur(16px)',
  xl: 'blur(24px)',
} as const;

// =============================================================================
// EXPORT ALL TOKENS
// =============================================================================

export const tokens = {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  componentSizes,
  blur,
} as const;

export type Tokens = typeof tokens;
