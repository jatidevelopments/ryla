'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  InfluencerTabsDisplay,
  useInfluencerTabs,
  InfluencerDropdown,
  StudioSearch,
  useInfluencerDropdown,
  type InfluencerTab,
} from './header';

interface StudioHeaderProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  className?: string;
}

export function StudioHeader({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  searchQuery,
  onSearchChange,
  totalCount,
  className,
}: StudioHeaderProps) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Calculate visible and hidden influencers
  const { visibleInfluencers, hiddenInfluencers } = useInfluencerTabs(
    influencers
  );

  // Use dropdown hook for positioning and click-outside detection
  const { position, mounted, dropdownRef } = useInfluencerDropdown({
    showDropdown: showMoreDropdown,
    buttonRef,
    onClose: () => setShowMoreDropdown(false),
  });

  return (
    <div
      className={cn(
        'border-b border-[var(--border-default)] bg-[var(--bg-elevated)]',
        className
      )}
    >
      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Left - Main tabs */}
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

        {/* Right - Search */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <StudioSearch
            searchQuery={searchQuery}
            onSearchChange={onSearchChange}
          />
        </div>
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {showMoreDropdown && (
        <InfluencerDropdown
          influencers={hiddenInfluencers}
          selectedInfluencerId={selectedInfluencerId}
          onSelectInfluencer={(id) => onSelectInfluencer(id)}
          onClose={() => setShowMoreDropdown(false)}
          position={position}
          mounted={mounted}
          dropdownRef={dropdownRef}
        />
      )}
    </div>
  );
}

