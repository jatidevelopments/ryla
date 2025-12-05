/**
 * RYLA Design System - Component Variants
 * Based on funnel-adult-v3 design system
 *
 * Shared variant definitions using class-variance-authority
 * These can be used directly in components or extended
 */

import { cva, type VariantProps } from 'class-variance-authority';

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Primary gradient button (purple)
        default: 'bg-primary-gradient text-white hover:brightness-110 active:brightness-95',
        // Secondary gradient (pink to orange)
        secondary: 'gradient-border text-white hover:brightness-110 active:brightness-95',
        // Pink gradient with glow
        pink: 'gradient-pink',
        // Tertiary subtle button
        tertiary: 'bg-white/10 text-white hover:bg-white/20 border border-white/10',
        // Destructive action
        destructive: 'bg-[#fc594c] text-white hover:bg-[#fc594c]/90',
        // Ghost/transparent
        ghost: 'text-white hover:bg-white/10',
        // Outline with gradient border
        outline: 'gradient-border-block rounded-[10px]',
        // Ghost button with gradient border
        'ghost-gradient': 'ghost-button',
        // Link style
        link: 'text-[#b99cff] underline-offset-4 hover:underline',
        // Back button (icon style)
        back: 'rounded-full bg-white/10 text-white hover:bg-white/20',
        // Orange gradient (CTA) with pulse
        'orange-cta': 'bg-[#fb6731] text-white hover:brightness-110 pulse-button',
        // Pink CTA with pulse
        'pink-cta': 'bg-[#ff437a] text-white hover:brightness-110 pulse-button-secondary',
        // Purple CTA with pulse
        'purple-cta': 'bg-[#b99cff] text-[#161619] hover:brightness-110 font-bold',
        // Sale button (purple to coral)
        sale: 'sale-gradient-button text-white font-bold',
        // Pill style (tags, filters)
        pill: 'rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10',
        // Semi-transparent for overlays
        'semi-transparent': 'bg-black/50 backdrop-blur-sm text-white hover:bg-black/60 border border-white/10',
      },
      size: {
        xs: 'h-[26px] px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 py-2',
        lg: 'h-[45px] px-6 text-base',
        xl: 'h-[52px] px-8 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

// =============================================================================
// INPUT VARIANTS
// =============================================================================

export const inputVariants = cva(
  // Base styles
  'flex w-full rounded-[10px] bg-white/5 px-3 py-2 text-sm text-white placeholder:text-[#a1a1aa] transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-white/10 focus:border-[#b99cff] focus:ring-1 focus:ring-[#b99cff]/20',
        filled: 'border-0 bg-white/10 focus:bg-white/15',
        ghost: 'border-0 bg-transparent hover:bg-white/5 focus:bg-white/10',
        error: 'border border-[#fc594c]/50 focus:border-[#fc594c] focus:ring-1 focus:ring-[#fc594c]/20',
      },
      inputSize: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
);

export type InputVariants = VariantProps<typeof inputVariants>;

// =============================================================================
// CARD VARIANTS
// =============================================================================

export const cardVariants = cva(
  // Base styles
  'rounded-[10px] transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-[#1f1f24] border border-white/5',
        elevated: 'bg-[#1f1f24] border border-white/10 shadow-lg',
        glass: 'bg-white/5 backdrop-blur-sm border border-white/10',
        ghost: 'bg-transparent',
        interactive: 'bg-[#1f1f24] border border-white/5 hover:border-white/20 hover:bg-[#323237] cursor-pointer',
        selected: 'bg-gradient-to-br from-[#b99cff]/10 to-transparent border-2 border-[#b99cff]',
        gradient: 'gradient-border-block',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
);

export type CardVariants = VariantProps<typeof cardVariants>;

// =============================================================================
// BADGE VARIANTS
// =============================================================================

export const badgeVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#b99cff]/20 text-[#b99cff] border border-[#b99cff]/30',
        secondary: 'bg-white/10 text-white/70 border border-white/10',
        pink: 'bg-[#ff437a]/20 text-[#ff437a] border border-[#ff437a]/30',
        success: 'bg-[#00ed77]/20 text-[#00ed77] border border-[#00ed77]/30',
        warning: 'bg-[#ffdda7]/20 text-[#ffdda7] border border-[#ffdda7]/30',
        error: 'bg-[#fc594c]/20 text-[#fc594c] border border-[#fc594c]/30',
        orange: 'bg-[#fb6731]/20 text-[#fb6731] border border-[#fb6731]/30',
        outline: 'bg-transparent text-white/70 border border-white/20',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0',
        default: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-2.5 py-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

// =============================================================================
// TEXT VARIANTS
// =============================================================================

