'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';

interface WizardImageCardProps {
  image: {
    src: string;
    alt: string;
    name: string;
  };
  selected?: boolean;
  onSelect: () => void;
  className?: string;
  aspectRatio?: 'square' | 'wide';
}

/**
 * Image-based option card for wizard steps
 * Similar to funnel's ImageCard component
 */
export function WizardImageCard({
  image,
  selected = false,
  onSelect,
  className,
  aspectRatio = 'square',
}: WizardImageCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'relative rounded-xl border-2 transition-all duration-200 overflow-hidden group',
        aspectRatio === 'square' ? 'aspect-square' : 'aspect-[159/128]',
        selected
          ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10',
        className
      )}
    >
      {/* Image */}
      <div className="absolute inset-0">
        {image.src ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <span className="text-white/40 text-xs">No image</span>
          </div>
        )}
        {/* Overlay gradient */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-200',
            selected
              ? 'bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100'
              : 'bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-80'
          )}
        />
      </div>

      {/* Name label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <p
          className={cn(
            'text-sm font-semibold text-center',
            selected ? 'text-white' : 'text-white/90'
          )}
        >
          {image.name}
        </p>
      </div>

      {/* Selection indicator */}
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-20 shadow-md">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M11.6667 3.5L5.25 9.91667L2.33334 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Shimmer effect when selected */}
      {selected && (
        <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none z-20" />
      )}
    </button>
  );
}

