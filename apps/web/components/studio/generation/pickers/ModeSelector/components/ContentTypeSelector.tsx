'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';
import type { ContentType } from '../../types';

interface ContentTypeSelectorProps {
  contentType: ContentType;
  onContentTypeChange: (type: ContentType) => void;
}

export function ContentTypeSelector({
  contentType,
  onContentTypeChange,
}: ContentTypeSelectorProps) {
  return (
    <div className="flex items-center gap-2" data-tutorial-target="content-type-selector">
      <button
        onClick={() => onContentTypeChange('image')}
        className={cn(
          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
          contentType === 'image'
            ? 'bg-white/10 text-white'
            : 'text-white/50 hover:text-white hover:bg-white/5'
        )}
      >
        Image
      </button>
      <Tooltip content="Video generation is coming soon!">
        <button
          onClick={(e) => {
            e.preventDefault();
            // Video generation is not yet available
          }}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium transition-all relative',
            'text-white/40 cursor-not-allowed',
            'hover:text-white/50'
          )}
          disabled
        >
          Video
          <span className="absolute -top-0.5 -right-0.5 text-[7px] text-orange-400 font-bold bg-orange-400/20 px-1 py-0.5 rounded uppercase tracking-wider">
            Soon
          </span>
        </button>
      </Tooltip>
    </div>
  );
}

