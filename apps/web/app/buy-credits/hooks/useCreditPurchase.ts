'use client';

import { useState, useCallback } from 'react';
import { getAccessToken } from '../../../lib/auth';
import { paymentService } from '../../../lib/services/payment.service';

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

        // Use payment service to create session and open payment URL
        await paymentService.createCreditSession(packageId);
          onSuccess?.();
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

