'use client';

import * as React from 'react';
import { notFound } from 'next/navigation';
import { PageContainer } from '@ryla/ui';
import { InfluencerProfile } from '../../../components/influencer/InfluencerProfile';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { ProfilePictureGenerationIndicator } from '../../../components/profile-pictures/ProfilePictureGenerationIndicator';
import { LoraTrainingIndicator } from '../../../components/lora/LoraTrainingIndicator';
import { useInfluencerData } from './hooks/useInfluencerData';
import { useInfluencerImages } from './hooks/useInfluencerImages';
import { InfluencerTabs } from './components/InfluencerTabs';
import { LoadingState } from '../../../components/ui/loading-state';
import { generateProfilePictureSetAndWait } from '../../../lib/api/character';
import { getProfilePictureSet } from '@ryla/business';
import { useProfilePicturesStore } from '@ryla/business';
import { trpc } from '../../../lib/trpc';
import { useCredits } from '../../../lib/hooks/use-credits';

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

  React.useEffect(() => {
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

  // Profile picture generation handler
  const utils = trpc.useUtils();
  const { refetch: refetchCredits } = useCredits();

  // Character update mutation for saving profile picture set ID
  const updateCharacterMutation = trpc.character.update.useMutation({
    onSuccess: () => {
      utils.character.getById.invalidate({ id: influencerId });
    },
  });

  /**
   * Start a profile picture generation job with proper job-based tracking
   */
  const startGenerationJob = React.useCallback(
    async (
      setId: 'classic-influencer' | 'professional-model' | 'natural-beauty',
      nsfwEnabled: boolean,
      existingJobId?: string // For retries
    ) => {
      if (!character?.baseImageUrl) {
        throw new Error('Base image is required to generate profile pictures');
      }

      // Get the profile picture set to calculate total count
      const set = getProfilePictureSet(setId);
      const regularCount = set?.positions.length || 7;
      const nsfwCount = nsfwEnabled ? 3 : 0;
      const totalCount = regularCount + nsfwCount;

      // Create unique job ID
      const jobId =
        existingJobId ||
        `pp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Get store actions
      const { startJob, completeJob, failJob, upsertJobImage, retryJob } =
        useProfilePicturesStore.getState();

      // If retrying, mark job as retrying
      if (existingJobId) {
        retryJob(character.id, existingJobId);
      } else {
        // Start tracking BEFORE the generation begins so the UI shows immediately
        // We'll update with actual jobIds once we have them
        startJob(character.id, {
          jobId,
          setId,
          setName: set?.name || setId,
          jobIds: [], // Will be updated when we get the actual job IDs
          totalCount,
          nsfwEnabled,
        });
      }

      // Generate in background - track progress via store
      generateProfilePictureSetAndWait(
        {
          baseImageUrl: character.baseImageUrl,
          characterId: character.id,
          setId,
          nsfwEnabled,
          generationMode: 'fast', // Use fast mode (no PuLID) for now
        },
        (status, error) => {
          // Progress callback - update store status
          if (status === 'completed') {
            completeJob(character.id, jobId);
            // Update character config with profilePictureSetId
            updateCharacterMutation.mutate({
              id: character.id,
              config: {
                ...(character.config || {}),
                profilePictureSetId: setId,
              },
            });
            // Refresh credits and influencer data
            refetchCredits();
            utils.character.getById.invalidate({ id: character.id });
          } else if (status === 'failed') {
            failJob(character.id, jobId, error || 'Generation failed');
          }
        },
        (image, positionId, positionName) => {
          // Image complete callback - update store
          upsertJobImage(character.id, jobId, {
            id: image.id,
            url: image.url,
            thumbnailUrl: image.thumbnailUrl,
            positionId,
            positionName,
            prompt: image.prompt,
            negativePrompt: image.negativePrompt,
            isNSFW: image.isNSFW,
          });

          // Invalidate character data to refresh imageCount stat
          // This triggers the gallery and stats to update in real-time
          utils.character.getById.invalidate({ id: character.id });
        }
      )
        .then(() => {
          // Generation started successfully - job was already added to store
        })
        .catch((error) => {
          console.error('Failed to start profile picture generation:', error);
          failJob(
            character.id,
            jobId,
            error instanceof Error
              ? error.message
              : 'Failed to start generation'
          );
        });
    },
    [character, utils, refetchCredits, updateCharacterMutation]
  );

  /**
   * Handler for generating profile pictures (called from modal)
   */
  const handleGenerateProfilePictures = React.useCallback(
    async (
      setId: 'classic-influencer' | 'professional-model' | 'natural-beauty',
      nsfwEnabled: boolean
    ) => {
      return startGenerationJob(setId, nsfwEnabled);
    },
    [startGenerationJob]
  );

  /**
   * Handler for retrying a failed generation job
   */
  const handleRetryGeneration = React.useCallback(
    (jobId: string, setId: string, nsfwEnabled: boolean) => {
      // Re-run with the same job ID so it updates the existing job
      startGenerationJob(
        setId as 'classic-influencer' | 'professional-model' | 'natural-beauty',
        nsfwEnabled,
        jobId
      );
    },
    [startGenerationJob]
  );

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
      <InfluencerProfile
        influencer={influencer}
        onGenerateProfilePictures={handleGenerateProfilePictures}
        characterProfilePictureSetId={character?.config?.profilePictureSetId}
      />

      {/* Content */}
      <PageContainer>
        {/* LoRA Training Indicator - shows training status */}
        <div className="mt-8 mb-4">
          <LoraTrainingIndicator
            characterId={influencerId}
            characterName={influencer.name}
          />
        </div>

        {/* Profile Picture Generation Indicator - shows stacked jobs with retry support */}
        <div className="mb-6">
          <ProfilePictureGenerationIndicator
            influencerId={influencerId}
            onRetry={handleRetryGeneration}
          />
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
