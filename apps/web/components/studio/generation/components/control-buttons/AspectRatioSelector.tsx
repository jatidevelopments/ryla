'use client';

import * as React from 'react';
import { Tooltip } from '../../../../ui/tooltip';
import { AspectRatioPicker } from '../../pickers/AspectRatioPicker';
import { AspectRatioIcon } from '../../icons';
import type { GenerationSettings, AspectRatio } from '../../types';
import { ASPECT_RATIOS } from '../../types';

interface AspectRatioSelectorProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => void;
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
          className="flex items-center gap-1.5 md:gap-2 min-h-[44px] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl bg-white/5 text-[var(--text-primary)] text-sm font-medium hover:bg-white/10 transition-all"
        >
          <AspectRatioIcon
            ratio={settings.aspectRatio}
            className="h-4 w-4 text-[var(--purple-400)]"
          />
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
