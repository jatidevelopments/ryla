'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { trpc } from '../../../lib/trpc';
import { useCredits, useStudioFilters, useStudioImages } from '../../../lib/hooks';
import { useLocalStorage } from '../../../lib/hooks/use-local-storage';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { StudioMode, ContentType } from '../../../components/studio/generation';
import { useInfluencers } from './useInfluencers';
import { useStudioComputed } from './useStudioComputed';
import { useStudioHandlers } from './useStudioHandlers';
import { useStudioEffects } from './useStudioEffects';
import { useStudioQueryParams } from './useStudioQueryParams';
import { useStudioUrlSync } from './useStudioUrlSync';
import { useUploadConsent } from './useUploadConsent';
import { useInfluencersForHook } from './useInfluencersForHook';

/**
 * Consolidated hook for all studio page state management
 * Combines data fetching, state, computed values, effects, and handlers
 */
export function useStudioState() {
  const router = useRouter();
  const utils = trpc.useUtils();

  // Upload consent
  const { hasConsent, acceptConsent } = useUploadConsent();
  const uploadImageMutation = trpc.user.uploadObjectImage.useMutation();
  const { balance: creditsBalance, refetch: refetchCredits } = useCredits();

  // Fetch influencers with image counts from backend
  const { data: charactersData } = trpc.character.list.useQuery();

  // Map Character data to AIInfluencer format
  const influencers = useInfluencers(charactersData);

  // Query params (memoized internally)
  const queryParams = useStudioQueryParams();

  // Influencer selection state
  const [selectedInfluencerId, setSelectedInfluencerId] = React.useState<string | null>(null);

  // Use extracted filter hook for all filter-related state
  const filters = useStudioFilters();
  const {
    viewMode,
    setViewMode,
    aspectRatios,
    setAspectRatios,
    status,
    setStatus,
    liked,
    setLiked,
    adult,
    setAdult,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showPanel,
    setShowPanel,
  } = filters;

  // Detail panel state
  const [selectedImage, setSelectedImage] = React.useState<StudioImage | null>(null);

  // Mode state (persisted to localStorage)
  const [mode, setMode] = useLocalStorage<StudioMode>('ryla-studio-mode', 'creating');
  const [contentType, setContentType] = useLocalStorage<ContentType>('ryla-studio-content-type', 'image');

  // Prepare influencers for hook (prevents infinite loops)
  const influencersForHook = useInfluencersForHook(influencers);

  // Use extracted hook for image management
  const {
    images: allImages,
    isLoading: isLoadingImages,
    refreshImages,
    addPlaceholders,
    updateImage,
    removeImage,
    activeGenerations,
    setActiveGenerations,
  } = useStudioImages({
    selectedInfluencerId,
    influencers: influencersForHook,
  });

  // Use computed values hook
  const {
    validInfluencers,
    influencerTabs,
    totalImageCount,
    influencerList,
    selectedInfluencerForGeneration,
    nsfwEnabled,
    filteredImages,
  } = useStudioComputed({
    influencers,
    allImages,
    selectedInfluencerId,
    status,
    aspectRatios,
    liked,
    adult,
    searchQuery,
    sortBy,
  });

  // Stable template apply handler
  const handleTemplateApply = React.useCallback(
    async (templateIdToApply: string) => {
      try {
        await utils.templates.applyTemplate.fetch({ id: templateIdToApply });
        // Clear template param from URL after applying
        const params = new URLSearchParams(window.location.search);
        params.delete('template');
        const newQuery = params.toString();
        const newUrl = newQuery ? `${window.location.pathname}?${newQuery}` : window.location.pathname;
        router.replace(newUrl, { scroll: false });
      } catch (error) {
        console.error('Failed to apply template:', error);
      }
    },
    [router, utils.templates.applyTemplate]
  );

  // URL → State initialization effects
  useStudioEffects({
    validInfluencers,
    influencerFromQuery: queryParams.influencerFromQuery,
    imageIdFromQuery: queryParams.imageIdFromQuery,
    modeFromQuery: queryParams.modeFromQuery,
    templateIdFromQuery: queryParams.templateIdFromQuery,
    selectedInfluencerId,
    allImages,
    mode,
    setSelectedInfluencerId,
    setSelectedImage,
    setShowPanel,
    setMode,
    onTemplateApply: handleTemplateApply,
  });

  // Memoize selected image ID for URL sync (avoids object reference issues)
  const selectedImageId = selectedImage?.id ?? null;

  // State → URL synchronization
  useStudioUrlSync({
    selectedInfluencerId,
    selectedImageId,
    showPanel,
    mode,
  });

  // Use handlers hook
  const handlers = useStudioHandlers({
    influencers,
    selectedInfluencerId,
    refreshImages,
    updateImage,
    removeImage,
    addPlaceholders,
    setActiveGenerations,
    setSelectedImage,
    setShowPanel,
    setSelectedInfluencerId,
    setMode,
    utils,
    refetchCredits,
    uploadImageMutation,
  });

  return {
    // State
    selectedInfluencerId,
    setSelectedInfluencerId,
    selectedImage,
    setSelectedImage,
    mode,
    setMode,
    contentType,
    setContentType,
    // Filters
    viewMode,
    setViewMode,
    aspectRatios,
    setAspectRatios,
    status,
    setStatus,
    liked,
    setLiked,
    adult,
    setAdult,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    showPanel,
    setShowPanel,
    // Computed
    influencerTabs,
    totalImageCount,
    influencerList,
    selectedInfluencerForGeneration,
    nsfwEnabled,
    filteredImages,
    // Data
    allImages,
    isLoadingImages,
    creditsBalance,
    activeGenerations,
    // Handlers
    ...handlers,
    // Upload
    hasConsent,
    acceptConsent,
  };
}

