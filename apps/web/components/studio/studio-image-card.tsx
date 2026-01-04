'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';

export interface StudioImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  influencerId: string;
  influencerName: string;
  influencerAvatar?: string;
  prompt?: string;
  scene?: string;
  environment?: string;
  outfit?: string; // Can be a string or JSON stringified OutfitComposition
  poseId?: string; // Pose ID (e.g., "standing-casual")
  aspectRatio: '1:1' | '9:16' | '2:3';
  status: 'completed' | 'generating' | 'failed';
  createdAt: string;
  isLiked?: boolean;
  nsfw?: boolean;
}

interface StudioImageCardProps {
  image: StudioImage;
  isSelected?: boolean;
  onSelect?: (image: StudioImage) => void;
  onQuickLike?: (imageId: string) => void;
  onQuickDownload?: (image: StudioImage) => void;
  size?: 'normal' | 'large';
  className?: string;
}

export function StudioImageCard({
  image,
  isSelected = false,
  onSelect,
  onQuickLike,
  onQuickDownload,
  size = 'normal',
  className,
}: StudioImageCardProps) {
  const handleClick = () => {
    onSelect?.(image);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickLike?.(image.id);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickDownload?.(image);
  };

  // Determine aspect ratio class
  const aspectClass =
    image.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : image.aspectRatio === '2:3'
      ? 'aspect-[2/3]'
      : 'aspect-square';

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 border border-transparent',
        isSelected
          ? 'ring-2 ring-[var(--purple-500)] ring-offset-2 ring-offset-[var(--bg-base)] scale-[1.02] border-[var(--purple-500)]/50'
          : 'hover:ring-1 hover:ring-[var(--purple-500)]/30 hover:border-[var(--border-default)]',
        size === 'large' && 'rounded-3xl',
        className
      )}
    >
      {/* Image Container */}
      <div className={cn('relative w-full bg-[var(--bg-elevated)]', aspectClass)}>
        {image.status === 'generating' ? (
          // Generating state - animated gradient
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/20 via-transparent to-[var(--pink-500)]/20 animate-pulse" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="relative mb-3">
                <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/10 border-t-[var(--purple-500)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6 text-[var(--purple-400)]"
                  >
                    <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-medium text-white/60">Generating...</span>
            </div>
          </div>
        ) : image.status === 'failed' ? (
          // Failed state
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-10 w-10 text-red-400 mb-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span className="text-sm font-medium text-red-400">Generation Failed</span>
            <button className="mt-2 text-xs text-white/50 hover:text-white underline">
              Retry
            </button>
          </div>
        ) : image.imageUrl ? (
          // Completed with image
          <>
            <Image
              src={image.thumbnailUrl || image.imageUrl}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </>
        ) : (
          // Placeholder
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-12 w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}

        {/* Top badges - always visible */}
        <div className="absolute left-2 right-2 top-2 flex items-start justify-between">
          {/* Left - Status/Generating badge */}
          {image.status === 'generating' && (
            <div className="flex items-center gap-1.5 rounded-full bg-[var(--purple-600)]/90 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Generating
            </div>
          )}
          
          {/* Selection checkmark */}
          {isSelected && image.status === 'completed' && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)] shadow-lg">
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
          
          {/* Right - Quick actions on hover */}
          {image.status === 'completed' && (
            <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100 ml-auto">
              <button
                onClick={handleLike}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-all',
                  image.isLiked
                    ? 'bg-red-500 text-white'
                    : 'bg-black/50 text-white hover:bg-black/70'
                )}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
              </button>
              <button
                onClick={handleDownload}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Liked badge - always visible if liked */}
        {image.isLiked && image.status === 'completed' && !isSelected && (
          <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 shadow-lg group-hover:opacity-0 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3 text-white"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </div>
        )}

        {/* Bottom - Influencer info on hover */}
        {image.status === 'completed' && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full p-3 transition-transform duration-300 group-hover:translate-y-0">
            <div className="flex items-center justify-between">
              {/* Influencer Tag */}
              <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-sm px-2 py-1">
                {image.influencerAvatar ? (
                  <div className="relative h-5 w-5 overflow-hidden rounded-full border border-[var(--purple-500)]/50">
                    <Image
                      src={image.influencerAvatar}
                      alt={image.influencerName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-[10px] font-bold">
                    {image.influencerName.charAt(0)}
                  </div>
                )}
                <span className="text-xs font-medium text-white max-w-[80px] truncate">
                  {image.influencerName}
                </span>
              </div>

              {/* Aspect ratio badge */}
              <div className="rounded-full bg-black/60 backdrop-blur-sm px-2 py-1 text-[10px] font-medium text-white/70">
                {image.aspectRatio}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
