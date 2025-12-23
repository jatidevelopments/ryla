'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

/**
 * RYLA Button Variants
 *
 * Based on the design system with purple gradient accents.
 * - primary: Purple-pink gradient with glow effect on hover
 * - secondary: Transparent with white border, purple hover
 * - ghost: No background, text only with underline on hover
 */
const rylaButtonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap font-semibold',
    'transition-all duration-200 ease-out',
    'disabled:pointer-events-none disabled:opacity-50',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)]',
          'text-white',
          'shadow-md',
          'hover:shadow-[var(--glow-purple)]',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        secondary: [
          'bg-transparent',
          'text-white',
          'border border-[var(--border-hover)]',
          'hover:border-[var(--purple-500)]',
          'hover:bg-[var(--purple-500)]/10',
          'active:bg-[var(--purple-500)]/20',
        ],
        ghost: [
          'bg-transparent',
          'text-[var(--text-secondary)]',
          'hover:text-white',
          'underline-offset-4',
          'hover:underline',
        ],
        gradient: [
          'relative overflow-hidden',
          'bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)]',
          'text-white',
          'shadow-lg shadow-[var(--purple-600)]/25',
          'hover:shadow-xl hover:shadow-[var(--purple-600)]/30',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
          // Shimmer effect
          'after:absolute after:inset-0',
          'after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent',
          'after:translate-x-[-200%]',
          'hover:after:translate-x-[200%]',
          'after:transition-transform after:duration-700',
        ],
        // Modern glassy purple button with glassmorphism effect
        glassy: [
          'relative overflow-hidden',
          'bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500',
          'backdrop-blur-xl',
          'text-white font-semibold',
          'border border-white/30',
          'shadow-lg shadow-purple-500/40',
          // Inner glow/shine effect at top
          'before:absolute before:inset-0 before:rounded-[inherit]',
          'before:bg-gradient-to-b before:from-white/30 before:via-white/5 before:to-transparent',
          'before:pointer-events-none',
          // Outer glow
          'ring-1 ring-purple-400/20',
          // Hover states
          'hover:shadow-xl hover:shadow-purple-500/50',
          'hover:border-white/40',
          'hover:brightness-110',
          'hover:scale-[1.02]',
          'active:scale-[0.98]',
        ],
        // Outline glassy variant
        'glassy-outline': [
          'relative overflow-hidden',
          'bg-white/10 backdrop-blur-xl',
          'text-white font-medium',
          'border border-white/25',
          'shadow-lg shadow-purple-500/10',
          // Inner subtle glow
          'before:absolute before:inset-0 before:rounded-[inherit]',
          'before:bg-gradient-to-b before:from-white/15 before:to-transparent',
          'before:pointer-events-none',
          // Hover states
          'hover:bg-white/15',
          'hover:border-purple-400/40',
          'hover:text-white',
          'hover:shadow-xl hover:shadow-purple-500/20',
          'active:scale-[0.98]',
        ],
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-full gap-1.5 [&_svg]:size-4',
        default: 'h-10 px-5 text-sm rounded-full gap-1.5 [&_svg]:size-4',
        lg: 'h-11 px-5 text-sm rounded-full gap-1.5 [&_svg]:size-4',
        xl: 'h-12 px-6 text-base rounded-full gap-2 [&_svg]:size-5',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface RylaButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof rylaButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/**
 * RylaButton Component
 *
 * A styled button component following the RYLA design system.
 *
 * @example
 * <RylaButton variant="primary" size="lg">
 *   CREATE YOUR AI INFLUENCER NOW
 * </RylaButton>
 *
 * @example
 * <RylaButton variant="secondary">
 *   See How It Works
 * </RylaButton>
 */
const RylaButton = React.forwardRef<HTMLButtonElement, RylaButtonProps>(
  (
    { className, variant, size, asChild = false, loading, children, ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(rylaButtonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

RylaButton.displayName = 'RylaButton';

export { RylaButton, rylaButtonVariants };
