'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { ProfilePictureImage } from '@ryla/business';

interface ProfilePictureCardProps {
  image: ProfilePictureImage;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onEditPrompt: () => void;
  isSkeleton?: boolean;
  isLoading?: boolean;
}

export function ProfilePictureCard({
  image,
  isSelected,
  onSelect,
  onDelete,
  onRegenerate,
  onEditPrompt,
  isSkeleton = false,
  isLoading = false,
}: ProfilePictureCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  if (isSkeleton) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
        <div className="relative aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
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
        isLoading && 'opacity-60'
      )}
      onMouseEnter={() => !isLoading && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      <div className="relative aspect-square bg-white/5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Image
              src={image.url}
              alt={image.positionName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5">
              <p className="text-white text-xs font-semibold">{image.positionName}</p>
            </div>

            {showActions && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPrompt();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                  title="Edit Prompt"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                  title="Regenerate"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M3 21v-5h5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-medium hover:bg-red-500 transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .56c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

