"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFunnelStore } from "@/store/states/funnel";
import { FinbyResultCodes } from "@/utils/enums/finby-result-codes";
import { finbyService } from "@/services/finby-service";
import { products } from "@/constants/products";
import { trackFacebookPurchase } from "@ryla/analytics";

// Disable static generation for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Payment Callback Page
 * 
 * Handles Finby payment redirects (ReturnUrl, CancelUrl, ErrorUrl)
 * 
 * URL Parameters from Finby:
 * - Reference: Payment reference ID
 * - ResultCode: Payment result code (0 = success, 1005 = cancel, >= 1000 = error)
 * - PaymentRequestId: Finby payment request ID (optional)
 * 
 * Flow:
 * - Success (ResultCode 0 or 3): Navigate to step 35 (success)
 * - Cancel/Error (ResultCode 1005 or >= 1000): Navigate to step 34 (payment step) with error message
 */
export default function PaymentCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setStep = useFunnelStore((state) => state.setStep);

    useEffect(() => {
        if (!searchParams) return;
        
        const reference = searchParams.get("Reference");
        const resultCodeParam = searchParams.get("ResultCode");
        const paymentRequestId = searchParams.get("PaymentRequestId");

        // Parse result code
        const resultCode = resultCodeParam ? parseInt(resultCodeParam, 10) : null;

        console.log("Payment callback received:", {
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
            localStorage.setItem("finby_payment_result", JSON.stringify(paymentResult));
        }

        // Handle different result codes
        if (resultCode === null) {
            // No result code - invalid callback
            console.error("Payment callback missing ResultCode");
            returnToPaymentStep("Invalid payment callback. Please try again.");
            return;
        }

        // Success codes: 0 (Success), 3 (Authorized)
        if (resultCode === FinbyResultCodes.SUCCESS || resultCode === 3) {
            // Clear previous step data on success (no need to restore)
            if (typeof window !== "undefined") {
                localStorage.removeItem("finby_payment_previous_step");
            }
            
            // Track Purchase event for Facebook Pixel
            // Try to get payment details from status API, fallback to default product
            const trackPurchaseEvent = async () => {
                try {
                    if (reference) {
                        const statusResponse = await finbyService.getPaymentStatus(reference);
                        const purchaseAmount = statusResponse.amount 
                            ? statusResponse.amount / 100 // Convert cents to dollars
                            : products[0]?.amount / 100 || 29.00; // Default to $29.00
                        const purchaseCurrency = statusResponse.currency || "USD";
                        
                        // Fire Facebook Pixel Purchase event
                        trackFacebookPurchase(purchaseAmount, purchaseCurrency, reference);
                        
                        console.log("✅ Purchase event tracked:", {
                            value: purchaseAmount,
                            currency: purchaseCurrency,
                            reference,
                        });
                    }
                } catch (error) {
                    console.error("Error tracking purchase event:", error);
                    // Fallback: track with default product if status check fails
                    const defaultProduct = products[0];
                    if (defaultProduct && reference) {
                        trackFacebookPurchase(defaultProduct.amount / 100, defaultProduct.currency || "USD", reference);
                    }
                }
            };
            
            // Track purchase asynchronously (don't block navigation)
            trackPurchaseEvent();
            
            // Process automatic refund immediately after successful payment
            // IMPORTANT: Refund failure should NOT block success navigation
            if (reference && paymentRequestId) {
                // Get product details for refund amount
                // Default to first product if we can't determine which product was used
                const product = products[0];
                const refundAmount = product?.amount || 2900; // Default to $29.00
                const refundCurrency = product?.currency || "USD";
                
                // Process refund asynchronously (don't block navigation)
                // Even if refund fails, we still treat payment as successful
                finbyService.processRefund({
                    paymentRequestId,
                    reference,
                    amount: refundAmount,
                    currency: refundCurrency,
                }).then(() => {
                    console.log("✅ Refund processed successfully from payment callback");
                }).catch((error) => {
                    console.error("❌ Refund failed from payment callback (payment still treated as successful):", error);
                    // Don't block navigation if refund fails - payment is still successful
                    // Log error for monitoring but continue with success flow
                });
            } else {
                console.warn("Cannot process refund: missing reference or paymentRequestId", {
                    reference,
                    paymentRequestId,
                });
            }
            
            // ALWAYS navigate to step 35 (success step) regardless of refund status
            // Refund failure should never block the success navigation
            const successStepIndex = 35;
            setStep(successStepIndex);
            router.replace(`/?step=${successStepIndex}`);
            return;
        }

        // Cancel: ResultCode 1005
        if (resultCode === FinbyResultCodes.USER_CANCEL) {
            returnToPaymentStep("Payment was cancelled. Please try again when you're ready.");
            return;
        }

        // Error: ResultCode >= 1000 (except 1005 which is cancel)
        if (resultCode >= 1000) {
            const errorMessage = getErrorMessage(resultCode);
            returnToPaymentStep(errorMessage);
            return;
        }

        // Pending or other status codes - return to payment step
        returnToPaymentStep("Payment is still processing. Please wait a moment and try again.");
    }, [searchParams, router, setStep]);

    const returnToPaymentStep = (errorMessage: string) => {
        // Store error message in localStorage to show in payment step
        // IMPORTANT: Set this synchronously BEFORE navigation to ensure it's available when FunnelView checks
            if (errorMessage && typeof window !== "undefined" && searchParams) {
                localStorage.setItem("finby_payment_error", errorMessage);
                // Also ensure payment result is set (even if it's an error) so FunnelView can detect it
                const existingResult = localStorage.getItem("finby_payment_result");
                if (!existingResult) {
                    // Set a minimal result to indicate we came from payment callback
                    localStorage.setItem("finby_payment_result", JSON.stringify({
                        reference: searchParams.get("Reference") || "unknown",
                        resultCode: searchParams.get("ResultCode") ? parseInt(searchParams.get("ResultCode")!, 10) : null,
                        timestamp: Date.now(),
                    }));
                }
            // Set a flag to indicate we're coming from payment callback (persists across navigation)
            sessionStorage.setItem("finby_payment_callback_redirect", "true");
        }

        // Navigate directly to step 34 (payment step) with error message
        const paymentStepIndex = 34;
        setStep(paymentStepIndex);
        router.replace(`/?step=${paymentStepIndex}`);
    };

    const getErrorMessage = (resultCode: number): string => {
        const errorMessages: Record<number, string> = {
            [FinbyResultCodes.INVALID_REQUEST]: "Invalid payment request. Please try again.",
            [FinbyResultCodes.UNKNOWN_ACCOUNT]: "Payment account error. Please contact support.",
            [FinbyResultCodes.MERCHANT_ACCOUNT_DISABLED]: "Payment service is temporarily unavailable.",
            [FinbyResultCodes.INVALID_SIGNATURE]: "Payment verification failed. Please try again.",
            [FinbyResultCodes.INVALID_AUTHENTICATION]: "Payment authentication failed. Please try again.",
            [FinbyResultCodes.INSUFFICIENT_BALANCE]: "Insufficient funds. Please use a different payment method.",
            [FinbyResultCodes.SERVICE_NOT_ALLOWED]: "Payment service not available. Please contact support.",
            [FinbyResultCodes.REJECTED_TRANSACTION]: "Payment was rejected. Please try again or use a different payment method.",
            [FinbyResultCodes.DECLINED_BY_RISK]: "Payment was declined for security reasons. Please contact support.",
            [FinbyResultCodes.GENERAL_ERROR]: "An error occurred during payment. Please try again.",
        };

        return errorMessages[resultCode] || "Payment failed. Please try again.";
    };

    // Show loading state while processing
    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-black">
            <div className="text-center">
                <div className="text-white text-xl font-bold mb-4">Processing payment...</div>
                <div className="text-white/70 text-sm">Please wait while we process your payment.</div>
            </div>
        </div>
    );
}

