'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { withCdn } from '@ryla/shared';
import { cn } from '@ryla/ui';

const genderOptions = [
  {
    value: 'female' as const,
    label: 'Female',
    gradient: 'from-pink-500 to-rose-500',
    disabled: false,
    comingSoon: false,
    image: withCdn('/images/wizard/base/caucasian/female-portrait.webp'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
        <circle cx="12" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 13v8M9 18h6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: 'male' as const,
    label: 'Male',
    gradient: 'from-blue-500 to-indigo-600',
    disabled: true,
    comingSoon: true,
    image: withCdn('/images/wizard/base/caucasian/male-portrait.webp'),
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
        <circle cx="10" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M14 10l5-5M15 5h4v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const styleOptions = [
  {
    value: 'realistic' as const,
    label: 'Realistic',
    description: 'Photorealistic AI images',
    gradient: 'from-purple-500 to-pink-500',
    disabled: false,
    comingSoon: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path
          d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    value: 'anime' as const,
    label: 'Anime',
    description: 'Stylized anime art',
    gradient: 'from-cyan-500 to-blue-600',
    disabled: true,
    comingSoon: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path
          d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42"
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
 * Step 1: Style Selection
 * Choose gender and style (realistic/anime)
 */
export function StepStyle() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Basic Settings</p>
        <h1 className="text-white text-2xl font-bold">Choose Gender & Style</h1>
      </div>

      {/* Gender Selection */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Select Gender</p>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {genderOptions.map((option) => {
              const isSelected = form.gender === option.value;
              const isDisabled = option.disabled;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    !isDisabled && setField('gender', option.value)
                  }
                  disabled={isDisabled}
                  className={cn(
                    'relative aspect-square rounded-xl border-2 transition-all duration-200 overflow-hidden',
                    isDisabled && 'cursor-not-allowed opacity-50',
                    isSelected
                      ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                      : isDisabled
                      ? 'border-white/5 bg-white/2'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  )}
                >
                  {/* Background Image */}
                  {option.image && (
                    <div className="absolute inset-0 z-0">
                      <img
                        src={option.image}
                        alt={option.label}
                        className={cn(
                          'w-full h-full object-cover',
                          isDisabled && 'opacity-30 grayscale'
                        )}
                      />
                      {/* Overlay gradient for better text visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                    </div>
                  )}

                  {/* Shimmer effect when selected */}
                  {isSelected && !isDisabled && (
                    <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-20" />
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-lg flex items-center justify-center shadow-md transition-transform duration-200 bg-gradient-to-br backdrop-blur-sm',
                        option.gradient,
                        isSelected && !isDisabled && 'scale-110',
                        isDisabled && 'opacity-50',
                        option.image && 'bg-white/20'
                      )}
                    >
                      {option.icon}
                    </div>
                    <p
                      className={cn(
                        'text-sm font-medium drop-shadow-lg',
                        isSelected ? 'text-white' : 'text-white/90',
                        isDisabled && 'opacity-50'
                      )}
                    >
                      {option.label}
                    </p>
                    {option.comingSoon && (
                      <span className="text-xs text-white/60 font-medium bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && !isDisabled && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center z-20 shadow-md">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M10 3L4.5 8.5L2 6"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Style Selection */}
      <div className="w-full space-y-3">
        {styleOptions.map((option) => {
          const isSelected = form.style === option.value;
          const isDisabled = option.disabled;
          return (
            <button
              key={option.value}
              onClick={() => !isDisabled && setField('style', option.value)}
              disabled={isDisabled}
              className={cn(
                'w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                isDisabled && 'cursor-not-allowed opacity-50',
                isSelected
                  ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                  : isDisabled
                  ? 'border-white/5 bg-white/2'
                  : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
              )}
            >
              <div className="relative z-10 flex items-center gap-4">
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
                    option.gradient,
                    isSelected && !isDisabled && 'scale-110',
                    isDisabled && 'opacity-50'
                  )}
                >
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {option.label}
                    </h3>
                    {option.comingSoon && (
                      <span className="text-xs text-white/40 font-medium bg-white/5 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm',
                      isDisabled ? 'text-white/40' : 'text-white/60'
                    )}
                  >
                    {option.description}
                  </p>
                </div>
                {isSelected && !isDisabled && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
