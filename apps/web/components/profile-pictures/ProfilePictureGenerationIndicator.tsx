'use client';

import * as React from 'react';
import { useProfilePictures } from '@ryla/business';
import { cn } from '@ryla/ui';

interface ProfilePictureGenerationIndicatorProps {
  influencerId: string;
  className?: string;
}

/**
 * Loading indicator that shows when profile pictures are being generated
 * Displays progress (X of Y images completed) with a spinner
 */
export function ProfilePictureGenerationIndicator({
  influencerId,
  className,
}: ProfilePictureGenerationIndicatorProps) {
  const state = useProfilePictures(influencerId);

  // Don't show if not generating
  if (!state || state.status !== 'generating') {
    return null;
  }

  const completedCount = state.completedCount || 0;
  const totalCount = state.totalCount || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 backdrop-blur-sm',
        className
      )}
    >
      {/* Spinner */}
      <div className="relative w-8 h-8 flex-shrink-0">
        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400 animate-spin" />
      </div>

      {/* Progress Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white mb-0.5">
          Generating Profile Pictures
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-white/70 font-medium whitespace-nowrap">
            {completedCount} / {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}

