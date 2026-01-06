'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  Download,
  Edit,
} from 'lucide-react';
import type { Post } from '@ryla/shared';

interface LightboxModalProps {
  images: Post[];
  selectedIndex: number;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onLike: (e: React.MouseEvent, imageId: string) => void;
  onDownload: (e: React.MouseEvent, image: Post) => void;
  onEdit: (e: React.MouseEvent, imageId: string) => void;
}

export function LightboxModal({
  images,
  selectedIndex,
  onClose,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onLike,
  onDownload,
  onEdit,
}: LightboxModalProps) {
  const image = images[selectedIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation - Previous */}
      {canGoPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Navigation - Next */}
      {canGoNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[3/4] h-[80vh]">
          <Image
            src={image.imageUrl || '/placeholder.png'}
            alt={image.caption || 'Generated image'}
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(e, image.id);
            }}
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full transition-all',
              image.isLiked
                ? 'bg-[var(--pink-500)] text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
            )}
          >
            <Heart
              className={cn(
                'h-5 w-5',
                image.isLiked && 'fill-current'
              )}
            />
          </button>
          <button
            onClick={(e) => onDownload(e, image)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => onEdit(e, image.id)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            title="Edit in Studio"
          >
            <Edit className="h-5 w-5" />
          </button>
        </div>

        {/* Caption */}
        {image.caption && (
          <div className="absolute -bottom-16 left-0 right-0 text-center">
            <p className="text-sm text-white/60 max-w-md mx-auto line-clamp-2">
              {image.caption}
            </p>
          </div>
        )}

        {/* Image counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1.5 rounded-full bg-black/50 text-white/80 text-sm font-medium">
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  );
}

