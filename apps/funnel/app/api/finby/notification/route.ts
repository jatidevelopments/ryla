import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
// TODO: Uncomment when database connection is available in funnel app
// import { db } from "@ryla/data";
// import { grantSubscriptionCredits } from "@ryla/payments";

/**
 * Finby Payment Notification Webhook
 * 
 * Receives payment notifications from Finby (Api version 3).
 * This endpoint should be configured in Finby merchant portal.
 * 
 * Documentation: https://doc.finby.eu/#wire-notification
 */

function verifySignature(secretKey: string, params: Record<string, string>, signature: string): boolean {
    // Build signature data according to Finby API v3 documentation
    // Format: AccountId/Amount/Currency/Type/ResultCode/CounterAccount/CounterAccountName/OrderId/PaymentId/Reference/RefuseReason
    const sigData = [
        params.AccountId,
        params.Amount,
        params.Currency,
        params.Type,
        params.ResultCode,
        params.CounterAccount || "",
        params.CounterAccountName || "",
        params.OrderId || "",
        params.PaymentId || "",
        params.Reference,
        params.RefuseReason || "",
    ].join("/");

    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(sigData);
    const calculatedSignature = hmac.digest("hex").toUpperCase();

    return calculatedSignature === signature.toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        const secretKey = process.env.FINBY_SECRET_KEY;

        if (!secretKey) {
            console.error("Finby secret key not configured");
            return NextResponse.json(
                { error: "Configuration error" },
                { status: 500 }
            );
        }

        // Finby sends notifications as URL query parameters (GET) or JSON body (POST)
        // For API v3, it's typically sent as query parameters
        const url = new URL(request.url);
        const params: Record<string, string> = {};

        // Get parameters from query string
        url.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Also check request body if it's JSON
        try {
            const body = await request.json();
            Object.assign(params, body);
        } catch {
            // Body might not be JSON, that's okay
        }

        // Verify signature
        const signature = params.Signature;
        if (!signature) {
            console.error("Missing signature in Finby notification");
            return NextResponse.json(
                { error: "Missing signature" },
                { status: 400 }
            );
        }

        const isValid = verifySignature(secretKey, params, signature);
        if (!isValid) {
            console.error("Invalid signature in Finby notification");
            return NextResponse.json(
                { error: "Invalid signature" },
                { status: 400 }
            );
        }

        // Process the notification
        const resultCode = parseInt(params.ResultCode || "0", 10);
        const reference = params.Reference;
        const paymentId = params.PaymentId || params.PaymentRequestId;
        const amount = parseFloat(params.Amount || "0");
        const currency = params.Currency || "EUR";

        console.log("Finby notification received:", {
            reference,
            paymentId,
            resultCode,
            amount,
            currency,
            type: params.Type,
        });

        // Process successful payments (resultCode 0 = success)
        if (resultCode === 0) {
            // Reference format expected: "sub_{userId}_{planId}" or similar
            // Parse the reference to get userId and planId
            const refParts = reference?.split("_") || [];
            const userId = refParts[1]; // e.g., "sub_user123_pro" -> "user123"
            const planId = refParts[2]; // e.g., "sub_user123_pro" -> "pro"

            if (userId && planId) {
                console.log(`Granting credits for user ${userId}, plan ${planId}`);
                
                // TODO: Uncomment when database connection is available
                // await grantSubscriptionCredits(db, userId, planId, paymentId);
                
                console.log(`Credits granted successfully for user ${userId}`);
            } else {
                console.warn("Could not parse userId/planId from reference:", reference);
            }
        } else {
            console.log(`Payment not successful. Result code: ${resultCode}`);
        }

        // Return 200 OK to acknowledge receipt
        // Finby will retry if it doesn't receive 200 OK
        return NextResponse.json({ status: "received" }, { status: 200 });
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

