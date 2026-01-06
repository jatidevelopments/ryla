'use client';

import * as React from 'react';
import { PageContainer } from '@ryla/ui';
import { capture } from '@ryla/analytics';
import type { AIInfluencer } from '@ryla/shared';
import { useInfluencerSettings } from './influencer-settings/hooks/use-influencer-settings';
import { InfluencerSettingsHeader } from './components/influencer-settings-header';
import { NSFWToggleSection } from './influencer-settings/components/nsfw-toggle-section';
import { NameField } from './influencer-settings/components/name-field';
import { BioField } from './influencer-settings/components/bio-field';
import { HandleField } from './influencer-settings/components/handle-field';
import { SocialMediaSection } from './influencer-settings/components/social-media-section';

export interface InfluencerSettingsContentProps {
  influencer: AIInfluencer;
  onBack: () => void;
}

export function InfluencerSettingsContent({
  influencer,
  onBack,
}: InfluencerSettingsContentProps) {
  // Settings hook - handles all form state, validation, and API calls
  const {
    name,
    bio,
    handle,
    nsfwEnabled,
    nameError,
    bioError,
    handleError,
    isSavingName,
    isSavingBio,
    isSavingHandle,
    isSavingNsfw,
    nameChanged,
    bioChanged,
    handleChanged,
    handleNameChange,
    handleBioChange,
    handleHandleChange,
    handleSaveName,
    handleSaveBio,
    handleSaveHandle,
    handleNsfwToggle,
  } = useInfluencerSettings({ influencer });

  // Track page view
  React.useEffect(() => {
    capture('settings_page_viewed', {
      influencer_id: influencer.id,
    });
  }, [influencer.id]);

  return (
    <div className="min-h-screen">
      <InfluencerSettingsHeader onBack={onBack} />

      <PageContainer className="py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <NSFWToggleSection
            nsfwEnabled={nsfwEnabled}
            isSaving={isSavingNsfw}
            onToggle={handleNsfwToggle}
          />

          {/* Identity Settings */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Identity Settings</h2>
            <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6 space-y-6">
              <NameField
                value={name}
                error={nameError}
                hasChanged={nameChanged}
                isSaving={isSavingName}
                onChange={handleNameChange}
                onSave={handleSaveName}
              />

              <BioField
                value={bio}
                error={bioError}
                hasChanged={bioChanged}
                isSaving={isSavingBio}
                onChange={handleBioChange}
                onSave={handleSaveBio}
              />

              <HandleField
                value={handle}
                error={handleError}
                hasChanged={handleChanged}
                isSaving={isSavingHandle}
                onChange={handleHandleChange}
                onSave={handleSaveHandle}
              />
            </div>
          </section>

          <SocialMediaSection />
        </div>
      </PageContainer>
    </div>
  );
}

