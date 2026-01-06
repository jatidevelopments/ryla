'use client';

import * as React from 'react';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { AspectRatio } from '../../../components/studio/generation';
import type { StatusFilter, LikedFilter, AdultFilter, SortBy } from '../../../components/studio';
import { isUuid } from '../utils';

interface Influencer {
  id: string;
  name: string;
  avatar?: string | null;
  imageCount?: number;
  nsfwEnabled?: boolean;
}

interface UseStudioComputedOptions {
  influencers: Influencer[];
  allImages: StudioImage[];
  selectedInfluencerId: string | null;
  status: StatusFilter;
  aspectRatios: AspectRatio[];
  liked: LikedFilter;
  adult: AdultFilter;
  searchQuery: string;
  sortBy: SortBy;
}

/**
 * Hook for computed values derived from studio state
 */
export function useStudioComputed({
  influencers,
  allImages,
  selectedInfluencerId,
  status,
  aspectRatios,
  liked,
  adult,
  searchQuery,
  sortBy,
}: UseStudioComputedOptions) {
  // Filter valid influencers (UUIDs only)
  const validInfluencers = React.useMemo(
    () => influencers.filter((i) => isUuid(i.id)),
    [influencers]
  );

  // Calculate influencer tabs with image counts and sorting
  const influencerTabs = React.useMemo(() => {
    if (!Array.isArray(validInfluencers) || validInfluencers.length === 0) {
      return [];
    }
    const tabs = validInfluencers.map((influencer) => {
      // Get images from allImages for sorting (only if loaded)
      const influencerImages = allImages.filter(
        (img) => img.influencerId === influencer.id
      );
      const mostRecentImage =
        influencerImages.length > 0
          ? influencerImages.reduce((latest, img) => {
              const imgDate = new Date(img.createdAt).getTime();
              const latestDate = new Date(latest.createdAt).getTime();
              return imgDate > latestDate ? img : latest;
            })
          : null;

      return {
        id: influencer.id,
        name: influencer.name,
        avatar: influencer.avatar || undefined,
        imageCount: influencer.imageCount ?? 0,
        _lastImageDate: mostRecentImage
          ? new Date(mostRecentImage.createdAt).getTime()
          : 0,
      };
    });

    // Sort by most recent image (most recent first), then by name
    tabs.sort((a, b) => {
      if (b._lastImageDate !== a._lastImageDate) {
        return b._lastImageDate - a._lastImageDate;
      }
      return a.name.localeCompare(b.name);
    });

    // Remove internal sorting property before returning
    return tabs.map((tab) => ({
      id: tab.id,
      name: tab.name,
      avatar: tab.avatar,
      imageCount: tab.imageCount,
    }));
  }, [validInfluencers, allImages]);

  // Calculate total count for "All Images"
  const totalImageCount = React.useMemo(() => {
    return influencerTabs.reduce((sum, tab) => sum + tab.imageCount, 0);
  }, [influencerTabs]);

  // Get influencer list for generation bar
  const influencerList = React.useMemo(() => {
    if (!Array.isArray(validInfluencers) || validInfluencers.length === 0) {
      return [];
    }
    return validInfluencers.map((influencer) => ({
      id: influencer.id,
      name: influencer.name,
      avatar: influencer.avatar || undefined,
    }));
  }, [validInfluencers]);

  // Selected influencer for generation - return null when "All Images" is selected
  const selectedInfluencerForGeneration = React.useMemo(() => {
    if (selectedInfluencerId) {
      return influencerList.find((i) => i.id === selectedInfluencerId) || null;
    }
    return null;
  }, [selectedInfluencerId, influencerList]);

  // Get NSFW enabled status from selected influencer
  const nsfwEnabled = React.useMemo(() => {
    if (!selectedInfluencerId) return false;
    const influencer = validInfluencers.find(
      (i) => i.id === selectedInfluencerId
    );
    return influencer?.nsfwEnabled || false;
  }, [selectedInfluencerId, validInfluencers]);

  // Filter images based on all filter criteria
  const filteredImages = React.useMemo(() => {
    let result = [...allImages];

    // Filter by influencer
    if (selectedInfluencerId) {
      result = result.filter(
        (img) => img.influencerId === selectedInfluencerId
      );
    }

    // Filter by status
    if (status !== 'all') {
      result = result.filter((img) => img.status === status);
    } else {
      // When showing 'all', exclude failed images by default
      result = result.filter((img) => img.status !== 'failed');
    }

    // Filter by aspect ratio
    if (aspectRatios.length > 0) {
      result = result.filter((img) =>
        aspectRatios.includes(img.aspectRatio as AspectRatio)
      );
    }

    // Filter by liked status
    if (liked !== 'all') {
      if (liked === 'liked') {
        result = result.filter((img) => img.isLiked === true);
      } else if (liked === 'not-liked') {
        result = result.filter((img) => img.isLiked === false);
      }
    }

    // Filter by adult content
    if (adult !== 'all') {
      if (adult === 'adult') {
        result = result.filter((img) => img.nsfw === true);
      } else if (adult === 'not-adult') {
        result = result.filter((img) => img.nsfw !== true);
      }
    }

    // Filter by search
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (img) =>
          img.prompt?.toLowerCase().includes(search) ||
          img.influencerName.toLowerCase().includes(search) ||
          img.scene?.toLowerCase().includes(search) ||
          img.environment?.toLowerCase().includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [
    allImages,
    selectedInfluencerId,
    status,
    aspectRatios,
    liked,
    adult,
    searchQuery,
    sortBy,
  ]);

  return {
    validInfluencers,
    influencerTabs,
    totalImageCount,
    influencerList,
    selectedInfluencerForGeneration,
    nsfwEnabled,
    filteredImages,
  };
}

