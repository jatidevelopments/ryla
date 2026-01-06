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
  shouldOpenEdit: boolean;
  selectedInfluencerId: string | null;
  allImages: StudioImage[];
  mode: StudioMode;
  setSelectedInfluencerId: (id: string | null) => void;
  setSelectedImage: React.Dispatch<React.SetStateAction<StudioImage | null>>;
  setShowPanel: (show: boolean) => void;
  setMode: (mode: StudioMode) => void;
}

/**
 * Hook for managing studio initialization effects
 */
export function useStudioEffects({
  validInfluencers,
  influencerFromQuery,
  imageIdFromQuery,
  shouldOpenEdit,
  selectedInfluencerId,
  allImages,
  mode,
  setSelectedInfluencerId,
  setSelectedImage,
  setShowPanel,
  setMode,
}: UseStudioEffectsOptions) {
  // Reset variations mode to creating (coming soon)
  React.useEffect(() => {
    if (mode === 'variations') {
      setMode('creating');
    }
  }, [mode, setMode]);
  // Track if we've initialized to prevent auto-selection after user explicitly clicks "All Images"
  const hasInitialized = React.useRef(false);

  // Auto-select influencer from query params or first influencer if none selected (only on initial mount)
  React.useEffect(() => {
    // If already initialized, don't auto-select (user may have explicitly selected "All Images")
    if (hasInitialized.current) return;

    // Wait for influencers to load
    if (validInfluencers.length === 0) return;

    if (influencerFromQuery && isUuid(influencerFromQuery)) {
      // Check if the influencer exists in the list
      const influencerExists = validInfluencers.some(
        (i) => i.id === influencerFromQuery
      );
      if (influencerExists) {
        setSelectedInfluencerId(influencerFromQuery);
        hasInitialized.current = true;
        return;
      }
    }

    // Only auto-select first influencer on initial mount if no query param and no selection yet
    // This only runs once on mount, so it won't interfere with user clicking "All Images"
    if (!selectedInfluencerId && validInfluencers[0]?.id) {
      setSelectedInfluencerId(validInfluencers[0].id);
    }

    // Mark as initialized after first run
    hasInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validInfluencers, influencerFromQuery]); // Only depend on influencers and query, not selectedInfluencerId

  // Preselect image from query params and open edit mode if requested
  React.useEffect(() => {
    if (!imageIdFromQuery || allImages.length === 0) return;

    const imageToSelect = allImages.find((img) => img.id === imageIdFromQuery);
    if (imageToSelect) {
      setSelectedImage(imageToSelect);
      setShowPanel(true);

      // Auto-select the influencer associated with the image
      if (
        imageToSelect.influencerId &&
        imageToSelect.influencerId !== selectedInfluencerId
      ) {
        setSelectedInfluencerId(imageToSelect.influencerId);
      }

      // Switch to editing mode if edit=true in query params
      if (shouldOpenEdit) {
        setMode('editing');
      }
    }
  }, [
    imageIdFromQuery,
    allImages,
    shouldOpenEdit,
    selectedInfluencerId,
    setSelectedImage,
    setShowPanel,
    setSelectedInfluencerId,
    setMode,
  ]);
}

