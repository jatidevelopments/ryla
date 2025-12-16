"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";

import { toastType, triggerToast } from "@/components/AlertToast";

import { useFinbySetupPayment } from "@/hooks/queries/useFinby";
import { useFinbyReady } from "@/hooks/useFinbyReady";

import { useAuthStore } from "@/store/states/auth";
import { useFunnelStore } from "@/store/states/funnel";

import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";

import { FinbyStatuses } from "@/utils/enums/finby-statuses";
import { FinbyResultCodes } from "@/utils/enums/finby-result-codes";

import { products } from "@/constants/products";

import { analyticsService } from "@/services/analytics-service";
import { finbyService } from "@/services/finby-service";
import { AnalyticsEventTypeEnum } from "@/utils/enums/analytics-event-types";
import { reportPurchase } from "@/lib/gtag";
import { trackPurchase, trackAddToCart } from "@/lib/fbPixel";
import { getStepIndexByName } from "@/features/funnel/config/steps";

export function usePaymentForm(posthog?: any) {
    const router = useRouter();
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [paymentReference, setPaymentReference] = useState<string | null>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const finbyIframeRef = useRef<HTMLIFrameElement | null>(null);

    const { mutate: setupPayment, isPending: isSetupPending } = useFinbySetupPayment();
    const { isReady: isFinbyReady, error: finbyError } = useFinbyReady();
    const form = useFormContext<FunnelSchema>();
    const authToken = useAuthStore((state) => state.authToken);
    const userId = useAuthStore((state) => state.userId);
    const authReset = useAuthStore((state) => state.reset);
    const funnelReset = useFunnelStore((state) => state.reset);
    const setStep = useFunnelStore((state) => state.setStep);

    const productId = form.watch("productId");
    const product = useMemo(() => products.find((p) => p.id === productId), [productId]);
    const email = form.watch("email");

    const addToCartTrackedRef = useRef(false);

    // Track AddToCart when payment form is ready and product is available
    useEffect(() => {
        if (!product || !isFinbyReady || addToCartTrackedRef.current) return;

        trackAddToCart({
            content_ids: [String(product.id)],
            content_name: product.name,
            value: product.amount / 100,
            currency: "USD",
        });

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: "cd_add_to_cart",
            product_id: product.id,
            product_name: product.name,
            value: product.amount / 100,
            currency: "USD",
        });

        addToCartTrackedRef.current = true;

        // PostHog paywall opened tracking
        try {
            if (typeof window !== "undefined" && posthog && product) {
                const cycle =
                    product.durationMonths === 12
                        ? "yearly"
                        : product.durationMonths === 3
                          ? "quarterly"
                          : "monthly";
                posthog.capture("paywall_opened", {
                    price_id: String(product.id),
                    cycle: cycle,
                    amount: product.amount / 100,
                });
            }
        } catch (e) {
            console.warn("PostHog paywall tracking failed", e);
        }
    }, [product, isFinbyReady, posthog]);

    // Initialize finby iframe when payment URL is ready
    useEffect(() => {
        if (!paymentUrl || !finbyIframeRef.current) return;

        // Set the iframe src to the payment URL
        finbyIframeRef.current.src = paymentUrl;

        // Callback when popup is loaded (if defined)
        if (typeof window !== "undefined" && (window as any).onTrustPayPopupLoaded) {
            (window as any).onTrustPayPopupLoaded();
        }
    }, [paymentUrl]);

    // Polling function for payment status
    const pollPaymentStatus = async (
        reference: string,
        mpPayload: any,
        onSuccess: () => void,
        onError: (errorMessage: string) => void,
    ) => {
        const pollInterval = 2000; // 2 seconds
        const maxAttempts = 30; // 1 minute total
        let attempts = 0;

        setIsPolling(true);

        // Check localStorage for payment result from callback (in case user was redirected)
        const checkLocalStorageResult = () => {
            if (typeof window === "undefined") return null;
            try {
                const stored = localStorage.getItem("finby_payment_result");
                if (stored) {
                    const result = JSON.parse(stored);
                    if (result.reference === reference) {
                        return result;
                    }
                }
            } catch (e) {
                console.error("Error reading payment result from localStorage:", e);
            }
            return null;
        };

        const poll = async () => {
            try {
                attempts++;
                
                // First check localStorage for callback result
                const callbackResult = checkLocalStorageResult();
                if (callbackResult) {
                    if (callbackResult.resultCode === 0 || callbackResult.resultCode === 3) {
                        // Success from callback
                        setIsPolling(false);
                        localStorage.removeItem("finby_payment_result");
                        onSuccess();
                        return;
                    } else if (callbackResult.resultCode === 1005) {
                        // User cancelled
                        setIsPolling(false);
                        localStorage.removeItem("finby_payment_result");
                        onError("Payment was cancelled. Please try again when you're ready.");
                        return;
                    } else if (callbackResult.resultCode && callbackResult.resultCode >= 1000) {
                        // Error from callback
                        setIsPolling(false);
                        localStorage.removeItem("finby_payment_result");
                        onError("Payment failed. Please try again.");
                        return;
                    }
                }

                const statusResponse = await finbyService.getPaymentStatus(reference);

                if (statusResponse.paid_status === "paid" || statusResponse.status === "paid") {
                    setIsPolling(false);
                    onSuccess();
                    return;
                } else if (
                    statusResponse.paid_status === "failed" ||
                    statusResponse.status === "failed"
                ) {
                    const errorMessage =
                        statusResponse.failureMessage ||
                        statusResponse.resultMessage ||
                        "Something went wrong during payment. Please try again.";
                    setIsPolling(false);
                    onError(errorMessage);
                    return;
                } else if (
                    statusResponse.paid_status === "pending" ||
                    statusResponse.status === "pending" ||
                    statusResponse.status === "processing"
                ) {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError("Payment is taking longer than expected. Please try again.");
                    }
                } else if (statusResponse.resultCode === FinbyResultCodes.SUCCESS) {
                    // finby result code 0 = success
                    setIsPolling(false);
                    onSuccess();
                    return;
                } else if (
                    statusResponse.resultCode !== undefined &&
                    statusResponse.resultCode !== FinbyResultCodes.SUCCESS
                ) {
                    // finby error code
                    const errorMessage =
                        statusResponse.resultMessage ||
                        statusResponse.failureMessage ||
                        "Payment failed. Please try again.";
                    setIsPolling(false);
                    onError(errorMessage);
                    return;
                } else {
                    // Continue polling if status is unclear
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError("Payment is taking longer than expected. Please try again.");
                    }
                }
            } catch (error: any) {
                console.error("Error polling payment status:", error);

                if (error.response?.status === 404) {
                    if (attempts < maxAttempts) {
                        setTimeout(poll, pollInterval);
                    } else {
                        setIsPolling(false);
                        onError("Payment is taking longer than expected. Please try again.");
                    }
                } else {
                    setIsPolling(false);
                    onError("Failed to check payment status. Please try again.");
                }
            }
        };

        poll();
    };

    useEffect(() => {
        if (finbyError) {
            triggerToast({
                title: "Payment system is not available. Please refresh the page.",
                type: toastType.error,
            });
        }
    }, [finbyError]);


    const onSubmit = async () => {
        if (!product || !email) {
            triggerToast({
                title: "Please enter your email address.",
                type: toastType.error,
            });
            return;
        }

        if (!isFinbyReady) {
            triggerToast({
                title: "Payment system is not ready. Please wait a moment.",
                type: toastType.error,
            });
            return;
        }

        // Save current step before initiating payment (for callback restoration)
        // This allows us to restore the user to the correct step after payment callback
        // Also save step index in URL for URL-based navigation
        const currentStep = useFunnelStore.getState().step;
        const paymentIndex = getStepIndexByName("Payment");
        
        if (typeof window !== "undefined") {
            // Save the step before Payment (typically Subscription step)
            // If we're on Payment step, try to get the step before it
            let stepToSave = currentStep;
            
            if (currentStep === paymentIndex && paymentIndex !== undefined && paymentIndex > 0) {
                // If we're on Payment step, save the step before it (Subscription)
                stepToSave = paymentIndex - 1;
            } else if (currentStep === null) {
                // If no step is set, use Payment step as fallback
                stepToSave = paymentIndex ?? 0;
            }
            
            // Save to localStorage for callback restoration
            localStorage.setItem("finby_payment_previous_step", JSON.stringify({
                step: stepToSave,
                timestamp: Date.now(),
            }));
            
            console.log(`Saved previous step before payment: ${stepToSave} (was on step ${currentStep})`);
            // Note: URL will be updated automatically by the URL sync effect in FunnelView
        }

        let utm: Record<string, any> | undefined;
        try {
            const stored = localStorage.getItem("utm_params");
            if (stored) utm = JSON.parse(stored);
        } catch {}

        const mpPayload = {
            distinct_id: String(userId ?? ""),
            product_name: product.name,
            value: product.amount / 100,
            currency: "USD",
            product_id: product.id,
            tid: utm?.deal,
        };

        try {
            // Mixpanel (DISABLED - tracking moved to PostHog)
            // analyticsService.trackPaymentEvent(AnalyticsEventTypeEnum.PAYMENT_INITIATED, mpPayload);

            if (typeof window !== "undefined" && posthog) {
                posthog.capture("payment_initiated", {
                    product_id: product.id,
                    product_name: product.name,
                    value: product.amount / 100,
                    currency: "USD",
                    user_id: userId,
                });
            }

            // Build callback URLs for Finby redirects
            // Always use production URL to avoid localhost redirects
            // In browser: use window.location.origin (should be goviral.ryla.ai in production)
            // Fallback to hardcoded production URL if localhost detected
            let siteUrl: string;
            if (typeof window !== "undefined") {
                // In browser: use current origin
                siteUrl = window.location.origin;
                // Safety check: if somehow localhost, use production URL
                if (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1")) {
                    console.warn("⚠️ Detected localhost in siteUrl, using production URL instead");
                    siteUrl = "https://goviral.ryla.ai";
                }
            } else {
                // On server: use env var or production URL
                siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://goviral.ryla.ai";
            }
            
            const paymentCallbackUrl = `${siteUrl}/payment-callback`;
            
            console.log("Payment setup - URLs:", {
                siteUrl,
                paymentCallbackUrl,
                notificationUrl: `${siteUrl}/api/finby/notification`,
                windowOrigin: typeof window !== "undefined" ? window.location.origin : "N/A",
            });
            
            // Setup payment with finby - get payment URL
            setupPayment(
                {
                    productId: product.id,
                    email: email,
                    // Optional billing info for SCA compliance
                    cardHolder: email.split("@")[0], // Use email prefix as fallback
                    billingCountry: "US", // Default, can be made dynamic
                    // Callback URLs for Finby redirects
                    returnUrl: paymentCallbackUrl,
                    cancelUrl: paymentCallbackUrl,
                    errorUrl: paymentCallbackUrl,
                    notificationUrl: `${siteUrl}/api/finby/notification`,
                },
                {
                    onSuccess: (response) => {
                        if (response.paymentUrl && response.reference) {
                            setPaymentUrl(response.paymentUrl);
                            setPaymentReference(response.reference);
                            setIsPopupOpen(true);

                            // Open finby popup
                            if (typeof window !== "undefined" && (window as any).openPopup) {
                                (window as any).openPopup();
                            } else {
                                triggerToast({
                                    title: "Failed to open payment window. Please refresh the page.",
                                    type: toastType.error,
                                });
                            }

                            // Start polling for payment status
                            pollPaymentStatus(
                                response.reference,
                                mpPayload,
                                async () => {
                                    setIsPopupOpen(false);

                                    // FACEBOOK PIXEL TRACKING — Purchase
                                    trackPurchase(product.amount / 100, "USD", response.reference);

                                    // GOOGLE ADS — Purchase (DISABLED)
                                    // reportPurchase(response.reference, {
                                    //     value: product.amount / 100,
                                    //     currency: "USD",
                                    // });

                                    // GTM / dataLayer — Purchase
                                    window.dataLayer = window.dataLayer || [];
                                    window.dataLayer.push({
                                        event: "cd_purchase",
                                        transaction_id: response.reference,
                                        value: product.amount / 100,
                                        currency: "USD",
                                        product_id: product.id,
                                        product_name: product.name,
                                    });

                                    // PostHog — Payment Success
                                    if (typeof window !== "undefined" && posthog) {
                                        posthog.capture("payment_success", {
                                            value: product.amount / 100,
                                            currency: "USD",
                                            product_id: product.id,
                                            product_name: product.name,
                                            user_id: userId,
                                        });
                                    }

                                    // Mixpanel (DISABLED - tracking moved to PostHog)
                                    // analyticsService.trackPaymentEvent(
                                    //     AnalyticsEventTypeEnum.PAYMENT_SUCCESS,
                                    //     mpPayload,
                                    // );

                                    // Process automatic refund immediately after successful payment
                                    // IMPORTANT: Refund failure should NOT block success navigation
                                    // Get paymentRequestId from payment status or response
                                    const processRefundAsync = async () => {
                                        try {
                                            const statusResponse = await finbyService.getPaymentStatus(response.reference);
                                            const paymentRequestId = statusResponse.paymentRequestId || response.transactionId;
                                            
                                            if (paymentRequestId) {
                                                console.log("Processing automatic refund for successful payment:", {
                                                    paymentRequestId,
                                                    reference: response.reference,
                                                    amount: product.amount,
                                                    currency: product.currency || "USD",
                                                });
                                                
                                                await finbyService.processRefund({
                                                    paymentRequestId,
                                                    reference: response.reference,
                                                    amount: product.amount,
                                                    currency: product.currency || "USD",
                                                });
                                                
                                                console.log("✅ Refund processed successfully");
                                            } else {
                                                console.warn("PaymentRequestId not available for refund, using reference:", response.reference);
                                                // Try with reference as fallback (may not work but worth trying)
                                                await finbyService.processRefund({
                                                    paymentRequestId: response.reference,
                                                    reference: response.reference,
                                                    amount: product.amount,
                                                    currency: product.currency || "USD",
                                                });
                                            }
                                        } catch (refundError: any) {
                                            console.error("❌ Refund failed (payment still treated as successful):", refundError);
                                            // Don't throw - refund failure should never block success navigation
                                            // Log error for monitoring but continue with success flow
                                        }
                                    };
                                    
                                    // Process refund asynchronously without blocking navigation
                                    // Fire and forget - don't await, so it doesn't block the success flow
                                    processRefundAsync();

                                    // Navigate to step 35 (success step) with step index in URL parameter
                                    // URL is the source of truth - FunnelView will sync the step from URL
                                    const successStepIndex = 35;
                                    setStep(successStepIndex);
                                    router.replace(`/?step=${successStepIndex}`);

                                    // PostHog tracking - Navigated to success step
                                    if (typeof window !== "undefined" && posthog) {
                                        posthog.capture("navigated_to_all_spots_reserved", {
                                            step_index: successStepIndex,
                                            product_id: product.id,
                                            product_name: product.name,
                                            value: product.amount / 100,
                                            currency: "USD",
                                            user_id: userId,
                                        });
                                    }
                                },
                                (errorMessage: string) => {
                                    setIsPopupOpen(false);

                                    // Store error message in localStorage to show in payment step
                                    if (typeof window !== "undefined") {
                                        localStorage.setItem("finby_payment_error", errorMessage);
                                    }

                                    // Mixpanel (DISABLED - tracking moved to PostHog)
                                    // analyticsService.trackPaymentEvent(
                                    //     AnalyticsEventTypeEnum.PAYMENT_FAILED,
                                    //     mpPayload,
                                    // );

                                    // PostHog - Payment Failed
                                    if (typeof window !== "undefined" && posthog) {
                                        posthog.capture("payment_failed", {
                                            product_id: product.id,
                                            product_name: product.name,
                                            value: product.amount / 100,
                                            currency: "USD",
                                            user_id: userId,
                                            error_message: errorMessage,
                                        });
                                    }

                                    // Navigate to step 34 (payment step) with error message
                                    const paymentStepIndex = 34;
                                    setStep(paymentStepIndex);
                                    router.replace(`/?step=${paymentStepIndex}`);

                                    triggerToast({
                                        title: errorMessage,
                                        type: toastType.error,
                                    });
                                },
                            );
                        } else {
                            const errorMessage = "Failed to initialize payment. Please try again.";
                            
                            // Store error message in localStorage to show in payment step
                            if (typeof window !== "undefined") {
                                localStorage.setItem("finby_payment_error", errorMessage);
                            }

                            // Navigate to step 34 (payment step) with error message
                            const paymentStepIndex = 34;
                            setStep(paymentStepIndex);
                            router.replace(`/?step=${paymentStepIndex}`);

                            triggerToast({
                                title: errorMessage,
                                type: toastType.error,
                            });
                        }
                    },
                    onError: (error) => {
                        console.error("Payment setup error:", error);
                        setIsPolling(false);

                        const errorMessage = error.message || "An unexpected error occurred. Please try again.";

                        // Store error message in localStorage to show in payment step
                        if (typeof window !== "undefined") {
                            localStorage.setItem("finby_payment_error", errorMessage);
                        }

                        // Mixpanel (DISABLED - tracking moved to PostHog)
                        // analyticsService.trackPaymentEvent(
                        //     AnalyticsEventTypeEnum.PAYMENT_FAILED,
                        //     mpPayload,
                        // );

                        // PostHog - Payment Failed
                        if (typeof window !== "undefined" && posthog) {
                            posthog.capture("payment_failed", {
                                product_id: product.id,
                                product_name: product.name,
                                value: product.amount / 100,
                                currency: "USD",
                                user_id: userId,
                                error_message: errorMessage,
                            });
                        }

                        // Navigate to step 34 (payment step) with error message
                        const paymentStepIndex = 34;
                        setStep(paymentStepIndex);
                        router.replace(`/?step=${paymentStepIndex}`);

                        triggerToast({
                            title: errorMessage,
                            type: toastType.error,
                        });
                    },
                },
            );
        } catch (error: any) {
            console.error("Payment processing error:", error);
            setIsPolling(false);

            // Mixpanel (DISABLED - tracking moved to PostHog)
            // analyticsService.trackPaymentEvent(AnalyticsEventTypeEnum.PAYMENT_FAILED, mpPayload);

            // PostHog - Payment Failed
            if (typeof window !== "undefined" && posthog) {
                posthog.capture("payment_failed", {
                    product_id: product?.id,
                    product_name: product?.name,
                    value: product ? product.amount / 100 : 0,
                    currency: "USD",
                    user_id: userId,
                    error_message: error.message || "Unknown error",
                });
            }

            triggerToast({
                title: error.message || "An unexpected error occurred. Please try again.",
                type: toastType.error,
            });
        }
    };

    return {
        product: product!,
        onSubmit,
        isPending: isSetupPending || isPolling || !isFinbyReady,
        isFinbyReady,
        finbyError,
        paymentUrl,
        finbyIframeRef,
    };
}
