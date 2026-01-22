'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import {
  ModelSelector,
  AspectRatioSelector,
  SettingsSection,
  CreativeControls,
  NSFWToggle,
} from './control-buttons';
import { SelectedImageDisplay } from './SelectedImageDisplay';
import { GenerateButton } from './GenerateButton';
import type { StudioImage } from '../../studio-image-card';
import type {
  SelectedObject,
  StudioMode,
  GenerationSettings,
  AIModel,
} from '../types';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface ControlButtonsRowProps {
  // Settings
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => void;

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
    showMobileSettingsMenu: boolean;
    setShowModelPicker: (show: boolean) => void;
    setShowAspectRatioPicker: (show: boolean) => void;
    setShowQualityPicker: (show: boolean) => void;
    setShowPosePicker: (show: boolean) => void;
    setShowOutfitModeSelector: (show: boolean) => void;
    setShowStylePicker: (show: boolean) => void;
    setShowMobileSettingsMenu: (show: boolean) => void;
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
  selectedPose: { id: string; name: string } | null | undefined;
  outfitDisplayText: string;
  hasOutfitComposition: boolean;

  // NSFW
  studioNsfwEnabled: boolean;
  canEnableNSFW: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;

  // Moved from PromptInputRow
  selectedImage: StudioImage | null;
  selectedObjects: SelectedObject[];
  onAddObject: () => void;
  onRemoveObject: (objectId: string) => void;
  onClearImage?: () => void;
  mode: StudioMode;
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  onShowInfluencerPicker: () => void;
  onPromptSubmit: () => void;
  canGenerate: boolean;
  creditsCost: number;
  isGenerating?: boolean;

  // Clear styles helper
  clearStyles: () => void;

  // Tutorial state
  tutorialCurrentStep?: number;
  tutorialIsActive?: boolean;
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
  selectedImage,
  selectedObjects,
  onAddObject,
  onRemoveObject,
  onClearImage,
  mode,
  influencers,
  selectedInfluencerId,
  onShowInfluencerPicker,
  onPromptSubmit,
  canGenerate,
  creditsCost,
  isGenerating = false,
  clearStyles,
  tutorialCurrentStep = -1,
  tutorialIsActive = false,
}: ControlButtonsRowProps) {
  // Auto-expand advanced when tutorial is on generation-settings step (index 4)
  const shouldAutoExpand = tutorialIsActive && tutorialCurrentStep === 4;
  const [showAdvanced, setShowAdvanced] = React.useState(shouldAutoExpand);

  // Update when tutorial step changes
  React.useEffect(() => {
    if (shouldAutoExpand) {
      setShowAdvanced(true);
    }
  }, [shouldAutoExpand]);

  return (
    <div
      className="flex items-center gap-1.5 md:gap-1.5 px-3 md:px-4 py-2.5 md:py-2 border-t border-white/5 overflow-x-auto scroll-hidden"
      data-tutorial-target="generation-controls"
    >
      {/* Mobile-only: Image Select Options */}
      <div className="flex md:hidden">
        <SelectedImageDisplay
          selectedImage={selectedImage}
          selectedObjects={selectedObjects}
          mode={mode}
          onClearImage={onClearImage}
          onRemoveObject={onRemoveObject}
          onAddObject={onAddObject}
        />
      </div>

      {/* Mobile-only: Divider if image is showing */}
      <div className="flex md:hidden h-3 w-px bg-white/10" />

      {/* Model Selector - Hidden on mobile, moved to settings menu */}
      <div className="hidden md:block">
        <ModelSelector
          availableModels={availableModels}
          selectedModel={selectedModel}
          settings={settings}
          updateSetting={updateSetting}
          showPicker={pickers.showModelPicker}
          onTogglePicker={() =>
            pickers.setShowModelPicker(!pickers.showModelPicker)
          }
          onClosePicker={() => pickers.setShowModelPicker(false)}
          buttonRef={modelButtonRef}
        />
      </div>

      {/* Divider - Hidden on mobile */}
      <div className="hidden md:block h-3 md:h-3.5 w-px bg-white/10" />

      {/* Aspect Ratio - Only show for creating/editing modes - Hidden on mobile, moved to settings menu */}
      {showAspectRatio && (
        <>
          <div className="hidden md:block">
            <AspectRatioSelector
              settings={settings}
              updateSetting={updateSetting}
              showPicker={pickers.showAspectRatioPicker}
              onTogglePicker={() =>
                pickers.setShowAspectRatioPicker(!pickers.showAspectRatioPicker)
              }
              onClosePicker={() => pickers.setShowAspectRatioPicker(false)}
              buttonRef={aspectRatioButtonRef}
            />
          </div>
          {/* Divider after aspect ratio */}
          <div className="hidden md:block h-3 md:h-3.5 w-px bg-white/10" />
        </>
      )}

      {/* Settings Section - Hidden on mobile, show essential only */}
      <div className="hidden md:contents">
        <SettingsSection
          settings={settings}
          updateSetting={updateSetting}
          showPromptEnhance={showPromptEnhance}
          showQualityPicker={pickers.showQualityPicker}
          onToggleQualityPicker={() =>
            pickers.setShowQualityPicker(!pickers.showQualityPicker)
          }
          onCloseQualityPicker={() => pickers.setShowQualityPicker(false)}
          qualityButtonRef={qualityButtonRef}
        />
      </div>

      {/* Creative Controls - Progressive Disclosure */}
      {showCreativeControls && (
        <>
          {/* Advanced Toggle Button */}
          <div className="hidden md:block">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                'flex items-center gap-1.5 min-h-[44px] px-3 py-2.5 rounded-2xl text-sm font-medium transition-all',
                showAdvanced
                  ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                  : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn(
                  'h-3.5 w-3.5 transition-transform',
                  showAdvanced && 'rotate-180'
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Advanced</span>
            </button>
          </div>

          {/* Advanced Controls - Collapsible */}
          {showAdvanced && (
            <div className="hidden md:contents">
              <CreativeControls
                settings={settings}
                updateSetting={updateSetting}
                selectedPose={selectedPose}
                outfitDisplayText={outfitDisplayText}
                hasOutfitComposition={hasOutfitComposition}
                onShowPosePicker={() => pickers.setShowPosePicker(true)}
                onShowOutfitModeSelector={() =>
                  pickers.setShowOutfitModeSelector(true)
                }
                onShowStylePicker={() => pickers.setShowStylePicker(true)}
                clearStyles={clearStyles}
              />
            </div>
          )}
        </>
      )}

      {/* Mobile: Quick settings button */}
      <button
        onClick={() => pickers.setShowMobileSettingsMenu(true)}
        className="flex md:hidden items-center gap-1.5 px-3 min-h-[44px] rounded-2xl bg-white/5 text-sm text-[var(--text-secondary)] hover:bg-white/10 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
        <span>Settings</span>
      </button>

      {/* Spacer */}
      <div className="flex-1 min-w-1 md:block hidden" />

      {/* Mobile-only: Generate Button (GO) */}
      <div className="flex md:hidden ml-auto">
        <GenerateButton
          mode={mode}
          canGenerate={canGenerate}
          creditsCost={creditsCost}
          isGenerating={isGenerating}
          onGenerate={onPromptSubmit}
        />
      </div>

      {/* Adult Content Toggle - Hidden on mobile, moved to settings menu */}
      <div className="hidden md:block">
        <NSFWToggle
          studioNsfwEnabled={studioNsfwEnabled}
          canEnableNSFW={canEnableNSFW}
          onToggle={() => setStudioNsfwEnabled(!studioNsfwEnabled)}
        />
      </div>
    </div>
  );
}
