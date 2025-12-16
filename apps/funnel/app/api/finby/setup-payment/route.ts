import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { generateFinbyReference } from "@/lib/finbyReference";

/**
 * Finby Payment Setup API Route
 * 
 * Generates a Finby payment gateway URL with proper signature.
 * Based on Finby API documentation: https://doc.finby.eu
 */

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

function generateSignature(secretKey: string, data: string): string {
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(data);
    return hmac.digest("hex").toUpperCase();
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

        // Convert amount from cents to decimal (products store amount in cents)
        const amount = product.amount / 100;
        const currency = product.currency || "EUR";
        const paymentType = 0; // 0 = Purchase

        // Generate unique reference with RYLAFL prefix to ensure refunds only work for funnel payments
        const reference = generateFinbyReference();

        // Build signature data for card payments
        // Format: AccountId/Amount/Currency/Reference/PaymentType/BillingCity/BillingCountry/BillingPostcode/BillingStreet/CardHolder/Email
        const billingCity = body.billingCity || "Unknown";
        const billingCountry = body.billingCountry || "US";
        const billingPostcode = body.billingPostcode || "00000";
        const billingStreet = body.billingStreet || "Unknown";
        const cardHolder = body.cardHolder || body.email.split("@")[0];
        const email = body.email;

        const sigData = `${projectId}/${amount.toFixed(2)}/${currency}/${reference}/${paymentType}/${billingCity}/${billingCountry}/${billingPostcode}/${billingStreet}/${cardHolder}/${email}`;
        const signature = generateSignature(secretKey, sigData);

        // Build Finby payment URL
        const baseUrl = "https://amapi.finby.eu/mapi5/Card/PayPopup";
        const params = new URLSearchParams({
            AccountId: projectId,
            Amount: amount.toFixed(2),
            Currency: currency,
            Reference: reference,
            PaymentType: paymentType.toString(),
            Signature: signature,
            BillingCity: billingCity,
            BillingCountry: billingCountry,
            BillingPostcode: billingPostcode,
            BillingStreet: billingStreet,
            CardHolder: cardHolder,
            Email: email,
        });

        // Add test mode indicator if enabled (for Finby testing)
        if (isTestMode) {
            console.log("🧪 TEST MODE: Using test payment credentials");
        }

        // Add optional URLs
        if (body.returnUrl) {
            params.append("ReturnUrl", body.returnUrl);
        }
        if (body.cancelUrl) {
            params.append("CancelUrl", body.cancelUrl);
        }
        if (body.errorUrl) {
            params.append("ErrorUrl", body.errorUrl);
        }
        if (body.notificationUrl) {
            params.append("NotificationUrl", body.notificationUrl);
        }

        const paymentUrl = `${baseUrl}?${params.toString()}`;

        return NextResponse.json({
            paymentUrl,
            reference,
            transactionId: reference, // Using reference as transaction ID for now
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

