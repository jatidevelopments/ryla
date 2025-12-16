declare const Shift4: any;

interface Shift4Payload {
    paymentToken: string;
    productId: number;
}

interface Shift4Response {
    status: string;
    subscriptionId: string;
}

interface PaymentStatusEvent {
    eventId: string;
    type: string;
    processed: boolean;
    createdAt: string;
}

interface PaymentStatusResponse {
    subscriptionId: string;
    paid_status: "pending" | "success" | "paid" | "failed";
    failureMessage?: string;
    events: PaymentStatusEvent[];
}