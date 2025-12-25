'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';
import { cn } from '@ryla/ui';

const creationMethods = [
  {
    id: 'presets',
    value: 'presets' as const,
    label: 'Create with Presets',
    description: 'Guided step-by-step wizard with visual options',
    bestFor: 'Recommended',
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
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
    description: 'Describe your character in your own words (voice memo coming soon)',
    bestFor: 'Quick start',
    gradient: 'from-cyan-500 to-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
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

  const handleMethodSelect = (method: 'presets' | 'prompt-based') => {
    setField('creationMethod', method);
    updateSteps(method);
    nextStep();
    router.push('/wizard/step-1');
  };

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Get Started</p>
        <h1 className="text-white text-2xl font-bold">
          How do you want to create?
        </h1>
      </div>

      {/* Options */}
      <div className="w-full space-y-3">
        {creationMethods.map((method) => {
          const isSelected = form.creationMethod === method.value;
          return (
            <button
              key={method.id}
              onClick={() => handleMethodSelect(method.value)}
              className={cn(
                'w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                isSelected
                  ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

              <div className="relative z-10 flex items-center gap-4">
                {/* Icon */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
                    method.gradient,
                    isSelected && 'scale-110'
                  )}
                >
                  {method.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-white">
                      {method.label}
                    </h3>
                    {method.bestFor === 'Recommended' && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-medium">
                        {method.bestFor}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/60">{method.description}</p>
                </div>

                {/* Arrow */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                    isSelected
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                      : 'bg-white/10'
                  )}
                >
                  {isSelected ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M10.5 4.5L5.25 9.75L3.5 8"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
      </div>

      {/* Helper text */}
      <p className="text-white/40 text-xs text-center mt-6">
        You can always change these settings later
      </p>
    </div>
  );
}
