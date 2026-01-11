'use client';

import { clsx } from 'clsx';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import StepWrapper from '@/components/layouts/StepWrapper';
import Stepper from '@/components/stepper';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import Image from 'next/image';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { Clock } from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

const MONTHLY_PRICE = 29;
const ORIGINAL_PRICE = 79;
const PRODUCT_ID = 1; // $29.00 monthly subscription product ID

export function InfluencerSubscriptionStep() {
  const { nextStep } = useStepperContext();
  const form = useFormContext<FunnelSchema>();

  // Countdown timer for Black Friday offer (37 minutes 34 seconds)
  const countdown = useCountdown(
    { hours: 0, minutes: 37, seconds: 34 },
    { autoStart: true }
  );

  useEffect(() => {
    // Set the product ID for the monthly subscription (only if not already set)
    const currentProductId = form.getValues('productId');
    if (currentProductId !== PRODUCT_ID) {
      form.setValue('productId', PRODUCT_ID);
    }

    // PostHog tracking - Subscription step viewed
    safePostHogCapture('subscription_step_viewed', {
      step_name: 'Subscription',
      step_index: 33,
      product_id: PRODUCT_ID,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]); // Only run once on mount

  const productId = form.watch('productId');

  return (
    <StepWrapper>
      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center mb-[30px] sm:mb-[70px] pb-32 sm:pb-0">
          <div className="w-full mb-2 sm:mb-5 md:mb-11">
            <Stepper.Progress />
          </div>

          <div className="text-center mb-3 sm:mb-6 px-4">
            <h1 className="text-transparent bg-clip-text bg-primary-gradient text-[24px] sm:text-[32px] font-extrabold text-center mb-1 sm:mb-3">
              Start Earning Today
            </h1>
            <p className="text-white/80 text-sm sm:text-lg font-semibold text-center mb-2 hidden sm:block">
              Get Full Access to Your AI Influencer
            </p>
          </div>

          {/* Hard Paywall - Single Option */}
          <div className="w-full mb-3 sm:mb-6 px-4">
            <div
              className={clsx(
                'relative w-full h-auto rounded-xl sm:rounded-2xl text-left border-2',
                'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20',
                'shadow-2xl shadow-purple-500/30',
                'overflow-visible'
              )}
            >
              {/* BEST VALUE Badge - Part of Border */}
              <div className="absolute -top-[10px] sm:-top-[13px] left-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 shadow-lg z-10 border-2 border-black/50">
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase">
                  ⭐ BEST VALUE
                </span>
              </div>

              <div className="w-full bg-gradient-to-b from-black/40 to-black/60 backdrop-blur-sm px-3 py-4 sm:px-5 sm:py-6 flex flex-col gap-2 sm:gap-4 rounded-xl sm:rounded-2xl">
                {/* Black Friday Countdown Banner */}
                {!countdown.isCompleted && (
                  <div className="w-full mb-3 sm:mb-4 pt-2 sm:pt-3">
                    <div className="w-full bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 backdrop-blur-sm">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                          <span className="text-white/90 text-xs sm:text-sm font-semibold">
                            Black Friday Special: Special price expires in
                          </span>
                        </div>
                        <span className="text-red-400 font-bold text-base sm:text-lg">
                          {countdown.formattedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Header */}
                <div className="flex flex-col gap-1 sm:gap-2">
                  <div className="text-white/70 text-xs sm:text-sm font-semibold uppercase tracking-wide">
                    1 Month Access
                  </div>
                  <div className="flex items-baseline gap-2 sm:gap-3">
                    <div className="text-white/50 text-lg sm:text-xl font-semibold line-through">
                      ${ORIGINAL_PRICE}
                    </div>
                    <div className="flex items-baseline gap-1 sm:gap-2">
                      <div className="text-white text-4xl sm:text-5xl font-extrabold">
                        ${MONTHLY_PRICE}
                      </div>
                      <div className="text-white/50 text-base sm:text-lg font-medium">
                        /month
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">
                      BLACK FRIDAY SPECIAL
                    </span>
                  </div>
                  <div className="text-white/40 text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                    Start earning with your AI influencer today
                  </div>
                </div>

                {/* Subscription Benefits */}
                <div className="pt-2 sm:pt-4 border-t border-white/20">
                  <div className="text-white text-sm sm:text-base font-bold mb-2 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                    <Image
                      src="/icons/fire-icon.svg"
                      alt="Benefits"
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5 invert brightness-0 opacity-90"
                    />
                    What you get:
                  </div>
                  <ul className="space-y-1.5 sm:space-y-3">
                    {[
                      {
                        icon: '/icons/magic-wand-icon.svg',
                        text: 'Unlimited content generation',
                        gradient: 'from-purple-500 to-pink-500',
                        description: 'No limits, no restrictions',
                      },
                      {
                        icon: '/icons/sale-icon.svg',
                        text: 'Multiple monetization platforms',
                        gradient: 'from-yellow-500 to-orange-500',
                        description: 'Sell on Fanvue, OnlyFans, TikTok & more',
                      },
                      {
                        icon: '/icons/recording-icon.svg',
                        text: 'Priority support & updates',
                        gradient: 'from-pink-500 to-rose-500',
                        description: 'Get new features first',
                      },
                      {
                        icon: '/icons/security-check-icon.svg',
                        text: 'Commercial usage rights',
                        gradient: 'from-green-500 to-emerald-500',
                        description: 'Full ownership of your content',
                      },
                    ].map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div
                          className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br ${benefit.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <Image
                            src={benefit.icon}
                            alt={benefit.text}
                            width={16}
                            height={16}
                            className="w-3 h-3 sm:w-4 sm:h-4 invert brightness-0 opacity-90"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-white/90 text-xs sm:text-sm font-medium pt-0.5 sm:pt-1.5 block">
                            {benefit.text}
                          </span>
                          <span className="text-white/50 text-[10px] sm:text-xs mt-0 sm:mt-0.5 block hidden sm:block">
                            {benefit.description}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom CTA like landing step */}
        <div className="w-full flex items-center justify-center px-[15px] sm:px-0 p-3 sm:p-5 bg-black-2 fixed bottom-0 left-0 z-[120] sm:static sm:z-auto border-t border-white/5 backdrop-blur-md">
          <div className="max-w-[450px] w-full space-y-1.5 sm:space-y-3">
            <Button
              onClick={nextStep}
              className="w-full h-[48px] sm:h-[55px] bg-primary-gradient disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-xl shadow-purple-500/30 text-base sm:text-lg font-bold relative overflow-hidden group"
              disabled={!productId}
            >
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />
              <span className="relative z-10 uppercase tracking-wide">
                YES, I WANT THE SPECIAL OFFER
              </span>
            </Button>
            <p className="text-white/70 text-xs sm:text-sm font-semibold text-center hidden sm:block">
              ⚡ Unlock your AI influencer and start earning today
            </p>
          </div>
        </div>
      </div>
    </StepWrapper>
  );
}
