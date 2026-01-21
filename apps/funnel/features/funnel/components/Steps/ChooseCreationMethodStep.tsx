'use client';

import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Video } from '@/components/ui/video';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import StepWrapper from '@/components/layouts/StepWrapper';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { trackFacebookViewContent, trackTwitterViewContent } from '@ryla/analytics';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';

export function ChooseCreationMethodStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();
  const viewContentTrackedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || viewContentTrackedRef.current) return;
    trackFacebookViewContent({
      step: 'Choose Creation Method',
      step_index: 0,
    });
    // Twitter/X Pixel - ViewContent event
    trackTwitterViewContent({
      content_id: 'funnel-entry',
      content_name: 'Choose Creation Method',
    });
    viewContentTrackedRef.current = true;
  }, []);

  const handleContinue = () => {
    // Set creation_method to 'presets' by default (matching old project behavior)
    form.setValue('creation_method', 'presets', { shouldValidate: true });

    safePostHogCapture('funnel_entry_started', {
      step_name: 'Choose Creation Method',
      step_index: 0,
      creation_method: 'presets',
    });

    safePostHogCapture('presets_flow_started', {});

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

          {/* Enhanced Mobile frame video container */}
          <div className="relative w-full mb-8 px-4">
            <div
              className={cn(
                'relative w-full h-auto aspect-[360/600] sm:aspect-[360/500] rounded-2xl overflow-hidden',
                'border-2 border-purple-400/50',
                'bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-black/30',
                'shadow-2xl shadow-purple-500/30',
                'transition-all duration-300 hover:border-purple-400/70 hover:shadow-purple-500/50 hover:scale-[1.02]'
              )}
            >
              <Video
                src="/video/ai_influencer_video_1.mp4"
                className="absolute inset-0 w-full h-full scale-[1.07]"
                objectFit="cover"
                aspectRatio="360/600"
                autoPlay={true}
                muted={true}
                loop
                playsInline
                controls={false}
                loading="eager"
                priority
                quality="high"
              />

              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

              {/* Text Overlay on video */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-8 px-5">
                <p className="text-white font-extrabold text-center text-xl md:text-2xl leading-tight drop-shadow-2xl">
                  Create Your AI Influencer{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">
                    in Minutes
                  </span>
                </p>
              </div>

              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-purple-500/50 rounded-2xl blur-xl opacity-50 -z-10 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Enhanced Button Section */}
        <div className="w-full flex items-center justify-center px-[15px] sm:px-5 p-5 bg-black-2 fixed bottom-0 left-0 z-[120] sm:static sm:z-auto">
          <div className="max-w-[450px] w-full">
            <Button
              onClick={handleContinue}
              className={cn(
                'w-full h-[55px] bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500',
                'text-white font-bold text-base uppercase rounded-xl',
                'flex items-center justify-center gap-2',
                'shadow-2xl shadow-purple-500/50',
                'hover:shadow-purple-500/70 hover:scale-[1.02]',
                'transition-all duration-300',
                'relative overflow-hidden group'
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
                CREATE YOUR AI INFLUENCER NOW
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
