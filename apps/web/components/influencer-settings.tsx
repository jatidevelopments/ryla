'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Instagram, Twitter, Music, Lock } from 'lucide-react';
import { PageContainer, Input, Label, RylaButton, Textarea, cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { trpc } from '../lib/trpc';
import { capture } from '@ryla/analytics';
import { useInfluencerStore } from '@ryla/business';

export interface InfluencerSettingsContentProps {
  influencer: AIInfluencer;
  onBack: () => void;
}

export function InfluencerSettingsContent({
  influencer,
  onBack,
}: InfluencerSettingsContentProps) {
  const updateInfluencer = useInfluencerStore((s) => s.updateInfluencer);
  const utils = trpc.useUtils();

  // Name editing state
  const [name, setName] = React.useState(influencer.name || '');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [isSavingName, setIsSavingName] = React.useState(false);

  // Bio editing state
  const [bio, setBio] = React.useState(influencer.bio || '');
  const [bioError, setBioError] = React.useState<string | null>(null);
  const [isSavingBio, setIsSavingBio] = React.useState(false);

  // Handle editing state
  const [handle, setHandle] = React.useState(influencer.handle || '');
  const [handleError, setHandleError] = React.useState<string | null>(null);
  const [isSavingHandle, setIsSavingHandle] = React.useState(false);

  // NSFW toggle state
  const [nsfwEnabled, setNsfwEnabled] = React.useState(influencer.nsfwEnabled || false);
  const [isSavingNsfw, setIsSavingNsfw] = React.useState(false);

  // Track if fields were edited
  const nameChanged = name !== influencer.name;
  const bioChanged = bio !== influencer.bio;
  const handleChanged = handle !== influencer.handle;

  // Update mutation
  const updateMutation = trpc.character.update.useMutation({
    onSuccess: (data) => {
      // Update local store
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

  // Validate name
  const validateName = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Name is required';
    }
    if (value.trim().length > 100) {
      return 'Name must be 100 characters or less';
    }
    return null;
  };

  // Validate bio
  const validateBio = (value: string): string | null => {
    if (value.length > 500) {
      return 'Bio must be 500 characters or less';
    }
    return null;
  };

  // Validate handle format
  const validateHandle = (value: string): string | null => {
    if (!value || value.trim().length === 0) {
      return 'Handle is required';
    }
    const cleanValue = value.replace(/^@/, '').trim();
    if (cleanValue.length < 3) {
      return 'Handle must be at least 3 characters';
    }
    if (cleanValue.length > 30) {
      return 'Handle must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanValue)) {
      return 'Handle can only contain letters, numbers, hyphens, and underscores';
    }
    return null;
  };

  // Handle name input change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    const error = validateName(value);
    setNameError(error);
  };

  // Handle bio input change
  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setBio(value);
    const error = validateBio(value);
    setBioError(error);
  };

  // Save name
  const handleSaveName = async () => {
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
  };

  // Save bio
  const handleSaveBio = async () => {
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
  };

  // Handle handle input change
  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  // Save handle
  const handleSaveHandle = async () => {
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
  };

  // Handle NSFW toggle
  const handleNsfwToggle = async (checked: boolean) => {
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

      // Update local store with the new value
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
  };

  // Track page view
  React.useEffect(() => {
    capture('settings_page_viewed', {
      influencer_id: influencer.id,
    });
  }, [influencer.id]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--bg-base)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 lg:px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center group-hover:bg-[var(--bg-surface)] transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </div>
            <span className="hidden sm:inline">Back to Profile</span>
          </button>

          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            Settings
          </h1>

          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      <PageContainer className="py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Content Settings */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Content Settings
            </h2>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <Label htmlFor="nsfw-toggle" className="text-base font-medium text-[var(--text-primary)] cursor-pointer block mb-2">
                    Enable Adult Content
                  </Label>
                  <p className="text-sm text-[var(--text-muted)]">
                    18+ only. When enabled, this allows generation of NSFW content and enables access to adult models for this AI Influencer.
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {isSavingNsfw && (
                    <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Saving...</span>
                  )}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={nsfwEnabled}
                    onClick={() => !isSavingNsfw && handleNsfwToggle(!nsfwEnabled)}
                    disabled={isSavingNsfw}
                    className={cn(
                      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed",
                      nsfwEnabled 
                        ? "bg-[var(--purple-500)]" 
                        : "bg-white/20 border border-white/30"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        nsfwEnabled ? "translate-x-6" : "translate-x-1"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Identity Settings */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Identity Settings
            </h2>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name-input">Name</Label>
                <p className="text-sm text-[var(--text-muted)]">
                  Your AI Influencer's display name. Must be 1-100 characters.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="name-input"
                      type="text"
                      value={name}
                      onChange={handleNameChange}
                      placeholder="Influencer name"
                      className={nameError ? 'border-red-500/50' : ''}
                    />
                    {nameError && (
                      <p className="text-sm text-red-400 mt-1">{nameError}</p>
                    )}
                  </div>
                  <RylaButton
                    onClick={handleSaveName}
                    disabled={!nameChanged || !!nameError || isSavingName}
                    variant="gradient"
                    size="sm"
                  >
                    {isSavingName ? 'Saving...' : 'Save'}
                  </RylaButton>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio-input">Bio</Label>
                <p className="text-sm text-[var(--text-muted)]">
                  A short description of your AI Influencer. Optional, max 500 characters.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Textarea
                      id="bio-input"
                      value={bio}
                      onChange={handleBioChange}
                      placeholder="Write a bio for your AI Influencer..."
                      rows={3}
                      className={bioError ? 'border-red-500/50' : ''}
                    />
                    <div className="flex items-center justify-between mt-1">
                      {bioError && (
                        <p className="text-sm text-red-400">{bioError}</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] ml-auto">
                        {bio.length}/500
                      </p>
                    </div>
                  </div>
                  <RylaButton
                    onClick={handleSaveBio}
                    disabled={!bioChanged || !!bioError || isSavingBio}
                    variant="gradient"
                    size="sm"
                    className="self-start"
                  >
                    {isSavingBio ? 'Saving...' : 'Save'}
                  </RylaButton>
                </div>
              </div>

              {/* Handle */}
              <div className="space-y-2">
                <Label htmlFor="handle-input">Handle / Slug</Label>
                <p className="text-sm text-[var(--text-muted)]">
                  Your AI Influencer's unique identifier. Must be unique, 3-30 characters, letters, numbers, hyphens, and underscores only.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      id="handle-input"
                      type="text"
                      value={handle}
                      onChange={handleHandleChange}
                      placeholder="@username"
                      className={handleError ? 'border-red-500/50' : ''}
                    />
                    {handleError && (
                      <p className="text-sm text-red-400 mt-1">{handleError}</p>
                    )}
                  </div>
                  <RylaButton
                    onClick={handleSaveHandle}
                    disabled={!handleChanged || !!handleError || isSavingHandle}
                    variant="gradient"
                    size="sm"
                  >
                    {isSavingHandle ? 'Saving...' : 'Save'}
                  </RylaButton>
                </div>
              </div>
            </div>
          </section>

          {/* Social Media Connections */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              Social Media Connections
            </h2>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6 space-y-4 opacity-60">
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Connect your social media accounts to automatically post content. Coming soon!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Instagram */}
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Instagram
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                </div>

                {/* Twitter/X */}
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Twitter className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        Twitter / X
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                </div>

                {/* TikTok */}
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                    <Music className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        TikTok
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                </div>

                {/* OnlyFans */}
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">OF</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        OnlyFans
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-[var(--text-muted)]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </div>
  );
}

