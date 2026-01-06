'use client';

import * as React from 'react';
import { useLocalStorage } from '../../../../lib/hooks/use-local-storage';
import type { 
  GenerationSettings, 
  StudioMode, 
  ContentType,
  AspectRatio,
  Quality,
  SelectedObject,
} from '../types';
import { 
  DEFAULT_GENERATION_SETTINGS, 
  getAIModelsForMode,
} from '../types';
import type { OutfitComposition } from '@ryla/shared';
import type { StudioImage } from '../../studio-image-card';

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
  updateSetting: <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => void;
  
  // NSFW state (studio-level)
  studioNsfwEnabled: boolean;
  setStudioNsfwEnabled: (enabled: boolean) => void;
  canEnableNSFW: boolean;
  
  // Model selection
  availableModels: ReturnType<typeof getAIModelsForMode>;
  selectedModel: ReturnType<typeof getAIModelsForMode>[number] | null;
  
  // Computed values
  creditsCost: number;
  canGenerate: boolean;
  
  // Outfit helpers
  outfitDisplayText: string;
  hasOutfitComposition: boolean;
  
  // Clear styles helper
  clearStyles: () => void;
}

// Helper to convert snake_case to kebab-case (for scene/environment mapping)
function snakeToKebab(str: string | null | undefined): string | null {
  if (!str) return null;
  return str.replace(/_/g, '-');
}

// Type for persisted settings (excludes context-specific fields)
type PersistedSettings = Omit<GenerationSettings, 'prompt' | 'influencerId' | 'mode' | 'contentType' | 'objects'>;

// Quality credits lookup
const QUALITY_CREDITS: Record<Quality, number> = {
  '1.5k': 20,
  '2k': 50,
  '4k': 80,
};

