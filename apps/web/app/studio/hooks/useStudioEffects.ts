'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { StudioMode } from '../../../components/studio/generation';
import { isUuid } from '../utils';

interface Influencer {
  id: string;
}

interface UseStudioEffectsOptions {
  validInfluencers: Influencer[];
  influencerFromQuery: string | null;
  imageIdFromQuery: string | null;
  modeFromQuery: StudioMode;
  templateIdFromQuery: string | null;
  selectedInfluencerId: string | null;
  allImages: StudioImage[];
  mode: StudioMode;
  setSelectedInfluencerId: (id: string | null) => void;
  setSelectedImage: (image: StudioImage | null) => void;
  setShowPanel: (show: boolean) => void;
  setMode: (mode: StudioMode) => void;
  onTemplateApply?: (templateId: string) => void;
}

/**
 * Hook for managing studio initialization effects
 * Handles URL → State synchronization on mount and navigation
 */
export function useStudioEffects({
  validInfluencers,
  influencerFromQuery,
  imageIdFromQuery,
  modeFromQuery,
  templateIdFromQuery,
  selectedInfluencerId,
  allImages,
  mode,
  setSelectedInfluencerId,
  setSelectedImage,
  setShowPanel,
  setMode,
  onTemplateApply,
}: UseStudioEffectsOptions) {
  // Track which imageId we've already processed to handle navigation
  const lastProcessedImageId = React.useRef<string | null>(null);
  const lastProcessedTemplateId = React.useRef<string | null>(null);
  const hasInitializedInfluencer = React.useRef(false);

  // Reset variations mode to creating (coming soon feature)
  React.useEffect(() => {
    if (mode === 'variations') {
      setMode('creating');
    }
  }, [mode, setMode]);

  // Effect 1: Initialize influencer from query params (runs once per session)
  React.useEffect(() => {
    if (hasInitializedInfluencer.current) return;
    if (validInfluencers.length === 0) return;

    if (influencerFromQuery && isUuid(influencerFromQuery)) {
      const exists = validInfluencers.some((i) => i.id === influencerFromQuery);
      if (exists) {
        setSelectedInfluencerId(influencerFromQuery);
        hasInitializedInfluencer.current = true;
        return;
      }
    }

    // Auto-select first influencer if none in query
    if (!selectedInfluencerId && validInfluencers[0]?.id) {
      setSelectedInfluencerId(validInfluencers[0].id);
    }

    hasInitializedInfluencer.current = true;
  }, [validInfluencers, influencerFromQuery, selectedInfluencerId, setSelectedInfluencerId]);

  // Effect 2: Handle image selection from query params
  // This runs on navigation (when imageIdFromQuery changes)
  React.useEffect(() => {
    // Skip if no imageId in query
    if (!imageIdFromQuery) {
      lastProcessedImageId.current = null;
      return;
    }

    // Skip if we already processed this imageId
    if (lastProcessedImageId.current === imageIdFromQuery) {
      return;
    }

    // Wait for images to load
    if (allImages.length === 0) return;

    const imageToSelect = allImages.find((img) => img.id === imageIdFromQuery);
    if (!imageToSelect) {
      // Image not found in current list - might need to wait for more data
      return;
    }

    // Mark as processed before state updates
    lastProcessedImageId.current = imageIdFromQuery;

    // Batch state updates
    setSelectedImage(imageToSelect);
    setShowPanel(true);

    // Auto-select influencer if needed
    if (imageToSelect.influencerId && imageToSelect.influencerId !== selectedInfluencerId) {
      setSelectedInfluencerId(imageToSelect.influencerId);
    }

    // Set mode from query
    if (modeFromQuery !== 'creating') {
      setMode(modeFromQuery);
    }
  }, [
    imageIdFromQuery,
    allImages,
    modeFromQuery,
    selectedInfluencerId,
    setSelectedImage,
    setShowPanel,
    setSelectedInfluencerId,
    setMode,
  ]);

  // Effect 3: Apply template from query params (runs when templateId changes)
  React.useEffect(() => {
    if (!templateIdFromQuery) {
      lastProcessedTemplateId.current = null;
      return;
    }

    // Skip if we already processed this template
    if (lastProcessedTemplateId.current === templateIdFromQuery) {
      return;
    }

    if (!onTemplateApply) return;

    lastProcessedTemplateId.current = templateIdFromQuery;
    onTemplateApply(templateIdFromQuery);
  }, [templateIdFromQuery, onTemplateApply]);
}
