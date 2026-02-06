'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  InfluencerTabsDisplay,
  useInfluencerTabs,
  InfluencerDropdown,
  StudioSearch,
  type InfluencerTab,
} from './header';
import { ModeIndicator } from './header/ModeIndicator';
import type { StudioMode } from './generation/types';

interface StudioHeaderProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  mode?: StudioMode;
  className?: string;
  // Toolbar props
  viewMode?: 'grid' | 'large' | 'masonry';
  onViewModeChange?: (mode: 'grid' | 'large' | 'masonry') => void;
  status?: 'all' | 'completed' | 'generating' | 'failed';
  onStatusChange?: (status: 'all' | 'completed' | 'generating' | 'failed') => void;
  liked?: 'all' | 'liked' | 'not-liked';
  onLikedChange?: (liked: 'all' | 'liked' | 'not-liked') => void;
  adult?: 'all' | 'adult' | 'not-adult';
  onAdultChange?: (adult: 'all' | 'adult' | 'not-adult') => void;
  sortBy?: 'newest' | 'oldest';
  onSortByChange?: (sort: 'newest' | 'oldest') => void;
  aspectRatios?: any[];
  onAspectRatioChange?: (ratios: any[]) => void;
}

export function StudioHeader({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  searchQuery,
  onSearchChange,
  totalCount,
  className,
  viewMode,
  onViewModeChange,
  status,
  onStatusChange,
  liked,
  onLikedChange,
  adult,
  onAdultChange,
  sortBy,
  onSortByChange,
  aspectRatios,
  onAspectRatioChange,
}: StudioHeaderProps) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Calculate visible and hidden influencers
  const { visibleInfluencers, hiddenInfluencers } =
    useInfluencerTabs(influencers);

  // Import toolbar components
  const {
    StatusFilter: StatusFilterComponent,
    AspectRatioFilter: AspectRatioFilterComponent,
    LikedFilter: LikedFilterComponent,
    AdultFilter: AdultFilterComponent,
    SortDropdown,
    ViewModeToggle,
  } = require('./toolbar');

  return (
    <div className={cn('px-3 pt-3', className)}>
      {/* Studio header with rounded glassmorphism style */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121214]/70 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_4px_16px_-2px_rgba(0,0,0,0.2)] overflow-hidden">
        {/* Top Navigation Tabs */}
        <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 md:py-3 border-b border-white/[0.05]">
          {/* Left - Main tabs - Scrollable on mobile */}
          <div className="flex-1 overflow-x-auto scroll-hidden">
            <InfluencerTabsDisplay
              visibleInfluencers={visibleInfluencers}
              selectedInfluencerId={selectedInfluencerId}
              onSelectInfluencer={onSelectInfluencer}
              totalCount={totalCount}
              onShowMore={
                hiddenInfluencers.length > 0
                  ? () => setShowMoreDropdown(!showMoreDropdown)
                  : undefined
              }
              moreButtonRef={buttonRef}
            />
          </div>

          {/* Right - Search - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0 ml-auto">
            <StudioSearch
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
            />
          </div>
        </div>

        {/* Filters Row - Desktop */}
        {viewMode && onViewModeChange && (
          <div className="hidden md:flex items-center justify-between gap-3 px-4 py-2">
            {/* Left - Filter Pills */}
            <div className="flex items-center gap-3 overflow-x-auto scroll-hidden flex-shrink-0">
              {status && onStatusChange && (
                <StatusFilterComponent
                  status={status}
                  onStatusChange={onStatusChange}
                />
              )}
              {aspectRatios && onAspectRatioChange && (
                <AspectRatioFilterComponent
                  aspectRatios={aspectRatios}
                  onAspectRatioChange={onAspectRatioChange}
                />
              )}
              {liked && onLikedChange && (
                <LikedFilterComponent liked={liked} onLikedChange={onLikedChange} />
              )}
              {adult && onAdultChange && (
                <AdultFilterComponent adult={adult} onAdultChange={onAdultChange} />
              )}
            </div>

            {/* Right - View Mode & Sort */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {sortBy && onSortByChange && (
                <SortDropdown sortBy={sortBy} onSortByChange={onSortByChange} />
              )}
              <div className="h-5 w-px bg-[var(--border-default)]" />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={onViewModeChange}
              />
            </div>
          </div>
        )}

        {/* Dropdown Menu - Refactored to PickerDrawer */}
        <InfluencerDropdown
          influencers={hiddenInfluencers}
          selectedInfluencerId={selectedInfluencerId}
          onSelectInfluencer={(id) => onSelectInfluencer(id)}
          onClose={() => setShowMoreDropdown(false)}
          isOpen={showMoreDropdown}
          anchorRef={buttonRef}
        />
      </div>
    </div>
  );
}
