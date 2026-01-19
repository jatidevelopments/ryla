'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { StudioImageCard, type StudioImage } from './studio-image-card';
import type { ViewMode } from './studio-toolbar';

interface StudioGalleryProps {
  images: StudioImage[];
  selectedImage: StudioImage | null;
  onSelectImage: (image: StudioImage | null) => void;
  onOpenDetails?: (image: StudioImage) => void;
  onQuickLike?: (imageId: string) => void;
  onQuickDownload?: (image: StudioImage) => void;
  viewMode?: ViewMode;
  isLoading?: boolean;
  className?: string;
}

// Memoized image card wrapper to prevent re-renders when parent updates
const MemoizedImageCard = React.memo(
  function MemoizedImageCard({
    image,
    isSelected,
    onSelect,
    onOpenDetails,
    onQuickLike,
    onQuickDownload,
    size,
  }: {
    image: StudioImage;
    isSelected: boolean;
    onSelect: (image: StudioImage | null) => void;
    onOpenDetails?: (image: StudioImage) => void;
    onQuickLike?: (imageId: string) => void;
    onQuickDownload?: (image: StudioImage) => void;
    size?: 'normal' | 'large';
  }) {
    return (
      <StudioImageCard
        image={image}
        isSelected={isSelected}
        onSelect={onSelect}
        onOpenDetails={onOpenDetails}
        onQuickLike={onQuickLike}
        onQuickDownload={onQuickDownload}
        size={size}
      />
    );
  },
  (prevProps, nextProps) => {
    // Only re-render if these specific things change
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.status === nextProps.image.status &&
      prevProps.image.progress === nextProps.image.progress &&
      prevProps.image.imageUrl === nextProps.image.imageUrl &&
      prevProps.image.isLiked === nextProps.image.isLiked &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.size === nextProps.size
    );
  }
);

export function StudioGallery({
  images,
  selectedImage,
  onSelectImage,
  onOpenDetails,
  onQuickLike,
  onQuickDownload,
  viewMode = 'grid',
  isLoading = false,
  className,
}: StudioGalleryProps) {
  // Track if initial load animation has happened (persists across re-renders)
  const initialLoadDoneRef = React.useRef(false);
  // Track seen image IDs to prevent re-animating existing images
  const seenImageIdsRef = React.useRef<Set<string>>(new Set());

  // Mark initial load as done after first successful render with images
  // This runs synchronously during render to prevent flicker
  if (images.length > 0 && !initialLoadDoneRef.current) {
    // Schedule marking as done after this render cycle
    // Using Promise.resolve to run after current render but before next
    Promise.resolve().then(() => {
      initialLoadDoneRef.current = true;
      images.forEach((img) => seenImageIdsRef.current.add(img.id));
    });
  }

  // Check if an image should animate (only new images after initial load)
  const shouldAnimateImage = (imageId: string, _index: number): boolean => {
    // On initial load, animate all images
    if (!initialLoadDoneRef.current) {
      return true;
    }
    // After initial load, only animate truly new images (not yet seen)
    // But also add them to seen set immediately to prevent re-animation
    if (!seenImageIdsRef.current.has(imageId)) {
      seenImageIdsRef.current.add(imageId);
      return true;
    }
    return false;
  };

  // Get animation delay (only for initial load, new images get no delay)
  const getAnimationDelay = (
    index: number,
    isInitialLoad: boolean
  ): string | undefined => {
    if (!isInitialLoad) return undefined;
    return `${Math.min(index * 40, 500)}ms`;
  };
  // Calculate grid columns based on view mode
  const gridClasses = {
    grid: 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    large: 'grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
    masonry: 'columns-2 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5',
  };

  if (isLoading) {
    return (
      <div className={cn('grid gap-3', gridClasses.grid, className)}>
        {Array.from({ length: 18 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square animate-pulse rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)]"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-10 md:py-20 px-6 text-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
        {/* Gradient glow */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10 w-full max-w-sm mx-auto">
          <div className="mb-4 md:mb-6 flex h-20 w-20 md:h-28 md:w-28 mx-auto items-center justify-center rounded-2xl md:rounded-3xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-10 w-10 md:h-14 md:w-14 text-[var(--purple-400)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-2 md:mb-3">
            No images yet
          </h3>
          <p className="text-sm md:text-base text-[var(--text-secondary)]">
            Start generating stunning images for your AI influencers. Each
            creation will appear here in your personal studio.
          </p>
        </div>
      </div>
    );
  }

  const isInitialLoad = !initialLoadDoneRef.current;

  // Masonry layout
  if (viewMode === 'masonry') {
    return (
      <div
        className={cn('gap-3', gridClasses.masonry, className)}
        data-tutorial-target="gallery"
      >
        {images.map((image, index) => {
          const shouldAnimate = shouldAnimateImage(image.id, index);
          return (
            <div
              key={image.id}
              className={cn(
                'mb-4 break-inside-avoid',
                shouldAnimate &&
                  'animate-in fade-in slide-in-from-bottom-2 duration-300'
              )}
              style={
                shouldAnimate
                  ? { animationDelay: getAnimationDelay(index, isInitialLoad) }
                  : undefined
              }
            >
              <MemoizedImageCard
                image={image}
                isSelected={selectedImage?.id === image.id}
                onSelect={onSelectImage}
                onOpenDetails={onOpenDetails}
                onQuickLike={onQuickLike}
                onQuickDownload={onQuickDownload}
              />
            </div>
          );
        })}
      </div>
    );
  }

  // Grid layout (default) and Large layout
  return (
    <div
      className={cn(
        'grid gap-3',
        viewMode === 'large' ? gridClasses.large : gridClasses.grid,
        className
      )}
    >
      {images.map((image, index) => {
        const shouldAnimate = shouldAnimateImage(image.id, index);
        return (
          <div
            key={image.id}
            className={cn(
              shouldAnimate &&
                'animate-in fade-in slide-in-from-bottom-2 duration-300'
            )}
            style={
              shouldAnimate
                ? { animationDelay: getAnimationDelay(index, isInitialLoad) }
                : undefined
            }
          >
            <MemoizedImageCard
              image={image}
              isSelected={selectedImage?.id === image.id}
              onSelect={onSelectImage}
              onOpenDetails={onOpenDetails}
              onQuickLike={onQuickLike}
              onQuickDownload={onQuickDownload}
              size={viewMode === 'large' ? 'large' : 'normal'}
            />
          </div>
        );
      })}
    </div>
  );
}
