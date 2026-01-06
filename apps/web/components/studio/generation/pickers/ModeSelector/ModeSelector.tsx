'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { StudioMode, ContentType } from '../types';
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
        'flex items-center gap-2 px-4 lg:px-6 py-3 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]',
        className
      )}
    >
      {/* Mode Tabs */}
      <div className="flex items-center gap-1" data-tutorial-target="mode-tabs">
        {(Object.keys(MODE_CONFIG) as StudioMode[]).map((modeKey) => (
          <ModeButton
            key={modeKey}
            mode={modeKey}
            isActive={mode === modeKey}
            onSelect={onModeChange}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-[var(--border-default)]" />

      {/* Content Type Selector */}
      <ContentTypeSelector
        contentType={contentType}
        onContentTypeChange={onContentTypeChange}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Credits Display */}
      <CreditsDisplay creditsAvailable={creditsAvailable} />
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

