export interface Product {
  id: number;
  name: string;
  amount: number;
  currency: string;
  durationMonths: number;
}

// Single $29.00 monthly subscription for AI Influencer
export const products: Product[] = [
  {
    id: 1,
    name: "Monthly AI Influencer Subscription",
    amount: 2900, // $29.00 in cents
    currency: "USD",
    durationMonths: 1,
  },
];
