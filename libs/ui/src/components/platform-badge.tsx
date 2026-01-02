/**
 * Platform Badge Component
 * 
 * Displays a platform icon/badge with platform name.
 * Used in aspect ratio selectors and export buttons.
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import type { PlatformId } from '@ryla/shared';
import { PLATFORMS } from '@ryla/shared';
import {
  FaInstagram,
  FaTiktok,
  FaPinterest,
  FaTwitter,
  FaYoutube,
  FaFacebook,
} from 'react-icons/fa';
import { HiHeart } from 'react-icons/hi';
import { SiOnlyfans } from 'react-icons/si';

export interface PlatformBadgeProps {
  platformId: PlatformId;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean; // Always true for compact badges
  className?: string;
  onClick?: () => void;
  variant?: 'badge' | 'compact'; // badge = icon + name, compact = just icon
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

const containerSizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-7 w-7',
};

// Platform icon components using react-icons
const PlatformIcon = ({ platformId, size = 'sm' }: { platformId: PlatformId; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClass = sizeClasses[size];
  
  const iconProps = {
    className: sizeClass,
    'aria-hidden': true,
  };
  
  const icons: Record<PlatformId, React.ReactNode> = {
    instagram: <FaInstagram {...iconProps} />,
    tiktok: <FaTiktok {...iconProps} />,
    pinterest: <FaPinterest {...iconProps} />,
    onlyfans: <SiOnlyfans {...iconProps} />,
    fanvue: <HiHeart {...iconProps} />, // Using heart icon as fallback for Fanvue
    twitter: <FaTwitter {...iconProps} />,
    youtube: <FaYoutube {...iconProps} />,
    facebook: <FaFacebook {...iconProps} />,
  };

  return icons[platformId] || (
    <div className={cn('rounded-full bg-current', sizeClass)} />
  );
};

export function PlatformBadge({
  platformId,
  size = 'md',
  showLabel = true,
  className,
  onClick,
  variant = 'badge',
}: PlatformBadgeProps) {
  const platform = PLATFORMS[platformId];
  
  if (!platform) {
    return null;
  }

  const isClickable = !!onClick;

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center gap-1',
          isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        onClick={onClick}
        title={platform.name}
      >
        <div
          className={cn(
            'rounded flex items-center justify-center text-white',
            'bg-gradient-to-br',
            platform.color,
            containerSizeClasses[size],
            'shadow-sm p-0.5'
          )}
        >
          <PlatformIcon platformId={platformId} size={size} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-1.5',
        isClickable && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      title={platform.name}
    >
      <div
        className={cn(
          'rounded flex items-center justify-center text-white',
          'bg-gradient-to-br',
          platform.color,
          containerSizeClasses[size],
          'shadow-sm p-0.5'
        )}
      >
        <PlatformIcon platformId={platformId} size={size} />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-white/90 whitespace-nowrap">
          {platform.name}
        </span>
      )}
    </div>
  );
}

/**
 * Platform Badge Group
 * Displays multiple platform badges in a compact group
 */
export interface PlatformBadgeGroupProps {
  platformIds: PlatformId[];
  size?: 'sm' | 'md' | 'lg';
  maxVisible?: number;
  className?: string;
  onPlatformClick?: (platformId: PlatformId) => void;
  showLabels?: boolean;
}

export function PlatformBadgeGroup({
  platformIds,
  size = 'sm',
  maxVisible = 5,
  className,
  onPlatformClick,
  showLabels = true,
}: PlatformBadgeGroupProps) {
  const visible = platformIds.slice(0, maxVisible);
  const remaining = platformIds.length - maxVisible;

  return (
    <div className={cn('flex items-center gap-1.5 flex-wrap', className)}>
      {visible.map((platformId) => (
        <PlatformBadge
          key={platformId}
          platformId={platformId}
          size={size}
          showLabel={showLabels}
          onClick={onPlatformClick ? () => onPlatformClick(platformId) : undefined}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded flex items-center justify-center px-1.5',
            'bg-white/10 border border-white/20',
            'text-white/70 text-xs font-medium',
            'h-5'
          )}
          title={`+${remaining} more platforms`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}

