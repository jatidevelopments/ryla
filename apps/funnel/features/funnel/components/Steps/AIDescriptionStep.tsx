'use client';

import { useFormContext } from 'react-hook-form';
import Stepper from '@/components/stepper';
import StepWrapper from '@/components/layouts/StepWrapper';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import Image from 'next/image';

export function AIDescriptionStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  const ai_description = form.watch('ai_description') || '';
  const ai_reference_image = form.watch('ai_reference_image');

  const handleContinue = () => {
    if (!ai_description.trim()) return;

    safePostHogCapture('ai_description_submitted', {
      step_name: 'AI Description',
      step_index: 1,
      description_length: ai_description.length,
      has_reference_image: !!ai_reference_image,
    });

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
              Describe Your AI Influencer
            </h2>
            <p className="text-white/90 text-base font-medium text-center mb-8">
              Tell us what you want and our AI will create it for you
            </p>
          </div>

          <div className="w-full px-4 space-y-4">
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">
                Description <span className="text-red-400">*</span>
              </label>
              <Textarea
                value={ai_description}
                onChange={(e) =>
                  form.setValue('ai_description', e.target.value, {
                    shouldValidate: true,
                  })
                }
                placeholder="Example: A 25-year-old fitness coach from Miami with long blonde hair, blue eyes, athletic build, confident and motivational personality..."
                className="min-h-[150px] border-white/10 bg-white/5 text-white placeholder:text-white/50 rounded-xl resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-white/50">
                <span>Be as detailed as possible for best results</span>
                <span>{ai_description.length}/1000</span>
              </div>
            </div>

            {/* Optional Reference Image Upload */}
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">
                Reference Image (Optional)
              </label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-white/20 transition-colors">
                {ai_reference_image ? (
                  <div className="space-y-2">
                    <Image
                      src={ai_reference_image}
                      alt="Reference"
                      width={200}
                      height={200}
                      className="mx-auto rounded-lg"
                    />
                    <button
                      onClick={() =>
                        form.setValue('ai_reference_image', undefined)
                      }
                      className="text-red-400 text-sm hover:text-red-300"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Image
                      src="/icons/image-icon.svg"
                      alt="Upload"
                      width={48}
                      height={48}
                      className="mx-auto opacity-50"
                    />
                    <p className="text-white/70 text-sm">
                      Upload a reference image to guide the AI
                    </p>
                    <p className="text-white/50 text-xs">
                      (Feature coming soon)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {form.formState.errors.ai_description && (
              <div className="text-red-500 text-sm font-medium text-center">
                {form.formState.errors.ai_description.message}
              </div>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 sm:static fixed bottom-0 left-0 z-100">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              disabled={!ai_description.trim()}
              className="w-full h-[45px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="text-base font-bold relative z-10">
                Generate with AI
              </span>
            </Button>
            <p className="text-white/50 text-xs font-medium text-center mt-3">
              Our AI will create your influencer based on your description
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
