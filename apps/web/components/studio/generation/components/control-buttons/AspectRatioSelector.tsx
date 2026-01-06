'use client';

import * as React from 'react';
import { Tooltip } from '../../../../ui/tooltip';
import { AspectRatioPicker } from '../../aspect-ratio-picker';
import { AspectRatioIcon } from '../../icons';
import type { GenerationSettings, AspectRatio } from '../../types';
import { ASPECT_RATIOS } from '../../types';

interface AspectRatioSelectorProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  showPicker: boolean;
  onTogglePicker: () => void;
  onClosePicker: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

export function AspectRatioSelector({
  settings,
  updateSetting,
  showPicker,
  onTogglePicker,
  onClosePicker,
  buttonRef,
}: AspectRatioSelectorProps) {
  return (
    <div className="relative">
      <Tooltip content="Aspect Ratio: Set the dimensions of generated images. 1:1 for square, 9:16 for stories, 16:9 for landscape.">
        <button
          ref={buttonRef}
          onClick={onTogglePicker}
          className="flex items-center gap-1.5 h-8 px-2 rounded-lg bg-white/5 text-[var(--text-primary)] text-xs font-medium hover:bg-white/10 transition-all"
        >
          <AspectRatioIcon ratio={settings.aspectRatio} className="h-3.5 w-3.5" />
          <span>{settings.aspectRatio}</span>
        </button>
      </Tooltip>
      {showPicker && (
        <AspectRatioPicker
          ratios={ASPECT_RATIOS}
          selectedRatio={settings.aspectRatio}
          placement="top"
          onSelect={(ratio) => {
            updateSetting('aspectRatio', ratio);
            onClosePicker();
          }}
          onClose={onClosePicker}
          anchorRef={buttonRef}
        />
      )}
    </div>
  );
}

