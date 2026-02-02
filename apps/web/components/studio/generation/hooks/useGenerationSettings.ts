'use client';

import * as React from 'react';
import type {
  GenerationSettings,
  StudioMode,
  ContentType,
  Quality,
  VideoDuration,
} from '../types';
import type { StudioImage } from '../../studio-image-card';
import { usePersistedSettings } from './use-persisted-settings';
import { useModelSelection } from './use-model-selection';
import { useOutfitDisplay } from './use-outfit-display';
import { useImageSettingsLoader } from './use-image-settings-loader';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface UseGenerationSettingsOptions {
  selectedInfluencer: Influencer | null;
  selectedImage: StudioImage | null;
  mode: StudioMode;
  contentType: ContentType;
  nsfwEnabled: boolean; // Influencer-level NSFW
}

interface UseGenerationSettingsReturn {
  // Settings state
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => void;

  // NSFW state (studio-level)
  studioNsfwEnabled: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;
  canEnableNSFW: boolean;

  // Model selection
  availableModels: ReturnType<typeof import('../types').getAIModelsForMode>;
  selectedModel:
    | ReturnType<typeof import('../types').getAIModelsForMode>[number]
    | null;

  // Computed values
  creditsCost: number;
  canGenerate: boolean;

  // Outfit helpers
  outfitDisplayText: string;
  hasOutfitComposition: boolean;

  // Clear styles helper
  clearStyles: () => void;
}

// Quality credits lookup (for images)
const QUALITY_CREDITS: Record<Quality, number> = {
  '1.5k': 20,
  '2k': 50,
  '4k': 80,
};

// Video duration credits lookup
const VIDEO_DURATION_CREDITS: Record<VideoDuration, number> = {
  2: 50,
  4: 100,
  6: 150,
  8: 200,
};

