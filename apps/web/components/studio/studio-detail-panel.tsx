'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, Button, RylaButton } from '@ryla/ui';
import type { StudioImage } from './studio-image-card';

interface StudioDetailPanelProps {
  image: StudioImage | null;
  onClose: () => void;
  onLike?: (imageId: string) => void;
  onDelete?: (imageId: string) => void;
  onDownload?: (image: StudioImage) => void;
  className?: string;
}

export function StudioDetailPanel({
  image,
  onClose,
  onLike,
  onDelete,
  onDownload,
  className,
}: StudioDetailPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleCopyPrompt = async () => {
    if (!image?.prompt) return;
    try {
      await navigator.clipboard.writeText(image.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (image) {
      onDownload?.(image);
    }
  };

  const handleDelete = () => {
    if (image) {
      onDelete?.(image.id);
      setShowDeleteConfirm(false);
    }
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  if (!image) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center border-l border-white/10 bg-[#0d0d0f] p-8 text-center',
          className
        )}
      >
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/10 to-[var(--pink-500)]/10 border border-white/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="h-12 w-12 text-white/20"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
        </div>
        <p className="text-lg font-semibold text-white/80 mb-2">Select an image</p>
        <p className="text-sm text-white/40 max-w-[200px]">
          Click on any image to view details and edit options
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col border-l border-white/10 bg-[#0d0d0f] overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-[#0a0a0b]">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--purple-500)]/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="font-semibold text-white">Image Details</h3>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="relative aspect-square w-full bg-[#0a0a0b]">
          {image.imageUrl ? (
            <>
              <Image
                src={image.imageUrl}
                alt=""
                fill
                className="object-contain"
              />
              {/* Aspect ratio indicator */}
              <div className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white/70">
                {image.aspectRatio}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-white/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="h-16 w-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}

          {/* Status Badge */}
          {image.status !== 'completed' && (
            <div
              className={cn(
                'absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium backdrop-blur-sm',
                image.status === 'generating'
                  ? 'bg-[var(--purple-600)]/90 text-white'
                  : 'bg-red-500/90 text-white'
              )}
            >
              {image.status === 'generating' && (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              )}
              {image.status === 'generating' ? 'Generating...' : 'Failed'}
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/10">
          <Button
            onClick={() => onLike?.(image.id)}
            variant="outline"
            className={cn(
              'flex-col gap-1 h-auto py-3',
              image.isLiked
                ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            <span className="text-xs">{image.isLiked ? 'Liked' : 'Like'}</span>
          </Button>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-col gap-1 h-auto py-3 border-white/10 bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
            <span className="text-xs">Download</span>
          </Button>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            className="flex-col gap-1 h-auto py-3 border-white/10 bg-white/5 text-white/70 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
            <span className="text-xs">Delete</span>
          </Button>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="mx-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 p-4">
            <p className="text-sm text-white mb-3">Are you sure you want to delete this image?</p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                variant="outline"
                className="flex-1 border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
              >
                Delete
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 border-white/10 bg-white/5"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* AI Influencer Connection - Prominent Section */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
            </svg>
            <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
              AI Influencer
            </h4>
          </div>
          <Link
            href={`/influencer/${image.influencerId}`}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[var(--purple-500)]/5 to-[var(--pink-500)]/5 p-4 transition-all hover:border-[var(--purple-500)]/50 hover:from-[var(--purple-500)]/10 hover:to-[var(--pink-500)]/10"
          >
            {/* Avatar with glow */}
            <div className="relative">
              {image.influencerAvatar ? (
                <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[var(--purple-500)]/50 group-hover:border-[var(--purple-500)]">
                  <Image
                    src={image.influencerAvatar}
                    alt={image.influencerName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xl font-bold text-white">
                  {image.influencerName.charAt(0)}
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white truncate">{image.influencerName}</p>
              <p className="text-sm text-white/50 flex items-center gap-1">
                <span>View profile</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </p>
            </div>

            {/* Arrow */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/40 group-hover:bg-[var(--purple-500)]/20 group-hover:text-[var(--purple-400)] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Generation Details */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
              <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
            </svg>
            <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
              Generation Details
            </h4>
          </div>
          
          <div className="space-y-3">
            {/* Prompt */}
            {image.prompt && (
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs text-white/40">Prompt</span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-xs text-[var(--purple-400)] hover:text-[var(--purple-300)] transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                          <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                          <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="rounded-xl bg-white/5 p-3 text-sm text-white/80 leading-relaxed border border-white/5">
                  {image.prompt}
                </p>
              </div>
            )}

            {/* Scene & Environment Tags */}
            <div className="flex flex-wrap gap-2">
              {image.scene && (
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/20 px-3 py-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--purple-400)]">
                    <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-white capitalize">
                    {image.scene.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
              {image.environment && (
                <div className="flex items-center gap-1.5 rounded-full bg-[var(--pink-500)]/10 border border-[var(--pink-500)]/20 px-3 py-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[var(--pink-400)]">
                    <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-medium text-white capitalize">
                    {image.environment.replace(/-/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white/30">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
            </svg>
            <h4 className="text-xs font-medium uppercase tracking-wider text-white/50">
              Info
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/40">Created</span>
              <span className="text-white/70">{formatDate(image.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Aspect Ratio</span>
              <span className="text-white/70">{image.aspectRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Status</span>
              <span className={cn(
                "capitalize",
                image.status === 'completed' && "text-green-400",
                image.status === 'generating' && "text-[var(--purple-400)]",
                image.status === 'failed' && "text-red-400"
              )}>
                {image.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">ID</span>
              <span className="font-mono text-xs text-white/50">{image.id.slice(0, 12)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Generate More CTA */}
      <div className="border-t border-white/10 p-4 bg-[#0a0a0b]">
        <RylaButton asChild variant="gradient" className="w-full">
          <Link href={`/influencer/${image.influencerId}/studio`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="mr-2 h-4 w-4">
              <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
            </svg>
            Generate More
          </Link>
        </RylaButton>
      </div>
    </div>
  );
}

