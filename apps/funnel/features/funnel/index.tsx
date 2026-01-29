'use client';

import { FormProvider } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import Stepper from '@/components/stepper';
import { useFunnelForm } from '@/features/funnel/hooks/useFunnelForm';
import {
  getPaymentStepIndices,
  getStepIndexByName,
} from '@/features/funnel/config/steps';
import { useOrderedSteps } from '@/hooks/useOrderedSteps';

import FinalOfferModal from '@/components/modals/FinalOfferModal';
import SecretOfferModal from '@/components/modals/SecretOfferModal';
import SpecialOfferModal from '@/components/modals/SpecialOfferModal';
import FinalOfferUnlockedModal from '@/components/modals/FinalOfferUnlockedModal';
import ShowVideoModal from '@/components/modals/ShowVideoModal';
import { FunnelStepNavigator } from '@/components/FunnelStepNavigator';

import { useAuthStore } from '@/store/states/auth';
import { useFunnelStore, getFunnelStore } from '@/store/states/funnel';
import { useInitUtm } from '@/hooks/useInitUtm';

function readPersistedState<T = any>(key: string): T | null {
  try {
    const raw =
      typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state ?? null;
  } catch {
    return null;
  }
}

export default function FunnelView() {
  useInitUtm();

  const { form, stepper, isReady } = useFunnelForm();
  const { orderedSteps } = useOrderedSteps();

  // Get creation method to determine flow
  const _creationMethod = form.watch('creation_method') as
    | 'presets'
    | 'ai'
    | 'custom'
    | undefined;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const _authToken = useAuthStore((s) => s.authToken);
  const setStepInStore = useFunnelStore((s) => s.setStep);

  // Track last known values to prevent circular updates
  const lastStepFromUrl = useRef<number | null>(null);
  const lastStepFromStepper = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  // Check if we're on the goviral.ryla.ai domain - hide navigation on this domain
  const isGoviralDomain =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'goviral.ryla.ai' ||
      window.location.hostname === 'www.goviral.ryla.ai');

  // Check environment variable to show/hide Navigator
  // Navigator is hidden by default in production unless NEXT_PUBLIC_SHOW_NAVIGATOR is 'true'
  // Also hidden on goviral.ryla.ai domain regardless of env var
  const showNavigator =
    !isGoviralDomain &&
    (process.env.NEXT_PUBLIC_SHOW_NAVIGATOR === 'true' ||
      process.env.NODE_ENV !== 'production');

  // Update document title based on current step
  useEffect(() => {
    if (!isReady || typeof window === 'undefined') return;

    const currentStep = orderedSteps.find(
      (step) => step.index === stepper.value
    );
    const stepTitle = currentStep?.name || '';
    document.title = stepTitle ? `Ryla.ai — ${stepTitle}` : 'Ryla.ai';
  }, [stepper.value, orderedSteps, isReady]);

  // Unified URL and step synchronization
  // URL is the source of truth - step changes update URL, URL changes update step
  useEffect(() => {
    if (!isReady || !searchParams) return;

    const stepParam = searchParams.get('step');
    const currentStepIndex = stepper.value;

    // Parse step from URL
    let stepFromUrl: number | null = null;
    if (stepParam) {
      if (stepParam === 'payment') {
        // Backward compatibility: "payment" maps to Payment step
        const paymentIndex = getStepIndexByName('Payment');
        if (paymentIndex !== undefined) {
          stepFromUrl = paymentIndex;
        }
      } else {
        const parsed = parseInt(stepParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < orderedSteps.length) {
          stepFromUrl = parsed;
        }
      }
    }

    // Check if URL changed (user navigated via browser or direct URL)
    const urlChanged =
      stepFromUrl !== null && stepFromUrl !== lastStepFromUrl.current;

    // Check if step changed (user clicked next/prev or used stepper)
    const stepChanged = currentStepIndex !== lastStepFromStepper.current;

    // On initial mount, prioritize URL if present, otherwise use saved step
    if (isInitialMount.current) {
      isInitialMount.current = false;

      if (stepFromUrl !== null) {
        // URL has step - use it
        const authState = readPersistedState<{ authToken: string | null }>(
          'auth-storage'
        );
        const funnelState = readPersistedState('funnel-storage');
        const hasValidAuth = Boolean(authState?.authToken);
        const hasFunnel = Boolean(funnelState);
        const paymentIndices = getPaymentStepIndices(orderedSteps);
        const isPaymentStep = paymentIndices.all.includes(stepFromUrl);

        // Check if there's a payment error in localStorage (user was redirected from payment callback)
        // IMPORTANT: Check for payment error FIRST before checking auth/funnel
        // This ensures users can always access step 34 after payment failure
        const hasPaymentError =
          typeof window !== 'undefined' &&
          localStorage.getItem('finby_payment_error');
        const hasPaymentResult =
          typeof window !== 'undefined' &&
          localStorage.getItem('finby_payment_result');
        const isFromPaymentCallback =
          typeof window !== 'undefined' &&
          sessionStorage.getItem('finby_payment_callback_redirect') === 'true';

        // Allow access to payment step (34) if there's a payment error, result, or we're coming from payment callback
        // This allows users to see error messages and retry payment
        const isPaymentErrorStep =
          stepFromUrl === 34 &&
          (hasPaymentError || hasPaymentResult || isFromPaymentCallback);

        // Clear the callback redirect flag after checking (one-time use)
        if (isFromPaymentCallback && typeof window !== 'undefined') {
          sessionStorage.removeItem('finby_payment_callback_redirect');
        }

        if (
          isPaymentStep &&
          (!hasValidAuth || !hasFunnel) &&
          !isPaymentErrorStep
        ) {
          // Redirect to start if trying to access payment steps without auth
          // UNLESS it's a payment error step (step 34 with error message or result)
          console.log(
            'Redirecting from payment step - no auth/funnel and no payment error',
            {
              stepFromUrl,
              hasValidAuth,
              hasFunnel,
              hasPaymentError,
              hasPaymentResult,
            }
          );
          const current = new URLSearchParams(searchParams.toString());
          current.delete('step');
          if (pathname) {
            router.replace(
              current.size ? `${pathname}?${current.toString()}` : pathname
            );
          }
          stepper.onChange(0);
          setStepInStore(0);
          lastStepFromUrl.current = 0;
          lastStepFromStepper.current = 0;
        } else {
          console.log('Allowing access to step', {
            stepFromUrl,
            isPaymentStep,
            hasValidAuth,
            hasFunnel,
            isPaymentErrorStep,
            hasPaymentError,
            hasPaymentResult,
          });
          stepper.onChange(stepFromUrl);
          setStepInStore(stepFromUrl);
          lastStepFromUrl.current = stepFromUrl;
          lastStepFromStepper.current = stepFromUrl;
        }
      } else {
        // No step in URL - use saved step or default to 0
        const savedStep = getFunnelStore().step;
        const initialStep =
          savedStep !== null && savedStep !== undefined ? savedStep : 0;
        stepper.onChange(initialStep);
        setStepInStore(initialStep);
        lastStepFromStepper.current = initialStep;

        // Update URL to reflect the step
        const current = new URLSearchParams(searchParams.toString());
        current.set('step', initialStep.toString());
        if (pathname) {
          router.replace(`${pathname}?${current.toString()}`);
        }
        lastStepFromUrl.current = initialStep;
      }
      return;
    }

    // After initial mount: sync URL ↔ step
    if (urlChanged && stepFromUrl !== null) {
      // URL changed (browser navigation) - update step
      const authState = readPersistedState<{ authToken: string | null }>(
        'auth-storage'
      );
      const funnelState = readPersistedState('funnel-storage');
      const hasValidAuth = Boolean(authState?.authToken);
      const hasFunnel = Boolean(funnelState);
      const paymentIndices = getPaymentStepIndices();
      const isPaymentStep = paymentIndices.all.includes(stepFromUrl);

      // Check if there's a payment error or result in localStorage (user was redirected from payment callback)
      // IMPORTANT: Check for payment error/result FIRST before checking auth/funnel
      // This ensures users can always access step 34 after payment failure
      const hasPaymentError =
        typeof window !== 'undefined' &&
        localStorage.getItem('finby_payment_error');
      const hasPaymentResult =
        typeof window !== 'undefined' &&
        localStorage.getItem('finby_payment_result');
      const isFromPaymentCallback =
        typeof window !== 'undefined' &&
        sessionStorage.getItem('finby_payment_callback_redirect') === 'true';

      // Allow access to payment step (34) if there's a payment error, result, or we're coming from payment callback
      // This allows users to see error messages and retry payment
      const isPaymentErrorStep =
        stepFromUrl === 34 &&
        (hasPaymentError || hasPaymentResult || isFromPaymentCallback);

      // Clear the callback redirect flag after checking (one-time use)
      if (isFromPaymentCallback && typeof window !== 'undefined') {
        sessionStorage.removeItem('finby_payment_callback_redirect');
      }

      if (
        isPaymentStep &&
        (!hasValidAuth || !hasFunnel) &&
        !isPaymentErrorStep
      ) {
        // Redirect to start if trying to access payment steps without auth
        // UNLESS it's a payment error step (step 34 with error message or result)
        console.log(
          'Redirecting from payment step (URL changed) - no auth/funnel and no payment error',
          {
            stepFromUrl,
            hasValidAuth,
            hasFunnel,
            hasPaymentError,
            hasPaymentResult,
          }
        );
        const current = new URLSearchParams(searchParams.toString());
        current.delete('step');
        if (pathname) {
          router.replace(
            current.size ? `${pathname}?${current.toString()}` : pathname
          );
        }
        if (stepper.value !== 0) {
          stepper.onChange(0);
          setStepInStore(0);
          lastStepFromStepper.current = 0;
        }
        lastStepFromUrl.current = 0;
      } else if (stepper.value !== stepFromUrl) {
        console.log('Allowing access to step (URL changed)', {
          stepFromUrl,
          isPaymentStep,
          hasValidAuth,
          hasFunnel,
          isPaymentErrorStep,
          hasPaymentError,
          hasPaymentResult,
        });
        stepper.onChange(stepFromUrl);
        setStepInStore(stepFromUrl);
        lastStepFromStepper.current = stepFromUrl;
        lastStepFromUrl.current = stepFromUrl;
      }
    } else if (stepChanged && !urlChanged && searchParams) {
      // Step changed from user interaction - update URL
      const current = new URLSearchParams(searchParams.toString());
      const stepInUrl = currentStepIndex.toString();

      if (current.get('step') !== stepInUrl && pathname) {
        current.set('step', stepInUrl);
        router.replace(`${pathname}?${current.toString()}`);
        lastStepFromUrl.current = currentStepIndex;
        lastStepFromStepper.current = currentStepIndex;
      }
    }
  }, [
    isReady,
    searchParams,
    stepper.value,
    router,
    pathname,
    setStepInStore,
    orderedSteps.length,
  ]);

  // Upload step has been removed - no longer needed

  if (!isReady) return null;

  return (
    <FormProvider {...form}>
      <div className={'w-full'}>
        <Stepper {...stepper}>
          {/* Funnel Step Navigator - Left Sidebar (must be inside Stepper context) */}
          {/* Hide navigation on goviral.ryla.ai domain or when NEXT_PUBLIC_SHOW_NAVIGATOR is not 'true' */}
          {showNavigator && <FunnelStepNavigator />}

          <Stepper.Contents>
            {orderedSteps.map((step) => {
              const StepComponent = step.component;
              return (
                <Stepper.Content key={step.index}>
                  {/* Step {step.index}: {step.name} ({step.type}) */}
                  <StepComponent />
                </Stepper.Content>
              );
            })}
          </Stepper.Contents>

          {/* Modals */}
          <SecretOfferModal />
          <FinalOfferModal />
          <SpecialOfferModal />
          <FinalOfferUnlockedModal />
          <ShowVideoModal />
        </Stepper>
      </div>
    </FormProvider>
  );
}
