'use client';

import { useFormContext } from 'react-hook-form';
import Stepper from '@/components/stepper';
import StepWrapper from '@/components/layouts/StepWrapper';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';

export function CustomPromptsStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  const custom_appearance_prompt = form.watch('custom_appearance_prompt') || '';
  const custom_identity_prompt = form.watch('custom_identity_prompt') || '';
  const custom_image_prompt = form.watch('custom_image_prompt') || '';

  const handleContinue = () => {
    if (!custom_appearance_prompt.trim() || !custom_identity_prompt.trim()) {
      return;
    }

    safePostHogCapture('custom_prompts_submitted', {
      step_name: 'Custom Prompts',
      step_index: 1,
      has_appearance: !!custom_appearance_prompt,
      has_identity: !!custom_identity_prompt,
      has_image: !!custom_image_prompt,
    });

    nextStep();
  };

  const canContinue =
    custom_appearance_prompt.trim() && custom_identity_prompt.trim();

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[40px] sm:mb-[30px]">
          <div className="w-full mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <div className="text-center mb-6 px-4">
            <h2 className="text-transparent bg-clip-text bg-primary-gradient text-xl md:text-2xl font-extrabold mb-3 md:mb-4 capitalize text-center leading-tight">
              Custom Prompts
            </h2>
            <p className="text-white/90 text-base font-medium text-center mb-8">
              Define your AI influencer with custom prompts
            </p>
          </div>

          <div className="w-full px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">
                Appearance Prompt <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={custom_appearance_prompt}
                onChange={(e) =>
                  form.setValue('custom_appearance_prompt', e.target.value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Describe physical appearance: age, ethnicity, hair, eyes, body type, etc."
                className="min-h-[120px] border-white/10 bg-white/5 text-white placeholder:text-white/50 rounded-xl resize-none"
                maxLength={500}
              />
              <div className="flex justify-end text-xs text-white/50">
                <span>{custom_appearance_prompt.length}/500</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">
                Identity & Personality Prompt{' '}
                <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={custom_identity_prompt}
                onChange={(e) =>
                  form.setValue('custom_identity_prompt', e.target.value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Describe personality, archetype, background story, values, etc."
                className="min-h-[120px] border-white/10 bg-white/5 text-white placeholder:text-white/50 rounded-xl resize-none"
                maxLength={500}
              />
              <div className="flex justify-end text-xs text-white/50">
                <span>{custom_identity_prompt.length}/500</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">
                Image Generation Prompt (Optional)
              </label>
              <Textarea
                value={custom_image_prompt}
                onChange={(e) =>
                  form.setValue('custom_image_prompt', e.target.value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Additional prompts for image generation style, lighting, mood, etc."
                className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/50 rounded-xl resize-none"
                maxLength={300}
              />
              <div className="flex justify-end text-xs text-white/50">
                <span>{custom_image_prompt.length}/300</span>
              </div>
            </div>

            {(form.formState.errors.custom_appearance_prompt ||
              form.formState.errors.custom_identity_prompt) && (
              <div className="text-red-500 text-sm font-medium text-center">
                Please fill in all required fields
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="text-base font-bold relative z-10">
                Review & Continue
              </span>
            </Button>
            <p className="text-white/50 text-xs font-medium text-center mt-3">
              Review your prompts before generation
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
