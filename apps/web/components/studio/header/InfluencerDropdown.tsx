'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { InfluencerTab } from './InfluencerTabs';

interface InfluencerDropdownProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
  mounted: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function InfluencerDropdown({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  onClose,
  position,
  mounted,
  dropdownRef,
}: InfluencerDropdownProps) {
  if (!mounted || influencers.length === 0) {
    return null;
  }

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
      }}
      className="w-64 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1d] shadow-xl z-[9999]"
    >
      <div className="p-2">
        {influencers.map((influencer) => (
          <button
            key={influencer.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelectInfluencer(influencer.id);
              onClose();
            }}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              selectedInfluencerId === influencer.id
                ? 'bg-[var(--purple-500)]/20 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            {influencer.avatar ? (
              <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--purple-500)]/30 flex-shrink-0">
                <Image
                  src={influencer.avatar}
                  alt={influencer.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-sm font-bold text-white flex-shrink-0">
                {influencer.name.charAt(0)}
              </div>
            )}
            <span className="font-medium truncate flex-1">
              {influencer.name}
            </span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40 flex-shrink-0">
              {influencer.imageCount}
            </span>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

