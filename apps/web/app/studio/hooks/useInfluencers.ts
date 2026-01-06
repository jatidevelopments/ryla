'use client';

import * as React from 'react';
import type { Character } from '@ryla/shared';

/**
 * Map Character data from backend to AIInfluencer format
 */
export function useInfluencers(charactersData: { items?: Character[] } | undefined) {
  const influencers = React.useMemo(() => {
    if (!charactersData?.items) return [];
    return charactersData.items.map((char) => ({
      id: char.id,
      name: char.name,
      handle: char.handle || `@${char.name.toLowerCase().replace(/\s+/g, '.')}`,
      bio: char.config?.bio || 'New AI influencer ✨',
      avatar: char.baseImageUrl || null,
      gender: char.config?.gender || 'female',
      style: char.config?.style || 'realistic',
      ethnicity: char.config?.ethnicity || 'caucasian',
      age: char.config?.age || 25,
      hairStyle: char.config?.hairStyle || 'long-straight',
      hairColor: char.config?.hairColor || 'brown',
      eyeColor: char.config?.eyeColor || 'brown',
      bodyType: char.config?.bodyType || 'slim',
      breastSize: char.config?.breastSize,
      archetype: char.config?.archetype || 'girl-next-door',
      personalityTraits: char.config?.personalityTraits || [],
      outfit: char.config?.defaultOutfit || 'casual',
      nsfwEnabled: char.config?.nsfwEnabled || false,
      profilePictureSetId: char.config?.profilePictureSetId || undefined,
      postCount: parseInt(char.postCount || '0', 10),
      imageCount: (char as any).imageCount ?? 0, // imageCount from backend
      likedCount: parseInt(char.likedCount || '0', 10),
      createdAt: char.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: char.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }, [charactersData]);

  return influencers;
}

