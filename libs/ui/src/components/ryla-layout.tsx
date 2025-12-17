'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

/**
 * Container Component
 *
 * Centered container with max-width and padding.
 */
interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'default' | 'narrow' | 'wide';
}

function Container({
  className,
  size = 'default',
  children,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full px-6 md:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Section Component
 *
 * Page section with consistent vertical padding.
 */
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  id?: string;
  fullHeight?: boolean;
  centered?: boolean;
  background?: 'default' | 'elevated' | 'gradient';
}

function Section({
  className,
  id,
  fullHeight = false,
  centered = false,
  background = 'default',
  children,
  ...props
}: SectionProps) {
  const bgClasses = {
    default: 'bg-[var(--bg-primary)]',
    elevated: 'bg-[var(--bg-elevated)]',
    gradient: 'bg-[var(--bg-primary)] relative overflow-hidden',
  };

  return (
    <section
      id={id}
      className={cn(
        'py-20 md:py-32',
        fullHeight && 'min-h-screen flex items-center',
        bgClasses[background],
        className
      )}
      {...props}
    >
      {/* Gradient glow for gradient background */}
      {background === 'gradient' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'var(--gradient-glow)',
          }}
          aria-hidden="true"
        />
      )}

      <Container className={cn(centered && 'text-center', 'relative z-10')}>
        {children}
      </Container>
    </section>
  );
}

/**
 * SectionHeader Component
 *
 * Consistent header for sections with title, subtitle, and optional badge.
 * Supports highlighting part of the title in purple using titleHighlight prop.
 */
interface SectionHeaderProps {
  badge?: string;
  title: string;
  titleHighlight?: string; // Part of title to highlight in purple
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

function SectionHeader({
  badge,
  title,
  titleHighlight,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  // Split title by highlight text if provided
  const renderTitle = () => {
    if (!titleHighlight) {
      return title;
    }

    const parts = title.split(titleHighlight);
    if (parts.length === 1) {
      return title; // Highlight text not found
    }

    return (
      <>
        {parts[0]}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          {titleHighlight}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <div className={cn('mb-12 md:mb-16', centered && 'text-center', className)}>
      {/* Badge */}
      {badge && (
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-[var(--purple-400)] bg-[var(--purple-600)]/10 rounded-full border border-[var(--purple-600)]/20">
          {badge}
        </span>
      )}

      {/* Title */}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] leading-tight">
        {renderTitle()}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-4 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * GradientBackground Component
 *
 * Decorative gradient background with optional parallax effect.
 */
interface GradientBackgroundProps {
  className?: string;
  position?: 'top' | 'center' | 'bottom';
  intensity?: 'light' | 'medium' | 'strong';
}

function GradientBackground({
  className,
  position = 'top',
  intensity = 'medium',
}: GradientBackgroundProps) {
  const positionStyles = {
    top: 'top-0 left-1/2 -translate-x-1/2',
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2',
  };

  const intensityOpacity = {
    light: 'opacity-30',
    medium: 'opacity-50',
    strong: 'opacity-70',
  };

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        'w-[800px] h-[800px]',
        positionStyles[position],
        intensityOpacity[intensity],
        className
      )}
      style={{
        background:
          'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        filter: 'blur(100px)',
      }}
      aria-hidden="true"
    />
  );
}

/**
 * Divider Component
 *
 * Subtle horizontal divider.
 */
interface DividerProps {
  className?: string;
}

function Divider({ className }: DividerProps) {
  return (
    <div
      className={cn(
        'w-full h-px bg-gradient-to-r from-transparent via-[var(--border-default)] to-transparent',
        className
      )}
      aria-hidden="true"
    />
  );
}

/**
 * RylaBadge Component
 *
 * Small badge for labels and tags.
 */
interface RylaBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'purple' | 'success';
  className?: string;
}

function RylaBadge({
  children,
  variant = 'default',
  className,
}: RylaBadgeProps) {
  const variantClasses = {
    default: 'bg-[var(--bg-hover)] text-[var(--text-secondary)]',
    purple:
      'bg-[var(--purple-600)]/10 text-[var(--purple-400)] border border-[var(--purple-600)]/20',
    success:
      'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

export {
  Container,
  Section,
  SectionHeader,
  GradientBackground,
  Divider,
  RylaBadge,
};
