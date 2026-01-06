'use client';

import * as React from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { useInfluencer, useInfluencerStore } from '@ryla/business';
import { PageContainer } from '@ryla/ui';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { InfluencerSettingsContent } from '../../../../components/influencer-settings';
import { trpc } from '../../../../lib/trpc';

export default function InfluencerSettingsPage() {
  return (
    <ProtectedRoute>
      <InfluencerSettingsPageContent />
    </ProtectedRoute>
  );
}

function InfluencerSettingsPageContent() {
  const params = useParams();
  const router = useRouter();
  const influencerId = params.id as string;

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId },
    { enabled: !influencer }
  );

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
        imageCount: 0,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer]);

  if (!influencer && isLoading) {
    return null;
  }

  if (!influencer && !character) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <InfluencerSettingsContent
        influencer={influencer}
        onBack={() => router.push(`/influencer/${influencerId}`)}
      />
    </div>
  );
}

