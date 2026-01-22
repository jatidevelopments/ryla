'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../lib/utils';
import { buttonVariants, type ButtonProps } from './button';

interface MagicButtonProps extends ButtonProps {
  /**
   * Enable ripple effect on click
   */
  ripple?: boolean;
  /**
   * Enable glow effect on hover
   */
  glow?: boolean;
  /**
   * Enable scale animation on click
   */
  scale?: boolean;
}

/**
 * MagicButton Component
 *
 * Enhanced button with magical micro-interactions:
 * - Ripple effect on click
 * - Glow effect on hover
 * - Scale animation on click
 *
 * @example
 * <MagicButton ripple glow scale>
 *   Click Me
 * </MagicButton>
 */
export const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(
  (
    {
      className,
      ripple = true,
      glow = true,
      scale = true,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = React.useState<Array<{ x: number; y: number; id: number }>>([]);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const rippleIdRef = React.useRef(0);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = rippleIdRef.current++;

        setRipples((prev) => [...prev, { x, y, id }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
      }

      onClick?.(e);
    };

    return (
      <button
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }
          (buttonRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
        }}
        className={cn(
          buttonVariants({ className }),
          'relative overflow-hidden',
          glow && 'hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          scale && 'active:scale-95 transition-transform duration-150',
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
        
        {/* Ripple effects */}
        {ripple && (
          <span className="absolute inset-0 overflow-hidden pointer-events-none">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="absolute rounded-full bg-white/30 animate-ripple"
                style={{
                  left: `${ripple.x}px`,
                  top: `${ripple.y}px`,
                  width: '0px',
                  height: '0px',
                  transform: 'translate(-50%, -50%)',
                  animation: 'ripple 0.6s ease-out',
                }}
              />
            ))}
          </span>
        )}
      </button>
    );
  }
);

MagicButton.displayName = 'MagicButton';
