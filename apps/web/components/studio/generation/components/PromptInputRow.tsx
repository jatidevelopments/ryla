'use client';

import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
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
  isGenerating?: boolean;
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
  isGenerating = false,
  onClearImage,
  onRemoveObject,
  onAddObject,
  onSelectInfluencer,
  onShowInfluencerPicker,
}: PromptInputRowProps) {
  return (
    <div className="flex items-center gap-1.5 md:gap-3 px-2 md:px-5 py-2 md:py-4">
      <div className="hidden md:flex">
        <SelectedImageDisplay
          selectedImage={selectedImage}
          selectedObjects={selectedObjects}
          mode={mode}
          onClearImage={onClearImage}
          onRemoveObject={onRemoveObject}
          onAddObject={onAddObject}
        />
      </div>

      {/* Prompt Input */}
      <div className="flex-1 min-w-0">
        <div
          className={cn(
            'relative w-full rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 px-4 py-1 transition-all focus-within:bg-white/8 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10',
            mode === 'upscaling' && 'opacity-50 pointer-events-none'
          )}
        >
          <TextareaAutosize
            value={prompt}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onPromptChange(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canGenerate) {
                  onPromptSubmit();
                }
              }
            }}
            disabled={mode === 'upscaling'}
            placeholder={getPromptPlaceholder(mode)}
            maxRows={4}
            className={cn(
              'w-full bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none resize-none py-1.5 min-h-[20px] transition-all',
              mode === 'upscaling' && 'cursor-not-allowed'
            )}
          />
        </div>
      </div>

      {/* Selected Influencer Thumbnails - Hidden on mobile, show picker button instead */}
      <div className="hidden md:flex">
        <InfluencerThumbnails
          influencers={influencers}
          selectedInfluencerId={selectedInfluencerId}
          onSelect={onSelectInfluencer}
          onShowMore={onShowInfluencerPicker}
        />
      </div>

      {/* Mobile: Simple influencer button - HIDDEN because moved to bottom */}
      {/* <button
        onClick={onShowInfluencerPicker}
        className="flex md:hidden items-center justify-center w-11 h-11 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0"
      >
        ...
      </button> */}

      {/* Generate/Edit Button - HIDDEN on mobile because moved to bottom */}
      <div className="hidden md:flex">
        <GenerateButton
          mode={mode}
          canGenerate={canGenerate}
          creditsCost={creditsCost}
          isGenerating={isGenerating}
          onGenerate={onPromptSubmit}
        />
      </div>
    </div>
  );
}
