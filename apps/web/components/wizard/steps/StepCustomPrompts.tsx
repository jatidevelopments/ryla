'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { Textarea } from '@ryla/ui';

/**
 * Step 1 (Custom Flow): Custom Prompts
 * User enters custom prompts for all aspects
 */
export function StepCustomPrompts() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">
          Custom Creation
        </p>
        <h1 className="text-white text-2xl font-bold">Write Your Prompts</h1>
      </div>

      {/* Appearance Prompt */}
      <div className="w-full mb-4">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">👤</span>
              <p className="text-white/70 text-sm">
                Appearance <span className="text-pink-400">*</span>
              </p>
            </div>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.customAppearancePrompt || '').length}/500
            </span>
          </div>
          <Textarea
            value={form.customAppearancePrompt || ''}
            onChange={(e) => setField('customAppearancePrompt', e.target.value)}
            placeholder="Describe physical appearance: age, ethnicity, hair, eyes, body type, etc."
            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
            maxLength={500}
          />
        </div>
      </div>

      {/* Identity Prompt */}
      <div className="w-full mb-4">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <p className="text-white/70 text-sm">
                Identity & Personality <span className="text-pink-400">*</span>
              </p>
            </div>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.customIdentityPrompt || '').length}/500
            </span>
          </div>
          <Textarea
            value={form.customIdentityPrompt || ''}
            onChange={(e) => setField('customIdentityPrompt', e.target.value)}
            placeholder="Describe personality, archetype, background story, values, etc."
            className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
            maxLength={500}
          />
        </div>
      </div>

      {/* Image Prompt (Optional) */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🖼️</span>
              <p className="text-white/70 text-sm">
                Image Style <span className="text-white/40">(optional)</span>
              </p>
            </div>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.customImagePrompt || '').length}/300
            </span>
          </div>
          <Textarea
            value={form.customImagePrompt || ''}
            onChange={(e) => setField('customImagePrompt', e.target.value)}
            placeholder="Additional prompts for image generation style, lighting, mood, etc."
            className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-orange-500/50 focus:ring-orange-500/20"
            maxLength={300}
          />
        </div>
      </div>
    </div>
  );
}
