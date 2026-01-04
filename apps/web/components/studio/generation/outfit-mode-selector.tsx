'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { X } from 'lucide-react';

export type OutfitMode = 'pre-composed' | 'custom';

interface OutfitModeSelectorProps {
  onModeSelect: (mode: OutfitMode) => void;
  onClose: () => void;
}

export function OutfitModeSelector({
  onModeSelect,
  onClose,
}: OutfitModeSelectorProps) {
  const [mounted, setMounted] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
    >
      <div
        className="relative flex flex-col w-full max-w-4xl bg-[#18181b] rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-[var(--purple-400)]"
              >
                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Choose Outfit Mode</h2>
              <p className="text-sm text-white/50">Select how you want to choose your outfit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre-Composed Outfits */}
            <button
              onClick={() => onModeSelect('pre-composed')}
              className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--purple-500)] transition-all bg-gradient-to-br from-white/5 to-white/[0.02]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/outfit-modes/pre-composed.webp"
                  alt="Pre-Composed Outfits"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-1">Pre-Composed</h3>
                  <p className="text-sm text-white/80 mb-3">70 ready outfits</p>
                </div>
              </div>
            </button>

            {/* Custom Composition */}
            <button
              onClick={() => onModeSelect('custom')}
              className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-[var(--purple-500)] transition-all bg-gradient-to-br from-white/5 to-white/[0.02]"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src="/outfit-modes/custom-composition.webp"
                  alt="Custom Composition"
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <h3 className="text-xl font-bold text-white mb-1">Custom Composition</h3>
                  <p className="text-sm text-white/80 mb-3">Mix & match 99 pieces</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

