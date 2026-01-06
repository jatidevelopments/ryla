'use client';

import { notFound } from 'next/navigation';
import { PageContainer } from '@ryla/ui';
import { InfluencerProfile } from '../../../components/influencer/InfluencerProfile';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { ProfilePictureGenerationIndicator } from '../../../components/profile-pictures';
import { useInfluencerData } from './hooks/useInfluencerData';
import { useInfluencerImages } from './hooks/useInfluencerImages';
import { InfluencerTabs } from './components/InfluencerTabs';

export default function InfluencerProfilePage() {
  return (
    <ProtectedRoute>
      <InfluencerProfileContent />
    </ProtectedRoute>
  );
}

function InfluencerProfileContent() {
  // Extract data fetching and state management
  const {
    influencerId,
    influencer,
    character,
    isLoading,
    allPosts,
    likedPosts,
    profilePicturesState,
    isGeneratingProfilePictures,
    imageCount,
  } = useInfluencerData();

  // Extract image management
  const {
    allImages,
    likedImages,
    isLoadingImages,
    handleImageLike,
    refreshImages,
  } = useInfluencerImages({
    influencerId,
    onImageCountUpdate: (count) => {
      // Image count is handled in useInfluencerData
    },
    profilePicturesState,
  });

  if (!influencer && isLoading) {
    return null;
  }

  if (!influencer && !character) {
    notFound();
  }

  return (
    <>
      {/* Profile Header */}
      <InfluencerProfile influencer={influencer} />

      {/* Content */}
      <PageContainer>
        {/* Profile Picture Generation Indicator */}
        <div className="mt-8 mb-6">
          <ProfilePictureGenerationIndicator influencerId={influencerId} />
        </div>

        {/* Tabs Component */}
        <InfluencerTabs
          allImages={allImages}
          allPosts={allPosts}
          likedPosts={likedPosts}
          likedImages={likedImages}
          isLoadingImages={isLoadingImages}
          influencerId={influencerId}
          onImageLike={handleImageLike}
        />
      </PageContainer>
    </>
  );
}
