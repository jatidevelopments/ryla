'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { SelectedImageDisplay } from './SelectedImageDisplay';
import { InfluencerThumbnails } from './InfluencerThumbnails';
import { GenerateButton } from './GenerateButton';
import { getPromptPlaceholder } from '../utils/get-prompt-placeholder';
import type { StudioImage } from '../../studio-image-card';
import type { SelectedObject, StudioMode } from '../types';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface PromptInputRowProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onPromptSubmit: () => void;
  mode: StudioMode;
  selectedImage: StudioImage | null;
  selectedObjects: SelectedObject[];
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  canGenerate: boolean;
  creditsCost: number;
  onClearImage?: () => void;
  onRemoveObject: (objectId: string) => void;
  onAddObject: () => void;
  onSelectInfluencer: (id: string) => void;
  onShowInfluencerPicker: () => void;
}

export function PromptInputRow({
  prompt,
  onPromptChange,
  onPromptSubmit,
  mode,
  selectedImage,
  selectedObjects,
  influencers,
  selectedInfluencerId,
  canGenerate,
  creditsCost,
  onClearImage,
  onRemoveObject,
  onAddObject,
  onSelectInfluencer,
  onShowInfluencerPicker,
}: PromptInputRowProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <SelectedImageDisplay
        selectedImage={selectedImage}
        selectedObjects={selectedObjects}
        mode={mode}
        onClearImage={onClearImage}
        onRemoveObject={onRemoveObject}
        onAddObject={onAddObject}
      />

      {/* Prompt Input */}
      <div className="flex-1 relative min-w-0">
        <input
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canGenerate && !e.shiftKey) {
              e.preventDefault();
              onPromptSubmit();
            }
          }}
          disabled={mode === 'upscaling'}
          placeholder={getPromptPlaceholder(mode)}
          className={cn(
            'w-full h-11 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none transition-all',
            'truncate pr-2',
            mode === 'upscaling' && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            maxWidth: '100%',
          }}
        />
      </div>

      {/* Selected Influencer Thumbnails */}
      <InfluencerThumbnails
        influencers={influencers}
        selectedInfluencerId={selectedInfluencerId}
        onSelect={onSelectInfluencer}
        onShowMore={onShowInfluencerPicker}
      />

      {/* Generate/Edit Button */}
      <GenerateButton
        mode={mode}
        canGenerate={canGenerate}
        creditsCost={creditsCost}
        onGenerate={onPromptSubmit}
      />
    </div>
  );
}
