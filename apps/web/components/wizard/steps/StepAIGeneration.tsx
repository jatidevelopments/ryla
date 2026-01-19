'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';
import { routes } from '@/lib/routes';

/**
 * Step 2 (AI Flow): AI Generation
 * Loader showing AI generation progress
 */
export function StepAIGeneration() {
  const router = useRouter();
  const setField = useCharacterWizardStore((s) => s.setField);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);
  const [progress, setProgress] = React.useState(0);
  const [isComplete, setIsComplete] = React.useState(false);

  React.useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          return 100;
        }
        return Math.min(prev + Math.random() * 15, 100);
      });
    }, 500);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  React.useEffect(() => {
    if (isComplete) {
      const mockConfig = {
        gender: 'female',
        style: 'realistic',
        ethnicity: 'caucasian',
        age: 25,
        hairStyle: 'long',
        hairColor: 'blonde',
        eyeColor: 'blue',
        bodyType: 'athletic',
        archetype: 'fitness_enthusiast',
        personalityTraits: ['confident', 'caring', 'ambitious'],
        bio: 'A 25-year-old fitness coach from Miami who loves sunrise workouts and motivating others.',
        name: 'Mia Rodriguez',
      };

      setField('aiGeneratedConfig', mockConfig);
    }
  }, [isComplete, setField]);

  const handleContinue = () => {
    if (!isComplete) return;
    nextStep();
    router.push(routes.wizard.step3);
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {/* Animated loader */}
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20" />
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="52"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeDasharray={`${progress * 3.27} 327`}
            strokeLinecap="round"
            className="transition-all duration-300"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-10 h-10 text-cyan-400"
          >
            <path
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 5.607a1.5 1.5 0 01-1.066 1.838l-.455.109a1.5 1.5 0 01-1.838-1.066l-.352-1.406M5 14.5l-1.402 5.607a1.5 1.5 0 001.066 1.838l.455.109a1.5 1.5 0 001.838-1.066l.352-1.406M12 21a3 3 0 100-6 3 3 0 000 6z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Text */}
      <h2 className="text-xl font-bold text-white mb-2">
        {isComplete ? 'Generation Complete!' : 'AI is Creating Your Influencer'}
      </h2>
      <p className="text-white/60 text-sm mb-8">
        {isComplete
          ? 'Review your generated character'
          : 'This will take just a moment...'}
      </p>

      {/* Progress text */}
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-xl px-6 py-3 mb-8">
        <span className="text-2xl font-bold text-white">
          {Math.round(progress)}%
        </span>
        <span className="text-white/50 text-sm ml-2">complete</span>
      </div>

      {/* Continue button - only show when complete */}
      {isComplete && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121214]/90 backdrop-blur-md border-t border-white/5 md:relative md:p-0 md:bg-transparent md:border-none md:mt-0 z-30">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleContinue}
              className="w-full h-12 md:h-14 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all relative overflow-hidden group active:scale-[0.98]"
            >
              <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
              <span className="relative z-10">Review & Continue</span>
            </button>
          </div>
        </div>
      )}
      {/* Spacer for fixed button on mobile when complete */}
      {isComplete && <div className="h-20 md:hidden" />}
    </div>
  );
}
