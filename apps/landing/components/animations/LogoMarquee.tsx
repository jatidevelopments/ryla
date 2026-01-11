'use client';

import Marquee from '@/components/ui/marquee';
import { cn } from '@/lib/utils';

interface LogoMarqueeProps {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  speed?: 'slow' | 'normal' | 'fast';
  fadeEdges?: boolean;
}

/**
 * LogoMarquee Component
 *
 * A specialized marquee for displaying platform logos with fade edges.
 * Built on top of the base Marquee component.
 *
 * @example
 * <LogoMarquee fadeEdges speed="slow">
 *   <PlatformLogo name="tiktok" />
 *   <PlatformLogo name="instagram" />
 * </LogoMarquee>
 */
export function LogoMarquee({
  className,
  reverse = false,
  pauseOnHover = true,
  children,
  speed = 'normal',
  fadeEdges = true,
}: LogoMarqueeProps) {
  const speedDuration = {
    slow: '60s',
    normal: '40s',
    fast: '25s',
  };

  return (
    <div className={cn('relative w-full overflow-hidden', className)}>
      {/* Left fade edge */}
      {fadeEdges && (
        <div
          className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-[var(--bg-primary)] to-transparent"
          aria-hidden="true"
        />
      )}

      {/* Marquee content */}
      <Marquee
        reverse={reverse}
        pauseOnHover={pauseOnHover}
        className={cn('[--gap:3rem]', `[--duration:${speedDuration[speed]}]`)}
      >
        {children}
      </Marquee>

      {/* Right fade edge */}
      {fadeEdges && (
        <div
          className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-[var(--bg-primary)] to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

interface PlatformLogoProps {
  name: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'snapchat' | 'reddit';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * PlatformLogo Component
 *
 * Displays a platform logo with consistent sizing and styling.
 * Uses actual SVG files from /public/logos/platforms/
 *
 * @example
 * <PlatformLogo name="tiktok" size="md" />
 */
export function PlatformLogo({
  name,
  className,
  size = 'md',
}: PlatformLogoProps) {
  const sizeClasses = {
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
  };

  // Platform emoji/icons as fallback for missing SVGs
  const platformIcons: Record<string, string> = {
    tiktok: '🎵',
    instagram: '📷',
    youtube: '▶️',
    twitter: '🐦',
    snapchat: '👻',
    reddit: '🤖',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 transition-all duration-200',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'opacity-60 hover:opacity-100',
        className
      )}
    >
      {/* Try to load SVG, fallback to emoji if missing */}
      <div className="relative flex items-center">
        <img
          src={`/logos/platforms/${name}.svg`}
          alt={name}
          className={cn(sizeClasses[size], 'w-auto')}
          style={{ filter: 'brightness(0) invert(1)' }}
          onError={(e) => {
            // Hide SVG and show emoji fallback
            const img = e.target as HTMLImageElement;
            img.style.display = 'none';
            const emoji = img.nextElementSibling as HTMLElement;
            if (emoji) {
              emoji.style.display = 'block';
              emoji.style.fontSize = sizeClasses[size]
                .replace('h-', '')
                .replace('5', '1.25rem')
                .replace('6', '1.5rem')
                .replace('8', '2rem');
            }
          }}
        />
        <span
          className="hidden"
          style={{ display: 'none', lineHeight: 1, fontSize: '1.25rem' }}
        >
          {platformIcons[name] || '•'}
        </span>
      </div>
      <span className="text-sm font-medium capitalize whitespace-nowrap">
        {name === 'tiktok'
          ? 'TikTok'
          : name === 'snapchat'
          ? 'Snapchat'
          : name === 'reddit'
          ? 'Reddit'
          : name === 'twitter'
          ? 'Twitter'
          : name}
      </span>
    </div>
  );
}

export default LogoMarquee;
