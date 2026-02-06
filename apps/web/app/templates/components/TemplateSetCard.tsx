'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { Heart, Image as ImageIcon, Video, Mic, AudioLines, Layers, Play, Plus } from 'lucide-react';

// Note: 'all' is only used for filtering, not for individual card display
export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';

interface TemplateSetCardProps {
  id: string;
  name: string;
  description?: string;
  previewImageUrl: string;
  thumbnailUrl?: string;
  likesCount: number;
  usageCount?: number;
  contentType: ContentType;
  isSet?: boolean;
  memberCount?: number;
  memberThumbnails?: string[]; // Preview thumbnails for sets
  isLiked?: boolean;
  onClick?: () => void;
  onApply?: () => void;
  onLikeToggle?: () => void;
}

const contentTypeConfig: Record<ContentType, { icon: React.ReactNode; label: string; color: string }> = {
  all: {
    icon: <Layers className="h-3 w-3" />,
    label: 'All',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
  image: {
    icon: <ImageIcon className="h-3 w-3" />,
    label: 'Image',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  video: {
    icon: <Video className="h-3 w-3" />,
    label: 'Video',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  lip_sync: {
    icon: <Mic className="h-3 w-3" />,
    label: 'Lip Sync',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  audio: {
    icon: <AudioLines className="h-3 w-3" />,
    label: 'Audio',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  mixed: {
    icon: <Layers className="h-3 w-3" />,
    label: 'Mixed',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  },
};

/**
 * TemplateSetCard - Enhanced card component for templates and template sets
 * Epic: EP-047 (Template Gallery UX Redesign)
 * 
 * Sets now show a visual grid preview of member templates for better visualization
 */
export function TemplateSetCard({
  id,
  name,
  previewImageUrl,
  thumbnailUrl,
  likesCount,
  contentType,
  isSet = false,
  memberCount,
  memberThumbnails = [],
  isLiked = false,
  onClick,
  onApply,
  onLikeToggle,
}: TemplateSetCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);
  const typeConfig = contentTypeConfig[contentType] || contentTypeConfig.image;

  // For sets, show up to 4 preview thumbnails
  const previewThumbnails = isSet && memberThumbnails.length > 0 
    ? memberThumbnails.slice(0, 4)
    : [];

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeToggle?.();
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onApply?.();
  };

  return (
    <div
      className={cn(
        'group relative bg-[var(--bg-elevated)] rounded-xl overflow-hidden transition-all duration-300',
        'border border-[var(--border-default)]',
        'hover:border-[var(--purple-500)]/50 hover:shadow-lg hover:shadow-purple-500/5',
        'cursor-pointer active:scale-[0.98]',
        isSet && 'ring-1 ring-[var(--purple-500)]/20'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Preview Image / Set Grid */}
      <div className="relative aspect-square overflow-hidden bg-[var(--bg-subtle)]">
        {isSet && previewThumbnails.length > 0 ? (
          // Set: Show grid preview of member templates
          <div className="absolute inset-0 grid grid-cols-2 gap-0.5 p-0.5">
            {previewThumbnails.map((thumb, idx) => (
              <div key={idx} className="relative overflow-hidden bg-[var(--bg-subtle)]">
                <Image
                  src={thumb}
                  alt={`${name} template ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
            {memberCount && memberCount > 4 && (
              <div className="relative flex items-center justify-center bg-[var(--bg-primary)]/90 backdrop-blur-sm">
                <div className="text-center">
                  <Plus className="h-3.5 w-3.5 mx-auto mb-0.5 text-[var(--text-secondary)]" />
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    +{memberCount - 4}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Single template or set without thumbnails: Show main preview image
          <>
            {!imageError ? (
              <Image
                src={thumbnailUrl || previewImageUrl}
                alt={name}
                fill
                className={cn(
                  'object-cover transition-transform duration-500',
                  isHovered && 'scale-105'
                )}
                onError={() => setImageError(true)}
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                {isSet ? (
                  <div className="text-center">
                    <Layers className="h-8 w-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
                    {memberCount && (
                      <span className="text-xs text-[var(--text-secondary)]">
                        {memberCount} templates
                      </span>
                    )}
                  </div>
                ) : (
                  <ImageIcon className="h-10 w-10 text-[var(--text-tertiary)]" />
                )}
              </div>
            )}
            {/* Set overlay pattern when no thumbnails */}
            {isSet && !imageError && (
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/10 to-transparent pointer-events-none" />
            )}
          </>
        )}

        {/* Gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent',
            'transition-opacity duration-300',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {/* Set indicator badge */}
        {isSet && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-md bg-[var(--purple-500)]/90 backdrop-blur-sm text-white shadow-lg">
            <Layers className="h-2.5 w-2.5" />
            <span>Set</span>
          </div>
        )}

        {/* Content type badge */}
        <div
          className={cn(
            'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border backdrop-blur-sm',
            typeConfig.color
          )}
        >
          {typeConfig.icon}
          <span className="hidden sm:inline">{typeConfig.label}</span>
        </div>

        {/* Apply button on hover */}
        {isHovered && (
          <button
            onClick={handleApplyClick}
            className={cn(
              'absolute bottom-2 left-2 right-2 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg',
              'bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)]',
              'text-white shadow-lg shadow-purple-500/30',
              'transition-all duration-200 hover:shadow-xl hover:shadow-purple-500/40',
              'opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0'
            )}
          >
            <Play className="h-3.5 w-3.5" />
            Apply
          </button>
        )}
      </div>

      {/* Card content */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          {/* Name */}
          <h3 className="text-xs font-semibold text-[var(--text-primary)] leading-tight line-clamp-2 flex-1">
            {name}
          </h3>

          {/* Like button */}
          <button
            onClick={handleLikeClick}
            className={cn(
              'flex items-center gap-1 px-1.5 py-1 text-[10px] font-medium rounded-md transition-all flex-shrink-0',
              isLiked
                ? 'text-pink-500 bg-pink-500/15'
                : 'text-[var(--text-tertiary)] hover:text-pink-400 hover:bg-pink-500/10'
            )}
          >
            <Heart
              className={cn('h-3 w-3', isLiked && 'fill-pink-500 text-pink-500')}
            />
            <span className="hidden sm:inline">{likesCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
