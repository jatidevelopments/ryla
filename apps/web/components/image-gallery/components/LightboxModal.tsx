'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, useIsMobile } from '@ryla/ui';
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
  const isMobile = useIsMobile();
  const image = images[selectedIndex];

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 z-10 w-full">
        {/* Image counter */}
        <div className="px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium backdrop-blur-sm">
          {selectedIndex + 1} / {images.length}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95 backdrop-blur-sm"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative flex items-center justify-center w-full px-4 overflow-hidden">
        {/* Navigation - Previous (hidden on mobile or as swipe?) */}
        {canGoPrevious && !isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            className="absolute left-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white group"
          >
            <ChevronLeft className="h-8 w-8 transition-transform group-hover:-translate-x-0.5" />
          </button>
        )}

        {/* Navigation - Next (hidden on mobile or as swipe?) */}
        {canGoNext && !isMobile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-6 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white group"
          >
            <ChevronRight className="h-8 w-8 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}

        {/* Image */}
        <div
          className={cn(
            'relative w-full h-full flex items-center justify-center transition-all duration-500',
            !isMobile && 'max-w-[75vw] max-h-[75vh]'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full h-full max-h-[70vh] sm:max-h-full">
            <Image
              src={image.imageUrl || '/placeholder.png'}
              alt={image.caption || 'Generated image'}
              fill
              className="object-contain animate-in zoom-in-95 duration-300"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div
        className="w-full flex flex-col items-center gap-6 p-6 sm:p-8 z-10 bg-gradient-to-t from-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Caption */}
        {image.caption && (
          <p className="text-sm text-white/70 max-w-lg text-center line-clamp-2 px-4 italic">
            "{image.caption}"
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLike(e, image.id);
            }}
            className={cn(
              'flex h-14 w-14 items-center justify-center rounded-full transition-all active:scale-95 shadow-xl',
              image.isLiked
                ? 'bg-[var(--pink-500)] text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white border border-white/10'
            )}
          >
            <Heart className={cn('h-6 w-6', image.isLiked && 'fill-current')} />
          </button>

          <button
            onClick={(e) => onDownload(e, image)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95 border border-white/10 shadow-xl"
            title="Download Image"
          >
            <Download className="h-6 w-6" />
          </button>

          <button
            onClick={(e) => onEdit(e, image.id)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95 border border-white/10 shadow-xl"
            title="Edit in Studio"
          >
            <Edit className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Swipe hints or extra space for home bar */}
        {isMobile && <div className="h-4" />}
      </div>

      {/* Mobile Swipe Navigation Areas (Invisible overlay for tapping left/right) */}
      {isMobile && (
        <>
          <div
            className="absolute left-0 top-20 bottom-32 w-20 z-0"
            onClick={(e) => {
              e.stopPropagation();
              canGoPrevious && onPrevious();
            }}
          />
          <div
            className="absolute right-0 top-20 bottom-32 w-20 z-0"
            onClick={(e) => {
              e.stopPropagation();
              canGoNext && onNext();
            }}
          />
        </>
      )}
    </div>
  );
}
