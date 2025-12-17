'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore, useInfluencerStore } from '@ryla/business';
import { Switch, cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';

/**
 * Step 6: Generate
 * Preview settings and create the AI influencer
 */
export function StepGenerate() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);

  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus('generating');

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create new influencer
    const newId = `influencer-${Date.now()}`;
    const handle = `@${(form.name || 'unnamed')
      .toLowerCase()
      .replace(/\s+/g, '.')}`;

    const newInfluencer: AIInfluencer = {
      id: newId,
      name: form.name || 'Unnamed',
      handle,
      bio: form.bio || 'New AI influencer ✨',
      avatar: '',
      gender: form.gender || 'female',
      style: form.style || 'realistic',
      ethnicity: form.ethnicity || 'caucasian',
      age: form.age,
      hairStyle: form.hairStyle || 'long-straight',
      hairColor: form.hairColor || 'brown',
      eyeColor: form.eyeColor || 'brown',
      bodyType: form.bodyType || 'slim',
      breastSize: form.breastSize || undefined,
      archetype: form.archetype || 'girl-next-door',
      personalityTraits:
        form.personalityTraits.length > 0
          ? form.personalityTraits
          : ['friendly'],
      outfit: form.outfit || 'casual',
      nsfwEnabled: form.nsfwEnabled,
      postCount: 0,
      imageCount: 0,
      likedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInfluencer(newInfluencer);
    setCharacterId(newId);
    setStatus('completed');
    resetForm();

    router.push(`/influencer/${newId}/studio`);
  };

  // Build summary items
  const summaryItems = [
    { label: 'Gender', value: form.gender },
    { label: 'Style', value: form.style },
    { label: 'Ethnicity', value: form.ethnicity },
    { label: 'Age', value: form.age },
    {
      label: 'Hair',
      value: `${form.hairColor || ''} ${form.hairStyle || ''}`.trim(),
    },
    { label: 'Eyes', value: form.eyeColor },
    { label: 'Body', value: form.bodyType },
  ].filter((item) => item.value);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        {/* Animated loader */}
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-8 h-8 text-purple-400"
            >
              <path
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">
          Creating Your Influencer
        </h2>
        <p className="text-white/60 text-sm">This will only take a moment...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-white/60 text-sm font-medium mb-2">Final Step</p>
        <h1 className="text-white text-2xl font-bold">
          {form.name || 'Your AI Influencer'}
        </h1>
        {form.personalityTraits.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {form.personalityTraits.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-3 py-1 text-xs text-white/80 capitalize"
              >
                {trait}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Character Summary</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {summaryItems.map((item) => (
              <div key={item.label} className="flex flex-col">
                <span className="text-white/40 text-xs">{item.label}</span>
                <span className="text-white capitalize">
                  {String(item.value).replace(/-/g, ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm space-y-4">
          <p className="text-white/70 text-sm">Generation Settings</p>

          {/* Aspect Ratio */}
          <div>
            <p className="text-white/50 text-xs mb-2">Aspect Ratio</p>
            <div className="flex gap-2">
              {(['1:1', '9:16', '2:3'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setField('aspectRatio', ratio)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2.5 text-center text-sm transition-all',
                    form.aspectRatio === ratio
                      ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'
                  )}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Mode */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">HQ Mode</p>
              <p className="text-white/40 text-xs">Higher quality output</p>
            </div>
            <Switch
              checked={form.qualityMode === 'hq'}
              onCheckedChange={(checked) =>
                setField('qualityMode', checked ? 'hq' : 'draft')
              }
            />
          </div>

          {/* NSFW */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-white text-sm font-medium">18+ Content</p>
              <p className="text-white/40 text-xs">Enable adult content</p>
            </div>
            <Switch
              checked={form.nsfwEnabled}
              onCheckedChange={(checked) => setField('nsfwEnabled', checked)}
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="w-full">
        <button
          onClick={handleGenerate}
          className="w-full h-14 rounded-xl font-bold text-base bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all relative overflow-hidden group"
        >
          <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Create AI Influencer
          </span>
        </button>
        <p className="text-white/40 text-xs text-center mt-3">Uses 5 credits</p>
      </div>
    </div>
  );
}
