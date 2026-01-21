'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFunnelStore } from '@/store/states/funnel';
import { FinbyResultCodes } from '@/utils/enums/finby-result-codes';
import { finbyService } from '@/services/finby-service';
import { products } from '@/constants/products';

import { trackFacebookPurchase, trackTwitterPurchase } from '@ryla/analytics';

export function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setStep = useFunnelStore((state) => state.setStep);

  useEffect(() => {
    if (!searchParams) return;

    const reference = searchParams.get('Reference');
    const resultCodeParam = searchParams.get('ResultCode');
    const paymentRequestId = searchParams.get('PaymentRequestId');

    // Parse result code
    const resultCode = resultCodeParam ? parseInt(resultCodeParam, 10) : null;

    console.log('Payment callback received:', {
      reference,
      resultCode,
      paymentRequestId,
    });

    // Store payment result in localStorage for polling to pick up
    if (reference) {
      const paymentResult = {
        reference,
        resultCode,
        paymentRequestId,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        'finby_payment_result',
        JSON.stringify(paymentResult)
      );
    }

    // Handle different result codes
    if (resultCode === null) {
      // No result code - invalid callback
      console.error('Payment callback missing ResultCode');
      returnToPaymentStep('Invalid payment callback. Please try again.');
      return;
    }

    // Success codes: 0 (Success), 3 (Authorized)
    if (resultCode === FinbyResultCodes.SUCCESS || resultCode === 3) {
      // Clear previous step data on success (no need to restore)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('finby_payment_previous_step');
      }

      // Track Purchase event for Facebook Pixel
      const trackPurchaseEvent = async () => {
        try {
          if (reference) {
            const statusResponse = await finbyService.getPaymentStatus(
              reference
            );
            const purchaseAmount = statusResponse.amount
              ? statusResponse.amount / 100 // Convert cents to dollars
              : products[0]?.amount / 100 || 29.0; // Default to $29.00
            const purchaseCurrency = statusResponse.currency || 'USD';

            // Fire Facebook Pixel Purchase event
            trackFacebookPurchase(purchaseAmount, purchaseCurrency, reference);

            // Fire Twitter/X Pixel Purchase event
            trackTwitterPurchase({
              value: purchaseAmount,
              currency: purchaseCurrency,
              conversion_id: reference, // Use conversion_id for deduplication
            });
          }
        } catch (error) {
          console.error('Error tracking purchase event:', error);
        }
      };

      trackPurchaseEvent();

      // Process automatic refund immediately after successful payment
      if (reference && paymentRequestId) {
        const product = products[0];
        const refundAmount = product?.amount || 2900;
        const refundCurrency = product?.currency || 'USD';

        finbyService
          .processRefund({
            paymentRequestId,
            reference,
            amount: refundAmount,
            currency: refundCurrency,
          })
          .catch((error) => {
            console.error('❌ Refund failed:', error);
          });
      }

      const successStepIndex = 35;
      setStep(successStepIndex);
      router.replace(`/?step=${successStepIndex}`);
      return;
    }

    // Cancel: ResultCode 1005
    if (resultCode === FinbyResultCodes.USER_CANCEL) {
      returnToPaymentStep(
        "Payment was cancelled. Please try again when you're ready."
      );
      return;
    }

    // Error: ResultCode >= 1000
    if (resultCode >= 1000) {
      returnToPaymentStep('Payment failed. Please try again.');
      return;
    }

    // Pending or other status
    returnToPaymentStep('Payment is still processing.');
  }, [searchParams, router, setStep]);

  const returnToPaymentStep = (errorMessage: string) => {
    if (errorMessage && typeof window !== 'undefined' && searchParams) {
      localStorage.setItem('finby_payment_error', errorMessage);
      sessionStorage.setItem('finby_payment_callback_redirect', 'true');
    }

    const paymentStepIndex = 34;
    setStep(paymentStepIndex);
    router.replace(`/?step=${paymentStepIndex}`);
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div className="text-white text-xl font-bold mb-4">
          Processing payment...
        </div>
        <div className="text-white/70 text-sm">
          Please wait while we process your payment.
        </div>
      </div>
    </div>
  );
}
