import axios from "@/lib/axios";

// Use Next.js API routes if backend API is not available
const USE_NEXTJS_API = typeof window !== "undefined";

/**
 * Finby service - now uses @ryla/payments library via API routes
 * The actual implementation is in apps/funnel/app/api/finby/setup-payment/route.ts
 */
export const finbyService = {
    /**
     * Setup payment and get the payment gateway URL
     * Uses Next.js API routes (which now use @ryla/payments library)
     * Falls back to backend API if available
     */
    setupPayment: async (data: FinbySetupPayload): Promise<FinbySetupResponse> => {
        if (USE_NEXTJS_API) {
            // Use Next.js API route (relative path)
            // This route now uses @ryla/payments library internally
            const response = await fetch("/api/finby/setup-payment", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            
            // Parse response JSON to check for error field
            const responseData = await response.json().catch(() => ({
                error: `Failed to parse response: ${response.statusText}`,
            }));
            
            // Check for error in response (even if status is 200)
            if (!response.ok || responseData.error) {
                const errorMessage = responseData.error || 
                    responseData.message || 
                    `Payment setup failed: ${response.statusText}`;
                
                // Log error for debugging
                console.error("[FinbyService] Payment setup failed:", {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorMessage,
                    details: responseData.details,
                    productId: data.productId,
                    email: data.email,
                });
                
                throw new Error(errorMessage);
            }
            
            // Validate response structure
            if (!responseData.paymentUrl || !responseData.reference) {
                const errorMessage = "Invalid payment response: missing paymentUrl or reference";
                console.error("[FinbyService] Invalid payment response:", responseData);
                throw new Error(errorMessage);
            }
            
            return responseData;
        } else {
            // Use backend API
            const response = await axios.post<FinbySetupResponse>("/finby/setup-payment", data);
            return response.data;
        }
    },
    /**
     * Get payment status by reference/transaction ID
     * Uses Next.js API routes if available, otherwise falls back to backend API
     */
    getPaymentStatus: async (reference: string): Promise<FinbyPaymentStatusResponse> => {
        if (USE_NEXTJS_API) {
            // Use Next.js API route (relative path)
            const response = await fetch(`/api/finby/payment-status/${reference}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                throw new Error(`Payment status check failed: ${response.statusText}`);
            }
            return response.json();
        } else {
            // Use backend API
            const response = await axios.get<FinbyPaymentStatusResponse>(`/finby/payment-status/${reference}`);
            return response.data;
        }
    },
    /**
     * Process refund for a payment
     * Uses Next.js API routes if available, otherwise falls back to backend API
     */
    processRefund: async (data: FinbyRefundPayload): Promise<FinbyRefundResponse> => {
        if (USE_NEXTJS_API) {
            // Use Next.js API route (relative path)
            const response = await fetch("/api/finby/refund", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(errorData.error || `Refund failed: ${response.statusText}`);
            }
            return response.json();
        } else {
            // Use backend API
            const response = await axios.post<FinbyRefundResponse>("/finby/refund", data);
            return response.data;
        }
    },
};

