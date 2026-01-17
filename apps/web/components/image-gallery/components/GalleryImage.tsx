'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import {
  Heart,
  Download,
  ImageIcon,
  ZoomIn,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import type { Post } from '@ryla/shared';
import { useIsMobile } from '@ryla/ui';

interface GalleryImageProps {
  image: Post;
  onClick: () => void;
  onLike: (e: React.MouseEvent) => void;
  onDownload: (e: React.MouseEvent) => void;
  onEdit: (e: React.MouseEvent) => void;
  onMoreActions?: (e: React.MouseEvent) => void;
}

export const GalleryImage = React.memo(
  function GalleryImage({
    image,
    onClick,
    onLike,
    onDownload,
    onEdit,
    onMoreActions,
  }: GalleryImageProps) {
    const [isHovered, setIsHovered] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const isMobile = useIsMobile();

    const handleLike = (e: React.MouseEvent) => {
      e.stopPropagation();
      onLike(e);
    };

    const handleDownload = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDownload(e);
    };

    const handleEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(e);
    };

    const handleMoreActions = (e: React.MouseEvent) => {
      e.stopPropagation();
      onMoreActions?.(e);
    };

    return (
      <>
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
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
                loading="lazy"
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
            {image.isLiked && (
              <div className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--pink-500)] shadow-lg">
                <Heart className="h-3.5 w-3.5 text-white fill-current" />
              </div>
            )}

            {/* More actions button (Mobile only) - Top Left to avoid like indicator */}
            {isMobile && (
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={handleMoreActions}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                  title="More actions"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Hover actions (Desktop only) */}
          {!isMobile && (
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
                onClick={handleLike}
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
                  onClick={handleDownload}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  <Download className="h-4 w-4" />
                </button>
                {/* Edit button */}
                <button
                  onClick={handleEdit}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                  title="Edit in Studio"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </>
    );
  },
  (prevProps: GalleryImageProps, nextProps: GalleryImageProps) => {
    // Custom comparison to prevent re-renders when image data hasn't changed
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.imageUrl === nextProps.image.imageUrl &&
      prevProps.image.isLiked === nextProps.image.isLiked &&
      prevProps.image.caption === nextProps.image.caption
    );
  }
);
