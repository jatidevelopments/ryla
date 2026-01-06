'use client';

import * as React from 'react';
import { CharacterPicker } from '../../pickers/CharacterPicker';
import type { GenerationSettings } from '../../types';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface CharacterPickerModalProps {
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  onInfluencerChange?: (influencerId: string | null) => void;
  onClose: () => void;
}

export function CharacterPickerModal({
  influencers,
  selectedInfluencerId,
  settings,
  updateSetting,
  onInfluencerChange,
  onClose,
}: CharacterPickerModalProps) {
  return (
    <CharacterPicker
      influencers={influencers}
      selectedInfluencerId={selectedInfluencerId}
      onSelect={(id) => {
        updateSetting('influencerId', id);
        onClose();
        // Sync to top bar
        if (onInfluencerChange) {
          onInfluencerChange(id);
        }
      }}
      onClose={onClose}
    />
  );
}

