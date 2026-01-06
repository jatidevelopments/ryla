'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import { AspectRatioPicker } from '../generation/pickers/AspectRatioPicker';
import { ASPECT_RATIOS } from '../generation/types';
import type { AspectRatio } from '../generation/types';

interface AspectRatioFilterProps {
  aspectRatios: AspectRatio[];
  onAspectRatioChange: (ratios: AspectRatio[]) => void;
}

function getAspectRatioLabel(aspectRatios: AspectRatio[]): string {
  if (aspectRatios.length === 0) {
    return 'All';
  }
  if (aspectRatios.length === 1) {
    return aspectRatios[0];
  }
  return `${aspectRatios.length} selected`;
}

export function AspectRatioFilter({
  aspectRatios,
  onAspectRatioChange,
}: AspectRatioFilterProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <Tooltip content="Filter by image dimensions (1:1, 9:16, 2:3)">
        <button
          ref={buttonRef}
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            'flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium transition-all',
            aspectRatios.length > 0
              ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
              : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 border border-[var(--border-default)]'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-[var(--purple-400)]"
          >
            <path
              fillRule="evenodd"
              d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>{getAspectRatioLabel(aspectRatios)}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4 text-[var(--text-muted)]"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Tooltip>
      {showPicker && (
        <AspectRatioPicker
          ratios={ASPECT_RATIOS}
          selectedRatio={aspectRatios[0] || '9:16'}
          selectedRatios={aspectRatios}
          multiple={true}
          onSelect={() => {}} // Not used in multiple mode
          onSelectMultiple={(ratios) => {
            onAspectRatioChange(ratios);
          }}
          onClose={() => setShowPicker(false)}
          anchorRef={buttonRef}
        />
      )}
    </div>
  );
}

