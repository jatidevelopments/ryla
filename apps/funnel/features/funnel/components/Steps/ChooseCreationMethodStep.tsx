'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import StepWrapper from '@/components/layouts/StepWrapper';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { trackFacebookViewContent } from '@ryla/analytics';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import ImageCard from '@/components/ImageCard';

const creationMethods: Array<{
  id: string;
  value: 'custom' | 'presets' | 'ai';
  label: string;
  description: string;
  bestFor: string;
  icon: string;
  gradient: string;
}> = [
  {
    id: 'presets',
    value: 'presets',
    label: 'Create with Presets',
    description: 'Guided step-by-step wizard',
    bestFor: 'Beginners',
    icon: '/icons/magic-wand-icon.svg',
    gradient: 'from-purple-500/20 to-pink-500/20',
  },
  {
    id: 'ai',
    value: 'ai',
    label: 'Create with AI',
    description: 'AI-powered quick setup',
    bestFor: 'Quick start',
    icon: '/icons/ai-brain-icon.svg',
    gradient: 'from-cyan-500/20 to-blue-500/20',
  },
  {
    id: 'custom',
    value: 'custom',
    label: 'Create with Custom Prompts',
    description: 'Full control with custom prompts',
    bestFor: 'Advanced users',
    icon: '/icons/book-edit-icon.svg',
    gradient: 'from-orange-500/20 to-red-500/20',
  },
];

export function ChooseCreationMethodStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();
  const viewContentTrackedRef = useRef(false);

  const creation_method = form.watch('creation_method');

  useEffect(() => {
    if (typeof window === 'undefined' || viewContentTrackedRef.current) return;
    trackFacebookViewContent({
      step: 'Choose Creation Method',
      step_index: 0,
    });
    viewContentTrackedRef.current = true;
  }, []);

  const handleMethodSelect = (method: 'custom' | 'presets' | 'ai') => {
    form.setValue('creation_method', method, { shouldValidate: true });

    safePostHogCapture('creation_method_selected', {
      step_name: 'Choose Creation Method',
      step_index: 0,
      method: method,
    });
  };

  const handleContinue = () => {
    if (!creation_method) return;

    safePostHogCapture('funnel_entry_started', {
      step_name: 'Choose Creation Method',
      step_index: 0,
      creation_method: creation_method,
    });

    // Track which flow started
    if (creation_method === 'ai') {
      safePostHogCapture('ai_flow_started', {});
    } else if (creation_method === 'custom') {
      safePostHogCapture('custom_flow_started', {});
    } else {
      safePostHogCapture('presets_flow_started', {});
    }

    nextStep();
  };

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        {/* Animated gradient background effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px] relative z-10">
          {/* Welcome Section */}
          <div className="text-center mb-8 px-4">
            <h2 className="text-white/80 text-sm font-semibold mb-3 tracking-wide uppercase">
              Welcome to Ryla.ai
            </h2>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold leading-tight mb-2">
              Start Building Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
                AI Influencer Empire
              </span>
            </h1>
            <p className="text-white/70 text-sm font-medium mt-3">
              Create hyper-realistic AI creators that earn 24/7
            </p>
          </div>

          {/* Creation Method Selection */}
          <div className="w-full px-4 mb-6">
            <p className="text-white/70 text-sm font-medium text-center mb-6">
              Choose how you want to create your AI Influencer
            </p>

            <div className="grid grid-cols-1 gap-4">
              {creationMethods.map((method) => {
                const isSelected = creation_method === method.value;
                return (
                  <ImageCard
                    key={method.id}
                    image={{
                      src: '',
                      alt: method.label,
                      name: method.label,
                    }}
                    isActive={isSelected}
                    onClick={() => handleMethodSelect(method.value)}
                    className="w-full h-auto min-h-[140px] relative"
                  >
                    <div
                      className={cn(
                        'absolute inset-0 bg-gradient-to-br',
                        method.gradient,
                        'rounded-xl'
                      )}
                    />

                    <div className="relative z-10 p-5 flex flex-col h-full">
                      <div className="flex items-start gap-4 mb-3">
                        <div
                          className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center',
                            'bg-white/10 backdrop-blur-sm',
                            isSelected && 'bg-white/20'
                          )}
                        >
                          <Image
                            src={method.icon}
                            alt={method.label}
                            width={24}
                            height={24}
                            className="w-6 h-6 invert brightness-0"
                          />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={cn(
                              'text-lg font-bold mb-1',
                              isSelected ? 'text-white' : 'text-white/90'
                            )}
                          >
                            {method.label}
                          </h3>
                          <p className="text-sm text-white/70 mb-2">
                            {method.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/50">
                              Best for:
                            </span>
                            <span className="text-xs font-semibold text-white/80">
                              {method.bestFor}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 14 14"
                              fill="none"
                            >
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
                    </div>

                    <ImageCard.Overlay />
                  </ImageCard>
                );
              })}
            </div>

            {form.formState.errors.creation_method && (
              <div className="text-red-500 text-sm font-medium text-center mt-4">
                {form.formState.errors.creation_method.message}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Button Section */}
        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 fixed bottom-0 left-0 z-[120] sm:static sm:z-auto">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              disabled={!creation_method}
              className={cn(
                'w-full h-[55px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500',
                'text-white font-bold text-base uppercase rounded-xl',
                'flex items-center justify-center gap-2',
                'shadow-2xl shadow-purple-500/50',
                'hover:shadow-purple-500/70 hover:scale-[1.02]',
                'transition-all duration-300',
                'relative overflow-hidden group',
                !creation_method &&
                  'opacity-50 cursor-not-allowed hover:scale-100'
              )}
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />

              <Image
                src="/icons/magic-wand-icon.svg"
                alt="Magic Wand"
                width={22}
                height={22}
                className="w-[22px] h-[22px] invert brightness-0 relative z-10"
                sizes="22px"
                loading="eager"
                quality={90}
              />
              <span className="text-base font-bold relative z-10">
                {creation_method ? 'CONTINUE' : 'SELECT A METHOD'}
              </span>
            </Button>
            <p className="text-white/60 text-xs font-medium text-center mt-4">
              Join thousands creating{' '}
              <span className="text-purple-400 font-semibold">
                passive income
              </span>{' '}
              with AI influencers
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
