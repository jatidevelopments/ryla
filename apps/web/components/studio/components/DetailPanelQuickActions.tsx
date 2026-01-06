'use client';

import * as React from 'react';
import { cn, Button } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { StudioImage } from '../studio-image-card';

interface DetailPanelQuickActionsProps {
  image: StudioImage;
  onLike?: (imageId: string) => void;
  onDownload?: (image: StudioImage) => void;
  onRetry?: (image: StudioImage) => void;
  onDeleteClick: () => void;
}

export function DetailPanelQuickActions({
  image,
  onLike,
  onDownload,
  onRetry,
  onDeleteClick,
}: DetailPanelQuickActionsProps) {
  const handleDownload = () => {
    if (image) {
      onDownload?.(image);
    }
  };

  return (
    <div
      className={cn(
        'grid gap-3 p-4 border-b border-[var(--border-default)]',
        image.status === 'failed' && onRetry ? 'grid-cols-2' : 'grid-cols-3'
      )}
    >
      {image.status === 'failed' && onRetry && (
        <Tooltip content="Retry generation (free)" wrapperClassName="contents">
          <Button
            onClick={() => onRetry(image)}
            className="col-span-2 bg-[var(--purple-500)] hover:bg-[var(--purple-600)] text-white rounded-xl py-4 font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.546a.75.75 0 001.5 0v-2.203l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.546a.75.75 0 00.53-.219z"
                clipRule="evenodd"
              />
            </svg>
            <span>Retry Generation (Free)</span>
          </Button>
        </Tooltip>
      )}
      {image.status !== 'failed' && (
        <>
          <Tooltip content="Like this image" wrapperClassName="contents">
            <Button
              onClick={() => onLike?.(image.id)}
              variant="outline"
              className={cn(
                'flex-col gap-1.5 h-auto py-4 rounded-xl transition-all',
                image.isLiked
                  ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                  : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
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
              <span className="text-xs font-medium">{image.isLiked ? 'Liked' : 'Like'}</span>
            </Button>
          </Tooltip>
          <Tooltip content="Download image" wrapperClassName="contents">
            <Button
              onClick={handleDownload}
              variant="outline"
              className="flex-col gap-1.5 h-auto py-4 rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
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
              <span className="text-xs font-medium">Download</span>
            </Button>
          </Tooltip>
        </>
      )}
      <Tooltip content="Delete this image" wrapperClassName="contents">
        <Button
          onClick={onDeleteClick}
          variant="outline"
          className="flex-col gap-1.5 h-auto py-4 rounded-xl border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path
              fillRule="evenodd"
              d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs font-medium">Delete</span>
        </Button>
      </Tooltip>
    </div>
  );
}

