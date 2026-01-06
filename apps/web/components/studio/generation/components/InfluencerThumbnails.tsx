'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../ui/tooltip';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface InfluencerThumbnailsProps {
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  onSelect: (id: string) => void;
  onShowMore: () => void;
}

export function InfluencerThumbnails({
  influencers,
  selectedInfluencerId,
  onSelect,
  onShowMore,
}: InfluencerThumbnailsProps) {
  // Reorder influencers to show selected one first
  const orderedInfluencers = React.useMemo(() => {
    if (!selectedInfluencerId) {
      return influencers;
    }
    const selected = influencers.find((inf) => inf.id === selectedInfluencerId);
    const others = influencers.filter((inf) => inf.id !== selectedInfluencerId);
    return selected ? [selected, ...others] : influencers;
  }, [influencers, selectedInfluencerId]);

  return (
    <div className="flex items-center gap-2">
      {orderedInfluencers.slice(0, 3).map((inf) => (
        <Tooltip key={inf.id} content={`Select ${inf.name} for generation`}>
          <button
            onClick={() => onSelect(inf.id)}
            className={cn(
              'relative h-10 w-10 rounded-lg overflow-hidden border-2 transition-all',
              selectedInfluencerId === inf.id
                ? 'border-[var(--purple-500)] ring-1 ring-[var(--purple-500)]/50'
                : 'border-transparent hover:border-white/30'
            )}
          >
            {inf.avatar ? (
              <Image src={inf.avatar} alt={inf.name} fill unoptimized className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center text-white text-xs font-bold">
                {inf.name.charAt(0)}
              </div>
            )}
            {selectedInfluencerId === inf.id && (
              <div className="absolute bottom-0.5 left-0.5 text-[8px] font-bold text-white bg-black/50 px-1 rounded uppercase truncate max-w-[36px]">
                {inf.name}
              </div>
            )}
          </button>
        </Tooltip>
      ))}

      {/* More Characters Button */}
      <Tooltip content="Select from more influencers">
        <button
          onClick={onShowMore}
          className="h-11 px-4 rounded-xl bg-white/5 text-[var(--text-secondary)] text-xs font-medium hover:bg-white/10 hover:text-[var(--text-primary)] transition-all"
        >
          More...
        </button>
      </Tooltip>

      {/* Red cross icon when no influencer is selected */}
      {!selectedInfluencerId && (
        <Tooltip content="No influencer selected. Select an influencer to generate images.">
          <div className="relative h-10 w-10 rounded-lg bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-red-400"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </div>
        </Tooltip>
      )}
    </div>
  );
}

