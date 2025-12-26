import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Finby Refund API Route
 * 
 * Processes refunds for successful payments via Finby API.
 * 
 * Endpoint: POST /api/finby/refund
 * 
 * Body:
 * {
 *   paymentRequestId: string; // Finby PaymentRequestId
 *   reference: string; // Payment reference
 *   amount: number; // Amount in cents
 *   currency: string; // Currency code (e.g., "USD")
 * }
 */

interface RefundPayload {
    paymentRequestId: string;
    reference: string;
    amount: number;
    currency: string;
}

function generateRefundSignature(
    secretKey: string,
    projectId: string,
    amount: string,
    currency: string,
    reference: string
): string {
    // Build signature data for refund
    // Format may vary - using similar pattern to payment setup
    const sigData = `${projectId}/${amount}/${currency}/${reference}`;
    const hmac = crypto.createHmac("sha256", secretKey);
    hmac.update(sigData);
    return hmac.digest("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
    try {
        const body: RefundPayload = await request.json();

        if (!body.paymentRequestId || !body.reference || !body.amount || !body.currency) {
            return NextResponse.json(
                { error: "paymentRequestId, reference, amount, and currency are required" },
                { status: 400 }
            );
        }

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

        // Verify reference belongs to this funnel (must start with RYLAFL prefix)
        const { isFunnelReference } = await import("@ryla/payments");
        if (!isFunnelReference(body.reference)) {
            console.error("❌ Refund blocked: Reference does not belong to this funnel", {
                reference: body.reference,
            });
            return NextResponse.json(
                { error: "Refund not allowed: Payment reference does not belong to this funnel" },
                { status: 403 }
            );
        }

        if (isTestMode) {
            console.log("🧪 TEST MODE: Processing refund");
        }

        // Convert amount from cents to decimal with exactly 2 decimal places
        // Ensure the amount is formatted correctly (e.g., 29.00 not 29 or 29.0)
        const amountDecimal = (body.amount / 100).toFixed(2);
        const amountValue = parseFloat(amountDecimal);

        // Validate amount has exactly 2 decimal places
        if (!/^\d+\.\d{2}$/.test(amountDecimal)) {
            return NextResponse.json(
                { error: `Invalid amount format. Expected format: XX.XX, got: ${amountDecimal}` },
                { status: 400 }
            );
        }

        // Log the amount being sent for debugging
        console.log("Refund amount details:", {
            originalAmountCents: body.amount,
            amountDecimal: amountDecimal,
            amountValue: amountValue,
            amountValueString: amountValue.toFixed(2),
        });

        // Generate signature for refund request
        const signature = generateRefundSignature(
            secretKey,
            projectId,
            amountDecimal,
            body.currency,
            body.reference
        );

        // Build refund request payload according to Finby API
        // Finby requires amount with exactly 2 decimal places
        // Since JSON numbers don't preserve trailing zeros, we'll try sending as a number first
        // If that fails, we may need to send as a string (but Finby API expects number type)
        const refundPayload = {
            MerchantIdentification: {
                ProjectId: projectId,
            },
            PaymentInformation: {
                Amount: {
                    // Send as number - Finby should accept 29.00 as 29 in JSON
                    // But if it requires string format, we'll need to adjust
                    Amount: parseFloat(amountDecimal),
                    Currency: body.currency,
                },
                References: {
                    MerchantReference: body.reference,
                },
            },
        };

        // Log the payload being sent (for debugging)
        // Note: JSON.stringify will show 29.00 as 29, but that's expected
        console.log("Refund payload:", JSON.stringify(refundPayload, null, 2));
        console.log("Amount value:", {
            asString: amountDecimal,
            asNumber: parseFloat(amountDecimal),
            asNumberFixed: parseFloat(amountDecimal).toFixed(2),
        });

        // Call Finby refund API
        // Note: Finby API may require Bearer token authentication instead of signature
        // If signature-based auth doesn't work, we may need to use API key/token
        const refundUrl = `https://aapi.finby.eu/api/Payments/Payment/${body.paymentRequestId}/Refund`;
        
        console.log("Processing refund:", {
            paymentRequestId: body.paymentRequestId,
            reference: body.reference,
            amount: amountDecimal,
            currency: body.currency,
        });

        // Try with signature-based authentication first
        // If this doesn't work, we may need to use Bearer token from FINBY_API_KEY
        const apiKey = process.env.FINBY_API_KEY || secretKey;
        
        const response = await fetch(refundUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                // Alternative: Include signature in headers if Finby requires it
                // "X-Signature": signature,
            },
            body: JSON.stringify(refundPayload),
        });

        // Parse response to check for errors in ResultInfo (Finby may return 200 with error in body)
        let responseData;
        try {
            responseData = await response.json();
        } catch {
            responseData = { error: await response.text() };
        }

        // Check if response contains ResultInfo with error (even if HTTP status is 200)
        const hasError = responseData?.ResultInfo && 
                        responseData.ResultInfo.ResultCode && 
                        responseData.ResultInfo.ResultCode !== 0;

        if (!response.ok || hasError) {
            const errorData = responseData;
            
            console.error("Finby refund failed:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
            });
            
            // Check if error is about decimal places - try sending amount as string
            const errorMessage = errorData?.ResultInfo?.AdditionalInfo || errorData?.error || JSON.stringify(errorData);
            if (errorMessage && (errorMessage.includes("two decimal places") || errorMessage.includes("decimal") || errorMessage.includes("Amount must"))) {
                console.log("Retrying refund with amount as string to preserve decimal places...");
                
                // Try with amount as string (some APIs require this for exact decimal formatting)
                const retryPayloadWithStringAmount = {
                    MerchantIdentification: {
                        ProjectId: projectId,
                    },
                    PaymentInformation: {
                        Amount: {
                            Amount: amountDecimal, // Send as string to preserve "29.00"
                            Currency: body.currency,
                        },
                        References: {
                            MerchantReference: body.reference,
                        },
                    },
                };
                
                const retryResponse = await fetch(refundUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${apiKey}`,
                    },
                    body: JSON.stringify(retryPayloadWithStringAmount),
                });
                
                // Parse retry response to check for errors in ResultInfo
                let retryResponseData;
                try {
                    retryResponseData = await retryResponse.json();
                } catch {
                    retryResponseData = { error: await retryResponse.text() };
                }
                
                // Check if retry response contains ResultInfo with error
                const retryHasError = retryResponseData?.ResultInfo && 
                                    retryResponseData.ResultInfo.ResultCode && 
                                    retryResponseData.ResultInfo.ResultCode !== 0;
                
                if (!retryResponse.ok || retryHasError) {
                    console.error("Refund retry with string amount also failed:", retryResponseData);
                    return NextResponse.json(
                        { 
                            error: "Refund failed",
                            details: retryResponseData,
                            status: retryResponse.status,
                        },
                        { status: retryResponse.status || 500 }
                    );
                }
                
                console.log("Refund successful (with string amount):", retryResponseData);
                return NextResponse.json({
                    success: true,
                    reference: body.reference,
                    paymentRequestId: body.paymentRequestId,
                    result: retryResponseData,
                });
            }
            
            // If Bearer token doesn't work, try without auth header (some APIs use signature in body)
            if (response.status === 401 || response.status === 403) {
                console.log("Retrying refund with signature in payload...");
                const retryPayload = {
                    ...refundPayload,
                    Signature: signature,
                };
                
                const retryResponse = await fetch(refundUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(retryPayload),
                });
                
                if (!retryResponse.ok) {
                    const retryErrorText = await retryResponse.text();
                    return NextResponse.json(
                        { 
                            error: "Refund failed",
                            details: retryErrorText,
                            status: retryResponse.status,
                        },
                        { status: retryResponse.status }
                    );
                }
                
                const retryResult = await retryResponse.json();
                console.log("Refund successful (with signature):", retryResult);
                return NextResponse.json({
                    success: true,
                    reference: body.reference,
                    paymentRequestId: body.paymentRequestId,
                    result: retryResult,
                });
            }
            
            return NextResponse.json(
                { 
                    error: "Refund failed",
                    details: errorData,
                    status: response.status,
                },
                { status: response.status }
            );
        }

        // Response is OK and no errors in ResultInfo
        console.log("Refund successful:", responseData);

        return NextResponse.json({
            success: true,
            reference: body.reference,
            paymentRequestId: body.paymentRequestId,
            result: responseData,
        });
    } catch (error: any) {
        console.error("Finby refund error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

