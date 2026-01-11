'use client';

import * as React from 'react';
import type { StudioMode } from '../types';
import { getAIModelsForMode } from '../types';

interface UseModelSelectionOptions {
  mode: StudioMode;
  studioNsfwEnabled: boolean;
  currentModelId: string | null;
}

interface UseModelSelectionReturn {
  availableModels: ReturnType<typeof getAIModelsForMode>;
  selectedModel: ReturnType<typeof getAIModelsForMode>[number] | null;
  shouldResetModel: boolean;
  defaultModelId: string | null;
}

/**
 * Hook for managing AI model selection based on mode and NSFW settings.
 * Handles filtering available models and resetting selection when needed.
 */
export function useModelSelection({
  mode,
  studioNsfwEnabled,
  currentModelId,
}: UseModelSelectionOptions): UseModelSelectionReturn {
  // Get models filtered by current mode and NSFW setting
  const availableModels = React.useMemo(() => {
    return getAIModelsForMode(mode, {
      nsfwEnabled: studioNsfwEnabled,
      mvpOnly: true,
    });
  }, [mode, studioNsfwEnabled]);

  // Check if current model is still available
  const isCurrentModelAvailable = React.useMemo(() => {
    return availableModels.some((m) => m.id === currentModelId);
  }, [availableModels, currentModelId]);

  // Determine if we should reset the model selection
  const shouldResetModel = React.useMemo(() => {
    return !isCurrentModelAvailable && availableModels.length > 0;
  }, [isCurrentModelAvailable, availableModels.length]);

  // Get default model ID (first available)
  const defaultModelId = React.useMemo(() => {
    return availableModels[0]?.id || null;
  }, [availableModels]);

  // Get selected model (current or default)
  const selectedModel = React.useMemo(() => {
    return (
      availableModels.find((m) => m.id === currentModelId) ||
      availableModels[0] ||
      null
    );
  }, [availableModels, currentModelId]);

  return {
    availableModels,
    selectedModel,
    shouldResetModel,
    defaultModelId,
  };
}

