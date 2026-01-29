import axios from "@/lib/axios";

/**
 * Finby service - uses backend API
 * All payment operations are handled by the backend API at end.ryla.ai
 */
export const finbyService = {
    /**
     * Setup payment and get the payment gateway URL
     * Uses backend API (end.ryla.ai/payments/finby/setup-payment)
     */
    setupPayment: async (data: FinbySetupPayload): Promise<FinbySetupResponse> => {
        const response = await axios.post<FinbySetupResponse>("/payments/finby/setup-payment", data);
        
        // Validate response structure
        if (!response.data.paymentUrl || !response.data.reference) {
            const errorMessage = "Invalid payment response: missing paymentUrl or reference";
            console.error("[FinbyService] Invalid payment response:", response.data);
            throw new Error(errorMessage);
        }
        
        return response.data;
    },
    /**
     * Get payment status by reference/transaction ID
     * Uses backend API (end.ryla.ai/payments/finby/payment-status/:reference)
     */
    getPaymentStatus: async (reference: string): Promise<FinbyPaymentStatusResponse> => {
        const response = await axios.get<FinbyPaymentStatusResponse>(`/payments/finby/payment-status/${reference}`);
        return response.data;
    },
    /**
     * Process refund for a payment
     * Uses backend API (end.ryla.ai/payments/finby/refund)
     */
    processRefund: async (data: FinbyRefundPayload): Promise<FinbyRefundResponse> => {
        const response = await axios.post<FinbyRefundResponse>("/payments/finby/refund", data);
        return response.data;
    },
};

