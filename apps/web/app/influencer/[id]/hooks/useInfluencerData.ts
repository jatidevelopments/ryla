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

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const updateInfluencer = useInfluencerStore((s) => s.updateInfluencer);
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId },
    { enabled: !influencer }
  );
  const allPosts = useInfluencerPosts(influencerId);
  const likedPosts = useLikedPosts(influencerId);

  // Check if profile pictures are being generated
  const profilePicturesState = useProfilePictures(influencerId);
  const isGeneratingProfilePictures = profilePicturesState?.status === 'generating';

  // Get image count from character query (includes imageCount) or fallback
  const imageCount = React.useMemo(() => {
    if ((character as any)?.imageCount !== undefined) {
      return (character as any).imageCount;
    }
    return 0;
  }, [character]);

  // Sync character data to influencer store
  React.useEffect(() => {
    if (!influencer && character) {
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
        profilePictureSetId: character.config?.profilePictureSetId || undefined,
        postCount: parseInt(character.postCount || '0', 10),
        imageCount: imageCount,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer, imageCount]);

  // Update image count when it changes (only if different from current value)
  React.useEffect(() => {
    if (influencer && imageCount !== undefined && influencer.imageCount !== imageCount) {
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
  };
}

