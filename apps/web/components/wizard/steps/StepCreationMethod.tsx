'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';
import { cn } from '@ryla/ui';
import { FEATURE_CREDITS } from '@ryla/shared';

// Character creation costs from shared pricing
const CHARACTER_CREATION_COST = FEATURE_CREDITS.base_images.credits; // 100 credits for base images

const creationMethods = [
  {
    id: 'presets',
    value: 'presets' as const,
    label: 'Create with Presets',
    description: 'Guided step-by-step wizard with visual options',
    bestFor: 'Recommended',
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
        <path
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'prompt-based',
    value: 'prompt-based' as const,
    label: 'Create with Prompt',
    description: 'Quick creation with one detailed description',
    bestFor: 'Quick start',
    gradient: 'from-cyan-500 to-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6 text-white">
        <path
          d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

/**
 * Step 0: Creation Method Selection
 * Choose how to create the AI influencer
 */
export function StepCreationMethod() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const updateSteps = useCharacterWizardStore((s) => s.updateSteps);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);

  const handleMethodSelect = (
    method: 'presets' | 'prompt-based' | 'existing-person'
  ) => {
    setField('creationMethod', method);
    updateSteps(method);
    nextStep();
    router.push('/wizard/step-1');
  };

  return (
    <div className="flex flex-col items-center px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 w-full">
        <p className="text-white/60 text-xs sm:text-sm font-medium mb-2">Get Started</p>
        <h1 className="text-white text-xl sm:text-2xl font-bold mb-3 sm:mb-4 px-2">
          How do you want to create?
        </h1>
        {/* Credit cost indicator */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0"
          >
            <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.088-2.046.44-.312.978-.53 1.662-.622V4.75A.75.75 0 0110 4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xs sm:text-sm font-medium text-white/80 whitespace-nowrap">
            <span className="text-purple-300 font-semibold">
              {CHARACTER_CREATION_COST}
            </span>{' '}
            credits to create
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="w-full space-y-2.5 sm:space-y-3">
        {creationMethods.map((method) => {
          const isSelected = form.creationMethod === method.value;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.value)}
              className={cn(
                'w-full p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                isSelected
                  ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:bg-white/10'
              )}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
                    method.gradient,
                    isSelected && 'scale-110'
                  )}
                >
                  {method.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {method.label}
                    </h3>
                    {method.bestFor === 'Recommended' && (
                      <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] sm:text-xs font-medium whitespace-nowrap">
                        {method.bestFor}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{method.description}</p>
                </div>

                {/* Arrow */}
                <div
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-white/10'
                  )}
                >
                  {isSelected ? (
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M10.5 4.5L5.25 9.75L3.5 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M5 3L9 7L5 11"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Divider */}
        <div className="relative my-4 sm:my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-[var(--bg-base)] text-white/30 text-[10px] sm:text-xs font-medium tracking-wider uppercase">
              or
            </span>
          </div>
        </div>

        {/* Existing Person Option */}
        <button
          onClick={() => handleMethodSelect('existing-person')}
          className={cn(
            'w-full p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
            form.creationMethod === 'existing-person'
              ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 active:bg-white/10'
          )}
        >
          {/* Shimmer effect on hover */}
          <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            {/* Icon */}
            <div
              className={cn(
                'w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br from-amber-500 to-orange-500',
                form.creationMethod === 'existing-person' && 'scale-110'
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
              >
                <path
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Create from Existing Person
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                Request to create an AI influencer based on an existing person
              </p>
            </div>

            {/* Arrow */}
            <div
              className={cn(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                form.creationMethod === 'existing-person'
                  ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                  : 'bg-white/10'
              )}
            >
              {form.creationMethod === 'existing-person' ? (
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M10.5 4.5L5.25 9.75L3.5 8"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M5 3L9 7L5 11"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
