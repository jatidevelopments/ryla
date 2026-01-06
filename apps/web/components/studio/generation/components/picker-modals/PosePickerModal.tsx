'use client';

import * as React from 'react';
import { PosePicker } from '../../pickers/PosePicker';
import type { GenerationSettings } from '../../types';

interface PosePickerModalProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  studioNsfwEnabled: boolean;
  onClose: () => void;
}

export function PosePickerModal({
  settings,
  updateSetting,
  studioNsfwEnabled,
  onClose,
}: PosePickerModalProps) {
  return (
    <PosePicker
      selectedPoseId={settings.poseId}
      onPoseSelect={(id) => updateSetting('poseId', id)}
      onClose={onClose}
      nsfwEnabled={studioNsfwEnabled}
    />
  );
}

