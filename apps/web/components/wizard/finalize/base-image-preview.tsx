'use client';

import * as React from 'react';
import Image from 'next/image';
import { ZoomIn } from 'lucide-react';
import { useIsMobile } from '@ryla/ui';
import { BaseImageLightbox } from '../components/base-image-lightbox';
import { getNextImageSrc } from '@/lib/utils/get-next-image-src';

interface BaseImagePreviewProps {
  imageUrl: string;
}

export function BaseImagePreview({ imageUrl }: BaseImagePreviewProps) {
  const isMobile = useIsMobile();
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const handleViewFull = React.useCallback(() => {
    setIsLightboxOpen(true);
  }, []);

  const handleCloseLightbox = React.useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  return (
    <>
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm relative group">
          <p className="text-white/70 text-sm mb-3">Selected Base Image</p>
          <div className="relative aspect-square max-w-xs mx-auto rounded-xl overflow-hidden">
            <Image
              src={getNextImageSrc(imageUrl)}
              alt="Selected base image"
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Mobile: View Full Button - Always visible on mobile */}
            {isMobile && (
              <button
                onClick={handleViewFull}
                className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-purple-500/90 hover:bg-purple-500 px-3 py-1.5 text-white text-xs font-medium shadow-lg transition-all active:scale-95 backdrop-blur-sm border border-purple-400/30"
                aria-label="View full size"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                <span>View Full</span>
              </button>
            )}

            {/* Desktop: Hover hint overlay - Click to view full */}
            {!isMobile && (
              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={handleViewFull}
              >
                <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-white text-sm font-medium">
                  <ZoomIn className="h-4 w-4" />
                  <span>Click to view full width</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <BaseImageLightbox
        image={
          imageUrl
            ? {
                id: 'preview',
                url: getNextImageSrc(imageUrl),
                thumbnailUrl: getNextImageSrc(imageUrl),
              }
            : null
        }
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
      />
    </>
  );
}

