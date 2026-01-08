'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { GeneratedImage } from '@ryla/business';

interface BaseImageCardProps {
  image: GeneratedImage;
  index: number;
  isSelected: boolean;
  isRegenerating: boolean;
  isSkeleton: boolean;
  onSelect: () => void;
  onRegenerate: () => void;
}

export function BaseImageCard({
  image,
  index,
  isSelected,
  isRegenerating,
  isSkeleton,
  onSelect,
  onRegenerate,
}: BaseImageCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  if (isSkeleton) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
        <div className="relative aspect-square">
          {/* Skeleton Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>

          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>

          {/* Image Number Label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2.5">
            <div className="h-3 w-16 bg-white/20 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-purple-400 ring-2 ring-purple-400/30'
          : 'border-white/10 hover:border-white/20',
        isRegenerating && 'opacity-60'
      )}
      onMouseEnter={() => !isRegenerating && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-square bg-white/5">
        {isRegenerating ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Image
              src={image.url}
              alt={`Base image ${index + 1}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Image Number + Model Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5">
              <p className="text-white text-[10px] md:text-sm font-semibold truncate">
                #{index + 1}
                {image.model ? ` - ${image.model}` : ''}
              </p>
            </div>

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500 flex items-center justify-center ring-2 ring-purple-500/30 shadow-lg z-20">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-4 h-4 md:w-5 md:h-5 text-white"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Mobile Regenerate Button - Visible when selected or on hover */}
            {((isSelected && !isSkeleton) || showActions) &&
              !isRegenerating && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate();
                  }}
                  className={cn(
                    'absolute top-2 left-2 w-9 h-9 md:w-10 md:h-10 rounded-xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transition-all active:scale-90',
                    'md:opacity-0 md:group-hover:opacity-100' // Hide on desktop except hover
                  )}
                  aria-label="Regenerate this image"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="md:w-5 md:h-5"
                  >
                    <path
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}

            {/* Desktop Actions Overlay (Optional fallback) */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center pointer-events-none">
              {/* Just visual feedback on hover for desktop */}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
