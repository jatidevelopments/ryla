'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { InfluencerTab } from './InfluencerTabs';
import { PickerDrawer } from '../generation/pickers/PickerDrawer';

interface InfluencerDropdownProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string) => void;
  onClose: () => void;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function InfluencerDropdown({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  onClose,
  isOpen,
  anchorRef,
}: InfluencerDropdownProps) {
  if (influencers.length === 0) {
    return null;
  }

  return (
    <PickerDrawer
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      title="All Influencers"
      desktopPosition="bottom"
      align="right"
      className="w-72"
    >
      <div className="p-2 space-y-1">
        {influencers.map((influencer) => (
          <button
            key={influencer.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectInfluencer(influencer.id);
              onClose();
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all',
              selectedInfluencerId === influencer.id
                ? 'bg-[var(--purple-500)]/20 text-white border border-[var(--purple-500)]/30'
                : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
            )}
          >
            {influencer.avatar ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[var(--purple-500)]/30 flex-shrink-0">
                <Image
                  src={influencer.avatar}
                  alt={influencer.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-sm font-bold text-white flex-shrink-0">
                {influencer.name.charAt(0)}
              </div>
            )}
            <div className="flex flex-col items-start truncate flex-1 min-w-0">
              <span className="font-semibold text-white truncate w-full">
                {influencer.name}
              </span>
              <span className="text-[11px] text-white/40">
                {influencer.imageCount} images
              </span>
            </div>
            {selectedInfluencerId === influencer.id && (
              <div className="h-2 w-2 rounded-full bg-[var(--purple-500)]" />
            )}
          </button>
        ))}
      </div>
    </PickerDrawer>
  );
}
