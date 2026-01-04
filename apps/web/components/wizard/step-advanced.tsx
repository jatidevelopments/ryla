'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardOptionCard } from './wizard-option-card';
import { WizardImageCard } from './wizard-image-card';
import { cn } from '@ryla/ui';
import {
  INFLUENCER_VOICES,
  VIDEO_CONTENT_OPTIONS,
} from '../../constants';

/**
 * Step 9: Advanced
 * Combine: Voice + Video Content Options + NSFW Toggle
 */
export function StepAdvanced() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const toggleVideoContent = (value: string) => {
    const current = form.videoContentOptions || [];
    if (current.includes(value)) {
      setField(
        'videoContentOptions',
        current.filter((v) => v !== value)
      );
    } else {
      setField('videoContentOptions', [...current, value]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Advanced</p>
        <h1 className="text-white text-2xl font-bold">Voice & Content</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Voice */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Voice</p>
            <div className="grid grid-cols-3 gap-3">
              {INFLUENCER_VOICES.map((option) => (
                <WizardOptionCard
                  key={option.id}
                  label={option.label}
                  selected={form.voice === option.value}
                  onSelect={() => setField('voice', option.value)}
                  size="md"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Video Content Options */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Video Content Options</p>
            <p className="text-white/50 text-xs mb-4">Select all that apply</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {VIDEO_CONTENT_OPTIONS.map((option) => {
                const isSelected = form.videoContentOptions?.includes(option.value) || false;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={option.image}
                    selected={isSelected}
                    onSelect={() => toggleVideoContent(option.value)}
                    aspectRatio="wide"
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: NSFW Toggle */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">NSFW Content</p>
            <button
              onClick={() => setField('nsfwEnabled', !form.nsfwEnabled)}
              className={cn(
                'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                form.nsfwEnabled
                  ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-white mb-1">
                    Enable NSFW Content
                  </p>
                  <p className="text-sm text-white/60">
                    Allow generation of adult content
                  </p>
                </div>
                <div
                  className={cn(
                    'w-12 h-6 rounded-full transition-all duration-200 flex items-center',
                    form.nsfwEnabled
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                      : 'bg-white/20'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md',
                      form.nsfwEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    )}
                  />
                </div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

