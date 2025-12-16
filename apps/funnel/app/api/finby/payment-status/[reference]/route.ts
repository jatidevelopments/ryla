import { NextRequest, NextResponse } from "next/server";

/**
 * Finby Payment Status API Route
 * 
 * Checks the payment status by reference/transaction ID.
 * 
 * Note: This is a simplified implementation. In production, you should:
 * 1. Store payment references in a database
 * 2. Query Finby API or your database for actual payment status
 * 3. Handle Finby notifications to update payment status
 */

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ reference: string }> }
) {
    try {
        const { reference } = await params;

        if (!reference) {
            return NextResponse.json(
                { error: "Reference is required" },
                { status: 400 }
            );
        }

        // TODO: In production, you should:
        // 1. Query your database for the payment record
        // 2. Check Finby API for payment status
        // 3. Return the actual status from your database or Finby
        
        // For now, returning a pending status
        // This should be replaced with actual payment status checking
        return NextResponse.json({
            reference,
            status: "pending",
            resultCode: 1, // 1 = Pending
            paid_status: "pending",
            resultMessage: "Payment status check not fully implemented. Check Finby merchant portal or implement status checking.",
        });
    } catch (error: any) {
        console.error("Finby payment status error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

