'use client';

import * as React from 'react';
import Image from 'next/image';
import { useCharacterWizardStore, getProfilePictureSet } from '@ryla/business';
import { cn } from '@ryla/ui';
import type { ProfilePictureImage } from '@ryla/business';
import {
  generateProfilePictureSetAndWait,
  regenerateProfilePicture,
  type JobStatus,
  type GeneratedImage,
} from '../../lib/api/character';

/**
 * Step: Profile Pictures
 * Automatically generate 7-10 profile pictures after base image selection
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
  const removeProfilePicture = useCharacterWizardStore((s) => s.removeProfilePicture);
  const updateProfilePicture = useCharacterWizardStore((s) => s.updateProfilePicture);

  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);
  const [showPromptEditor, setShowPromptEditor] = React.useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = React.useState<string>('');

  // Get selected base image
  const selectedBaseImage = baseImages.find((img) => img.id === selectedBaseImageId);

  // Auto-generate on mount if base image selected and not already generating
  React.useEffect(() => {
    if (
      selectedBaseImageId &&
      selectedBaseImage &&
      !profilePictureSet.generating &&
      profilePictureSet.images.length === 0
    ) {
      handleGenerateProfilePictures();
    }
  }, [selectedBaseImageId]);

  const handleGenerateProfilePictures = async () => {
    if (!selectedBaseImage) return;

    setProfilePictureSetGenerating(true);

    try {
      // Use classic-influencer set by default (can be made configurable)
      const images = await generateProfilePictureSetAndWait(
        {
          baseImageUrl: selectedBaseImage.url,
          setId: 'classic-influencer',
          nsfwEnabled: form.nsfwEnabled,
        },
        (status: JobStatus) => {
          // Progress updates can be shown here
        }
      );

      // Convert GeneratedImage[] to ProfilePictureImage[]
      // TODO: API should return position info, for now map by index
      const set = getProfilePictureSet('classic-influencer');
      const profileImages: ProfilePictureImage[] = images.map((img, index) => {
        const position = set?.positions[index] || {
          id: `position-${index}`,
          name: `Position ${index + 1}`,
        };
        return {
          ...img,
          positionId: position.id,
          positionName: position.name,
          isNSFW: false,
        };
      });

      // Add NSFW images if enabled
      if (form.nsfwEnabled) {
        // TODO: Generate NSFW images separately
        // For now, just mark some as NSFW
      }

      setProfilePictureSetImages(profileImages);
    } catch (error) {
      console.error('Profile picture generation failed:', error);
    } finally {
      setProfilePictureSetGenerating(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    removeProfilePicture(imageId);
    if (selectedImageId === imageId) {
      setSelectedImageId(null);
    }
  };

  const handleRegenerateImage = async (imageId: string) => {
    const image = profilePictureSet.images.find((img) => img.id === imageId);
    if (!image || !selectedBaseImage) return;

    updateProfilePicture(imageId, { url: 'loading' });

    try {
      const result = await regenerateProfilePicture({
        baseImageUrl: selectedBaseImage.url,
        positionId: image.positionId,
        nsfwEnabled: form.nsfwEnabled,
        setId: 'classic-influencer',
      });

      // Poll for results
      // TODO: Implement polling or use webhook
      // For now, just update with placeholder
      updateProfilePicture(imageId, {
        url: selectedBaseImage.url, // Placeholder
      });
    } catch (error) {
      console.error('Regeneration failed:', error);
      // Revert loading state
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

    updateProfilePicture(imageId, { prompt: editingPrompt });
    setShowPromptEditor(null);

    // Regenerate with new prompt
    updateProfilePicture(imageId, { url: 'loading' });

    try {
      const result = await regenerateProfilePicture({
        baseImageUrl: selectedBaseImage.url,
        positionId: image.positionId,
        prompt: editingPrompt,
        nsfwEnabled: form.nsfwEnabled,
        setId: 'classic-influencer',
      });

      // TODO: Poll for results and update image
      // For now, just revert loading
      updateProfilePicture(imageId, { url: image.url });
    } catch (error) {
      console.error('Regeneration with new prompt failed:', error);
      updateProfilePicture(imageId, { url: image.url });
    }
  };

  const regularImages = profilePictureSet.images.filter((img) => !img.isNSFW);
  const nsfwImages = profilePictureSet.images.filter((img) => img.isNSFW);

  if (!selectedBaseImage) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-white/60 text-sm">Please select a base image first</p>
      </div>
    );
  }

  if (profilePictureSet.generating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Generating Profile Pictures
        </h2>
        <p className="text-white/60 text-sm">
          Creating 7-10 variations with different positions...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm font-medium mb-2">Profile Picture Set</p>
        <h1 className="text-white text-2xl font-bold">
          Your Character Profile Pictures
        </h1>
        <p className="text-white/40 text-sm mt-2">
          {regularImages.length} images generated
          {form.nsfwEnabled && nsfwImages.length > 0 && ` • ${nsfwImages.length} NSFW images`}
        </p>
      </div>

      {/* Regular Images Grid */}
      {regularImages.length > 0 && (
        <div className="w-full mb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {regularImages.map((image) => (
              <ProfilePictureCard
                key={image.id}
                image={image}
                isSelected={selectedImageId === image.id}
                onSelect={() => setSelectedImageId(image.id)}
                onDelete={() => handleDeleteImage(image.id)}
                onRegenerate={() => handleRegenerateImage(image.id)}
                onEditPrompt={() => handleEditPrompt(image)}
              />
            ))}
          </div>
        </div>
      )}

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
                onSelect={() => setSelectedImageId(image.id)}
                onDelete={() => handleDeleteImage(image.id)}
                onRegenerate={() => handleRegenerateImage(image.id)}
                onEditPrompt={() => handleEditPrompt(image)}
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

      {/* Empty State */}
      {regularImages.length === 0 && !profilePictureSet.generating && (
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
 * Profile Picture Card Component
 */
interface ProfilePictureCardProps {
  image: ProfilePictureImage;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onEditPrompt: () => void;
}

function ProfilePictureCard({
  image,
  isSelected,
  onSelect,
  onDelete,
  onRegenerate,
  onEditPrompt,
}: ProfilePictureCardProps) {
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div
      className={cn(
        'relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer',
        isSelected
          ? 'border-purple-400 ring-2 ring-purple-400/30'
          : 'border-white/10 hover:border-white/20'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      onClick={onSelect}
    >
      {/* Image */}
      <div className="relative aspect-square bg-white/5">
        {image.url === 'loading' ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <Image
            src={image.url}
            alt={image.positionName}
            fill
            className="object-cover"
          />
        )}

        {/* Position Label */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="text-white text-xs font-medium">{image.positionName}</p>
        </div>

        {/* Actions Overlay */}
        {showActions && image.url !== 'loading' && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditPrompt();
              }}
              className="px-2 py-1 rounded bg-white/20 text-white text-xs hover:bg-white/30"
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
              className="px-2 py-1 rounded bg-white/20 text-white text-xs hover:bg-white/30"
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
              className="px-2 py-1 rounded bg-red-500/80 text-white text-xs hover:bg-red-500"
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

