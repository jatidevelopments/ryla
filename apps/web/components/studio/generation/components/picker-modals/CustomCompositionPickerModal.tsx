'use client';

import * as React from 'react';
import { OutfitCompositionPicker } from '../../pickers/OutfitCompositionPicker';
import { OutfitComposition } from '@ryla/shared';
import type { GenerationSettings } from '../../types';

interface CustomCompositionPickerModalProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  studioNsfwEnabled: boolean;
  onClose: () => void;
}

export function CustomCompositionPickerModal({
  settings,
  updateSetting,
  studioNsfwEnabled,
  onClose,
}: CustomCompositionPickerModalProps) {
  const selectedComposition =
    typeof settings.outfit === 'object' && settings.outfit !== null
      ? (settings.outfit as OutfitComposition)
      : null;

  return (
    <OutfitCompositionPicker
      selectedComposition={selectedComposition}
      onCompositionSelect={(composition) => {
        updateSetting('outfit', composition);
        onClose();
      }}
      onClose={onClose}
      nsfwEnabled={studioNsfwEnabled}
      influencerId={settings.influencerId || undefined}
    />
  );
}

