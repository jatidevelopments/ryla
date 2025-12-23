'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@ryla/ui';
import { useInfluencerStore } from '@ryla/business';
import type { Post } from '@ryla/shared';
import {
  Heart,
  Download,
  ImageIcon,
  Plus,
  Sparkles,
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface ImageGalleryProps {
  images: Post[];
  influencerId: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function ImageGallery({
  images,
  influencerId,
  emptyMessage = 'No images yet',
  emptyAction,
  className,
}: ImageGalleryProps) {
  const toggleLike = useInfluencerStore((state) => state.toggleLike);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  const handleLike = (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation();
    toggleLike(imageId);
  };

  const handleDownload = async (e: React.MouseEvent, image: Post) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryla-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < images.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex]);

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Empty state illustration */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 rounded-2xl blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
            <ImageIcon className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-[var(--text-muted)] max-w-sm mb-6">
          Generate images to build your AI influencer&apos;s gallery
        </p>
        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-600)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--purple-500)]/20 transition-all hover:shadow-xl hover:shadow-[var(--purple-500)]/30 hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Gallery Grid - Masonry-like layout */}
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3',
          className
        )}
      >
        {images.map((image, index) => (
          <GalleryImage
            key={image.id}
            image={image}
            onClick={() => openLightbox(index)}
            onLike={(e) => handleLike(e, image.id)}
            onDownload={(e) => handleDownload(e, image)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Navigation - Previous */}
          {selectedIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Navigation - Next */}
          {selectedIndex < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
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
                src={images[selectedIndex].imageUrl || '/placeholder.png'}
                alt={images[selectedIndex].caption || 'Generated image'}
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Action buttons */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={(e) => handleLike(e, images[selectedIndex].id)}
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                  images[selectedIndex].isLiked
                    ? 'bg-[var(--pink-500)] text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                )}
              >
                <Heart
                  className={cn(
                    'h-5 w-5',
                    images[selectedIndex].isLiked && 'fill-current'
                  )}
                />
              </button>
              <button
                onClick={(e) => handleDownload(e, images[selectedIndex])}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Download className="h-5 w-5" />
              </button>
            </div>

            {/* Caption */}
            {images[selectedIndex].caption && (
              <div className="absolute -bottom-16 left-0 right-0 text-center">
                <p className="text-sm text-white/60 max-w-md mx-auto line-clamp-2">
                  {images[selectedIndex].caption}
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
      )}
    </>
  );
}

interface GalleryImageProps {
  image: Post;
  onClick: () => void;
  onLike: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
}

function GalleryImage({ image, onClick, onLike, onDownload }: GalleryImageProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-default)] transition-all duration-300 hover:border-[var(--purple-500)]/30 hover:shadow-lg hover:shadow-[var(--purple-500)]/10"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4]">
        {!imageError && image.imageUrl ? (
          <Image
            src={image.imageUrl}
            alt={image.caption || 'Generated image'}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-900)]/50 to-[var(--pink-900)]/50">
            <ImageIcon className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Like indicator (always visible if liked) */}
        {image.isLiked && !isHovered && (
          <div className="absolute top-2 right-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pink-500)] shadow-lg">
              <Heart className="h-3.5 w-3.5 text-white fill-current" />
            </div>
          </div>
        )}

        {/* Hover actions */}
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 p-3 flex items-center justify-between transition-all duration-300',
            isHovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-4 opacity-0'
          )}
        >
          {/* Like button */}
          <button
            onClick={onLike}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all',
              image.isLiked
                ? 'bg-[var(--pink-500)] text-white'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
          >
            <Heart
              className={cn('h-4 w-4', image.isLiked && 'fill-current')}
            />
          </button>

          <div className="flex items-center gap-2">
            {/* Zoom hint */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
              <ZoomIn className="h-4 w-4" />
            </div>
            {/* Download button */}
            <button
              onClick={onDownload}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

