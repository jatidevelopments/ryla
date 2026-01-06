'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { Button } from '@ryla/ui';
import { ZoomIn } from 'lucide-react';
import type { StudioImage } from '../studio-image-card';

interface DetailPanelImagePreviewProps {
  image: StudioImage;
  onOpenLightbox: () => void;
  onRetry?: (image: StudioImage) => void;
}

export function DetailPanelImagePreview({
  image,
  onOpenLightbox,
  onRetry,
}: DetailPanelImagePreviewProps) {
  return (
    <div
      className="relative aspect-square w-full bg-[var(--bg-base)] cursor-pointer group"
      onClick={() => image.imageUrl && onOpenLightbox()}
    >
      {image.imageUrl ? (
        <>
          <Image
            src={image.imageUrl}
            alt=""
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
          />
          {/* Aspect ratio indicator */}
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white/70">
            {image.aspectRatio}
          </div>
          {/* Zoom hint overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-white text-sm font-medium">
              <ZoomIn className="h-4 w-4" />
              <span>Click to view full width</span>
            </div>
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

      {/* Retry Button for Failed Images */}
      {image.status === 'failed' && onRetry && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center p-6">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-8 w-8 text-red-400"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">Generation Failed</h3>
            <p className="mb-4 text-sm text-white/70">
              This image failed to generate. You can retry without any cost.
            </p>
            <Button
              onClick={() => onRetry(image)}
              className="bg-[var(--purple-500)] hover:bg-[var(--purple-600)] text-white rounded-xl px-6 py-2.5 font-medium transition-colors"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

