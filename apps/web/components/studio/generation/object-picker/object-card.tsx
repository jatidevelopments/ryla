'use client';

import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { StudioImage } from '../../studio-image-card';

interface ObjectCardProps {
  image: StudioImage;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}

export function ObjectCard({ image, isSelected, isDisabled, onSelect }: ObjectCardProps) {
  const aspectClass =
    image.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : image.aspectRatio === '2:3'
      ? 'aspect-[2/3]'
      : 'aspect-square';

  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        disabled={isDisabled}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : isDisabled
            ? 'border-transparent opacity-30 cursor-not-allowed'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Image */}
        <div className={cn('relative w-full bg-white/5 overflow-hidden', aspectClass)}>
          {image.imageUrl ? (
            <>
              <Image
                src={image.thumbnailUrl || image.imageUrl}
                alt={image.prompt || 'Object image'}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-8 w-8 text-white/20"
              >
                <path
                  fillRule="evenodd"
                  d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Name overlay */}
          {image.prompt && (
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="text-xs font-medium text-white line-clamp-1">{image.prompt}</div>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}

