'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { useInfluencerStore } from '@ryla/business';
import type { Post } from '@ryla/shared';
import { Heart, Copy, Check, Download, ImageIcon } from 'lucide-react';

export interface PostCardProps {
  post: Post;
  onExport?: (post: Post) => void;
  className?: string;
}

export function PostCard({ post, onExport, className }: PostCardProps) {
  const toggleLike = useInfluencerStore((state) => state.toggleLike);
  const [copied, setCopied] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLike(post.id);
  };

  const handleCopyCaption = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExport?.(post);
  };

  // Get aspect ratio class
  const aspectClass =
    post.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : post.aspectRatio === '2:3'
        ? 'aspect-[2/3]'
        : 'aspect-square';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl transition-all duration-300',
        'bg-[var(--bg-subtle)] border border-[var(--border-default)]',
        'hover:border-[var(--purple-500)]/30 hover:shadow-lg hover:shadow-[var(--purple-500)]/5',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className={cn('relative w-full overflow-hidden', aspectClass)}>
        {/* Gradient overlay on hover */}
        <div
          className={cn(
            'absolute inset-0 z-10 transition-opacity duration-300',
            'bg-gradient-to-t from-black/60 via-black/20 to-transparent',
            isHovered ? 'opacity-100' : 'opacity-0'
          )}
        />

        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt=""
            fill
            className={cn(
              'object-cover transition-transform duration-500',
              isHovered && 'scale-105'
            )}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/10 to-[var(--pink-500)]/10">
            <ImageIcon className="h-12 w-12 text-[var(--text-muted)]/30" />
          </div>
        )}

        {/* Like indicator - always visible when liked */}
        {post.isLiked && (
          <div className="absolute right-2 top-2 z-20">
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-[var(--pink-500)] shadow-lg">
              <Heart className="h-3.5 w-3.5 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Hover action buttons */}
        <div
          className={cn(
            'absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 transition-all duration-300',
            isHovered
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          )}
        >
          <button
            onClick={handleLike}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-200',
              post.isLiked
                ? 'bg-[var(--pink-500)] text-white shadow-lg'
                : 'bg-white/20 text-white hover:bg-white/30'
            )}
            title={post.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              className={cn('h-4 w-4', post.isLiked && 'fill-white')}
            />
          </button>

          <button
            onClick={handleCopyCaption}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30"
            title={copied ? 'Copied!' : 'Copy caption'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={handleExport}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-200 hover:bg-white/30"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Caption */}
      <div className="p-3">
        <p className="line-clamp-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          {post.caption}
        </p>
      </div>
    </div>
  );
}
