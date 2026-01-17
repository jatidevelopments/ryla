/**
 * finby Payment Integration Types
 * Based on https://doc.finby.eu/#overview-intro
 */

// Payment setup request payload
interface FinbySetupPayload {
    productId: number;
    email: string;
    cardHolder?: string;
    billingStreet?: string;
    billingCity?: string;
    billingPostcode?: string;
    billingCountry?: string;
    returnUrl?: string;
    cancelUrl?: string;
    errorUrl?: string;
    notificationUrl?: string;
}

// Payment setup response - contains the payment gateway URL
interface FinbySetupResponse {
    paymentUrl: string;
    reference: string;
    transactionId?: string;
    requestId?: string;
    // Error handling fields
    error?: string;
    message?: string;
    code?: string;
}

// Payment status response
interface FinbyPaymentStatusResponse {
    reference: string;
    transactionId?: string;
    status: "pending" | "paid" | "failed" | "processing" | "authorized";
    resultCode: number; // finby result codes: 0 = success, others = error
    resultMessage?: string;
    amount?: number;
    currency?: string;
    paid_status: "pending" | "success" | "paid" | "failed";
    failureMessage?: string;
    paymentRequestId?: string; // Finby PaymentRequestId for refunds
}

// Refund request payload
interface FinbyRefundPayload {
    paymentRequestId: string;
    reference: string;
    amount: number; // Amount in cents
    currency: string;
}

// Refund response
interface FinbyRefundResponse {
    success: boolean;
    reference: string;
    paymentRequestId: string;
    result?: any;
    error?: string;
}

// Window interface for finby popup
declare global {
    interface Window {
        openPopup?: () => void;
        onTrustPayPopupLoaded?: () => void;
    }
}
