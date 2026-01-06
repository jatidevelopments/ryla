'use client';

import * as React from 'react';
import {
  ModelSelector,
  AspectRatioSelector,
  SettingsSection,
  CreativeControls,
  NSFWToggle,
} from './control-buttons';
import type { GenerationSettings, AIModel } from '../types';

interface ControlButtonsRowProps {
  // Settings
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  
  // Model selection
  availableModels: AIModel[];
  selectedModel: AIModel | null;
  
  // Picker state
  pickers: {
    showModelPicker: boolean;
    showAspectRatioPicker: boolean;
    showQualityPicker: boolean;
    showPosePicker: boolean;
    showOutfitModeSelector: boolean;
    showStylePicker: boolean;
    setShowModelPicker: (show: boolean) => void;
    setShowAspectRatioPicker: (show: boolean) => void;
    setShowQualityPicker: (show: boolean) => void;
    setShowPosePicker: (show: boolean) => void;
    setShowOutfitModeSelector: (show: boolean) => void;
    setShowStylePicker: (show: boolean) => void;
  };
  
  // Refs for picker positioning
  modelButtonRef: React.RefObject<HTMLButtonElement>;
  aspectRatioButtonRef: React.RefObject<HTMLButtonElement>;
  qualityButtonRef: React.RefObject<HTMLButtonElement>;
  
  // Mode visibility
  showAspectRatio: boolean;
  showPromptEnhance: boolean;
  showCreativeControls: boolean;
  
  // Computed values
  selectedPose: { id: string; name: string } | null;
  outfitDisplayText: string;
  hasOutfitComposition: boolean;
  
  // NSFW
  studioNsfwEnabled: boolean;
  canEnableNSFW: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;
  
  // Clear styles helper
  clearStyles: () => void;
}

export function ControlButtonsRow({
  settings,
  updateSetting,
  availableModels,
  selectedModel,
  pickers,
  modelButtonRef,
  aspectRatioButtonRef,
  qualityButtonRef,
  showAspectRatio,
  showPromptEnhance,
  showCreativeControls,
  selectedPose,
  outfitDisplayText,
  hasOutfitComposition,
  studioNsfwEnabled,
  canEnableNSFW,
  setStudioNsfwEnabled,
  clearStyles,
}: ControlButtonsRowProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-4 py-2 border-t border-white/5 overflow-x-auto scroll-hidden"
      data-tutorial-target="generation-controls"
    >
      {/* Model Selector */}
      <ModelSelector
        availableModels={availableModels}
        selectedModel={selectedModel}
        settings={settings}
        updateSetting={updateSetting}
        showPicker={pickers.showModelPicker}
        onTogglePicker={() => pickers.setShowModelPicker(!pickers.showModelPicker)}
        onClosePicker={() => pickers.setShowModelPicker(false)}
        buttonRef={modelButtonRef}
      />

      {/* Divider */}
      <div className="h-3.5 w-px bg-white/10" />

      {/* Aspect Ratio - Only show for creating/editing modes */}
      {showAspectRatio && (
        <>
          <AspectRatioSelector
            settings={settings}
            updateSetting={updateSetting}
            showPicker={pickers.showAspectRatioPicker}
            onTogglePicker={() => pickers.setShowAspectRatioPicker(!pickers.showAspectRatioPicker)}
            onClosePicker={() => pickers.setShowAspectRatioPicker(false)}
            buttonRef={aspectRatioButtonRef}
          />
          {/* Divider after aspect ratio */}
          <div className="h-3.5 w-px bg-white/10" />
        </>
      )}

      {/* Settings Section */}
      <SettingsSection
        settings={settings}
        updateSetting={updateSetting}
        showPromptEnhance={showPromptEnhance}
        showQualityPicker={pickers.showQualityPicker}
        onToggleQualityPicker={() => pickers.setShowQualityPicker(!pickers.showQualityPicker)}
        onCloseQualityPicker={() => pickers.setShowQualityPicker(false)}
        qualityButtonRef={qualityButtonRef}
      />

      {/* Creative Controls - Only show for creating/editing modes */}
      {showCreativeControls && (
        <CreativeControls
          settings={settings}
          updateSetting={updateSetting}
          selectedPose={selectedPose}
          outfitDisplayText={outfitDisplayText}
          hasOutfitComposition={hasOutfitComposition}
          onShowPosePicker={() => pickers.setShowPosePicker(true)}
          onShowOutfitModeSelector={() => pickers.setShowOutfitModeSelector(true)}
          onShowStylePicker={() => pickers.setShowStylePicker(true)}
          clearStyles={clearStyles}
        />
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Adult Content Toggle */}
      <NSFWToggle
        studioNsfwEnabled={studioNsfwEnabled}
        canEnableNSFW={canEnableNSFW}
        onToggle={() => setStudioNsfwEnabled(!studioNsfwEnabled)}
      />
    </div>
  );
}

