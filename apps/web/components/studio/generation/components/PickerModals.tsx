'use client';

import * as React from 'react';
import type { GenerationSettings, StudioMode } from '../types';
import type { StudioImage } from '../../studio-image-card';
import {
  CharacterPickerModal,
  StylePickerModal,
  PosePickerModal,
  OutfitModeSelectorModal,
  PreComposedOutfitPickerModal,
  CustomCompositionPickerModal,
  ObjectPickerModal,
} from './picker-modals';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface PickerModalsProps {
  // Picker visibility state
  pickers: {
    showCharacterPicker: boolean;
    showStylePicker: boolean;
    showPosePicker: boolean;
    showOutfitModeSelector: boolean;
    showOutfitPicker: boolean;
    showObjectPicker: boolean;
    outfitMode: 'pre-composed' | 'custom' | null;
    setShowCharacterPicker: (show: boolean) => void;
    setShowStylePicker: (show: boolean) => void;
    setShowPosePicker: (show: boolean) => void;
    setShowOutfitModeSelector: (show: boolean) => void;
    setShowOutfitPicker: (show: boolean) => void;
    setShowObjectPicker: (show: boolean) => void;
    setOutfitMode: (mode: 'pre-composed' | 'custom' | null) => void;
  };

  // Settings
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;

  // Influencers
  influencers: Influencer[];
  onInfluencerChange?: (influencerId: string | null) => void;

  // Mode and content
  mode: StudioMode;
  studioNsfwEnabled: boolean;

  // Images
  selectedImage: StudioImage | null;
  availableImages: StudioImage[];

  // Upload consent
  hasUploadConsent?: boolean;
  onAcceptConsent?: () => Promise<void>;
  onUploadImage?: (file: File) => Promise<StudioImage | null>;
}

export function PickerModals({
  pickers,
  settings,
  updateSetting,
  influencers,
  onInfluencerChange,
  mode,
  studioNsfwEnabled,
  selectedImage,
  availableImages,
  hasUploadConsent = false,
  onAcceptConsent,
  onUploadImage,
}: PickerModalsProps) {
  return (
    <>
      {pickers.showCharacterPicker && (
        <CharacterPickerModal
          influencers={influencers}
          selectedInfluencerId={settings.influencerId}
          settings={settings}
          updateSetting={updateSetting}
          onInfluencerChange={onInfluencerChange}
          onClose={() => pickers.setShowCharacterPicker(false)}
        />
      )}

      {pickers.showStylePicker && (
        <StylePickerModal
          settings={settings}
          updateSetting={updateSetting}
          onClose={() => pickers.setShowStylePicker(false)}
        />
      )}

      {pickers.showPosePicker && (
        <PosePickerModal
          settings={settings}
          updateSetting={updateSetting}
          studioNsfwEnabled={studioNsfwEnabled}
          onClose={() => pickers.setShowPosePicker(false)}
        />
      )}

      {pickers.showOutfitModeSelector && (
        <OutfitModeSelectorModal
          onModeSelect={(mode) => {
            pickers.setOutfitMode(mode);
            pickers.setShowOutfitModeSelector(false);
            pickers.setShowOutfitPicker(true);
          }}
          onClose={() => pickers.setShowOutfitModeSelector(false)}
        />
      )}

      {pickers.showOutfitPicker && pickers.outfitMode === 'pre-composed' && (
        <PreComposedOutfitPickerModal
          settings={settings}
          updateSetting={updateSetting}
          studioNsfwEnabled={studioNsfwEnabled}
          onClose={() => {
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
        />
      )}

      {pickers.showOutfitPicker && pickers.outfitMode === 'custom' && (
        <CustomCompositionPickerModal
          settings={settings}
          updateSetting={updateSetting}
          studioNsfwEnabled={studioNsfwEnabled}
          onClose={() => {
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
        />
      )}

      {pickers.showObjectPicker && mode === 'editing' && (
        <ObjectPickerModal
          settings={settings}
          updateSetting={updateSetting}
          selectedImage={selectedImage}
          availableImages={availableImages}
          hasUploadConsent={hasUploadConsent}
          onAcceptConsent={onAcceptConsent}
          onUploadImage={onUploadImage}
          onClose={() => pickers.setShowObjectPicker(false)}
        />
      )}
    </>
  );
}

