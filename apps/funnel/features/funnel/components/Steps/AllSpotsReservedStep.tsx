"use client";

import { useEffect, useState, useRef } from "react";
import StepWrapper from "@/components/layouts/StepWrapper";
import { Button } from "@/components/ui/button";
import { safePostHogCapture } from "@/lib/analytics/posthog-utils";
import { useFormContext } from "react-hook-form";
import { FunnelSchema } from "@/features/funnel/hooks/useFunnelForm";
import { trackFacebookPurchase } from "@ryla/analytics";
import { products } from "@/constants/products";
import { finbyService } from "@/services/finby-service";
import { getOrCreateSessionId, updateSessionWaitlist } from "@/services/session-service";

export function AllSpotsReservedStep() {
    const form = useFormContext<FunnelSchema>();
    const email = form.watch("email");
    const [isOnWaitlist, setIsOnWaitlist] = useState(false);
    const purchaseTrackedRef = useRef(false);

    useEffect(() => {
        // PostHog tracking - All spots reserved page viewed
        safePostHogCapture('all_spots_reserved_viewed', {
            step_name: 'All Spots Reserved',
            email: email || undefined,
        });

        // Fallback: Track Purchase event if not already tracked
        // This ensures Purchase is fired even if callback page didn't fire it
        if (!purchaseTrackedRef.current && typeof window !== "undefined") {
            // Check if we have payment result in localStorage (from callback)
            try {
                const paymentResult = localStorage.getItem("finby_payment_result");
                if (paymentResult) {
                    const result = JSON.parse(paymentResult);
                    // Only track if payment was successful (resultCode 0 or 3)
                    if (result.reference && (result.resultCode === 0 || result.resultCode === 3)) {
                        const trackPurchaseEvent = async () => {
                            try {
                                const statusResponse = await finbyService.getPaymentStatus(result.reference);
                                const purchaseAmount = statusResponse.amount 
                                    ? statusResponse.amount / 100 // Convert cents to dollars
                                    : products[0]?.amount / 100 || 29.00; // Default to $29.00
                                const purchaseCurrency = statusResponse.currency || "USD";
                                
                                // Fire Facebook Pixel Purchase event
                                trackFacebookPurchase(purchaseAmount, purchaseCurrency, result.reference);
                                purchaseTrackedRef.current = true;
                                
                                console.log("✅ Purchase event tracked from AllSpotsReservedStep:", {
                                    value: purchaseAmount,
                                    currency: purchaseCurrency,
                                    reference: result.reference,
                                });
                            } catch (error) {
                                console.error("Error tracking purchase event from AllSpotsReservedStep:", error);
                                // Fallback: track with default product if status check fails
                                const defaultProduct = products[0];
                                if (defaultProduct && result.reference) {
                                    trackFacebookPurchase(defaultProduct.amount / 100, defaultProduct.currency || "USD", result.reference);
                                    purchaseTrackedRef.current = true;
                                }
                            }
                        };
                        
                        trackPurchaseEvent();
                    }
                }
            } catch (e) {
                console.error("Error checking payment result for Purchase tracking:", e);
            }
        }
    }, [email]);

    const handleJoinWaitlist = () => {
        // PostHog tracking - Waitlist joined
        safePostHogCapture('waitlist_joined', {
            step_name: 'All Spots Reserved',
            email: email || undefined,
        });

        setIsOnWaitlist(true);

        // Save waitlist status to Supabase session
        const sessionId = getOrCreateSessionId();
        updateSessionWaitlist(sessionId, true).catch((error) => {
            console.error("Failed to save waitlist status to session:", error);
        });
    };

    return (
        <StepWrapper>
            <div className="min-h-screen w-full flex items-center justify-center px-4 py-8">
                <div className="max-w-[500px] w-full">
                    {/* Simple heading */}
                    <h1 className="text-white text-2xl font-semibold mb-8 text-center">
                        Sorry,{" "}
                        <span className="text-transparent bg-clip-text bg-primary-gradient">
                            All Spots Are Currently Reserved.
                        </span>
                    </h1>

                    {/* Simple clock icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                            <svg
                                className="w-8 h-8 text-white/60"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Main content box - simple and clean */}
                    <div className="bg-white/5 rounded-2xl p-8 mb-8 border border-white/10">
                        <div className="space-y-6 text-left">
                            <p className="text-white text-base leading-relaxed">
                                Ryla.ai's early access is limited to a select group of users — and all spots have now been filled.
                            </p>
                            
                            <div className="border-t border-white/10 pt-6">
                                <p className="text-white/80 text-base leading-relaxed">
                                    Your order has been refunded, and you've been added to the priority waitlist.
                                </p>
                            </div>

                            <div className="border-t border-white/10 pt-6">
                                <p className="text-white text-base leading-relaxed">
                                    We'll notify you the moment a new spot opens so you can be among the next wave of creators to enter Ryla.ai.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Simple button */}
                    {!isOnWaitlist ? (
                        <Button
                            onClick={handleJoinWaitlist}
                            className="w-full h-[50px] bg-primary-gradient hover:opacity-90 transition-opacity rounded-xl font-semibold"
                        >
                            Yes, please let me know when a new spot is available
                        </Button>
                    ) : (
                        <div className="text-center">
                            <div className="w-full h-[50px] bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-3">
                                <svg
                                    className="w-5 h-5 text-green-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                <span className="text-green-400 text-sm font-semibold">
                                    You're on the waitlist!
                                </span>
                            </div>
                            <p className="text-white/60 text-sm">
                                We'll notify you as soon as a spot becomes available
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </StepWrapper>
    );
}

