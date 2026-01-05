'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { StudioImageCard, type StudioImage } from './studio-image-card';
import type { ViewMode } from './studio-toolbar';

interface StudioGalleryProps {
  images: StudioImage[];
  selectedImage: StudioImage | null;
  onSelectImage: (image: StudioImage | null) => void;
  onQuickLike?: (imageId: string) => void;
  onQuickDownload?: (image: StudioImage) => void;
  viewMode?: ViewMode;
  isLoading?: boolean;
  className?: string;
}

export function StudioGallery({
  images,
  selectedImage,
  onSelectImage,
  onQuickLike,
  onQuickDownload,
  viewMode = 'grid',
  isLoading = false,
  className,
}: StudioGalleryProps) {
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
      <div className="relative flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] overflow-hidden">
        {/* Gradient glow */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
          }}
        />
        
        <div className="relative z-10">
          <div className="mb-6 flex h-28 w-28 mx-auto items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-14 w-14 text-[var(--purple-400)]"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">No images yet</h3>
          <p className="text-[var(--text-secondary)] max-w-md mx-auto">
            Start generating stunning images for your AI influencers. Each creation will appear here in your personal studio.
          </p>
        </div>
      </div>
    );
  }

  // Masonry layout
  if (viewMode === 'masonry') {
    return (
      <div 
        className={cn('gap-3', gridClasses.masonry, className)}
        data-tutorial-target="gallery"
      >
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="mb-4 break-inside-avoid animate-in fade-in slide-in-from-bottom-2 duration-300"
            style={{ animationDelay: `${Math.min(index * 30, 500)}ms` }}
          >
            <StudioImageCard
              image={image}
              isSelected={selectedImage?.id === image.id}
              onSelect={onSelectImage}
              onQuickLike={onQuickLike}
              onQuickDownload={onQuickDownload}
            />
          </div>
        ))}
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
      {images.map((image, index) => (
        <div
          key={image.id}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${Math.min(index * 40, 500)}ms` }}
        >
          <StudioImageCard
            image={image}
            isSelected={selectedImage?.id === image.id}
            onSelect={onSelectImage}
            onQuickLike={onQuickLike}
            onQuickDownload={onQuickDownload}
            size={viewMode === 'large' ? 'large' : 'normal'}
          />
        </div>
      ))}
    </div>
  );
}
