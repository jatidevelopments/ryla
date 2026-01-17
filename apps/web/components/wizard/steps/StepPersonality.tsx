'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { Input, Textarea, cn } from '@ryla/ui';
import { PERSONALITY_TRAIT_OPTIONS } from '@ryla/shared';

/**
 * Step: Personality & Bio
 * User sets name, personality traits, and bio
 */
export function StepPersonality() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const toggleTrait = (trait: string) => {
    const current = form.personalityTraits;
    if (current.includes(trait)) {
      setField(
        'personalityTraits',
        current.filter((t) => t !== trait)
      );
    } else if (current.length < 3) {
      setField('personalityTraits', [...current, trait]);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Identity</p>
        <h1 className="text-white text-2xl font-bold">Personality & Bio</h1>
      </div>

      {/* Name */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-3">Name your influencer</p>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="e.g., Luna Martinez"
            className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl focus:border-purple-500/50 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Personality Traits */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm">Personality Traits</p>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {form.personalityTraits.length}/3
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PERSONALITY_TRAIT_OPTIONS.map((option) => {
              const isSelected = form.personalityTraits.includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleTrait(option.value)}
                  className={cn(
                    'rounded-full border px-4 py-3 text-sm transition-all duration-200 min-h-[44px]',
                    isSelected
                      ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10'
                  )}
                >
                  {option.emoji} {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-3">
            Bio <span className="text-white/40">(optional)</span>
          </p>
          <Textarea
            id="bio"
            value={form.bio}
            onChange={(e) => setField('bio', e.target.value)}
            placeholder="e.g., Just a small-town girl with big dreams ✨"
            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
          />
        </div>
      </div>
    </div>
  );
}
