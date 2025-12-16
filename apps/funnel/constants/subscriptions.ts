export interface Subscription {
    id: number;
    productId: number;
    months: number;
    durationText: string;
    saleOff: number;
    regularPriceInDays: string;
    regularPrice: string;
    salePriceInDays: string;
    salePriceFull: string;
    isBestChoice: boolean;
}

// Single $29.00 monthly subscription for AI Influencer
export const subscriptions: Subscription[] = [
    {
        id: 1,
        productId: 1, // Matches product ID in products.ts
        months: 1,
        durationText: "1 month",
        saleOff: 0,
        regularPriceInDays: "0.97",
        regularPrice: "29.00",
        salePriceInDays: "0.97",
        salePriceFull: "29.00",
        isBestChoice: true,
    },
];