'use client';

import * as React from 'react';
import { capture } from '@ryla/analytics';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../../../lib/trpc';
import { useInfluencerStore } from '@ryla/business';
import { validateName, validateBio, validateHandle } from '../utils/validation';

interface UseInfluencerSettingsOptions {
  influencer: AIInfluencer;
}

/**
 * Hook for managing influencer settings form state, validation, and API calls
 */
export function useInfluencerSettings({ influencer }: UseInfluencerSettingsOptions) {
  const updateInfluencer = useInfluencerStore((s) => s.updateInfluencer);
  const utils = trpc.useUtils();

  // Form state
  const [name, setName] = React.useState(influencer.name || '');
  const [bio, setBio] = React.useState(influencer.bio || '');
  const [handle, setHandle] = React.useState(influencer.handle || '');
  const [nsfwEnabled, setNsfwEnabled] = React.useState(influencer.nsfwEnabled || false);

  // Error state
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [bioError, setBioError] = React.useState<string | null>(null);
  const [handleError, setHandleError] = React.useState<string | null>(null);

  // Loading state
  const [isSavingName, setIsSavingName] = React.useState(false);
  const [isSavingBio, setIsSavingBio] = React.useState(false);
  const [isSavingHandle, setIsSavingHandle] = React.useState(false);
  const [isSavingNsfw, setIsSavingNsfw] = React.useState(false);

  // Track if fields were edited
  const nameChanged = name !== influencer.name;
  const bioChanged = bio !== influencer.bio;
  const handleChanged = handle !== influencer.handle;

  // Update mutation
  const updateMutation = trpc.character.update.useMutation({
    onSuccess: (data) => {
      if (data) {
        const updatedConfig = data.config as any;
        updateInfluencer(influencer.id, {
          name: data.name || influencer.name,
          handle: data.handle || influencer.handle,
          bio: updatedConfig?.bio ?? influencer.bio,
          nsfwEnabled: updatedConfig?.nsfwEnabled ?? nsfwEnabled,
        });
        // Update local state to match saved values
        if (data.name) setName(data.name);
        if (updatedConfig?.bio !== undefined) setBio(updatedConfig.bio);
        if (updatedConfig?.nsfwEnabled !== undefined) setNsfwEnabled(updatedConfig.nsfwEnabled);
        utils.character.getById.invalidate({ id: influencer.id });
      }
      setIsSavingName(false);
      setIsSavingBio(false);
      setIsSavingHandle(false);
      setIsSavingNsfw(false);
      setNameError(null);
      setBioError(null);
      setHandleError(null);
    },
    onError: (error) => {
      setIsSavingName(false);
      setIsSavingBio(false);
      setIsSavingHandle(false);
      setIsSavingNsfw(false);
      if (error.message.includes('handle') || error.message.includes('unique')) {
        setHandleError('This handle is already taken. Please choose another.');
      } else if (error.message.includes('name')) {
        setNameError(error.message || 'Failed to save name.');
      } else if (error.message.includes('bio')) {
        setBioError(error.message || 'Failed to save bio.');
      } else {
        setHandleError(error.message || 'Failed to save. Please try again.');
      }
    },
  });

  // Handlers
  const handleNameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setNameError(error);
  }, []);

  const handleBioChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
    const error = validateBio(value);
    setBioError(error);
  }, []);

  const handleHandleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHandle(value);
    const error = validateHandle(value);
    setHandleError(error);

    // Track edit started
    if (!handleChanged && value !== influencer.handle) {
      capture('handle_edit_started', {
        influencer_id: influencer.id,
      });
    }
  }, [handleChanged, influencer.handle, influencer.id]);

  const handleSaveName = React.useCallback(async () => {
    const error = validateName(name);
    if (error) {
      setNameError(error);
      return;
    }

    setIsSavingName(true);

    try {
      await updateMutation.mutateAsync({
        id: influencer.id,
        name: name.trim(),
      });

      capture('name_edit_completed', {
        influencer_id: influencer.id,
        name: name.trim(),
        success: true,
      });
    } catch (error) {
      capture('name_edit_failed', {
        influencer_id: influencer.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [name, influencer.id, updateMutation]);

  const handleSaveBio = React.useCallback(async () => {
    const error = validateBio(bio);
    if (error) {
      setBioError(error);
      return;
    }

    setIsSavingBio(true);

    try {
      await updateMutation.mutateAsync({
        id: influencer.id,
        config: {
          bio: bio.trim(),
        },
      });

      capture('bio_edit_completed', {
        influencer_id: influencer.id,
        success: true,
      });
    } catch (error) {
      capture('bio_edit_failed', {
        influencer_id: influencer.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [bio, influencer.id, updateMutation]);

  const handleSaveHandle = React.useCallback(async () => {
    const error = validateHandle(handle);
    if (error) {
      setHandleError(error);
      return;
    }

    setIsSavingHandle(true);
    const cleanHandle = handle.replace(/^@/, '').trim();

    try {
      await updateMutation.mutateAsync({
        id: influencer.id,
        handle: cleanHandle,
      });

      capture('handle_edit_completed', {
        influencer_id: influencer.id,
        handle: cleanHandle,
        success: true,
      });
    } catch (error) {
      capture('handle_edit_failed', {
        influencer_id: influencer.id,
        error: error instanceof Error ? error.message : 'Unknown error',
        reason: 'server_error',
      });
    }
  }, [handle, influencer.id, updateMutation]);

  const handleNsfwToggle = React.useCallback(
    async (checked: boolean) => {
      const previousValue = nsfwEnabled;
      setNsfwEnabled(checked);
      setIsSavingNsfw(true);

      try {
        const result = await updateMutation.mutateAsync({
          id: influencer.id,
          config: {
            nsfwEnabled: checked,
          },
        });

        if (result) {
          updateInfluencer(influencer.id, {
            nsfwEnabled: checked,
          });
        }

        capture('nsfw_toggle_changed', {
          influencer_id: influencer.id,
          nsfw_enabled: checked,
        });

        setIsSavingNsfw(false);
      } catch (error) {
        // Revert on error
        setNsfwEnabled(previousValue);
        setIsSavingNsfw(false);
        console.error('Failed to update NSFW setting:', error);
      }
    },
    [nsfwEnabled, influencer.id, updateMutation, updateInfluencer]
  );

  return {
    // Form values
    name,
    bio,
    handle,
    nsfwEnabled,

    // Errors
    nameError,
    bioError,
    handleError,

    // Loading states
    isSavingName,
    isSavingBio,
    isSavingHandle,
    isSavingNsfw,

    // Changed flags
    nameChanged,
    bioChanged,
    handleChanged,

    // Handlers
    handleNameChange,
    handleBioChange,
    handleHandleChange,
    handleSaveName,
    handleSaveBio,
    handleSaveHandle,
    handleNsfwToggle,
  };
}