export function useGenerationSettings({
  selectedInfluencer,
  selectedImage,
  mode,
  contentType,
  nsfwEnabled,
}: UseGenerationSettingsOptions): UseGenerationSettingsReturn {
  // Local NSFW toggle state (separate from influencer-level nsfwEnabled)
  const [studioNsfwEnabled, setStudioNsfwEnabled] = React.useState(false);

  // Disable NSFW toggle if influencer doesn't have NSFW enabled
  const canEnableNSFW = nsfwEnabled;

  // Use extracted hook for localStorage persistence
  const {
    persistedSettings,

    updatePersistedSetting,
  } = usePersistedSettings();

  // Initialize settings state
  const [settings, setSettings] = React.useState<GenerationSettings>(() => ({
    ...persistedSettings,
    prompt: '', // Always start with empty prompt
    influencerId: selectedInfluencer?.id || null,
    mode,
    contentType,
    outfit: persistedSettings.outfit ?? null,
    objects: [], // Always start with empty objects
  }));

  // Update influencer when prop changes
  React.useEffect(() => {
    setSettings((prev) => {
      const newInfluencerId = selectedInfluencer?.id || null;
      if (prev.influencerId !== newInfluencerId) {
        return { ...prev, influencerId: newInfluencerId };
      }
      return prev;
    });
  }, [selectedInfluencer]);

  // Sync persisted settings when they change externally
  const persistedSettingsRef = React.useRef(persistedSettings);
  React.useEffect(() => {
    const prev = persistedSettingsRef.current;
    const changedFields: Partial<typeof persistedSettings> = {};

    if (prev.aspectRatio !== persistedSettings.aspectRatio)
      changedFields.aspectRatio = persistedSettings.aspectRatio;
    if (prev.quality !== persistedSettings.quality)
      changedFields.quality = persistedSettings.quality;
    if (prev.modelId !== persistedSettings.modelId)
      changedFields.modelId = persistedSettings.modelId;
    if (prev.styleId !== persistedSettings.styleId)
      changedFields.styleId = persistedSettings.styleId;
    if (prev.sceneId !== persistedSettings.sceneId)
      changedFields.sceneId = persistedSettings.sceneId;
    if (prev.lightingId !== persistedSettings.lightingId)
      changedFields.lightingId = persistedSettings.lightingId;
    if (prev.promptEnhance !== persistedSettings.promptEnhance)
      changedFields.promptEnhance = persistedSettings.promptEnhance;
    if (prev.batchSize !== persistedSettings.batchSize)
      changedFields.batchSize = persistedSettings.batchSize;
    if (prev.poseId !== persistedSettings.poseId)
      changedFields.poseId = persistedSettings.poseId;
    if (prev.outfit !== persistedSettings.outfit)
      changedFields.outfit = persistedSettings.outfit;

    if (Object.keys(changedFields).length > 0) {
      setSettings((prev) => ({
        ...prev,
        ...changedFields,
        prompt: prev.prompt,
        influencerId: prev.influencerId,
        mode,
        contentType,
        objects: prev.objects,
      }));
    }

    persistedSettingsRef.current = persistedSettings;
  }, [persistedSettings, mode, contentType]);

  // Clear objects when switching away from editing mode
  React.useEffect(() => {
    if (mode !== 'editing' && settings.objects.length > 0) {
      setSettings((prev) => ({ ...prev, objects: [] }));
    }
  }, [mode]);

  // Use extracted hook for loading settings from selected image
  const { imageSettings, imageNsfw } = useImageSettingsLoader({
    selectedImage,
    mode,
    currentSettings: settings,
  });

  // Apply image settings when they change
  React.useEffect(() => {
    if (imageSettings) {
      setSettings((prev) => ({
        ...prev,
        ...imageSettings,
      }));
    } else if (!selectedImage || mode === 'creating') {
      setSettings((prev) => ({ ...prev, prompt: '' }));
    }
  }, [imageSettings, selectedImage, mode]);

  // Apply NSFW setting from image
  React.useEffect(() => {
    if (imageNsfw !== null) {
      setStudioNsfwEnabled(imageNsfw);
    }
  }, [imageNsfw]);

  // Use extracted hook for model selection
  const { availableModels, selectedModel, shouldResetModel, defaultModelId } =
    useModelSelection({
      mode,
      studioNsfwEnabled,
      currentModelId: settings.modelId,
    });

  // Reset modelId if current selection is not available
  React.useEffect(() => {
    if (shouldResetModel && defaultModelId) {
      setSettings((prev) => ({ ...prev, modelId: defaultModelId }));
      updatePersistedSetting('modelId', defaultModelId);
    }
  }, [shouldResetModel, defaultModelId, updatePersistedSetting]);

  // Calculate credits cost based on content type
  const creditsCost = React.useMemo(() => {
    if (contentType === 'video') {
      const videoDuration = settings.videoDuration ?? 4;
      return VIDEO_DURATION_CREDITS[videoDuration] || 100;
    }
    return (QUALITY_CREDITS[settings.quality] || 20) * settings.batchSize;
  }, [
    contentType,
    settings.videoDuration,
    settings.quality,
    settings.batchSize,
  ]);

  // Update setting and persist to localStorage
  const updateSetting = React.useCallback(
    <K extends keyof GenerationSettings>(
      key: K,
      value: GenerationSettings[K]
    ) => {
      setSettings((prev) => {
        const updated = { ...prev, [key]: value };

        // Persist to localStorage (excluding context-specific fields)
        if (
          key !== 'prompt' &&
          key !== 'influencerId' &&
          key !== 'mode' &&
          key !== 'contentType' &&
          key !== 'objects'
        ) {
          updatePersistedSetting(
            key as keyof typeof persistedSettings,
            value as never
          );
        }

        return updated;
      });
    },
    [updatePersistedSetting]
  );

  // Validation: can we generate?
  const canGenerate = React.useMemo(() => {
    if (!settings.influencerId) return false;

    if (mode === 'creating') return true;

    if (mode === 'editing' || mode === 'upscaling') {
      return selectedImage !== null;
    }

    return false;
  }, [settings.influencerId, mode, selectedImage]);

  // Use extracted hook for outfit display
  const { outfitDisplayText, hasOutfitComposition } = useOutfitDisplay({
    outfit: settings.outfit,
  });

  // Clear styles helper
  const clearStyles = React.useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      styleId: null,
      sceneId: null,
      lightingId: null,
    }));
    updatePersistedSetting('styleId', null);
    updatePersistedSetting('sceneId', null);
    updatePersistedSetting('lightingId', null);
  }, [updatePersistedSetting]);

  return {
    settings,
    updateSetting,
    studioNsfwEnabled,
    setStudioNsfwEnabled,
    canEnableNSFW,
    availableModels,
    selectedModel,
    creditsCost,
    canGenerate,
    outfitDisplayText,
    hasOutfitComposition,
    clearStyles,
  };
}
