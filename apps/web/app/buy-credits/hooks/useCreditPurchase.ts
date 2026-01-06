'use client';

import { useState, useCallback } from 'react';
import { getAccessToken } from '../../../lib/auth';
import type { CreditPackage } from '../../../constants/pricing';

interface UseCreditPurchaseOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useCreditPurchase({ onSuccess, onError }: UseCreditPurchaseOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const purchase = useCallback(
    async (packageId: string) => {
      setIsProcessing(true);
      try {
        const token = getAccessToken();
        if (!token) {
          throw new Error('You must be logged in to purchase credits');
        }

        const response = await fetch('/api/finby/setup-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            type: 'credit',
            packageId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create payment session');
        }

        const data = await response.json();

        // Redirect to Finby payment page
        if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
          onSuccess?.();
        } else {
          throw new Error('No payment URL received');
        }
      } catch (error: any) {
        console.error('Purchase error:', error);
        const errorObj = error instanceof Error ? error : new Error(error.message || 'Failed to start payment. Please try again.');
        onError?.(errorObj);
        setIsProcessing(false);
        throw errorObj;
      }
    },
    [onSuccess, onError]
  );

  return {
    purchase,
    isProcessing,
  };
}

