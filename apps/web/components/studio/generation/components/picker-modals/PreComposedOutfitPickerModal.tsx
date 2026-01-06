'use client';

import * as React from 'react';
import { PreComposedOutfitPicker } from '../../pickers/PreComposedOutfitPicker';
import type { GenerationSettings } from '../../types';

interface PreComposedOutfitPickerModalProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  studioNsfwEnabled: boolean;
  onClose: () => void;
}

export function PreComposedOutfitPickerModal({
  settings,
  updateSetting,
  studioNsfwEnabled,
  onClose,
}: PreComposedOutfitPickerModalProps) {
  const selectedOutfit =
    typeof settings.outfit === 'string' ? settings.outfit : null;

  return (
    <PreComposedOutfitPicker
      selectedOutfit={selectedOutfit}
      onOutfitSelect={(outfit) => {
        updateSetting('outfit', outfit);
        onClose();
      }}
      onClose={onClose}
      nsfwEnabled={studioNsfwEnabled}
    />
  );
}

