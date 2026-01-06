'use client';

import * as React from 'react';
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
import { useUploadConsent } from './useUploadConsent';
import { useInfluencersForHook } from './useInfluencersForHook';

/**
 * Consolidated hook for all studio page state management
 * Combines data fetching, state, computed values, effects, and handlers
 */
export function useStudioState() {
  const utils = trpc.useUtils();

  // Upload consent
  const { hasConsent, acceptConsent } = useUploadConsent();
  const uploadImageMutation = trpc.user.uploadObjectImage.useMutation();
  const { balance: creditsBalance, refetch: refetchCredits } = useCredits();

  // Fetch influencers with image counts from backend
  const { data: charactersData } = trpc.character.list.useQuery();

  // Map Character data to AIInfluencer format
  const influencers = useInfluencers(charactersData);

  // Query params
  const { influencerFromQuery, imageIdFromQuery, shouldOpenEdit } =
    useStudioQueryParams();

  // Influencer selection state
  const [selectedInfluencerId, setSelectedInfluencerId] = React.useState<
    string | null
  >(null);

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
  const [selectedImage, setSelectedImage] = React.useState<StudioImage | null>(
    null
  );

  // Mode state
  const [mode, setMode] = useLocalStorage<StudioMode>(
    'ryla-studio-mode',
    'creating'
  );
  const [contentType, setContentType] = useLocalStorage<ContentType>(
    'ryla-studio-content-type',
    'image'
  );

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

  // Use computed values hook (needed before effects that use validInfluencers)
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

  // Use effects hook for initialization
  useStudioEffects({
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

