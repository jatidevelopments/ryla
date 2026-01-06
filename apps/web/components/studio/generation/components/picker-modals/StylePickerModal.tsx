'use client';

import * as React from 'react';
import { StylePicker } from '../../pickers/StylePicker';
import type { GenerationSettings } from '../../types';

interface StylePickerModalProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onClose: () => void;
}

export function StylePickerModal({
  settings,
  updateSetting,
  onClose,
}: StylePickerModalProps) {
  return (
    <StylePicker
      selectedStyleId={settings.styleId}
      selectedSceneId={settings.sceneId}
      selectedLightingId={settings.lightingId}
      onStyleSelect={(id) => updateSetting('styleId', id)}
      onSceneSelect={(id) => updateSetting('sceneId', id)}
      onLightingSelect={(id) => updateSetting('lightingId', id)}
      onClose={onClose}
    />
  );
}

