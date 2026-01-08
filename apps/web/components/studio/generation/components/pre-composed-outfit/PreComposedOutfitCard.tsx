'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, Badge } from '@ryla/ui';
import type { OutfitOption } from '@ryla/shared';

interface PreComposedOutfitCardProps {
  outfit: OutfitOption;
  isSelected: boolean;
  onSelect: () => void;
  isFavorited: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function PreComposedOutfitCard({
  outfit,
  isSelected,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: PreComposedOutfitCardProps) {
  return (
    <>
      <button
        onClick={onSelect}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02]',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Outfit Display */}
        <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
          {outfit.thumbnail ? (
            <>
              <Image
                src={outfit.thumbnail}
                alt={outfit.label}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                <div className="text-sm font-semibold text-white mb-1">
                  {outfit.label}
                </div>
                {outfit.category && (
                  <div className="text-xs text-white/60 capitalize">
                    {outfit.category}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-4 h-full">
              {/* Emoji/Icon */}
              <div className="text-5xl mb-3">{outfit.emoji}</div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

              {/* Name overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="text-sm font-semibold text-white mb-1">
                  {outfit.label}
                </div>
                {outfit.category && (
                  <div className="text-xs text-white/60 capitalize">
                    {outfit.category}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Adult badge */}
        {outfit.isAdult && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <Badge
              variant="error"
              size="default"
              className="uppercase font-bold text-xs px-3 py-1.5 bg-red-600/90 text-white border-red-500 shadow-lg shadow-red-500/50"
            >
              18+
            </Badge>
          </div>
        )}

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Like button */}
        <button
          onClick={onToggleFavorite}
          className={cn(
            'absolute top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
            outfit.isAdult ? 'right-12' : 'right-2',
            isFavorited
              ? 'bg-[var(--pink-500)] text-white opacity-100'
              : 'bg-black/50 text-white/60 hover:bg-black/70 hover:text-white'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn('h-4 w-4', isFavorited && 'fill-current')}
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
        </button>
      </button>
    </>
  );
}
