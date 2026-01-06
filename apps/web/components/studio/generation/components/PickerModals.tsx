'use client';

import * as React from 'react';
import { CharacterPicker } from '../character-picker';
import { StylePicker } from '../style-picker';
import { PosePicker } from '../pose-picker';
import { OutfitModeSelector } from '../outfit-mode-selector';
import { PreComposedOutfitPicker } from '../pre-composed-outfit-picker';
import { OutfitCompositionPicker } from '../outfit-composition-picker';
import { ObjectPicker } from '../object-picker';
import { OutfitComposition } from '@ryla/shared';
import type { GenerationSettings, StudioMode, SelectedObject } from '../types';
import type { StudioImage } from '../../studio-image-card';

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
      {/* Character Picker Modal */}
      {pickers.showCharacterPicker && (
        <CharacterPicker
          influencers={influencers}
          selectedInfluencerId={settings.influencerId}
          onSelect={(id) => {
            updateSetting('influencerId', id);
            pickers.setShowCharacterPicker(false);
            // Sync to top bar
            if (onInfluencerChange) {
              onInfluencerChange(id);
            }
          }}
          onClose={() => pickers.setShowCharacterPicker(false)}
        />
      )}

      {/* Style Picker Modal */}
      {pickers.showStylePicker && (
        <StylePicker
          selectedStyleId={settings.styleId}
          selectedSceneId={settings.sceneId}
          selectedLightingId={settings.lightingId}
          onStyleSelect={(id) => updateSetting('styleId', id)}
          onSceneSelect={(id) => updateSetting('sceneId', id)}
          onLightingSelect={(id) => updateSetting('lightingId', id)}
          onClose={() => pickers.setShowStylePicker(false)}
        />
      )}

      {/* Pose Picker Modal */}
      {pickers.showPosePicker && (
        <PosePicker
          selectedPoseId={settings.poseId}
          onPoseSelect={(id) => updateSetting('poseId', id)}
          onClose={() => pickers.setShowPosePicker(false)}
          nsfwEnabled={studioNsfwEnabled}
        />
      )}

      {/* Outfit Mode Selector */}
      {pickers.showOutfitModeSelector && (
        <OutfitModeSelector
          onModeSelect={(mode) => {
            pickers.setOutfitMode(mode);
            pickers.setShowOutfitModeSelector(false);
            pickers.setShowOutfitPicker(true);
          }}
          onClose={() => pickers.setShowOutfitModeSelector(false)}
        />
      )}

      {/* Pre-Composed Outfit Picker */}
      {pickers.showOutfitPicker && pickers.outfitMode === 'pre-composed' && (
        <PreComposedOutfitPicker
          selectedOutfit={
            typeof settings.outfit === 'string' ? settings.outfit : null
          }
          onOutfitSelect={(outfit) => {
            updateSetting('outfit', outfit);
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
          onClose={() => {
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
          nsfwEnabled={studioNsfwEnabled}
        />
      )}

      {/* Custom Composition Picker */}
      {pickers.showOutfitPicker && pickers.outfitMode === 'custom' && (
        <OutfitCompositionPicker
          selectedComposition={
            typeof settings.outfit === 'object' && settings.outfit !== null
              ? (settings.outfit as OutfitComposition)
              : null
          }
          onCompositionSelect={(composition) => {
            updateSetting('outfit', composition);
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
          onClose={() => {
            pickers.setShowOutfitPicker(false);
            pickers.setOutfitMode(null);
          }}
          nsfwEnabled={studioNsfwEnabled}
          influencerId={settings.influencerId || undefined}
        />
      )}

      {/* Object Picker Modal */}
      {pickers.showObjectPicker && mode === 'editing' && (
        <ObjectPicker
          availableImages={availableImages.filter(img => img.id !== selectedImage?.id)}
          selectedObjectIds={settings.objects.map(obj => obj.id)}
          onObjectSelect={(image) => {
            const newObject: SelectedObject = {
              id: image.id,
              imageUrl: image.imageUrl,
              thumbnailUrl: image.thumbnailUrl,
              name: image.prompt || image.influencerName,
            };
            updateSetting('objects', [...settings.objects, newObject]);
          }}
          onObjectRemove={(imageId) => {
            updateSetting('objects', settings.objects.filter(obj => obj.id !== imageId));
          }}
          onClose={() => pickers.setShowObjectPicker(false)}
          maxObjects={3}
          hasUploadConsent={hasUploadConsent}
          onConsentAccept={onAcceptConsent}
          onUploadImage={onUploadImage}
        />
      )}
    </>
  );
}

