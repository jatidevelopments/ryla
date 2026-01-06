'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { ProfilePictureSet } from '@ryla/business';
import { setConfigs } from './constants';
import { PositionPreviewGrid } from './position-preview-grid';

interface ProfileSetCardProps {
  set: ProfilePictureSet;
  isSelected: boolean;
  isHovered: boolean;
  creditCost: number;
  onSelect: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function ProfileSetCard({
  set,
  isSelected,
  isHovered,
  creditCost,
  onSelect,
  onMouseEnter,
  onMouseLeave,
}: ProfileSetCardProps) {
  const config = setConfigs[set.id as keyof typeof setConfigs];

  return (
    <label
      className={cn(
        'relative block rounded-xl border-2 transition-all cursor-pointer overflow-hidden group',
        isSelected
          ? `${config.borderColor} bg-gradient-to-r ${config.bgGradient} shadow-lg ${config.shadowColor}`
          : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <input
        type="radio"
        name="profilePictureSet"
        value={set.id}
        checked={isSelected}
        onChange={onSelect}
        className="sr-only"
      />

      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all text-2xl',
              isSelected ? config.iconBg : 'bg-white/5 group-hover:bg-white/10'
            )}
          >
            {config.emoji}
          </div>

          {/* Text Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    'font-semibold',
                    isSelected ? 'text-white' : 'text-white/80'
                  )}
                >
                  {set.name}
                </p>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                    isSelected ? config.badgeColor : 'bg-white/10 text-white/50'
                  )}
                >
                  +{creditCost}
                </span>
              </div>
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full bg-white ring-4 ring-white/20" />
              )}
            </div>
            <p className="text-white/50 text-sm mt-1">{config.shortDesc}</p>
            <p className="text-white/30 text-xs mt-1">
              {set.positions.length} unique photos in different locations
            </p>
          </div>
        </div>
      </div>

      {/* Position Preview Grid */}
      <PositionPreviewGrid
        positions={config.positions}
        setId={set.id}
        isVisible={isSelected || isHovered}
      />

      {/* Gradient accent line at bottom when selected */}
      {isSelected && (
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r',
            config.gradient
          )}
        />
      )}
    </label>
  );
}

