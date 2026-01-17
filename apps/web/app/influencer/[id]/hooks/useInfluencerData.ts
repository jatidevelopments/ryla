'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import {
  useInfluencer,
  useInfluencerPosts,
  useLikedPosts,
  useInfluencerStore,
} from '@ryla/business';
import { useProfilePictures } from '@ryla/business';
import { trpc } from '../../../../lib/trpc';

/**
 * Hook for managing influencer data (fetching, store updates)
 */
export function useInfluencerData() {
  const params = useParams();
  const influencerId = params.id as string;
  const utils = trpc.useUtils();

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const updateInfluencer = useInfluencerStore((s) => s.updateInfluencer);
  // Always fetch character data to ensure we have the latest baseImageUrl
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId }
  );
  const allPosts = useInfluencerPosts(influencerId);
  const likedPosts = useLikedPosts(influencerId);

  // Check if profile pictures are being generated
  const profilePicturesState = useProfilePictures(influencerId);
  const isGeneratingProfilePictures = profilePicturesState?.status === 'generating';
  
  // Track completed images to detect new completions
  const lastCompletedCountRef = React.useRef(0);
  
  // Auto-refresh character data when new images complete (to update imageCount stat)
  React.useEffect(() => {
    if (!profilePicturesState) return;
    
    // Calculate current completed count across all jobs
    const currentCompleted = profilePicturesState.jobs?.reduce(
      (sum, job) => sum + (job.images?.length || 0),
      0
    ) || profilePicturesState.completedCount || 0;
    
    // If new images completed, invalidate character query to refresh stats
    if (currentCompleted > lastCompletedCountRef.current) {
      console.log('[useInfluencerData] New images completed, refreshing character data:', {
        previous: lastCompletedCountRef.current,
        current: currentCompleted,
      });
      lastCompletedCountRef.current = currentCompleted;
      
      // Debounce the invalidation to avoid too many requests
      const timer = setTimeout(() => {
        utils.character.getById.invalidate({ id: influencerId });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [profilePicturesState, influencerId, utils]);

  // Get image count from character query (includes imageCount) or fallback
  const imageCount = React.useMemo(() => {
    if ((character as any)?.imageCount !== undefined) {
      return (character as any).imageCount;
    }
    return 0;
  }, [character]);

  // Sync character data to influencer store - add if doesn't exist
  React.useEffect(() => {
    if (!influencer && character) {
      console.log('[useInfluencerData] Adding influencer to store:', {
        influencerId,
        baseImageUrl: character.baseImageUrl,
      });
      addInfluencer({
        id: character.id,
        name: character.name,
        handle: character.handle || `@${character.name.toLowerCase().replace(/\s+/g, '.')}`,
        bio: character.config?.bio || 'New AI influencer ✨',
        avatar: character.baseImageUrl || null,
        gender: character.config?.gender || 'female',
        style: character.config?.style || 'realistic',
        ethnicity: character.config?.ethnicity || 'caucasian',
        age: character.config?.age || 25,
        hairStyle: character.config?.hairStyle || 'long-straight',
        hairColor: character.config?.hairColor || 'brown',
        eyeColor: character.config?.eyeColor || 'brown',
        bodyType: character.config?.bodyType || 'slim',
        breastSize: character.config?.breastSize,
        archetype: character.config?.archetype || 'girl-next-door',
        personalityTraits: character.config?.personalityTraits || [],
        outfit: character.config?.defaultOutfit || 'casual',
        nsfwEnabled: character.config?.nsfwEnabled || false,
        // Preserve null values - don't convert to undefined
        // null means user skipped, undefined means not set
        profilePictureSetId: character.config?.profilePictureSetId ?? undefined,
        postCount: parseInt(character.postCount || '0', 10),
        imageCount: imageCount,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer, imageCount]);

  // Update influencer when character data changes (especially baseImageUrl)
  // Use ref to track last processed baseImageUrl to prevent infinite loops
  const lastProcessedBaseImageUrlRef = React.useRef<string | null | undefined>(undefined);
  const influencerRef = React.useRef(influencer);

  // Keep ref in sync with influencer
  React.useEffect(() => {
    influencerRef.current = influencer;
  }, [influencer]);

  React.useEffect(() => {
    // Only proceed if we have character data
    if (!character) {
      return;
    }

    const currentBaseImageUrl = character.baseImageUrl || null;
    const lastProcessed = lastProcessedBaseImageUrlRef.current;

    // Skip if baseImageUrl hasn't changed
    if (currentBaseImageUrl === lastProcessed) {
      return;
    }

    // Update the ref first to prevent re-triggering
    lastProcessedBaseImageUrlRef.current = currentBaseImageUrl;

    // Get current influencer from ref (may be null if not in store yet)
    const currentInfluencer = influencerRef.current;

    // Only update if influencer exists and avatar is different
    if (currentInfluencer && currentBaseImageUrl !== currentInfluencer.avatar) {
      console.log('[useInfluencerData] Updating avatar:', {
        influencerId,
        oldAvatar: currentInfluencer.avatar,
        newAvatar: currentBaseImageUrl,
      });
      updateInfluencer(influencerId, { avatar: currentBaseImageUrl });
    }
  }, [character?.baseImageUrl, influencerId, updateInfluencer]); // Only depend on character.baseImageUrl, not influencer

  // Update image count when it changes (only if different from current value)
  React.useEffect(() => {
    if (influencer && imageCount !== undefined && influencer.imageCount !== imageCount) {
      console.log('[useInfluencerData] Updating imageCount in store:', {
        influencerId,
        oldCount: influencer.imageCount,
        newCount: imageCount,
      });
      updateInfluencer(influencerId, { imageCount });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageCount, influencerId]); // Removed influencer and updateInfluencer from deps to prevent infinite loop

  return {
    influencerId,
    influencer,
    character,
    isLoading,
    allPosts,
    likedPosts,
    profilePicturesState,
    isGeneratingProfilePictures,
    imageCount,
    updateInfluencer,
  };
}

