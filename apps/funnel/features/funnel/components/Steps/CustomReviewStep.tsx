'use client';

import { useFormContext } from 'react-hook-form';
import Stepper from '@/components/stepper';
import StepWrapper from '@/components/layouts/StepWrapper';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Button } from '@/components/ui/button';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';

export function CustomReviewStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  const custom_appearance_prompt = form.watch('custom_appearance_prompt') || '';
  const custom_identity_prompt = form.watch('custom_identity_prompt') || '';
  const custom_image_prompt = form.watch('custom_image_prompt') || '';

  const handleContinue = () => {
    safePostHogCapture('custom_review_completed', {
      step_name: 'Custom Review',
      step_index: 2,
    });

    // Continue to character generation
    nextStep();
  };

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]">
          <div className="w-full mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <div className="text-center mb-6 px-4">
            <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
              Review Your Prompts
            </h2>
            <p className="text-white/90 text-base font-medium text-center mb-8">
              Confirm your custom prompts before generation
            </p>
          </div>

          <div className="w-full px-4 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div>
                <span className="text-white/50 text-xs uppercase tracking-wide">
                  Appearance
                </span>
                <p className="text-white/80 text-sm mt-2">
                  {custom_appearance_prompt}
                </p>
              </div>

              <div className="border-t border-white/10 pt-3">
                <span className="text-white/50 text-xs uppercase tracking-wide">
                  Identity & Personality
                </span>
                <p className="text-white/80 text-sm mt-2">
                  {custom_identity_prompt}
                </p>
              </div>

              {custom_image_prompt && (
                <div className="border-t border-white/10 pt-3">
                  <span className="text-white/50 text-xs uppercase tracking-wide">
                    Image Generation
                  </span>
                  <p className="text-white/80 text-sm mt-2">
                    {custom_image_prompt}
                  </p>
                </div>
              )}
            </div>

            <p className="text-white/60 text-xs text-center">
              These prompts will be used to generate your AI influencer
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
                Generate Character
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
