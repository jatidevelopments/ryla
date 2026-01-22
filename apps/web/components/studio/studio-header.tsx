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
import type { StudioMode } from '../generation/types';

interface StudioHeaderProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  mode?: StudioMode;
  className?: string;
}

export function StudioHeader({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  searchQuery,
  onSearchChange,
  totalCount,
  mode,
  className,
}: StudioHeaderProps) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Calculate visible and hidden influencers
  const { visibleInfluencers, hiddenInfluencers } =
    useInfluencerTabs(influencers);

  return (
    <div
      className={cn(
        'border-b border-[var(--border-default)] bg-[var(--bg-elevated)]',
        className
      )}
    >
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-2 md:gap-4 px-2 md:px-4 py-2 md:py-3">
        {/* Mode Indicator - Left side */}
        {mode && (
          <div className="flex-shrink-0">
            <ModeIndicator mode={mode} />
          </div>
        )}
        
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
  );
}
