'use client';

import * as React from 'react';
import Image from 'next/image';
import { ZoomIn, RefreshCw, AlertCircle } from 'lucide-react';
import { getNextImageSrc } from '@/lib/utils/get-next-image-src';
import { cn, useIsMobile } from '@ryla/ui';
import type { GeneratedImage } from '@ryla/business';

interface BaseImageCardProps {
  image: GeneratedImage;
  index: number;
  isSelected: boolean;
  isRegenerating: boolean;
  isSkeleton: boolean;
  onSelect: () => void;
  onRegenerate: () => void;
  onViewFull?: () => void;
}

export function BaseImageCard({
  image,
  index,
  isSelected,
  isRegenerating,
  isSkeleton,
  onSelect,
  onRegenerate,
  onViewFull,
}: BaseImageCardProps) {
  const isMobile = useIsMobile();
  const isFailed = image.url === 'failed' || image.url === 'error';

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

  if (isFailed) {
    return (
      <div
        className={cn(
          'relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
          'border-red-500/50 bg-red-950/20'
        )}
        onClick={onSelect}
      >
        <div className="relative aspect-square bg-red-950/30">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 text-red-400 mb-3" />
            <p className="text-red-300 text-xs md:text-sm font-semibold mb-1">
              Generation Failed
            </p>
            {image.error && (
              <p className="text-red-400/70 text-[10px] md:text-xs line-clamp-2">
                {image.error}
              </p>
            )}
          </div>

          {/* Image Number Label */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5 z-10">
            <p className="text-white text-[10px] md:text-sm font-semibold truncate">
              #{index + 1} - Failed
            </p>
          </div>

          {/* Regenerate Button */}
          <div className="absolute top-2 left-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRegenerate();
              }}
              className={cn(
                'w-8 h-8 md:w-9 md:h-9 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transition-all hover:bg-black/80 active:scale-90',
                !isMobile && 'opacity-0 group-hover:opacity-100'
              )}
              aria-label="Regenerate this image"
            >
              <RefreshCw className="w-4 h-4 md:w-[18px] md:h-[18px]" />
            </button>
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
            {image.url &&
            image.url !== 'loading' &&
            image.url !== 'skeleton' &&
            image.url !== 'failed' &&
            image.url !== 'error' ? (
              <Image
                src={getNextImageSrc(image.url)}
                alt={`Base image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : image.url === 'failed' || image.url === 'error' ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <p className="text-white/40 text-xs">Failed to load</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                <p className="text-white/40 text-xs">Invalid image URL</p>
              </div>
            )}

            {/* Image Number + Model Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5 z-10">
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

            {/* Action Buttons - Top Left */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 z-20">
              {/* View Full Width Button */}
              {onViewFull && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewFull();
                  }}
                  className={cn(
                    'w-8 h-8 md:w-9 md:h-9 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transition-all hover:bg-black/80 active:scale-90',
                    !isMobile && 'opacity-0 group-hover:opacity-100'
                  )}
                  aria-label="View full size"
                >
                  <ZoomIn className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                </button>
              )}

              {/* Regenerate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRegenerate();
                }}
                className={cn(
                  'w-8 h-8 md:w-9 md:h-9 rounded-lg bg-black/60 backdrop-blur-md flex items-center justify-center text-white border border-white/10 shadow-lg transition-all hover:bg-black/80 active:scale-90',
                  !isMobile && 'opacity-0 group-hover:opacity-100'
                )}
                aria-label="Regenerate this image"
              >
                <RefreshCw className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
            </div>

            {/* Hover Overlay - Click anywhere to select (but don't block buttons) */}
            <div
              className={cn(
                'absolute inset-0 bg-black/0 transition-colors pointer-events-none',
                !isSelected && 'group-hover:bg-black/10'
              )}
            />
          </>
        )}
      </div>
    </div>
  );
}
