'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';

export interface InfluencerTab {
  id: string;
  name: string;
  avatar?: string;
  imageCount: number;
}

interface InfluencerTabsProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  totalCount: number;
  maxVisible?: number;
}

const MAX_VISIBLE_INFLUENCERS = 5;

export function useInfluencerTabs(
  influencers: InfluencerTab[],
  maxVisible: number = MAX_VISIBLE_INFLUENCERS
) {
  const visibleInfluencers = React.useMemo(() => {
    if (influencers.length <= maxVisible) {
      return influencers;
    }
    return influencers.slice(0, maxVisible);
  }, [influencers, maxVisible]);

  const hiddenInfluencers = React.useMemo(() => {
    if (influencers.length <= maxVisible) {
      return [];
    }
    return influencers.slice(maxVisible);
  }, [influencers, maxVisible]);

  return {
    visibleInfluencers,
    hiddenInfluencers,
  };
}

interface InfluencerTabButtonProps {
  influencer: InfluencerTab;
  isSelected: boolean;
  onSelect: () => void;
}

function InfluencerTabButton({
  influencer,
  isSelected,
  onSelect,
}: InfluencerTabButtonProps) {
  return (
    <Tooltip content={`View images from ${influencer.name}`}>
      <button
        onClick={onSelect}
        className={cn(
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
          isSelected
            ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/50'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
        )}
      >
        {influencer.avatar ? (
          <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--purple-500)]/30 flex-shrink-0">
            <Image
              src={influencer.avatar}
              alt={influencer.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xs font-bold text-white flex-shrink-0">
            {influencer.name.charAt(0)}
          </div>
        )}
        <span className="max-w-[100px] truncate">{influencer.name}</span>
        <span className="rounded-full bg-[var(--bg-hover)] px-1.5 py-0.5 text-xs text-[var(--text-muted)] flex-shrink-0">
          {influencer.imageCount}
        </span>
      </button>
    </Tooltip>
  );
}

interface InfluencerTabsDisplayProps {
  visibleInfluencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  totalCount: number;
  onShowMore?: () => void;
  moreButtonRef?: React.RefObject<HTMLButtonElement>;
}

export function InfluencerTabsDisplay({
  visibleInfluencers,
  selectedInfluencerId,
  onSelectInfluencer,
  totalCount,
  onShowMore,
  moreButtonRef,
}: InfluencerTabsDisplayProps) {
  return (
    <div
      className="flex items-center gap-1 min-w-0"
      style={{ maxWidth: 'calc(100% - 300px)' }}
      data-tutorial-target="character-selector"
    >
      <Tooltip content="View all images from all influencers">
        <button
          onClick={() => onSelectInfluencer(null)}
          className={cn(
            'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all flex-shrink-0',
            !selectedInfluencerId
              ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/20'
              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
          All Images
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
            {totalCount}
          </span>
        </button>
      </Tooltip>

      {/* Divider */}
      <div className="mx-3 h-6 w-px bg-[var(--border-default)] flex-shrink-0" />

      {/* Influencer Tabs - Limited Width with Overflow */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          {visibleInfluencers.map((influencer) => (
            <InfluencerTabButton
              key={influencer.id}
              influencer={influencer}
              isSelected={selectedInfluencerId === influencer.id}
              onSelect={() => onSelectInfluencer(influencer.id)}
            />
          ))}
        </div>

        {/* More Influencers Button */}
        {onShowMore && (
          <div className="relative flex-shrink-0">
            <Tooltip content="View more influencers">
              <button
                ref={(el) => {
                  // Store ref for dropdown positioning
                  if (el) {
                    (window as any).__moreButtonRef = el;
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onShowMore();
                }}
                className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all h-[36px] w-[36px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                  <path d="M8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                  <path d="M15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}

