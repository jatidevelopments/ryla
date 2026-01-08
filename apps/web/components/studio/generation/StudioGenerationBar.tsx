'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { GenerationSettings } from './types';
import { QUALITY_OPTIONS, ALL_POSES } from './types';
import type { StudioImage } from '../studio-image-card';
import { ModeSelector } from './pickers/ModeSelector';
import type { StudioMode, ContentType } from './types';
import {
  useGenerationSettings,
  usePickerState,
  useModeChangeHandler,
  useGenerationValidation,
  useControlVisibility,
} from './hooks';
import { PromptInputRow, ControlButtonsRow, PickerModals } from './components';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface StudioGenerationBarProps {
  influencers: Influencer[];
  selectedInfluencer: Influencer | null;
  onInfluencerChange?: (influencerId: string | null) => void; // Callback when influencer changes in bottom toolbar
  onGenerate: (settings: GenerationSettings) => void;
  isGenerating?: boolean;
  creditsAvailable?: number;
  selectedImage?: StudioImage | null;
  onClearSelectedImage?: () => void;
  mode: StudioMode;
  contentType: ContentType;
  onModeChange: (mode: StudioMode) => void;
  onContentTypeChange: (type: ContentType) => void;
  nsfwEnabled: boolean;
  availableImages?: StudioImage[]; // Images available for object selection
  hasUploadConsent?: boolean; // Whether user has accepted upload consent
  onAcceptConsent?: () => Promise<void>; // Handler to accept consent
  onUploadImage?: (file: File) => Promise<StudioImage | null>; // Handler to upload image
  className?: string;
}

