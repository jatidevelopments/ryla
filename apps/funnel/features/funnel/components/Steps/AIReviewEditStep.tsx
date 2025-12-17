'use client';

import { useFormContext } from 'react-hook-form';
import Stepper from '@/components/stepper';
import StepWrapper from '@/components/layouts/StepWrapper';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Button } from '@/components/ui/button';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { cn } from '@/lib/utils';

export function AIReviewEditStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  const ai_generated_config = form.watch('ai_generated_config') as any;
  const ai_description = form.watch('ai_description');

  const handleContinue = () => {
    if (!ai_generated_config) return;

    // Apply AI-generated config to form
    Object.keys(ai_generated_config).forEach((key) => {
      const formKey = key as keyof FunnelSchema;
      const value = ai_generated_config[key];

      // Only set if the key exists in the form schema
      if (formKey && value !== undefined && value !== null) {
        try {
          form.setValue(formKey, value as any, {
            shouldValidate: false, // Don't validate yet, will validate on next steps
          });
        } catch (error) {
          // Ignore errors for fields that don't exist in schema
          console.warn(`Could not set ${formKey}:`, error);
        }
      }
    });

    safePostHogCapture('ai_review_completed', {
      step_name: 'AI Review & Edit',
      step_index: 3,
    });

    // Continue to next step (should be Video Content Intro or similar)
    nextStep();
  };

  if (!ai_generated_config) {
    return (
      <StepWrapper>
        <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
          <p className="text-white/70">No configuration generated yet...</p>
        </div>
      </StepWrapper>
    );
  }

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]">
          <div className="w-full mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <div className="text-center mb-6 px-4">
            <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
              Review AI-Generated Config
            </h2>
            <p className="text-white/90 text-base font-medium text-center mb-8">
              Review and edit the AI-generated configuration
            </p>
          </div>

          <div className="w-full px-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-white/50 text-xs">Age:</span>
                <p className="text-white font-medium">
                  {ai_generated_config.influencer_age}
                </p>
              </div>
              <div>
                <span className="text-white/50 text-xs">Ethnicity:</span>
                <p className="text-white font-medium capitalize">
                  {ai_generated_config.influencer_ethnicity?.replace(/-/g, ' ')}
                </p>
              </div>
              <div>
                <span className="text-white/50 text-xs">Hair:</span>
                <p className="text-white font-medium capitalize">
                  {ai_generated_config.influencer_hair_color}{' '}
                  {ai_generated_config.influencer_hair_style}
                </p>
              </div>
              <div>
                <span className="text-white/50 text-xs">Archetype:</span>
                <p className="text-white font-medium capitalize">
                  {ai_generated_config.influencer_archetype?.replace(/_/g, ' ')}
                </p>
              </div>
              {ai_generated_config.influencer_bio && (
                <div>
                  <span className="text-white/50 text-xs">Bio:</span>
                  <p className="text-white/80 text-sm mt-1">
                    {ai_generated_config.influencer_bio}
                  </p>
                </div>
              )}
            </div>

            <p className="text-white/60 text-xs text-center">
              💡 You can edit these settings in the next steps if needed
            </p>
          </div>
        </div>

        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              className="w-full h-[45px] bg-primary-gradient relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="text-base font-bold relative z-10">
                Continue to Generation
              </span>
            </Button>
            <p className="text-white/50 text-xs font-medium text-center mt-3">
              Proceed to character generation
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
