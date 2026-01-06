'use client';

import * as React from 'react';
import { OutfitModeSelector } from '../../pickers/OutfitModeSelector';

interface OutfitModeSelectorModalProps {
  onModeSelect: (mode: 'pre-composed' | 'custom') => void;
  onClose: () => void;
}

export function OutfitModeSelectorModal({
  onModeSelect,
  onClose,
}: OutfitModeSelectorModalProps) {
  return (
    <OutfitModeSelector
      onModeSelect={(mode) => {
        onModeSelect(mode);
        onClose();
      }}
      onClose={onClose}
    />
  );
}

