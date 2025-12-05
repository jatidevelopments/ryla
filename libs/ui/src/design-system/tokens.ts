/**
 * RYLA Design System - Design Tokens
 * Single source of truth for all design values
 * Based on funnel-adult-v3 design system
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
// COLORS (from funnel-adult-v3)
// =============================================================================

export const colors = {
  // Primary Brand Colors (Purple)
  primary: {
    light: '#f0dbfa',
    medium: '#f0dbff',
    dark: '#d5b9ff',
    semi: '#b99cff',
    DEFAULT: '#b99cff',  // Main primary color
  },

  // Secondary/Accent Colors (Pink/Orange)
  accent: {
    pink: '#ff437a',
    pinkRed: '#f54d71',
    orange: '#fb6731',
    coralRed: '#fd525a',
    coral: '#ffb498',
  },

  // Success
  success: {
    DEFAULT: '#00ed77',
    light: '#4ade80',
  },

  // Neutral Colors
  neutral: {
    black: '#161619',
    black2: '#1f1f24',
    smoothGray: '#323237',
    gray1: '#a1a1aa',
    gray2: '#2a2a2f',
    white: '#ffffff',
  },

  // Semantic Colors
  semantic: {
    success: '#00ed77',  // salad green
    warning: '#ffdda7',  // light yellow
    error: '#fc594c',    // red
    info: '#b99cff',     // semi purple
  },

  // Surface Colors (backgrounds)
  surface: {
    primary: '#161619',
    secondary: '#1f1f24',
    tertiary: '#323237',
    elevated: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border Colors
  border: {
    default: 'rgba(255, 255, 255, 0.1)',
    hover: 'rgba(255, 255, 255, 0.2)',
    focus: '#b99cff',
    muted: 'rgba(255, 255, 255, 0.05)',
  },

  // Text Colors
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
    inverse: '#161619',
    accent: '#b99cff',
  },

  // Accent variations
  accent: {
    lightYellow: '#ffdda7',
    coral: '#ffb498',
    coralRed: '#fd525a',
  },
} as const;

// =============================================================================
// GRADIENTS (from funnel-adult-v3)
// =============================================================================

export const gradients = {
  // Primary brand gradient (purple)
  primary: 'linear-gradient(45deg, #c4b5fd 0%, #7c3aed 100%)',
  primaryHover: 'linear-gradient(45deg, #a78bfa 0%, #6d28d9 100%)',

  // Secondary gradient (pink to orange - for CTAs)
  secondary: 'linear-gradient(135deg, #fd3a69, #fb6731)',
  secondaryHover: 'linear-gradient(135deg, #fb6731, #ff437a)',

  // Pink gradient button
  pinkButton: 'linear-gradient(to right, #fd407c, #ee79de, #ff6994)',

  // Slider range
  slider: 'linear-gradient(to right, #d5b9ff, #b99cff)',

  // CTA gradient (purple to coral)
  cta: 'linear-gradient(135deg, #d5b9ff 0%, #ffb498 100%)',
  ctaHover: 'linear-gradient(135deg, #ffb498 0%, #d5b9ff 100%)',

  // Dark pink overlay
  darkPink: 'linear-gradient(to bottom, rgba(31, 31, 36, 0.8) 0.2%, rgba(190, 64, 176, 0.4) 50%, rgba(31, 31, 36, 0.8) 99.8%)',

  // Card/surface gradient
  card: 'linear-gradient(180deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',

  // Radial fade (for effects)
  radialFade: 'radial-gradient(circle, #f04296 0%, rgba(240, 66, 72, 0) 100%)',

  // White gradient
  white: 'linear-gradient(rgba(255, 255, 255, 70%) 0%, rgba(255, 255, 255, 0%) 100%)',
} as const;

// =============================================================================
// TYPOGRAPHY (from funnel-adult-v3)
// =============================================================================

export const typography = {
  // Font Families
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Menlo', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  // Font Weights
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
  },
} as const;

// =============================================================================
// SPACING
// =============================================================================

export const spacing = {
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
} as const;

// =============================================================================
// BORDER RADIUS (from funnel-adult-v3)
// =============================================================================

export const borderRadius = {
  none: '0',
  sm: 'calc(0.625rem - 4px)',     // ~6px
  default: 'calc(0.625rem - 2px)', // ~8px
  md: '0.625rem',                  // 10px (--radius)
  lg: '0.75rem',                   // 12px
  xl: 'calc(0.625rem + 4px)',     // ~14px
  '2xl': '1rem',                   // 16px
  '3xl': '1.5rem',                 // 24px
  full: '9999px',
} as const;

// =============================================================================
// SHADOWS (from funnel-adult-v3)
// =============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',

  // Brand shadows
  whiteGlow: '0px 0px 12.3px rgba(255, 255, 255, 0.1)',
  primary: '0 0 13.1px #fd525a',
  pinkGlow: '0 4px 10px rgba(255, 28, 138, 0.49)',
  voiceIcon: '3px 10px 15px 0 rgba(0, 0, 0, 0.25)',
  emoji: '0px 4px 4px rgba(0, 0, 0, 0.25)',

  // Translucent shadows
  translucent: '0 -5px 41px 0 rgba(41, 39, 130, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',

  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
} as const;

// =============================================================================
// TRANSITIONS & ANIMATIONS
// =============================================================================

export const transitions = {
  // Durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
    gradient: '800ms',
  },

  // Timing Functions
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
} as const;

// =============================================================================
// Z-INDEX
// =============================================================================

export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
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
  // Button heights
  button: {
    xs: '26px',
    sm: '32px',
    md: '40px',
    lg: '45px',
    xl: '52px',
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
} as const;

export type Tokens = typeof tokens;
