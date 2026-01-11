'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import {
  useProfilePictureGeneration,
  useProfilePictureHandlers,
  useProfilePictureInitialization,
} from '../hooks';
import {
  ProfilePictureHeader,
  ProfilePictureNSFWToggle,
  ProfilePictureGrid,
  ProfilePicturePromptEditor,
  ProfilePictureEmptyState,
  BaseImageError,
} from '../components';

/**
 * Step: Profile Pictures
 * Automatically generate 7-10 profile pictures after base image selection
 * Shows skeleton loaders and updates images progressively as they complete
 */
export function StepProfilePictures() {
  const selectedBaseImageId = useCharacterWizardStore(
    (s) => s.selectedBaseImageId
  );
  const baseImages = useCharacterWizardStore((s) => s.baseImages);
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const safeBaseImages = Array.isArray(baseImages) ? baseImages : [];
  const selectedBaseImage = safeBaseImages.find(
    (img) => img.id === selectedBaseImageId
  );

  // Generation logic hook
  const {
    isGenerating,
    completedCount,
    error,
    totalExpected,
    handleGenerateProfilePictures,
    handleRegenerateImage,
    handleRegenerateWithPrompt,
  } = useProfilePictureGeneration();

  // Handlers and computed values hook
  const {
    selectedImageId,
    setSelectedImageId,
    showPromptEditor,
    setShowPromptEditor,
    editingPrompt,
    setEditingPrompt,
    safeProfileImages,
    regularImages,
    nsfwImages,
    skeletonImages,
    handleDeleteImage,
    handleEditPrompt,
    handleSavePrompt,
  } = useProfilePictureHandlers({
    handleRegenerateWithPrompt,
  });

  // Initialization hook (uses safeProfileImages from handlers hook)
  useProfilePictureInitialization({
    selectedBaseImageId,
    isGenerating,
    safeProfileImages,
    handleGenerateProfilePictures,
  });

  if (!selectedBaseImage) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-white/60 text-sm">
          Please select a base image first
        </p>
      </div>
    );
  }

  const isGeneratingWithSkeletons = isGenerating || skeletonImages.length > 0;
  const hasImages = regularImages.length > 0 || nsfwImages.length > 0;
  const editingImage = safeProfileImages.find(
    (img) => img.id === showPromptEditor
  );

  return (
    <div className="flex flex-col items-center w-full">
      <ProfilePictureHeader
        isGenerating={isGeneratingWithSkeletons}
        completedCount={completedCount}
        totalExpected={totalExpected}
        regularImageCount={regularImages.length}
        nsfwImageCount={nsfwImages.length}
        nsfwEnabled={form.nsfwEnabled || false}
      />

      <ProfilePictureNSFWToggle
        nsfwEnabled={form.nsfwEnabled || false}
        onNSFWChange={(enabled) => setField('nsfwEnabled', enabled)}
      />

      <ProfilePictureGrid
        images={safeProfileImages}
        selectedImageId={selectedImageId}
        nsfwEnabled={form.nsfwEnabled || false}
        onSelectImage={setSelectedImageId}
        onDeleteImage={handleDeleteImage}
        onRegenerateImage={handleRegenerateImage}
        onEditPrompt={handleEditPrompt}
      />

      {/* NSFW Images Section */}
      {form.nsfwEnabled && nsfwImages.length > 0 && (
        <div className="w-full mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-white/10" />
            <p className="text-white/40 text-sm font-medium px-4">
              18+ Content
            </p>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <ProfilePictureGrid
            images={nsfwImages}
            selectedImageId={selectedImageId}
            nsfwEnabled={true}
            onSelectImage={setSelectedImageId}
            onDeleteImage={handleDeleteImage}
            onRegenerateImage={handleRegenerateImage}
            onEditPrompt={handleEditPrompt}
          />
        </div>
      )}

      {editingImage && (
        <ProfilePicturePromptEditor
          image={editingImage}
          prompt={editingPrompt}
          onPromptChange={setEditingPrompt}
          onSave={() => handleSavePrompt(showPromptEditor!)}
          onCancel={() => {
            setShowPromptEditor(null);
            setEditingPrompt('');
          }}
        />
      )}

      <BaseImageError error={error} />

      <ProfilePictureEmptyState
        hasImages={hasImages}
        isGenerating={isGeneratingWithSkeletons}
        onGenerate={handleGenerateProfilePictures}
      />
    </div>
  );
}
