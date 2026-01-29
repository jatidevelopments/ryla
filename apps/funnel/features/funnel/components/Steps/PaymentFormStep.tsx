'use client';

import { X, Loader2Icon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { Controller, useFormContext } from 'react-hook-form';
import { usePaymentForm } from '@/features/funnel/hooks/usePaymentForm';
import { useEffect, useRef, useState } from 'react';
import SpriteIcon from '@/components/SpriteIcon/SpriteIcon';
import { usePostHog } from 'posthog-js/react';
import CustomInput from '@/components/CustomInput';
import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';
import Image from 'next/image';
import { subscriptions } from '@/constants/subscriptions';
import { toastType, triggerToast } from '@/components/AlertToast';
import { useFunnelStore } from '@/store/states/funnel';
import { getStepIndexByName } from '@/features/funnel/config/steps';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import { trackFacebookLead, trackTwitterLead } from '@ryla/analytics';
import { useCountdown } from '@/hooks/useCountdown';
import {
  getOrCreateSessionId,
  updateSessionEmail,
} from '@/services/session-service';

export function PaymentFormStep() {
  const posthog = usePostHog();
  const form = useFormContext<FunnelSchema>();
  const { product, onSubmit, isPending, finbyIframeRef } =
    usePaymentForm(posthog);
  const { prevStep } = useStepperContext();

  const email = form.watch('email');
  const emailError = form.formState.errors.email;
  const productId = form.watch('productId');
  const emailTrackedRef = useRef<Set<string>>(new Set()); // Track which email values we've already tracked
  const leadTrackedRef = useRef(false); // Track if Lead event has been fired

  // Spots left counter - decreases by 1 every 30 seconds, minimum 1
  const [spotsLeft, setSpotsLeft] = useState(3);

  // Countdown timer for Black Friday offer (37 minutes 34 seconds)
  const countdown = useCountdown(
    { hours: 0, minutes: 37, seconds: 34 },
    { autoStart: true }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft((prev) => Math.max(1, prev - 1));
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Set default productId if not set
  useEffect(() => {
    if (!productId) {
      const defaultSubscription = subscriptions.find((s) => s.isBestChoice);
      if (defaultSubscription) {
        form.setValue('productId', defaultSubscription.productId);
      }
    }
  }, [productId, form]);

  const setStep = useFunnelStore((state) => state.setStep);
  const currentStep = useFunnelStore((state) => state.step);

  // Check for payment callback errors from Finby redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const paymentError = localStorage.getItem('finby_payment_error');
    if (paymentError) {
      // Show error toast
      triggerToast({
        title: paymentError,
        type: toastType.error,
      });
      // Clear the error from storage
      localStorage.removeItem('finby_payment_error');
    }

    // Ensure we're on the correct step after callback
    // If we have a saved previous step and we're not on it, restore it
    try {
      const previousStepData = localStorage.getItem(
        'finby_payment_previous_step'
      );
      if (previousStepData) {
        const { step, timestamp } = JSON.parse(previousStepData);
        // Only restore if saved within last 30 minutes and we're on payment step
        const isRecent = Date.now() - timestamp < 30 * 60 * 1000;
        const paymentIndex = getStepIndexByName('Payment');

        if (
          step !== null &&
          step !== undefined &&
          isRecent &&
          currentStep === paymentIndex &&
          step !== paymentIndex
        ) {
          console.log(
            `Restoring to previous step from PaymentFormStep: ${step}`
          );
          setStep(step);
          // Clear the saved step after using it
          localStorage.removeItem('finby_payment_previous_step');
        } else if (!isRecent) {
          // Clear stale data
          localStorage.removeItem('finby_payment_previous_step');
        }
      }
    } catch (e) {
      console.error('Error checking previous step:', e);
      localStorage.removeItem('finby_payment_previous_step');
    }

    // Check for successful payment result from callback
    const paymentResult = localStorage.getItem('finby_payment_result');
    if (paymentResult) {
      try {
        const result = JSON.parse(paymentResult);
        // If payment was successful (ResultCode 0 or 3), navigate to success step
        if (result.resultCode === 0 || result.resultCode === 3) {
          const allSpotsReservedIndex =
            getStepIndexByName('All Spots Reserved');
          if (allSpotsReservedIndex !== undefined) {
            setStep(allSpotsReservedIndex);
          }
        }
        // Clear the result from storage
        localStorage.removeItem('finby_payment_result');
      } catch (e) {
        console.error('Error parsing payment result:', e);
        localStorage.removeItem('finby_payment_result');
      }
    }
  }, [setStep]);

  // If product is not found, show error message
  if (!product) {
    return (
      <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px] relative">
        <div className="max-w-[420px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
          <div className="w-full bg-red-500/10 border border-red-500/50 rounded-2xl p-6">
            <h2 className="text-white text-xl font-bold mb-2">Payment Error</h2>
            <p className="text-white/70 text-sm">
              {productId
                ? `Product with ID ${productId} not found. Please select a valid subscription plan.`
                : 'No product selected. Please select a subscription plan first.'}
            </p>
            <Button onClick={prevStep} className="mt-4 w-full">
              Go Back to Select Plan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const onOpenSpecialOffer = () => {
    // COMMENTED OUT: Exit-intent offer logic - users can now leave paywall freely, special offer logic will be used in the future again
    prevStep();
    // if (isSpecialOfferOpened) prevStep();
    // else setOpen({ trigger: ModalTriggers.SPECIAL_OFFER_MODAL });
  };

  return (
    <div className="w-full flex flex-col min-h-screen px-[15px] pt-[25px] sm:px-10 sm:pt-[40px] pb-[70px] relative">
      <Button
        onClick={onOpenSpecialOffer}
        variant={'unstyled'}
        className={'absolute top-5 right-5 p-0 w-auto h-auto z-10'}
      >
        <X className={'text-white'} size={24} strokeWidth={3} />
      </Button>

      <div className="max-w-[450px] flex-1 h-full w-full mx-auto flex flex-col items-center justify-center">
        <div className="w-full flex-1 sm:flex-none flex flex-col items-center sm:justify-center">
          {/* Black Friday Countdown Banner */}
          {!countdown.isCompleted && (
            <div className="w-full mb-4">
              <div className="w-full bg-gradient-to-r from-red-900/40 to-orange-900/40 border border-red-700/50 rounded-xl p-3 sm:p-4 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    <span className="text-white/90 text-xs sm:text-sm font-semibold">
                      Black Friday Special: Special price expires in{' '}
                      <span className="text-red-400 font-bold text-sm sm:text-base">
                        {countdown.formattedTime}
                      </span>
                    </span>
                  </div>
                  <span className="text-red-400 font-bold text-sm sm:text-base">
                    After that it will be $79
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Spots Left Counter */}
          <div className="w-full mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-3 backdrop-blur-sm">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span className="text-white/90 text-sm font-semibold">
                <span className="text-purple-400 font-bold text-base">
                  ONLY {spotsLeft}
                </span>{' '}
                {spotsLeft === 1 ? 'Spot' : 'Spots'} left today, claim yours NOW
              </span>
            </div>
          </div>

          {/* Key Benefits Reminder */}
          <div className="w-full mb-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-xl p-4">
            <p className="text-white/90 font-semibold text-sm mb-3 text-center">
              What you're getting:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Hyper-realistic AI',
                'Perfect consistency',
                'Viral-ready videos',
                '24/7 passive income',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary-gradient flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-white/80 text-xs font-medium">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Email Input */}
          <div className="w-full mb-6">
            <Label
              className="text-white font-bold text-lg sm:text-xl mb-4 block"
              htmlFor="email"
            >
              Enter your email to continue
            </Label>
            <Controller
              name="email"
              control={form.control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field }) => (
                <div className="border-2 border-purple-400/50 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-1 shadow-lg">
                  <CustomInput
                    id="email"
                    icon={
                      <Image
                        src="/icons/mail-icon.svg"
                        alt="Mail Icon"
                        width={24}
                        height={24}
                        className="w-6 h-6 invert brightness-0"
                      />
                    }
                    type="email"
                    placeholder="your@email.com"
                    value={field.value || ''}
                    className="text-base sm:text-lg"
                    onChange={(e) => {
                      field.onChange(e);
                      // Track email entry on payment step
                      const emailValue = e.target.value;
                      const emailRegex =
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

                      // Track when user starts typing (first character)
                      if (
                        emailValue.length === 1 &&
                        !emailTrackedRef.current.has('started')
                      ) {
                        safePostHogCapture('payment_email_started', {
                          step_index: 34,
                          step_name: 'Payment',
                        });
                        emailTrackedRef.current.add('started');
                      }

                      // Track when email is valid and complete
                      if (
                        emailValue &&
                        emailRegex.test(emailValue) &&
                        !emailTrackedRef.current.has(emailValue)
                      ) {
                        safePostHogCapture('payment_email_entered', {
                          step_index: 34,
                          step_name: 'Payment',
                          email: emailValue,
                          email_domain: emailValue.split('@')[1] || '',
                        });
                        emailTrackedRef.current.add(emailValue);

                        // Save email to backend API session
                        const sessionId = getOrCreateSessionId();
                        updateSessionEmail(sessionId, emailValue).catch(
                          (error) => {
                            console.error(
                              'Failed to save email to session:',
                              error
                            );
                          }
                        );

                        // Facebook Pixel - Lead event (only after email is entered and validated)
                        if (!leadTrackedRef.current) {
                          trackFacebookLead(emailValue); // Use email as eventId for deduplication
                          // Twitter/X Pixel - Lead event (with email if available)
                          trackTwitterLead({
                            email_address: emailValue || undefined,
                          });
                          leadTrackedRef.current = true;
                        }
                      }
                    }}
                    onBlur={(e) => {
                      field.onBlur();
                      // Track email validation on blur
                      const emailValue = e.target.value;
                      const emailRegex =
                        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

                      if (emailValue) {
                        safePostHogCapture('payment_email_blurred', {
                          step_index: 34,
                          step_name: 'Payment',
                          email: emailValue,
                          email_domain: emailValue.split('@')[1] || '',
                          is_valid: emailRegex.test(emailValue),
                        });
                      }
                    }}
                    isError={emailError?.message}
                    resetInput={() => {
                      form.setValue('email', '');
                      emailTrackedRef.current.clear(); // Reset tracking when email is cleared
                      leadTrackedRef.current = false; // Reset Lead tracking when email is cleared
                    }}
                  />
                </div>
              )}
            />
            {emailError && (
              <p className="text-red-400 text-xs mt-2 font-medium">
                {emailError.message}
              </p>
            )}
          </div>

          {/* finby Payment Iframe - Hidden by default, shown as popup by finby popup.js */}
          <iframe
            id="TrustPayFrame"
            ref={finbyIframeRef}
            style={{ display: 'none' }}
            title="finby Payment Gateway"
          />

          {/* Payment Security Card */}
          <div className="w-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-base">Secure Payment</h3>
              <div className="flex items-center gap-2">
                <SpriteIcon
                  src="/images/cards-logos/visa.png"
                  fallbackAlt="Visa"
                  targetW={35}
                  targetH={24}
                  fit="contain"
                />
                <SpriteIcon
                  src="/images/cards-logos/mastercard.png"
                  fallbackAlt="Mastercard"
                  targetW={35}
                  targetH={24}
                  fit="contain"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-white/90 text-xs font-medium">
                  SSL Encrypted
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-2.5 h-2.5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-white/90 text-xs font-medium">
                  Cancel Anytime
                </p>
              </div>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="w-full bg-gradient-to-br from-green-500/10 to-emerald-500/5 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold text-base">
                30-Day Money-Back Guarantee
              </h3>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                <Image
                  alt="guarantee"
                  src="/icons/security-check-icon.svg"
                  width={16}
                  height={16}
                  className="w-3 h-3 invert brightness-0"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-2.5 h-2.5 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-white/90 text-xs font-medium">
                Not satisfied? Get a full refund within 30 days. No questions
                asked.
              </p>
            </div>
          </div>

          {/* Commitment Consistency Message */}
          <div className="w-full mb-4 text-center">
            <p className="text-white/90 text-sm font-semibold">
              You're just one click away from building your AI Influencer Empire
            </p>
          </div>

          {/* CTA Button */}
          <div className="w-full flex flex-col items-center gap-3">
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isPending || !email || !!emailError}
              className="w-full h-[60px] bg-primary-gradient text-white text-lg font-bold rounded-xl shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              {/* Button shimmer effect */}
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/30 via-transparent to-transparent pointer-events-none -translate-x-1/2" />

              {isPending ? (
                <>
                  <Loader2Icon className="animate-spin w-5 h-5 relative z-10" />
                  <span className="relative z-10">Processing...</span>
                </>
              ) : (
                <span className="relative z-10 uppercase tracking-wide">
                  YES I WANT TO CLAIM MY SPOT NOW
                </span>
              )}
            </Button>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/50 text-xs font-medium">
                  Secure
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/50 text-xs font-medium">
                  Encrypted
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  className="w-4 h-4 text-purple-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-white/50 text-xs font-medium">
                  Protected
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentFormStep;
