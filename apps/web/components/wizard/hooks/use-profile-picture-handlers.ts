'use client';

import * as React from 'react';
import { useCharacterWizardStore, type ProfilePictureImage } from '@ryla/business';

interface UseProfilePictureHandlersOptions {

  handleRegenerateWithPrompt: (imageId: string, prompt: string) => Promise<void>;
}

interface UseProfilePictureHandlersReturn {
  selectedImageId: string | null;
  setSelectedImageId: (id: string | null) => void;
  showPromptEditor: string | null;
  setShowPromptEditor: (id: string | null) => void;
  editingPrompt: string;
  setEditingPrompt: (prompt: string) => void;
  safeProfileImages: ProfilePictureImage[];
  regularImages: ProfilePictureImage[];
  nsfwImages: ProfilePictureImage[];
  skeletonImages: ProfilePictureImage[];
  handleDeleteImage: (imageId: string) => void;
  handleEditPrompt: (image: ProfilePictureImage) => void;
  handleSavePrompt: (imageId: string) => Promise<void>;
}

/**
 * Hook for profile picture action handlers and computed values
 */
export function useProfilePictureHandlers({

  handleRegenerateWithPrompt,
}: UseProfilePictureHandlersOptions): UseProfilePictureHandlersReturn {
  const profilePictureSet = useCharacterWizardStore((s) => s.profilePictureSet);
  const removeProfilePicture = useCharacterWizardStore((s) => s.removeProfilePicture);

  const [selectedImageId, setSelectedImageId] = React.useState<string | null>(null);
  const [showPromptEditor, setShowPromptEditor] = React.useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = React.useState<string>('');

  const safeProfileImages = React.useMemo(
    () => (Array.isArray(profilePictureSet.images) ? profilePictureSet.images : []),
    [profilePictureSet.images]
  );

  const regularImages = React.useMemo(
    () => safeProfileImages.filter((img) => !img.isNSFW),
    [safeProfileImages]
  );

  const nsfwImages = React.useMemo(
    () => safeProfileImages.filter((img) => img.isNSFW),
    [safeProfileImages]
  );

  const skeletonImages = React.useMemo(
    () => safeProfileImages.filter((img) => img.url === 'skeleton'),
    [safeProfileImages]
  );

  const handleDeleteImage = React.useCallback(
    (imageId: string) => {
      removeProfilePicture(imageId);
      if (selectedImageId === imageId) {
        setSelectedImageId(null);
      }
    },
    [selectedImageId, removeProfilePicture]
  );

  const handleEditPrompt = React.useCallback((image: ProfilePictureImage) => {
    setEditingPrompt(image.prompt || '');
    setShowPromptEditor(image.id);
  }, []);

  const handleSavePrompt = React.useCallback(
    async (imageId: string) => {
      await handleRegenerateWithPrompt(imageId, editingPrompt);
      setShowPromptEditor(null);
      setEditingPrompt('');
    },
    [editingPrompt, handleRegenerateWithPrompt]
  );

  return {
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
  };
}

