'use client';

import * as React from 'react';
import Image from 'next/image';
import { PickerDrawer } from './PickerDrawer';

export type OutfitMode = 'pre-composed' | 'custom';

interface OutfitModeSelectorProps {
  onModeSelect: (mode: OutfitMode) => void;
  onClose: () => void;
}

export function OutfitModeSelector({
  onModeSelect,
  onClose,
}: OutfitModeSelectorProps) {
  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Choose Outfit Mode"
      className="w-full max-w-4xl"
    >
      {/* Options Grid */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pre-Composed Outfits */}
          <button
            onClick={() => onModeSelect('pre-composed')}
            className="group relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-[var(--purple-500)] transition-all bg-gradient-to-br from-white/5 to-white/[0.02]"
          >
            <div className="relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[16/10] overflow-hidden">
              <Image
                src="/outfit-modes/pre-composed.webp"
                alt="Pre-Composed Outfits"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">
                  Pre-Composed
                </h3>
                <p className="text-sm text-white/70 mb-1">70 ready outfits</p>
              </div>
            </div>
          </button>

          {/* Custom Composition */}
          <button
            onClick={() => onModeSelect('custom')}
            className="group relative rounded-2xl overflow-hidden border-2 border-transparent hover:border-[var(--purple-500)] transition-all bg-gradient-to-br from-white/5 to-white/[0.02]"
          >
            <div className="relative aspect-[16/10] sm:aspect-[21/9] md:aspect-[16/10] overflow-hidden">
              <Image
                src="/outfit-modes/custom-composition.webp"
                alt="Custom Composition"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-1">
                  Custom Composition
                </h3>
                <p className="text-sm text-white/70 mb-1">
                  Mix & match 99 pieces
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </PickerDrawer>
  );
}
