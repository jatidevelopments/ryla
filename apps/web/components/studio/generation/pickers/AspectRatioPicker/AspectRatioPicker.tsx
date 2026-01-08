'use client';

import * as React from 'react';
import type { AspectRatio, AspectRatioOption } from '../../types';
import { usePlatformFilter } from './hooks';
import { PlatformFilter, AspectRatioList } from './components';
import { PickerDrawer } from '../PickerDrawer';

interface AspectRatioPickerProps {
  ratios: AspectRatioOption[];
  selectedRatio: AspectRatio;
  selectedRatios?: AspectRatio[]; // For multiple selection mode
  multiple?: boolean; // Enable multiple selection
  placement?: 'top' | 'bottom'; // Position relative to anchor: 'top' = above, 'bottom' = below
  onSelect: (ratio: AspectRatio) => void;
  onSelectMultiple?: (ratios: AspectRatio[]) => void; // For multiple selection mode
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function AspectRatioPicker({
  ratios,
  selectedRatio,
  selectedRatios = [],
  multiple = false,
  placement = 'bottom',
  onSelect,
  onSelectMultiple,
  onClose,
  anchorRef,
}: AspectRatioPickerProps) {
  // Use extracted hooks
  const {
    allPlatforms,
    selectedPlatforms,
    filteredRatios,
    togglePlatform,
    clearFilter,
  } = usePlatformFilter({ ratios });

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      anchorRef={anchorRef}
      desktopPosition={placement}
      title="Aspect Ratio"
      className="md:w-80"
    >
      <div className="p-3">
        {/* Platform filter */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.1em] mb-3 block">
            Filter by platform
          </label>
          <PlatformFilter
            allPlatforms={allPlatforms}
            selectedPlatforms={selectedPlatforms}
            onTogglePlatform={togglePlatform}
            onClearFilter={clearFilter}
          />
        </div>

        {/* Aspect ratio list */}
        {filteredRatios.length === 0 && selectedPlatforms.length > 0 ? (
          <div className="px-3 py-6 text-center text-sm text-white/40">
            No aspect ratios support the selected platforms
          </div>
        ) : (
          <AspectRatioList
            ratios={filteredRatios}
            selectedRatio={selectedRatio}
            selectedRatios={selectedRatios}
            multiple={multiple}
            onSelect={(ratio) => {
              onSelect(ratio);
              if (!multiple) onClose();
            }}
            onSelectMultiple={onSelectMultiple}
          />
        )}
      </div>
    </PickerDrawer>
  );
}
