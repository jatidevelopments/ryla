'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { AspectRatio, AspectRatioOption } from '../types';
import { usePlatformFilter, usePickerPosition } from './hooks';
import { PlatformFilter, AspectRatioList } from './components';

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
  const ref = React.useRef<HTMLDivElement>(null);

  // Use extracted hooks
  const { allPlatforms, selectedPlatforms, filteredRatios, togglePlatform, clearFilter } =
    usePlatformFilter({ ratios });
  const { position, mounted } = usePickerPosition({ anchorRef, placement });

  // Click outside handler
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  const content = (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: placement === 'top' ? 'translateY(-100%)' : undefined,
      }}
      className="w-80 rounded-xl border border-white/10 bg-[#1a1a1d] p-2 shadow-xl z-[9999]"
    >
      <div className="mb-2 px-2">
        <div className="mb-2 text-xs font-medium text-white/50 uppercase tracking-wider">
          Aspect ratio
        </div>
        {/* Platform filter */}
        <PlatformFilter
          allPlatforms={allPlatforms}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={togglePlatform}
          onClearFilter={clearFilter}
        />
      </div>

      {/* Aspect ratio list */}
      {filteredRatios.length === 0 && selectedPlatforms.length > 0 ? (
        <div className="px-3 py-4 text-center text-sm text-white/40">
          No aspect ratios support the selected platform(s)
        </div>
      ) : (
        <AspectRatioList
          ratios={filteredRatios}
          selectedRatio={selectedRatio}
          selectedRatios={selectedRatios}
          multiple={multiple}
          onSelect={onSelect}
          onSelectMultiple={onSelectMultiple}
        />
      )}
    </div>
  );

  return createPortal(content, document.body);
}
