/**
 * Payment Service
 * 
 * Frontend service for handling payment flows (subscriptions and credits).
 * Uses the backend API for payment processing (not Next.js API routes).
 * Follows MDC's paymentServices pattern.
 */

import { getAccessToken, getCurrentUser } from '../auth';

const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface CreatePaymentSessionParams {
  type: 'subscription' | 'credit';
  planId?: string; // For subscriptions
  packageId?: string; // For credits
  isYearly?: boolean; // For subscriptions
  // userId and email are optional - will be fetched from auth if not provided
  userId?: string;
  email?: string;
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
   * 
   * Uses the backend API endpoint: POST /payments/session
   */
  async createPaymentSession(
    params: CreatePaymentSessionParams
  ): Promise<PaymentSessionResponse> {
    try {
      // Get auth token using the proper auth utility
      const token = typeof window !== 'undefined'
        ? getAccessToken()
        : null;

      if (!token) {
        throw new Error('Authentication required. Please log in to continue.');
      }

      // Get current user to extract userId and email
      // The backend requires userId in the request body and validates it matches the JWT
      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Unable to get user information. Please log in again.');
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // Prepare request body with user info
      const requestBody = {
        ...params,
        userId: params.userId || user.id,
        email: params.email || user.email,
      };

      // Call backend API instead of Next.js API route
      const response = await fetch(`${API_BASE_URL}/payments/session`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Handle error response
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Payment service error. Please try again.';
        let errorCode: string | undefined;

        if (contentType?.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
            errorCode = errorData.code;
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

        const error = new Error(errorMessage) as Error & { code?: string };
        if (errorCode) {
          error.code = errorCode;
        }
        throw error;
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

      // Open payment URL in new tab only - do NOT redirect current page
      // Use '_blank' without 'noopener' to get a valid window reference
      // (noopener can return null even on success in some browsers)
      const paymentWindow = window.open(data.paymentUrl, '_blank');

      if (!paymentWindow) {
        // Popup was blocked - inform user but don't redirect current page
        console.warn('Payment popup was blocked. User should allow popups for this site.');
        // Still return successfully - the URL is available for the caller to handle
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

