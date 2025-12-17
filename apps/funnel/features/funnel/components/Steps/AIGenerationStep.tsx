'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import StepWrapper from '@/components/layouts/StepWrapper';
import Stepper from '@/components/stepper';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { useFormContext } from 'react-hook-form';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';

export function AIGenerationStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Simulate AI generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isComplete) {
      // Simulate AI-generated config
      const mockConfig = {
        influencer_age: 25,
        influencer_ethnicity: 'caucasian',
        influencer_skin_color: 'light',
        influencer_eye_color: 'blue',
        influencer_hair_style: 'long',
        influencer_hair_color: 'blonde',
        influencer_face_shape: 'oval',
        influencer_body_type: 'athletic',
        influencer_archetype: 'fitness_enthusiast',
        influencer_personality_traits: ['confident', 'caring', 'ambitious'],
        influencer_bio:
          'A 25-year-old fitness coach from Miami who loves sunrise workouts and motivating others.',
      };

      form.setValue('ai_generated_config', mockConfig);

      safePostHogCapture('ai_generation_completed', {
        step_name: 'AI Generation',
        step_index: 2,
      });
    }
  }, [isComplete, form]);

  const handleContinue = () => {
    if (!isComplete) return;
    nextStep();
  };

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]">
          <div className="w-full mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <div className="text-center mb-8 px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Image
                src="/icons/ai-brain-icon.svg"
                alt="AI"
                width={48}
                height={48}
                className="w-12 h-12 animate-pulse"
              />
            </div>

            <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
              AI is Creating Your Influencer
            </h2>
            <p className="text-white/90 text-base font-medium text-center mb-8">
              This will take just a moment...
            </p>

            <div className="w-full space-y-4">
              <Progress value={progress} className="h-2" />
              <p className="text-white/70 text-sm">
                {progress < 100
                  ? `${Math.round(progress)}% complete`
                  : 'Complete!'}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              disabled={!isComplete}
              className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="text-base font-bold relative z-10">
                {isComplete ? 'Review & Continue' : 'Generating...'}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