export function StudioGenerationBar({
  influencers,
  selectedInfluencer,
  onInfluencerChange,
  onGenerate,
  isGenerating = false,
  creditsAvailable = 250,
  selectedImage = null,
  onClearSelectedImage,
  mode,
  contentType,
  onModeChange,
  onContentTypeChange,
  nsfwEnabled,
  availableImages = [],
  hasUploadConsent = false,
  onAcceptConsent,
  onUploadImage,
  className,
}: StudioGenerationBarProps) {
  // Use extracted hook for mode change handling
  const { handleModeChange } = useModeChangeHandler({
    selectedImage,
    mode,
    onModeChange,
    onClearSelectedImage,
  });

  // Use extracted hooks for state management
  const {
    settings,
    updateSetting,
    studioNsfwEnabled,
    setStudioNsfwEnabled,
    canEnableNSFW,
    availableModels,
    selectedModel,
    creditsCost,
    outfitDisplayText,
    hasOutfitComposition,
    clearStyles,
  } = useGenerationSettings({
    selectedInfluencer,
    selectedImage,
    mode,
    contentType,
    nsfwEnabled,
  });

  // Use extracted hook for picker visibility
  const pickers = usePickerState();

  // Button refs for picker positioning
  const modelButtonRef = React.useRef<HTMLButtonElement>(null);
  const aspectRatioButtonRef = React.useRef<HTMLButtonElement>(null);
  const qualityButtonRef = React.useRef<HTMLButtonElement>(null);

  // Computed values
  const selectedPose = settings.poseId
    ? ALL_POSES.find((p) => p.id === settings.poseId)
    : null;

  const handleGenerate = () => {
    // Allow generation without influencer (for "All Images" mode)
    // if (!settings.influencerId) return;

    // Validation based on mode
    // Note: prompt is now optional - backend builds it from character DNA and settings
    if ((mode === 'editing' || mode === 'upscaling') && !selectedImage) return;

    // If no influencer selected, we can't generate (need at least one)
    if (!settings.influencerId) {
      // Show a message or prevent generation
      return;
    }

    const finalSettings = {
      ...settings,
      nsfw: studioNsfwEnabled, // Pass Studio-level NSFW toggle
    };
    onGenerate(finalSettings);
  };

  // Use extracted hooks for validation and visibility
  const { canGenerate } = useGenerationValidation({
    settings,
    mode,
    selectedImage,
    creditsAvailable,
    creditsCost,
  });

  const { showCreativeControls, showAspectRatio, showPromptEnhance } =
    useControlVisibility(mode);

  return (
    <div
      className={cn(
        'mx-3 md:mx-4 mb-4 md:mb-1 lg:mx-6 lg:mb-2 pointer-events-auto',
        className
      )}
    >
      <div
        className="flex flex-col rounded-2xl md:rounded-3xl bg-[var(--bg-elevated)]/95 backdrop-blur-xl border-2 shadow-xl md:shadow-2xl shadow-black/40 overflow-hidden transition-all duration-300"
        style={{
          borderColor:
            mode === 'creating'
              ? '#3b82f6'
              : mode === 'editing'
              ? '#a855f7'
              : mode === 'upscaling'
              ? '#22c55e'
              : '#f97316',
        }}
      >
        {/* Mode Selector */}
        <ModeSelector
          mode={mode}
          contentType={contentType}
          onModeChange={handleModeChange}
          onContentTypeChange={onContentTypeChange}
          hasSelectedImage={!!selectedImage}
          creditsAvailable={creditsAvailable}
          className="bg-transparent"
        />

        {/* Generation Content */}
        <div className="flex flex-col">
          {/* Prompt Input Row */}
          <PromptInputRow
            prompt={settings.prompt}
            onPromptChange={(prompt) => updateSetting('prompt', prompt)}
            onPromptSubmit={handleGenerate}
            mode={mode}
            selectedImage={selectedImage}
            selectedObjects={settings.objects}
            influencers={influencers}
            selectedInfluencerId={settings.influencerId}
            canGenerate={canGenerate}
            creditsCost={creditsCost}
            onClearImage={onClearSelectedImage}
            onRemoveObject={(objectId) =>
              updateSetting(
                'objects',
                settings.objects.filter((o) => o.id !== objectId)
              )
            }
            onAddObject={() => pickers.setShowObjectPicker(true)}
            onSelectInfluencer={(id) => {
              updateSetting('influencerId', id);
              pickers.setShowCharacterPicker(false);
              if (onInfluencerChange) {
                onInfluencerChange(id);
              }
            }}
            onShowInfluencerPicker={() => pickers.setShowCharacterPicker(true)}
          />

          {/* Controls Row */}
          <ControlButtonsRow
            settings={settings}
            updateSetting={updateSetting}
            availableModels={availableModels}
            selectedModel={selectedModel}
            pickers={pickers}
            modelButtonRef={modelButtonRef}
            aspectRatioButtonRef={aspectRatioButtonRef}
            qualityButtonRef={qualityButtonRef}
            showAspectRatio={showAspectRatio}
            showPromptEnhance={showPromptEnhance}
            showCreativeControls={showCreativeControls}
            selectedPose={selectedPose}
            outfitDisplayText={outfitDisplayText}
            hasOutfitComposition={hasOutfitComposition}
            studioNsfwEnabled={studioNsfwEnabled}
            canEnableNSFW={canEnableNSFW}
            setStudioNsfwEnabled={setStudioNsfwEnabled}
            clearStyles={clearStyles}
            // Shared props for mobile layout
            selectedImage={selectedImage}
            selectedObjects={settings.objects}
            onAddObject={() => pickers.setShowObjectPicker(true)}
            onRemoveObject={(objectId) =>
              updateSetting(
                'objects',
                settings.objects.filter((o) => o.id !== objectId)
              )
            }
            onClearImage={onClearSelectedImage}
            mode={mode}
            influencers={influencers}
            selectedInfluencerId={settings.influencerId}
            onShowInfluencerPicker={() => pickers.setShowCharacterPicker(true)}
            onPromptSubmit={handleGenerate}
            canGenerate={canGenerate}
            creditsCost={creditsCost}
          />
        </div>

        {/* Picker Modals */}
        <PickerModals
          pickers={pickers}
          settings={settings}
          updateSetting={updateSetting}
          influencers={influencers}
          onInfluencerChange={onInfluencerChange}
          mode={mode}
          studioNsfwEnabled={studioNsfwEnabled}
          canEnableNSFW={canEnableNSFW}
          setStudioNsfwEnabled={setStudioNsfwEnabled}
          selectedImage={selectedImage}
          availableImages={availableImages}
          hasUploadConsent={hasUploadConsent}
          onAcceptConsent={onAcceptConsent}
          onUploadImage={onUploadImage}
          outfitDisplayText={outfitDisplayText}
          selectedPoseName={selectedPose?.name}
          selectedModelName={selectedModel?.name}
        />
      </div>
    </div>
  );
}

// ModelIcon and AspectRatioIcon are now imported from ./icons
