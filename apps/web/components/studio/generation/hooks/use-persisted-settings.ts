'use client';

import * as React from 'react';
import { useLocalStorage } from '../../../../lib/hooks/use-local-storage';
import type { GenerationSettings } from '../types';
import { DEFAULT_GENERATION_SETTINGS } from '../types';

// Type for persisted settings (excludes context-specific fields)
export type PersistedSettings = Omit<
  GenerationSettings,
  'prompt' | 'influencerId' | 'mode' | 'contentType' | 'objects'
>;

const DEFAULT_PERSISTED_SETTINGS: PersistedSettings = {
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
};

interface UsePersistedSettingsReturn {
  persistedSettings: PersistedSettings;
  setPersistedSettings: React.Dispatch<React.SetStateAction<PersistedSettings>>;
  updatePersistedSetting: <K extends keyof PersistedSettings>(
    key: K,
    value: PersistedSettings[K]
  ) => void;
}

/**
 * Hook for managing generation settings persisted to localStorage.
 * Excludes context-specific fields (prompt, influencerId, mode, contentType, objects).
 */
export function usePersistedSettings(): UsePersistedSettingsReturn {
  const [persistedSettings, setPersistedSettings] =
    useLocalStorage<PersistedSettings>(
      'ryla-studio-generation-settings',
      DEFAULT_PERSISTED_SETTINGS
    );

  const updatePersistedSetting = React.useCallback(
    <K extends keyof PersistedSettings>(
      key: K,
      value: PersistedSettings[K]
    ) => {
      setPersistedSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setPersistedSettings]
  );

  return {
    persistedSettings,
    setPersistedSettings,
    updatePersistedSetting,
  };
}

