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
import { MobileSettingsMenu } from '../pickers';

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
    showMobileSettingsMenu: boolean;
    showModelPicker: boolean; // Added
    showAspectRatioPicker: boolean; // Added
    outfitMode: 'pre-composed' | 'custom' | null;
    setShowCharacterPicker: (show: boolean) => void;
    setShowStylePicker: (show: boolean) => void;
    setShowPosePicker: (show: boolean) => void;
    setShowOutfitModeSelector: (show: boolean) => void;
    setShowOutfitPicker: (show: boolean) => void;
    setShowObjectPicker: (show: boolean) => void;
    setShowMobileSettingsMenu: (show: boolean) => void;
    setShowModelPicker: (show: boolean) => void; // Added
    setShowAspectRatioPicker: (show: boolean) => void; // Added
    setOutfitMode: (mode: 'pre-composed' | 'custom' | null) => void;
  };

  // Settings
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => void;

  // Influencers
  influencers: Influencer[];
  onInfluencerChange?: (influencerId: string | null) => void;

  // Mode and content
  mode: StudioMode;
  studioNsfwEnabled: boolean;
  canEnableNSFW: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;

  // Images
  selectedImage: StudioImage | null;
  availableImages: StudioImage[];

  // Models
  selectedModelName?: string; // Added

  // Upload consent
  hasUploadConsent?: boolean;
  onAcceptConsent?: () => Promise<void>;
  onUploadImage?: (file: File) => Promise<StudioImage | null>;
  outfitDisplayText?: string;
  selectedPoseName?: string;
}

export function PickerModals({
  pickers,
  settings,
  updateSetting,
  influencers,
  onInfluencerChange,
  mode,
  studioNsfwEnabled,
  canEnableNSFW,
  setStudioNsfwEnabled,
  selectedImage,
  availableImages,
  hasUploadConsent = false,
  onAcceptConsent,
  onUploadImage,
  outfitDisplayText,
  selectedPoseName,
  selectedModelName,
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

      {pickers.showMobileSettingsMenu && (
        <MobileSettingsMenu
          onShowPosePicker={() => pickers.setShowPosePicker(true)}
          onShowOutfitPicker={() => pickers.setShowOutfitModeSelector(true)}
          onShowStylePicker={() => pickers.setShowStylePicker(true)}
          onShowModelPicker={() => pickers.setShowModelPicker(true)}
          onShowAspectRatioPicker={() => pickers.setShowAspectRatioPicker(true)}
          onShowCharacterPicker={() => pickers.setShowCharacterPicker(true)}
          onClose={() => pickers.setShowMobileSettingsMenu(false)}
          outfitDisplayText={outfitDisplayText}
          selectedPoseName={selectedPoseName}
          selectedModelName={selectedModelName}
          selectedCharacterName={
            influencers.find((i) => i.id === settings.influencerId)?.name ||
            'None'
          }
          currentAspectRatio={settings.aspectRatio}
          studioNsfwEnabled={studioNsfwEnabled}
          canEnableNSFW={canEnableNSFW}
          setStudioNsfwEnabled={setStudioNsfwEnabled}
        />
      )}
    </>
  );
}
