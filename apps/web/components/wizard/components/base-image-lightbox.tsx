'use client';

import * as React from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { cn, useIsMobile } from '@ryla/ui';
import type { GeneratedImage } from '@ryla/business';

interface BaseImageLightboxProps {
  image: GeneratedImage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BaseImageLightbox({
  image,
  isOpen,
  onClose,
}: BaseImageLightboxProps) {
  const isMobile = useIsMobile();

  if (!isOpen || !image || image.url === 'skeleton' || image.url === 'loading') {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Image Container */}
      <div
        className={cn(
          'relative flex items-center justify-center transition-all duration-500',
          isMobile
            ? 'w-full h-full p-4'
            : 'max-w-[90vw] max-h-[85vh] w-full h-[85vh]'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full">
          <Image
            src={image.url}
            alt={`Base image ${image.model ? `- ${image.model}` : ''}`}
            fill
            className="object-contain animate-in zoom-in-95 duration-300"
            priority
          />
        </div>
      </div>

      {/* Info Overlay (Optional) */}
      {!isMobile && image.model && (
        <div className="absolute bottom-10 left-0 right-0 px-10 flex justify-center pointer-events-none">
          <div className="max-w-2xl bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-center pointer-events-auto border border-white/10">
            <p className="text-sm text-white/70">{image.model}</p>
          </div>
        </div>
      )}
    </div>
  );
}
