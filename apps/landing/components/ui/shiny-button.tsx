'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import React from 'react';

const animationProps = {
  initial: { '--x': '100%', scale: 0.8 },
  animate: { '--x': '-100%', scale: 1 },
  whileTap: { scale: 0.95 },
  transition: {
    repeat: Infinity,
    repeatType: 'loop' as const,
    repeatDelay: 1,
    type: 'spring' as const,
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring' as const,
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
};

interface ShinyButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onDrag' | 'onDragStart' | 'onDragEnd' | 'onClick'
  > {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>
  ) => void;
}

const buttonClassName = cn(
  'relative rounded-full px-8 py-3.5 font-semibold text-base',
  // Gradient background
  'bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)]',
  // Shadow
  'shadow-lg shadow-purple-500/25',
  // Hover
  'hover:shadow-xl hover:shadow-purple-500/40',
  // Transition
  'transition-shadow duration-300',
  // Text
  'text-white'
);

const ShinyContent = ({ children }: { children: React.ReactNode }) => (
  <>
    {/* Shiny sweep effect */}
    <span
      className="relative z-10 flex items-center justify-center gap-2 text-white"
      style={{
        maskImage:
          'linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))',
        WebkitMaskImage:
          'linear-gradient(-75deg, white calc(var(--x) + 20%), transparent calc(var(--x) + 30%), white calc(var(--x) + 100%))',
      }}
    >
      {children}
    </span>
    {/* Shine overlay */}
    <span
      style={{
        mask: 'linear-gradient(white, white) content-box, linear-gradient(white, white)',
        maskComposite: 'exclude',
        WebkitMaskComposite: 'xor',
      }}
      className="absolute inset-0 z-10 block rounded-full bg-[linear-gradient(-75deg,rgba(255,255,255,0.1)_calc(var(--x)+20%),rgba(255,255,255,0.5)_calc(var(--x)+25%),rgba(255,255,255,0.1)_calc(var(--x)+100%))] p-px"
    />
  </>
);

export function ShinyButton({
  children,
  className,
  onClick,
  disabled,
  type,
  href,
  ...restProps
}: ShinyButtonProps) {
  // Extract HTML-only props that don't conflict with motion
  const {
    onDrag: _onDrag,
    onDragStart: _onDragStart,
    onDragEnd: _onDragEnd,
    ...safeProps
  } = restProps as any;

  // If href is provided, render as anchor tag wrapped in motion.div
  if (href) {
    return (
      <motion.div {...animationProps} className="inline-block">
        <a
          href={href}
          onClick={(e) => {
            if (onClick) {
              onClick(e);
            }
          }}
          className={cn(buttonClassName, className, 'inline-block')}
        >
          <ShinyContent>{children}</ShinyContent>
        </a>
      </motion.div>
    );
  }

  // Otherwise render as button
  return (
    <motion.button
      {...animationProps}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...safeProps}
      className={cn(buttonClassName, className)}
    >
      <ShinyContent>{children}</ShinyContent>
    </motion.button>
  );
}

export default ShinyButton;
