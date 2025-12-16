import axios from "@/lib/axios";

export const shift4Service = {
    payment: async (data: Shift4Payload): Promise<Shift4Response> => {
        const response = await axios.post<Shift4Response>("/shift4/charge", data);
        return response.data;
    },
    getPaymentStatus: async (subscriptionId: string): Promise<PaymentStatusResponse> => {
        const response = await axios.get<PaymentStatusResponse>(`/shift4/payment-status/${subscriptionId}`);
        return response.data;
    },
};