export const textVariants = cva('', {
  variants: {
    variant: {
      // Display
      h1: 'text-4xl md:text-5xl font-bold tracking-tight',
      h2: 'text-3xl md:text-4xl font-bold tracking-tight',
      h3: 'text-2xl md:text-3xl font-semibold',
      h4: 'text-xl md:text-2xl font-semibold',
      h5: 'text-lg md:text-xl font-semibold',
      h6: 'text-base md:text-lg font-semibold',
      // Body
      body: 'text-base',
      'body-sm': 'text-sm',
      'body-lg': 'text-lg',
      // Utility
      label: 'text-sm font-medium',
      caption: 'text-xs text-[#a1a1aa]',
      overline: 'text-xs font-semibold uppercase tracking-wider',
    },
    color: {
      default: 'text-white',
      muted: 'text-[#a1a1aa]',
      subtle: 'text-[#71717a]',
      accent: 'text-[#b99cff]',
      pink: 'text-[#ff437a]',
      orange: 'text-[#fb6731]',
      success: 'text-[#00ed77]',
      warning: 'text-[#ffdda7]',
      error: 'text-[#fc594c]',
    },
  },
  defaultVariants: {
    variant: 'body',
    color: 'default',
  },
});

export type TextVariants = VariantProps<typeof textVariants>;

// =============================================================================
// AVATAR VARIANTS
// =============================================================================

export const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-[#323237]',
  {
    variants: {
      size: {
        xs: 'h-8 w-8 text-xs',
        sm: 'h-9 w-9 text-sm',
        default: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
        '2xl': 'h-20 w-20 text-xl',
      },
      status: {
        none: '',
        online: 'ring-2 ring-[#00ed77]',
        offline: 'ring-2 ring-[#a1a1aa]',
        busy: 'ring-2 ring-[#fc594c]',
      },
    },
    defaultVariants: {
      size: 'default',
      status: 'none',
    },
  }
);

export type AvatarVariants = VariantProps<typeof avatarVariants>;

// =============================================================================
// SKELETON VARIANTS
// =============================================================================

export const skeletonVariants = cva(
  'animate-pulse bg-white/5 rounded-md',
  {
    variants: {
      variant: {
        default: '',
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'rounded-full',
        button: 'h-10 rounded-[10px]',
        card: 'h-32 rounded-[10px]',
        image: 'aspect-square rounded-[10px] image-skeleton-gradient',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type SkeletonVariants = VariantProps<typeof skeletonVariants>;

// =============================================================================
// OPTION CARD VARIANTS (For wizard selection cards)
// =============================================================================

export const optionCardVariants = cva(
  'relative rounded-[10px] overflow-hidden transition-all duration-200 cursor-pointer border',
  {
    variants: {
      variant: {
        default: 'bg-[#1f1f24] border-white/10 hover:border-white/30 shadow-white-glow',
        image: 'bg-[#1f1f24] border-white/10 hover:border-white/30 aspect-square',
        horizontal: 'bg-[#1f1f24] border-white/10 hover:border-white/30 flex items-center',
      },
      selected: {
        true: 'border-2 border-[#b99cff] bg-gradient-to-br from-[#b99cff]/10 to-transparent',
        false: '',
      },
      size: {
        sm: 'p-2',
        default: 'p-3',
        lg: 'p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      selected: false,
      size: 'default',
    },
  }
);

export type OptionCardVariants = VariantProps<typeof optionCardVariants>;

// =============================================================================
// PROGRESS BAR VARIANTS
// =============================================================================

export const progressVariants = cva(
  'h-2 w-full overflow-hidden rounded-full bg-white/10',
  {
    variants: {
      variant: {
        default: '',
        gradient: '',
      },
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export const progressIndicatorVariants = cva(
  'h-full transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-[#b99cff]',
        gradient: 'slider-range-bg', // Uses CSS variable gradient (purple)
        pink: 'bg-[#ff437a]',
        orange: 'bg-[#fb6731]',
        success: 'bg-[#00ed77]',
      },
    },
    defaultVariants: {
      variant: 'gradient',
    },
  }
);

export type ProgressVariants = VariantProps<typeof progressVariants>;

// =============================================================================
// SWITCH VARIANTS (from funnel)
// =============================================================================

export const switchVariants = cva(
  'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'data-[state=checked]:bg-[#b99cff] data-[state=unchecked]:bg-[#323237]',
        pink: 'data-[state=checked]:bg-[#ff437a] data-[state=unchecked]:bg-[#323237]',
        custom: 'switcher-root', // Uses CSS class for complex styling
      },
      size: {
        default: 'h-6 w-11',
        sm: 'h-5 w-9',
        lg: 'h-7 w-14',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type SwitchVariants = VariantProps<typeof switchVariants>;
