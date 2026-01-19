'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { routes } from '@/lib/routes';

/**
 * Step 2 (Custom Flow): Custom Review
 * Review custom prompts before generation
 */
export function StepCustomReview() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useCharacterWizardStore((s) => s.form);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);

  const handleContinue = () => {
    // Update store state immediately for instant UI feedback
    nextStep();

    // Navigate in a transition to make it feel instant
    startTransition(() => {
      router.push(routes.wizard.step3);
    });
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">Review</p>
        <h1 className="text-white text-2xl font-bold">Confirm Your Prompts</h1>
      </div>

      {/* Prompts Review */}
      <div className="w-full space-y-4">
        {/* Appearance */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👤</span>
            <p className="text-white/70 text-sm font-medium">Appearance</p>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            {form.customAppearancePrompt}
          </p>
        </div>

        {/* Identity */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">✨</span>
            <p className="text-white/70 text-sm font-medium">
              Identity & Personality
            </p>
          </div>
          <p className="text-white/90 text-sm leading-relaxed">
            {form.customIdentityPrompt}
          </p>
        </div>

        {/* Image Style */}
        {form.customImagePrompt && (
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🖼️</span>
              <p className="text-white/70 text-sm font-medium">Image Style</p>
            </div>
            <p className="text-white/90 text-sm leading-relaxed">
              {form.customImagePrompt}
            </p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="w-full my-6">
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
          <p className="text-white/70 text-xs text-center">
            These prompts will be used to generate your AI influencer
          </p>
        </div>
      </div>

      {/* Continue button */}
      <button
        onClick={handleContinue}
        disabled={isPending}
        className="w-full h-12 rounded-xl font-bold text-base bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
        <span className="relative z-10 flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
            <path
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Generate Character
        </span>
      </button>
    </div>
  );
}
