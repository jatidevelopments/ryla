'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCharacterWizardStore, getProfilePictureSet } from '@ryla/business';
import { cn, Checkbox } from '@ryla/ui';
import type { ProfilePictureImage } from '@ryla/business';
import {
  generateProfilePictureSetAndWait,
  regenerateProfilePictureAndWait,
  type JobStatus,
  type GeneratedImage,
} from '../../lib/api/character';

/**
 * Step: Profile Pictures
 * Automatically generate 7-10 profile pictures after base image selection
 * Shows skeleton loaders and updates images progressively as they complete
 */
export function StepProfilePictures() {
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const profilePictureSet = useCharacterWizardStore((s) => s.profilePictureSet);
  const form = useCharacterWizardStore((s) => s.form);
  const setProfilePictureSetGenerating = useCharacterWizardStore(
    (s) => s.setProfilePictureSetGenerating
  );
  const setProfilePictureSetImages = useCharacterWizardStore(
    (s) => s.setProfilePictureSetImages
  );
  const addProfilePicture = useCharacterWizardStore((s) => s.addProfilePicture);
  const removeProfilePicture = useCharacterWizardStore((s) => s.removeProfilePicture);
  const updateProfilePicture = useCharacterWizardStore((s) => s.updateProfilePicture);
  const setField = useCharacterWizardStore((s) => s.setField);

  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);
  const [showPromptEditor, setShowPromptEditor] = React.useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = React.useState<string>('');
  const [completedCount, setCompletedCount] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);

  // Get selected base image (defensive check for array)
  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];
  const selectedBaseImage = safeBaseImages.find((img) => img.id === selectedBaseImageId);

  // Get profile picture set to determine expected count
  const set = React.useMemo(() => getProfilePictureSet('classic-influencer'), []);
  const expectedRegularCount = set?.positions.length || 7;
  const expectedNSFWCount = form.nsfwEnabled ? 3 : 0;
  const totalExpected = expectedRegularCount + expectedNSFWCount;

  // Ensure profilePictureSet.images is always an array (defensive check)
  const safeProfileImages = Array.isArray(profilePictureSet.images) ? profilePictureSet.images : [];

  // Auto-generate on mount if base image selected and not already generating
  React.useEffect(() => {
    if (
      selectedBaseImageId &&
      selectedBaseImage &&
      !profilePictureSet.generating &&
      safeProfileImages.length === 0
    ) {
      handleGenerateProfilePictures();
    }
  }, [selectedBaseImageId, selectedBaseImage, profilePictureSet.generating, safeProfileImages.length]);

  // Initialize skeleton slots when generation starts
  React.useEffect(() => {
    if (profilePictureSet.generating && safeProfileImages.length === 0) {
      setCompletedCount(0);
      
      // Create skeleton slots for all expected images
      const skeletonImages: ProfilePictureImage[] = [];
      
      // Regular positions
      set?.positions.forEach((position, index) => {
        skeletonImages.push({
          id: `skeleton-${position.id}`,
          url: 'skeleton', // Special marker for skeleton state
          positionId: position.id,
          positionName: position.name,
          isNSFW: false,
        });
      });

      // NSFW positions if enabled
      if (form.nsfwEnabled) {
        for (let i = 0; i < 3; i++) {
          skeletonImages.push({
            id: `skeleton-nsfw-${i}`,
            url: 'skeleton',
            positionId: `nsfw-${i + 1}`,
            positionName: `NSFW ${i + 1}`,
            isNSFW: true,
          });
        }
      }

      setProfilePictureSetImages(skeletonImages);
    }
  }, [profilePictureSet.generating, totalExpected, set, form.nsfwEnabled]);

  const handleGenerateProfilePictures = async () => {
    if (!selectedBaseImage) return;

    setProfilePictureSetGenerating(true);
    setCompletedCount(0);
    setError(null);

    try {
      // Start generation - this returns immediately, images come via callback
      await generateProfilePictureSetAndWait(
        {
          baseImageUrl: selectedBaseImage.url,
          setId: 'classic-influencer',
          nsfwEnabled: form.nsfwEnabled,
          generationMode: 'fast', // Use fast mode (no PuLID) for now
        },
        (status: JobStatus, err?: string) => {
          // Progress updates
          if (status === 'completed') {
            setProfilePictureSetGenerating(false);
          } else if (status === 'failed') {
            setProfilePictureSetGenerating(false);
            if (err) setError(err);
          }
        },
        (image: GeneratedImage, positionId: string, positionName: string) => {
          // Called when each image completes - update progressively
          const profileImage: ProfilePictureImage = {
            ...image,
            positionId,
            positionName,
            isNSFW: positionId.startsWith('nsfw-'),
          };

          // Find and replace the skeleton slot
          const currentImages = profilePictureSet.images;
          const skeletonIndex = currentImages.findIndex(
            (img) => img.positionId === positionId && img.url === 'skeleton'
          );

          if (skeletonIndex !== -1) {
            // Replace skeleton with actual image
            const updatedImages = [...currentImages];
            updatedImages[skeletonIndex] = profileImage;
            setProfilePictureSetImages(updatedImages);
          } else {
            // Add new image if skeleton not found
            addProfilePicture(profileImage);
          }

          setCompletedCount((prev) => {
            const newCount = prev + 1;
            // If all images are done, stop generating state
            if (newCount >= totalExpected) {
              setProfilePictureSetGenerating(false);
            }
            return newCount;
          });
        }
      );
      // Don't set generating to false here - let the callback handle it
    } catch (error) {
      console.error('Profile picture generation failed:', error);
      setProfilePictureSetGenerating(false);
      setError(error instanceof Error ? error.message : 'Profile picture generation failed');
    }
  };

  const handleDeleteImage = (imageId: string) => {
    removeProfilePicture(imageId);
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const handleRegenerateImage = async (imageId: string) => {
    const image = safeProfileImages.find((img) => img.id === imageId);
    if (!image || !selectedBaseImage) return;

    // Set loading state
    updateProfilePicture(imageId, { url: 'loading' });

    try {
      // Regenerate and wait for completion
      const regeneratedImage = await regenerateProfilePictureAndWait(
        {
          baseImageUrl: selectedBaseImage.url,
          positionId: image.positionId,
          nsfwEnabled: form.nsfwEnabled,
          setId: 'classic-influencer',
        },
        (status: JobStatus) => {
          // Progress updates if needed
        }
      );

      // Update with the new image
      updateProfilePicture(imageId, {
        url: regeneratedImage.url,
        thumbnailUrl: regeneratedImage.thumbnailUrl,
      });
    } catch (error) {
      console.error('Regeneration failed:', error);
      // Revert to original image on error
      updateProfilePicture(imageId, { url: image.url });
    }
  };

  const handleEditPrompt = (image: ProfilePictureImage) => {
    setEditingPrompt(image.prompt || '');
    setShowPromptEditor(image.id);
  };

  const handleSavePrompt = async (imageId: string) => {
    const image = profilePictureSet.images.find((img) => img.id === imageId);
    if (!image || !selectedBaseImage) return;

    // Update prompt in store
    updateProfilePicture(imageId, { prompt: editingPrompt });
    setShowPromptEditor(null);

    // Set loading state
    updateProfilePicture(imageId, { url: 'loading' });

    try {
      // Regenerate with new prompt and wait for completion
      const regeneratedImage = await regenerateProfilePictureAndWait(
        {
          baseImageUrl: selectedBaseImage.url,
          positionId: image.positionId,
          prompt: editingPrompt,
          nsfwEnabled: form.nsfwEnabled,
          setId: 'classic-influencer',
        },
        (status: JobStatus) => {
          // Progress updates if needed
        }
      );

      // Update with the new image
      updateProfilePicture(imageId, {
        url: regeneratedImage.url,
        thumbnailUrl: regeneratedImage.thumbnailUrl,
        prompt: editingPrompt, // Keep the updated prompt
      });
    } catch (error) {
      console.error('Regeneration with new prompt failed:', error);
      // Revert to original image on error
      updateProfilePicture(imageId, { url: image.url });
    }
  };

  const regularImages = safeProfileImages.filter((img) => !img.isNSFW);
  const nsfwImages = safeProfileImages.filter((img) => img.isNSFW);
  const skeletonImages = safeProfileImages.filter((img) => img.url === 'skeleton');
  const loadingImages = safeProfileImages.filter((img) => img.url === 'loading');

  if (!selectedBaseImage) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-white/60 text-sm">Please select a base image first</p>
      </div>
    );
  }

  const isGenerating = profilePictureSet.generating || skeletonImages.length > 0;
  const hasImages = regularImages.length > 0 || nsfwImages.length > 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8 w-full">
        <p className="text-white/60 text-sm font-medium mb-2">Profile Picture Set</p>
        <h1 className="text-white text-2xl font-bold mb-2">
          Your Character Profile Pictures
        </h1>
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <p className="text-white/60 text-sm">
              Generating {completedCount}/{totalExpected} images...
            </p>
          </div>
        ) : (
          <p className="text-white/40 text-sm mt-2">
            {regularImages.length} images generated
            {form.nsfwEnabled && nsfwImages.length > 0 && ` • ${nsfwImages.length} NSFW images`}
          </p>
        )}
      </div>

      {/* NSFW Toggle */}
      <div className="w-full mb-4">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Checkbox
              id="nsfw-toggle-profile"
              checked={form.nsfwEnabled || false}
              onCheckedChange={(checked) => setField('nsfwEnabled', checked as boolean)}
            />
            <label
              htmlFor="nsfw-toggle-profile"
              className="text-white/70 text-sm font-medium leading-none cursor-pointer"
            >
              Enable NSFW Content
            </label>
          </div>
          <p className="text-white/40 text-xs mt-2 ml-7">
            When enabled, profile pictures will include 3 adult-themed images
          </p>
        </div>
      </div>

      {/* Images Grid with Skeleton Loaders */}
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Show all images (including skeletons) */}
          {safeProfileImages
            .filter((img) => !img.isNSFW || form.nsfwEnabled)
            .map((image) => (
              <ProfilePictureCard
                key={image.id}
                image={image}
                isSelected={selectedImageId === image.id}
                onSelect={() => image.url !== 'skeleton' && image.url !== 'loading' && setSelectedImageId(image.id)}
                onDelete={() => handleDeleteImage(image.id)}
                onRegenerate={() => handleRegenerateImage(image.id)}
                onEditPrompt={() => handleEditPrompt(image)}
                isSkeleton={image.url === 'skeleton'}
                isLoading={image.url === 'loading'}
              />
            ))}
        </div>
      </div>

      {/* NSFW Images Section */}
      {form.nsfwEnabled && nsfwImages.length > 0 && (
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-white/10" />
            <p className="text-white/40 text-sm font-medium px-4">18+ Content</p>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {nsfwImages.map((image) => (
              <ProfilePictureCard
                key={image.id}
                image={image}
                isSelected={selectedImageId === image.id}
                onSelect={() => image.url !== 'skeleton' && image.url !== 'loading' && setSelectedImageId(image.id)}
                onDelete={() => handleDeleteImage(image.id)}
                onRegenerate={() => handleRegenerateImage(image.id)}
                onEditPrompt={() => handleEditPrompt(image)}
                isSkeleton={image.url === 'skeleton'}
                isLoading={image.url === 'loading'}
              />
            ))}
          </div>
        </div>
      )}

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <PromptEditorModal
          image={profilePictureSet.images.find((img) => img.id === showPromptEditor)!}
          prompt={editingPrompt}
          onPromptChange={setEditingPrompt}
          onSave={() => handleSavePrompt(showPromptEditor)}
          onCancel={() => {
            setShowPromptEditor(null);
            setEditingPrompt('');
          }}
        />
      )}

      {error && (
        <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!hasImages && !isGenerating && (
        <div className="w-full text-center py-12">
          <p className="text-white/60 text-sm mb-4">No profile pictures generated yet</p>
          <button
            onClick={handleGenerateProfilePictures}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Generate Profile Pictures
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Profile Picture Card Component with Skeleton Loading
 */
interface ProfilePictureCardProps {
  image: ProfilePictureImage;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onEditPrompt: () => void;
  isSkeleton?: boolean;
  isLoading?: boolean;
}

function ProfilePictureCard({
  image,
  isSelected,
  onSelect,
  onDelete,
  onRegenerate,
  onEditPrompt,
  isSkeleton = false,
  isLoading = false,
}: ProfilePictureCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  if (isSkeleton) {
    return (
      <div className="relative rounded-xl overflow-hidden border-2 border-white/10 bg-white/5">
        <div className="relative aspect-square">
          {/* Skeleton Animation */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
          </div>
          
          {/* Position Label Skeleton */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse" />
          </div>

          {/* Loading Indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-purple-400 ring-2 ring-purple-400/30'
          : 'border-white/10 hover:border-white/20',
        isLoading && 'opacity-60'
      )}
      onMouseEnter={() => !isLoading && setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-square bg-white/5">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/5">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <Image
              src={image.url}
              alt={image.positionName}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Position Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-2.5">
              <p className="text-white text-xs font-semibold">{image.positionName}</p>
            </div>

            {/* Actions Overlay */}
            {showActions && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditPrompt();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                  title="Edit Prompt"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-medium hover:bg-white/30 transition-colors backdrop-blur-sm"
                  title="Regenerate"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M3 21v-5h5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-medium hover:bg-red-500 transition-colors backdrop-blur-sm"
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                    <path
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .56c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Prompt Editor Modal
 */
interface PromptEditorModalProps {
  image: ProfilePictureImage;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function PromptEditorModal({
  image,
  prompt,
  onPromptChange,
  onSave,
  onCancel,
}: PromptEditorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold">Edit Prompt</h3>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Position: {image.positionName}</p>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
            placeholder="Enter prompt adjustments..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Regenerate with New Prompt
          </button>
        </div>
      </div>
    </div>
  );
}
