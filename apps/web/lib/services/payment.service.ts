/**
 * Payment Service
 * 
 * Frontend service for handling payment flows (subscriptions and credits).
 * Follows MDC's paymentServices pattern.
 */

import { getAccessToken } from '../auth';

export interface CreatePaymentSessionParams {
  type: 'subscription' | 'credit';
  planId?: string; // For subscriptions
  packageId?: string; // For credits
  isYearly?: boolean; // For subscriptions
}

export interface PaymentSessionResponse {
  paymentUrl: string;
  paymentRequestId?: string;
  reference?: string;
}

export interface PaymentServiceError {
  message: string;
  code?: string;
}

/**
 * Payment service for creating payment sessions and handling redirects
 */
export const paymentService = {
  /**
   * Create payment session for subscription or credit purchase
   * Opens payment URL in new tab (with fallback to same-tab redirect)
   */
  async createPaymentSession(
    params: CreatePaymentSessionParams
  ): Promise<PaymentSessionResponse> {
    try {
      // Get auth token using the proper auth utility
      const token = typeof window !== 'undefined'
        ? getAccessToken()
        : null;

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/finby/setup-payment', {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        // Handle error response
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Payment service error. Please try again.';

        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            // Use default message
          }
        } else {
          // If response is HTML or other format, try to get text
          try {
            const text = await response.text();
            // Extract meaningful error from HTML if possible
            if (text.includes('error') || text.includes('Error')) {
              errorMessage = 'Payment service error. Please try again later.';
            }
          } catch {
            // Use default message
          }
        }

        throw new Error(errorMessage);
      }

      // Verify response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid response format from payment service');
      }

      const data = await response.json();

      if (!data.paymentUrl) {
        throw new Error('No payment URL received from payment service');
      }

      // Open payment URL in new tab
      const paymentWindow = window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');

      if (!paymentWindow) {
        // Popup blocked - fallback to same-tab redirect
        window.location.href = data.paymentUrl;
      } else {
        paymentWindow.focus();
      }

      return {
        paymentUrl: data.paymentUrl,
        paymentRequestId: data.paymentRequestId,
        reference: data.reference,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to create payment session');
    }
  },

  /**
   * Create subscription payment session
   */
  async createSubscriptionSession(
    planId: string,
    isYearly = false
  ): Promise<PaymentSessionResponse> {
    return this.createPaymentSession({
      type: 'subscription',
      planId,
      isYearly,
    });
  },

  /**
   * Create credit purchase payment session
   */
  async createCreditSession(
    packageId: string
  ): Promise<PaymentSessionResponse> {
    return this.createPaymentSession({
      type: 'credit',
      packageId,
    });
  },
};

