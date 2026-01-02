import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering to avoid React 19 cache issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { createFinbyV3WebhookHandler } from "@ryla/payments";
// TODO: Uncomment when database connection is available in funnel app
// import { db } from "@ryla/data";
// import { grantSubscriptionCredits } from "@ryla/payments";

/**
 * Finby Payment Notification Webhook
 * 
 * Receives payment notifications from Finby (API version 3).
 * This endpoint should be configured in Finby merchant portal.
 * 
 * Documentation: https://doc.finby.eu/#wire-notification
 */

const projectId = process.env.FINBY_PROJECT_ID;
const secretKey = process.env.FINBY_SECRET_KEY;

if (!projectId || !secretKey) {
    console.error("Finby credentials not configured for webhook handler");
}

// Create webhook handler using @ryla/payments library
const webhookHandler = projectId && secretKey ? createFinbyV3WebhookHandler({
    projectId,
    secretKey,
    onPaymentSucceeded: async (event) => {
        console.log("Finby payment succeeded:", {
            reference: event.data.subscriptionId,
            paymentId: event.data.invoiceId,
            amount: event.data.amount,
            currency: event.data.currency,
        });

        // Reference format expected: "sub_{userId}_{planId}" or similar
        // Parse the reference to get userId and planId
        const reference = event.data.subscriptionId || '';
        const refParts = reference?.split("_") || [];
        const userId = refParts[1]; // e.g., "sub_user123_pro" -> "user123"
        const planId = refParts[2]; // e.g., "sub_user123_pro" -> "pro"

        if (userId && planId) {
            console.log(`Granting credits for user ${userId}, plan ${planId}`);
            
            // TODO: Uncomment when database connection is available
            // await grantSubscriptionCredits(db, userId, planId, event.data.invoiceId);
            
            console.log(`Credits granted successfully for user ${userId}`);
        } else {
            console.warn("Could not parse userId/planId from reference:", reference);
        }
    },
    onPaymentFailed: async (event) => {
        console.log("Finby payment failed:", {
            reference: event.data.subscriptionId,
            paymentId: event.data.invoiceId,
            error: event.data.error,
        });
    },
    onError: (error, rawBody) => {
        console.error("Finby webhook handler error:", error);
        console.error("Raw body:", rawBody);
    },
}) : null;

export async function POST(request: NextRequest) {
    if (!webhookHandler) {
        return NextResponse.json(
            { error: "Webhook handler not configured" },
            { status: 500 }
        );
    }

    try {
        // Finby sends notifications as URL query parameters (GET) or JSON body (POST)
        // For API v3, it's typically sent as query parameters
        const url = new URL(request.url);
        const signature = url.searchParams.get('Signature') || '';

        // Get raw body
        const rawBody = await request.text();

        // Handle webhook using library
        return await webhookHandler(rawBody, signature);
    } catch (error: any) {
        console.error("Finby notification error:", error);
        // Return 500 so Finby will retry
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

// Finby may also send notifications via GET
export async function GET(request: NextRequest) {
    return POST(request);
}

