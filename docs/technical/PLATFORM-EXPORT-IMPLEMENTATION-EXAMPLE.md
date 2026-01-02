# Platform Export Implementation Example

## Overview

This document shows how to integrate platform badges and export functionality into the aspect ratio selector and export flows.

## Example: Enhanced Aspect Ratio Selector

```tsx
// apps/web/components/studio/generation/aspect-ratio-selector.tsx

'use client';

import * as React from 'react';
import { ASPECT_RATIOS } from './types';
import { PlatformBadgeGroup } from '@ryla/ui';
import type { AspectRatio } from './types';

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (ratio: AspectRatio) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  const selectedRatio = ASPECT_RATIOS.find(r => r.value === value);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-[var(--text-secondary)]">
        Aspect Ratio
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {ASPECT_RATIOS.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onChange(ratio.value)}
            className={cn(
              'relative p-3 rounded-lg border-2 transition-all',
              'hover:border-[var(--purple-500)]/50',
              value === ratio.value
                ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10'
                : 'border-[var(--border-default)]'
            )}
          >
            <div className="text-center">
              <div className="text-lg font-semibold mb-1">{ratio.label}</div>
              
              {/* Platform badges */}
              {ratio.platforms && ratio.platforms.length > 0 && (
                <div className="mt-2 flex justify-center">
                  <PlatformBadgeGroup
                    platformIds={ratio.platforms}
                    size="sm"
                    maxVisible={3}
                  />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Show selected ratio's platforms */}
      {selectedRatio?.platforms && selectedRatio.platforms.length > 0 && (
        <div className="mt-3 p-3 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-default)]">
          <div className="text-xs text-[var(--text-muted)] mb-2">
            Compatible platforms:
          </div>
          <PlatformBadgeGroup
            platformIds={selectedRatio.platforms}
            size="md"
            maxVisible={8}
          />
        </div>
      )}
    </div>
  );
}
```

## Example: Export Modal with Platform Selection

```tsx
// apps/web/components/studio/export-modal.tsx

'use client';

import * as React from 'react';
import { Dialog } from '@ryla/ui';
import { PlatformBadge, PlatformBadgeGroup } from '@ryla/ui';
import { PLATFORMS, getPlatformsForAspectRatio } from '@ryla/shared';
import { downloadImageForPlatform, getExportSuggestions } from '@ryla/shared';
import type { AspectRatio, PlatformId } from '@ryla/shared';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  imageUrl: string;
  caption?: string;
  aspectRatio: AspectRatio;
}

export function ExportModal({
  open,
  onClose,
  imageUrl,
  caption,
  aspectRatio,
}: ExportModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<PlatformId[]>([]);
  const [isExporting, setIsExporting] = React.useState(false);

  const compatiblePlatforms = getPlatformsForAspectRatio(aspectRatio);
  const suggestions = getExportSuggestions(aspectRatio);

  const togglePlatform = (platformId: PlatformId) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleExport = async () => {
    if (selectedPlatforms.length === 0) return;

    setIsExporting(true);
    try {
      for (const platformId of selectedPlatforms) {
        await downloadImageForPlatform(imageUrl, {
          imageUrl,
          caption,
          platformId,
          aspectRatio,
        });
      }
      
      // Show success message
      alert(`Exported to ${selectedPlatforms.length} platform(s)!`);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Export to Platform</Dialog.Title>
          <Dialog.Description>
            Select platforms to export your {aspectRatio} image
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-4 py-4">
          {/* Suggested platforms */}
          {suggestions.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 text-[var(--text-secondary)]">
                Recommended for {aspectRatio}:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map(platformId => {
                  const platform = PLATFORMS[platformId];
                  return (
                    <button
                      key={platformId}
                      onClick={() => togglePlatform(platformId)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                        selectedPlatforms.includes(platformId)
                          ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10'
                          : 'border-[var(--border-default)] hover:border-[var(--purple-500)]/50'
                      )}
                    >
                      <PlatformBadge platformId={platformId} size="sm" />
                      <span className="text-sm">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All compatible platforms */}
          <div>
            <div className="text-sm font-medium mb-2 text-[var(--text-secondary)]">
              All compatible platforms:
            </div>
            <div className="grid grid-cols-2 gap-2">
              {compatiblePlatforms.map(platform => (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all',
                    selectedPlatforms.includes(platform.id)
                      ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/10'
                      : 'border-[var(--border-default)] hover:border-[var(--purple-500)]/50'
                  )}
                >
                  <PlatformBadge platformId={platform.id} size="sm" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{platform.name}</div>
                    {platform.description && (
                      <div className="text-xs text-[var(--text-muted)]">
                        {platform.description}
                      </div>
                    )}
                  </div>
                  {selectedPlatforms.includes(platform.id) && (
                    <div className="text-[var(--purple-500)]">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Dialog.Footer>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border-default)]"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={selectedPlatforms.length === 0 || isExporting}
            className="px-4 py-2 rounded-lg bg-[var(--purple-500)] text-white disabled:opacity-50"
          >
            {isExporting
              ? 'Exporting...'
              : `Export to ${selectedPlatforms.length} platform(s)`}
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

## Example: Quick Export Button in Post Card

```tsx
// apps/web/components/post-card.tsx (enhanced)

import { PlatformBadgeGroup } from '@ryla/ui';
import { getPlatformsForAspectRatio } from '@ryla/shared';
import { ExportModal } from './export-modal';

export function PostCard({ post, onExport }: PostCardProps) {
  const [showExportModal, setShowExportModal] = React.useState(false);
  const compatiblePlatforms = getPlatformsForAspectRatio(post.aspectRatio);

  return (
    <>
      <div className="post-card">
        {/* ... existing card content ... */}
        
        {/* Quick export button with platform badges */}
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--purple-500)]/10 border border-[var(--purple-500)]/30 hover:bg-[var(--purple-500)]/20 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm">Export</span>
          {compatiblePlatforms.length > 0 && (
            <PlatformBadgeGroup
              platformIds={compatiblePlatforms.map(p => p.id)}
              size="sm"
              maxVisible={3}
            />
          )}
        </button>
      </div>

      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
        imageUrl={post.imageUrl}
        caption={post.caption}
        aspectRatio={post.aspectRatio}
      />
    </>
  );
}
```

## Usage in Studio Generation Bar

```tsx
// apps/web/components/studio/generation/studio-generation-bar.tsx

import { ASPECT_RATIOS } from './types';
import { PlatformBadgeGroup } from '@ryla/ui';

// In the aspect ratio selector section:
{ASPECT_RATIOS.map(ratio => (
  <button
    key={ratio.value}
    onClick={() => setAspectRatio(ratio.value)}
    className={cn(
      'relative p-2 rounded-lg border',
      aspectRatio === ratio.value && 'border-[var(--purple-500)]'
    )}
  >
    <div className="text-center">
      <div className="text-sm font-semibold">{ratio.label}</div>
      {ratio.platforms && (
        <div className="mt-1">
          <PlatformBadgeGroup
            platformIds={ratio.platforms}
            size="sm"
            maxVisible={2}
          />
        </div>
      )}
    </div>
  </button>
))}
```

## Key Integration Points

1. **Aspect Ratio Selector**: Show platform badges when selecting aspect ratios
2. **Export Modal**: Let users choose platforms to export to
3. **Post Cards**: Show compatible platforms and quick export
4. **Generation Settings**: Display platform compatibility in tooltips

## Next Steps

1. Implement the aspect ratio selector enhancement
2. Add export modal to post cards
3. Add platform tooltips in generation bar
4. Track export analytics (which platforms are used most)