export function useGenerationSettings({
  selectedInfluencer,
  selectedImage,
  mode,
  contentType,
  nsfwEnabled,
}: UseGenerationSettingsOptions): UseGenerationSettingsReturn {
  
  // Track the last image ID we loaded settings from to avoid overwriting user edits
  const lastLoadedImageIdRef = React.useRef<string | null>(null);
  
  // Local NSFW toggle state (separate from influencer-level nsfwEnabled)
  const [studioNsfwEnabled, setStudioNsfwEnabled] = React.useState(false);
  
  // Disable NSFW toggle if influencer doesn't have NSFW enabled
  const canEnableNSFW = nsfwEnabled;

  // Load settings from localStorage (excluding prompt, influencerId, mode, contentType, and objects)
  const [persistedSettings, setPersistedSettings] = useLocalStorage<PersistedSettings>(
    'ryla-studio-generation-settings',
    {
      aspectRatio: DEFAULT_GENERATION_SETTINGS.aspectRatio,
      quality: DEFAULT_GENERATION_SETTINGS.quality,
      modelId: DEFAULT_GENERATION_SETTINGS.modelId,
      styleId: DEFAULT_GENERATION_SETTINGS.styleId,
      sceneId: DEFAULT_GENERATION_SETTINGS.sceneId,
      lightingId: DEFAULT_GENERATION_SETTINGS.lightingId,
      promptEnhance: DEFAULT_GENERATION_SETTINGS.promptEnhance,
      batchSize: DEFAULT_GENERATION_SETTINGS.batchSize,
      poseId: DEFAULT_GENERATION_SETTINGS.poseId,
      outfit: DEFAULT_GENERATION_SETTINGS.outfit,
    }
  );

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
    setSettings(prev => {
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
    const changedFields: Partial<PersistedSettings> = {};
    
    if (prev.aspectRatio !== persistedSettings.aspectRatio) changedFields.aspectRatio = persistedSettings.aspectRatio;
    if (prev.quality !== persistedSettings.quality) changedFields.quality = persistedSettings.quality;
    if (prev.modelId !== persistedSettings.modelId) changedFields.modelId = persistedSettings.modelId;
    if (prev.styleId !== persistedSettings.styleId) changedFields.styleId = persistedSettings.styleId;
    if (prev.sceneId !== persistedSettings.sceneId) changedFields.sceneId = persistedSettings.sceneId;
    if (prev.lightingId !== persistedSettings.lightingId) changedFields.lightingId = persistedSettings.lightingId;
    if (prev.promptEnhance !== persistedSettings.promptEnhance) changedFields.promptEnhance = persistedSettings.promptEnhance;
    if (prev.batchSize !== persistedSettings.batchSize) changedFields.batchSize = persistedSettings.batchSize;
    if (prev.poseId !== persistedSettings.poseId) changedFields.poseId = persistedSettings.poseId;
    if (prev.outfit !== persistedSettings.outfit) changedFields.outfit = persistedSettings.outfit;
    
    if (Object.keys(changedFields).length > 0) {
      setSettings(prev => ({
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
      setSettings(prev => ({ ...prev, objects: [] }));
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load settings from selected image when entering editing/upscaling/variations mode
  React.useEffect(() => {
    if (selectedImage && (mode === 'editing' || mode === 'upscaling' || mode === 'variations')) {
      if (selectedImage.id !== lastLoadedImageIdRef.current) {
        // Parse outfit - can be string or JSON stringified OutfitComposition
        let outfitValue: string | null | OutfitComposition = null;
        if (selectedImage.outfit) {
          try {
            outfitValue = JSON.parse(selectedImage.outfit);
          } catch {
            outfitValue = selectedImage.outfit;
          }
        }

        setSettings(prev => ({
          ...prev,
          prompt: '', // User can re-enter custom details
          sceneId: snakeToKebab(selectedImage.scene) || null,
          poseId: selectedImage.poseId || null,
          outfit: outfitValue,
          aspectRatio: selectedImage.aspectRatio || prev.aspectRatio,
        }));
        
        // Load NSFW setting from the selected image
        if (selectedImage.nsfw !== undefined) {
          setStudioNsfwEnabled(selectedImage.nsfw);
        }
        
        lastLoadedImageIdRef.current = selectedImage.id;
      }
    } else if (!selectedImage || mode === 'creating') {
      setSettings(prev => ({ ...prev, prompt: '' }));
      lastLoadedImageIdRef.current = null;
    }
  }, [selectedImage, mode]);

  // Get models filtered by current mode and NSFW setting
  const availableModels = React.useMemo(() => {
    return getAIModelsForMode(mode, {
      nsfwEnabled: studioNsfwEnabled,
      mvpOnly: true,
    });
  }, [mode, studioNsfwEnabled]);

  // Reset modelId if current selection is not available
  React.useEffect(() => {
    const isCurrentModelAvailable = availableModels.some(m => m.id === settings.modelId);
    if (!isCurrentModelAvailable && availableModels.length > 0) {
      const newModelId = availableModels[0].id;
      setSettings(prev => ({ ...prev, modelId: newModelId }));
      setPersistedSettings(prev => ({ ...prev, modelId: newModelId }));
    }
  }, [mode, studioNsfwEnabled, availableModels, settings.modelId, setPersistedSettings]);

  const selectedModel = availableModels.find(m => m.id === settings.modelId) || availableModels[0] || null;
  
  // Calculate credits cost
  const creditsCost = (QUALITY_CREDITS[settings.quality] || 20) * settings.batchSize;

  // Update setting and persist to localStorage
  const updateSetting = React.useCallback(<K extends keyof GenerationSettings>(
    key: K, 
    value: GenerationSettings[K]
  ) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      
      // Persist to localStorage (excluding context-specific fields)
      if (key !== 'prompt' && key !== 'influencerId' && key !== 'mode' && key !== 'contentType' && key !== 'objects') {
        setPersistedSettings(prevPersisted => ({
          ...prevPersisted,
          [key]: value,
        }));
      }
      
      return updated;
    });
  }, [setPersistedSettings]);

  // Validation: can we generate?
  const canGenerate = React.useMemo(() => {
    if (!settings.influencerId) return false;
    
    if (mode === 'creating') return true;
    
    if (mode === 'editing' || mode === 'upscaling') {
      return selectedImage !== null;
    }
    
    return false;
  }, [settings.influencerId, mode, selectedImage]);

  // Get outfit display text
  const getOutfitDisplayText = React.useCallback((): string => {
    if (!settings.outfit) return 'Outfit';
    
    // Legacy string format
    if (typeof settings.outfit === 'string') {
      // Simple label extraction
      return settings.outfit.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
    
    // New composition format
    const comp = settings.outfit as OutfitComposition;
    const pieceCount = [comp.top, comp.bottom, comp.shoes].filter(Boolean).length;
    if (pieceCount > 0) {
      return pieceCount > 2 ? `Custom (${pieceCount})` : 'Custom';
    }
    return 'Outfit';
  }, [settings.outfit]);

  const outfitDisplayText = getOutfitDisplayText();
  const hasOutfitComposition = settings.outfit !== null && typeof settings.outfit === 'object';

  // Clear styles helper
  const clearStyles = React.useCallback(() => {
    setSettings(prev => ({
      ...prev,
      styleId: null,
      sceneId: null,
      lightingId: null,
    }));
    setPersistedSettings(prev => ({
      ...prev,
      styleId: null,
      sceneId: null,
      lightingId: null,
    }));
  }, [setPersistedSettings]);

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

