'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { StudioMode, ContentType } from '../../types';
import { MODE_CONFIG, COLOR_CLASSES } from './constants';
import { ModeButton, ContentTypeSelector, CreditsDisplay } from './components';

interface ModeSelectorProps {
  mode: StudioMode;
  contentType: ContentType;
  onModeChange: (mode: StudioMode) => void;
  onContentTypeChange: (type: ContentType) => void;
  hasSelectedImage?: boolean;
  creditsAvailable?: number;
  className?: string;
}

export function ModeSelector({
  mode,
  contentType,
  onModeChange,
  onContentTypeChange,
  hasSelectedImage = false,
  creditsAvailable = 0,
  className,
}: ModeSelectorProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 md:gap-2 px-2 md:px-4 lg:px-6 py-1.5 md:py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-default)] overflow-x-auto scroll-hidden',
        className
      )}
    >
      {/* Mode Tabs - Scrollable on mobile */}
      <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0" data-tutorial-target="mode-tabs">
        {(Object.keys(MODE_CONFIG) as StudioMode[]).map((modeKey) => (
          <ModeButton
            key={modeKey}
            mode={modeKey}
            isActive={mode === modeKey}
            onSelect={onModeChange}
          />
        ))}
      </div>

      {/* Divider - hidden on mobile */}
      <div className="hidden md:block h-6 w-px bg-[var(--border-default)]" />

      {/* Content Type Selector */}
      <ContentTypeSelector
        contentType={contentType}
        onContentTypeChange={onContentTypeChange}
      />

      {/* Spacer */}
      <div className="flex-1 min-w-2" />

      {/* Credits Display - Hidden on mobile (shown elsewhere) */}
      <div className="hidden md:block">
        <CreditsDisplay creditsAvailable={creditsAvailable} />
      </div>
    </div>
  );
}

// Export helper to get mode color for borders
export function getModeBorderColor(mode: StudioMode): string {
  const config = MODE_CONFIG[mode];
  return COLOR_CLASSES[config.color].border;
}

// Re-export constants for external use
export { MODE_CONFIG, COLOR_CLASSES } from './constants';

