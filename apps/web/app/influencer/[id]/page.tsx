'use client';

import { notFound } from 'next/navigation';
import { PageContainer } from '@ryla/ui';
import { InfluencerProfile } from '../../../components/influencer/InfluencerProfile';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { ProfilePictureGenerationIndicator } from '../../../components/profile-pictures/ProfilePictureGenerationIndicator';
import { useInfluencerData } from './hooks/useInfluencerData';
import { useInfluencerImages } from './hooks/useInfluencerImages';
import { InfluencerTabs } from './components/InfluencerTabs';
import { LoadingState } from '../../../components/ui/loading-state';
import { useEffect } from 'react';

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
    isGeneratingProfilePictures: _isGeneratingProfilePictures,
    imageCount: _imageCount,
    updateInfluencer,
  } = useInfluencerData();

  // Extract image management
  const {
    allImages,
    likedImages,
    isLoadingImages,
    handleImageLike,
    refreshImages: _refreshImages,
  } = useInfluencerImages({
    influencerId,
    onImageCountUpdate: (_count) => {
      // Image count is handled in useInfluencerData
    },
    profilePicturesState,
  });

  // Sync liked count with store
  const totalLikedCount = likedImages.length + likedPosts.length;
  const currentLikedCount = influencer?.likedCount ?? 0;

  useEffect(() => {
    if (influencer && totalLikedCount !== currentLikedCount) {
      updateInfluencer(influencerId, { likedCount: totalLikedCount });
    }
  }, [
    totalLikedCount,
    currentLikedCount,
    influencer,
    influencerId,
    updateInfluencer,
  ]);

  if (!influencer) {
    if (isLoading) {
      return (
        <div className="flex flex-col min-h-screen">
          <LoadingState
            title="Loading Profile"
            message="Fetching influencer assets..."
            fullPage
          />
        </div>
      );
    }

    if (!character) {
      notFound();
    }

    // Character exists but influencer mapping failed or is still in progress
    return (
      <div className="flex flex-col min-h-screen">
        <LoadingState
          title="Loading Profile"
          message="Synchronizing character data..."
          fullPage
        />
      </div>
    );
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
          influencerName={influencer.name}
          influencerAvatar={influencer.avatar || undefined}
        />
      </PageContainer>
    </>
  );
}
