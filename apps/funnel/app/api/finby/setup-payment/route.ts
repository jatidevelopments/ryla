import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering to avoid React 19 cache issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { createPaymentProvider } from "@ryla/payments";

/**
 * Finby Payment Setup API Route
 * 
 * Generates a Finby payment gateway URL with proper signature using @ryla/payments library.
 * Based on Finby API documentation: https://doc.finby.eu
 */

interface FinbySetupPayload {
    productId: number;
    email: string;
    userId?: string;
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

export async function POST(request: NextRequest) {
    try {
        const body: FinbySetupPayload = await request.json();

        // Validate required fields
        if (!body.productId || !body.email) {
            return NextResponse.json(
                { error: "productId and email are required" },
                { status: 400 }
            );
        }

        // Get Finby credentials from environment
        const projectId = process.env.FINBY_PROJECT_ID;
        const secretKey = process.env.FINBY_SECRET_KEY;
        const isTestMode = process.env.FINBY_TEST_MODE === "true";

        if (!projectId || !secretKey) {
            console.error("Finby credentials not configured");
            return NextResponse.json(
                { error: "Finby credentials not configured" },
                { status: 500 }
            );
        }

        // Get product details
        // Import products - in production, fetch from database
        const { products } = await import("@/constants/products");
        const product = products.find((p) => p.id === body.productId);

        if (!product) {
            return NextResponse.json(
                { error: `Product with id ${body.productId} not found` },
                { status: 400 }
            );
        }

        // Add test mode indicator if enabled (for Finby testing)
        if (isTestMode) {
            console.log("🧪 TEST MODE: Using test payment credentials");
        }

        // Create Finby payment provider using API v3 (popup-based)
        const finby = createPaymentProvider('finby', {
            projectId,
            secretKey,
            apiVersion: 'v3',
        });

        // Create checkout session using the library
        const session = await finby.createCheckoutSession({
            priceId: product.id.toString(), // Using product ID as price ID for v3
            userId: body.userId || body.email, // Use email as fallback userId
            email: body.email,
            productId: body.productId,
            amount: product.amount, // Amount in cents
            currency: product.currency || "EUR",
            successUrl: body.returnUrl || "/payment-callback",
            cancelUrl: body.cancelUrl || "/payment-callback",
            errorUrl: body.errorUrl,
            notificationUrl: body.notificationUrl,
            cardHolder: body.cardHolder,
            billingStreet: body.billingStreet,
            billingCity: body.billingCity,
            billingPostcode: body.billingPostcode,
            billingCountry: body.billingCountry,
        });

        return NextResponse.json({
            paymentUrl: session.url,
            reference: session.reference,
            transactionId: session.transactionId || session.reference,
        });
    } catch (error: any) {
        console.error("Finby setup payment error:", error);
        console.error("Finby setup payment error details:", {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            { 
                error: error.message || "Internal server error",
                details: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

