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

/**
 * Required environment variables for Finby payment integration
 */
const REQUIRED_ENV_VARS = {
    FINBY_PROJECT_ID: 'Finby Project ID (API v3)',
    FINBY_SECRET_KEY: 'Finby Secret Key (API v3)',
} as const;

const OPTIONAL_ENV_VARS = {
    FINBY_TEST_MODE: 'Test mode flag (optional)',
    NEXT_PUBLIC_SITE_URL: 'Site URL for callbacks (optional)',
} as const;

/**
 * Validates all required environment variables are set
 * @returns Object with validation results and missing variables
 */
function validateEnvironmentVariables(): {
    isValid: boolean;
    missing: string[];
    present: string[];
    details: Record<string, { present: boolean; valueLength: number }>;
} {
    const missing: string[] = [];
    const present: string[] = [];
    const details: Record<string, { present: boolean; valueLength: number }> = {};

    // Check required variables
    for (const [varName, description] of Object.entries(REQUIRED_ENV_VARS)) {
        const value = process.env[varName];
        const isPresent = !!value && value.trim().length > 0;
        
        details[varName] = {
            present: isPresent,
            valueLength: value?.length || 0,
        };

        if (isPresent) {
            present.push(varName);
        } else {
            missing.push(`${varName} (${description})`);
        }
    }

    // Check optional variables (for logging only)
    for (const [varName, description] of Object.entries(OPTIONAL_ENV_VARS)) {
        const value = process.env[varName];
        const isPresent = !!value && value.trim().length > 0;
        
        details[varName] = {
            present: isPresent,
            valueLength: value?.length || 0,
        };

        if (isPresent) {
            present.push(varName);
        }
    }

    return {
        isValid: missing.length === 0,
        missing,
        present,
        details,
    };
}

export async function POST(request: NextRequest) {
    const startTime = Date.now();
    let requestId: string | undefined;
    
    try {
        // Validate environment variables FIRST - before processing request
        const envValidation = validateEnvironmentVariables();
        
        // Log environment validation results
        console.log(`[FinbyAPI] Environment validation:`, {
            isValid: envValidation.isValid,
            requiredPresent: envValidation.present.filter(v => 
                Object.keys(REQUIRED_ENV_VARS).includes(v)
            ),
            requiredMissing: envValidation.missing,
            optionalPresent: envValidation.present.filter(v => 
                Object.keys(OPTIONAL_ENV_VARS).includes(v)
            ),
            details: Object.entries(envValidation.details).reduce((acc, [key, value]) => {
                // Don't log actual values for security, just presence and length
                acc[key] = {
                    present: value.present,
                    valueLength: value.present ? value.valueLength : 0,
                };
                return acc;
            }, {} as Record<string, { present: boolean; valueLength: number }>),
            timestamp: new Date().toISOString(),
        });

        // Fail fast if required environment variables are missing
        if (!envValidation.isValid) {
            const error = "Payment system configuration error: Missing required environment variables";
            console.error(`[FinbyAPI] Configuration validation failed:`, {
                missingVariables: envValidation.missing,
                requiredVariables: Object.keys(REQUIRED_ENV_VARS),
                timestamp: new Date().toISOString(),
            });
            
            return NextResponse.json(
                { 
                    error,
                    code: "CONFIGURATION_ERROR",
                    message: "Payment system is not properly configured. Missing required environment variables.",
                    missingVariables: envValidation.missing.map(v => v.split(' ')[0]), // Just variable names
                },
                { status: 500 }
            );
        }

        const body: FinbySetupPayload = await request.json();
        requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Log payment initiation attempt with full context
        console.log(`[FinbyAPI] Payment setup initiated [${requestId}]:`, {
            requestId,
            productId: body.productId,
            email: body.email?.substring(0, 3) + '***', // Partial email for privacy
            emailDomain: body.email?.split('@')[1] || 'unknown',
            hasUserId: !!body.userId,
            userId: body.userId ? `${body.userId.substring(0, 4)}***` : undefined,
            hasReturnUrl: !!body.returnUrl,
            hasCancelUrl: !!body.cancelUrl,
            hasNotificationUrl: !!body.notificationUrl,
            timestamp: new Date().toISOString(),
            environment: {
                nodeEnv: process.env.NODE_ENV,
                testMode: process.env.FINBY_TEST_MODE === "true",
                hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
            },
        });

        // Validate required fields
        if (!body.productId || !body.email) {
            const error = "productId and email are required";
            console.error(`[FinbyAPI] Validation failed [${requestId}]:`, error);
            return NextResponse.json(
                { 
                    error,
                    code: "VALIDATION_ERROR",
                    requestId,
                },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            const error = "Invalid email format";
            console.error(`[FinbyAPI] Email validation failed [${requestId}]:`, error);
            return NextResponse.json(
                { 
                    error,
                    code: "INVALID_EMAIL",
                    requestId,
                },
                { status: 400 }
            );
        }

        // Get Finby credentials from environment (already validated above, but double-check)
        const projectId = process.env.FINBY_PROJECT_ID;
        const secretKey = process.env.FINBY_SECRET_KEY;
        const isTestMode = process.env.FINBY_TEST_MODE === "true";
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

        // Additional runtime validation (defensive check)
        if (!projectId || !secretKey) {
            const error = "Payment system configuration error: Credentials not available";
            console.error(`[FinbyAPI] Runtime configuration check failed [${requestId}]:`, {
                hasProjectId: !!projectId,
                projectIdLength: projectId?.length || 0,
                hasSecretKey: !!secretKey,
                secretKeyLength: secretKey?.length || 0,
                envValidationPassed: envValidation.isValid,
            });
            return NextResponse.json(
                { 
                    error,
                    code: "CONFIGURATION_ERROR",
                    requestId,
                    message: "Payment system is not properly configured. Please contact support.",
                },
                { status: 500 }
            );
        }

        // Log credential availability (without exposing actual values)
        console.log(`[FinbyAPI] Credentials validated [${requestId}]:`, {
            hasProjectId: true,
            projectIdLength: projectId.length,
            hasSecretKey: true,
            secretKeyLength: secretKey.length,
            isTestMode,
            hasSiteUrl: !!siteUrl,
            siteUrl: siteUrl || 'not set',
        });

        // Get product details
        // Import products - in production, fetch from database
        const { products } = await import("@/constants/products");
        const product = products.find((p) => p.id === body.productId);

        if (!product) {
            const error = `Product with id ${body.productId} not found`;
            console.error(`[FinbyAPI] Product not found [${requestId}]:`, {
                productId: body.productId,
                availableProducts: products.map(p => p.id),
            });
            return NextResponse.json(
                { 
                    error,
                    code: "PRODUCT_NOT_FOUND",
                    requestId,
                },
                { status: 400 }
            );
        }

        // Add test mode indicator if enabled (for Finby testing)
        if (isTestMode) {
            console.log(`[FinbyAPI] 🧪 TEST MODE [${requestId}]: Using test payment credentials`);
        }

        // Create Finby payment provider using API v3 (popup-based)
        let finby;
        try {
            console.log(`[FinbyAPI] Initializing payment provider [${requestId}]:`, {
                provider: 'finby',
                apiVersion: 'v3',
                hasProjectId: !!projectId,
                hasSecretKey: !!secretKey,
                timestamp: new Date().toISOString(),
            });

            finby = createPaymentProvider('finby', {
            projectId,
            secretKey,
            apiVersion: 'v3',
        });

            console.log(`[FinbyAPI] Payment provider initialized successfully [${requestId}]:`, {
                provider: 'finby',
                apiVersion: 'v3',
                timestamp: new Date().toISOString(),
            });
        } catch (providerError: any) {
            const error = "Failed to initialize payment provider";
            console.error(`[FinbyAPI] Provider initialization failed [${requestId}]:`, {
                error: providerError.message,
                errorName: providerError.name,
                stack: providerError.stack,
                provider: 'finby',
                apiVersion: 'v3',
                hasProjectId: !!projectId,
                hasSecretKey: !!secretKey,
                timestamp: new Date().toISOString(),
            });
            return NextResponse.json(
                { 
                    error,
                    code: "PROVIDER_INIT_ERROR",
                    requestId,
                    message: "Unable to connect to payment system. Please try again.",
                },
                { status: 500 }
            );
        }

        // Create checkout session using the library
        let session;
        try {
            const sessionParams = {
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
            };

            console.log(`[FinbyAPI] Creating checkout session [${requestId}]:`, {
                productId: sessionParams.productId,
                amount: sessionParams.amount,
                currency: sessionParams.currency,
                hasEmail: !!sessionParams.email,
                hasUserId: !!sessionParams.userId,
                hasSuccessUrl: !!sessionParams.successUrl,
                hasCancelUrl: !!sessionParams.cancelUrl,
                hasNotificationUrl: !!sessionParams.notificationUrl,
                timestamp: new Date().toISOString(),
            });

            session = await finby.createCheckoutSession(sessionParams);

            // Validate session response
            if (!session || !session.url || !session.reference) {
                const error = "Invalid session response from payment provider";
                console.error(`[FinbyAPI] Invalid session [${requestId}]:`, {
                    hasSession: !!session,
                    hasUrl: !!session?.url,
                    hasReference: !!session?.reference,
                });
                return NextResponse.json(
                    { 
                        error,
                        code: "INVALID_SESSION",
                        requestId,
                        message: "Payment system returned an invalid response. Please try again.",
                    },
                    { status: 500 }
                );
            }

            const duration = Date.now() - startTime;
            console.log(`[FinbyAPI] Payment setup successful [${requestId}]:`, {
                reference: session.reference,
                transactionId: session.transactionId || session.reference,
                hasUrl: !!session.url,
                urlLength: session.url?.length || 0,
                urlDomain: session.url ? new URL(session.url).hostname : undefined,
                duration: `${duration}ms`,
                productId: body.productId,
                amount: product.amount,
                currency: product.currency || "EUR",
                timestamp: new Date().toISOString(),
        });

        return NextResponse.json({
            paymentUrl: session.url,
            reference: session.reference,
            transactionId: session.transactionId || session.reference,
                requestId,
        });
        } catch (sessionError: any) {
            const error = sessionError.message || "Failed to create payment session";
            const duration = Date.now() - startTime;
            console.error(`[FinbyAPI] Session creation failed [${requestId}]:`, {
                error: sessionError.message,
                errorName: sessionError.name,
                stack: sessionError.stack,
                duration: `${duration}ms`,
                productId: body.productId,
                productName: product.name,
                amount: product.amount,
                currency: product.currency || "EUR",
                email: body.email?.substring(0, 3) + '***',
                hasProvider: !!finby,
                timestamp: new Date().toISOString(),
            });
            return NextResponse.json(
                { 
                    error,
                    code: "SESSION_CREATION_ERROR",
                    requestId,
                    message: "Unable to initialize payment. Please check your payment details and try again.",
                    details: process.env.NODE_ENV === "development" ? sessionError.stack : undefined,
                },
                { status: 500 }
            );
        }
    } catch (error: any) {
        const duration = Date.now() - startTime;
        const errorMessage = error.message || "Internal server error";
        console.error(`[FinbyAPI] Unexpected error [${requestId || 'unknown'}]:`, {
            error: errorMessage,
            errorName: error.name,
            stack: error.stack,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            // Log environment state for debugging (without exposing secrets)
            environment: {
                nodeEnv: process.env.NODE_ENV,
                hasProjectId: !!process.env.FINBY_PROJECT_ID,
                hasSecretKey: !!process.env.FINBY_SECRET_KEY,
                testMode: process.env.FINBY_TEST_MODE === "true",
            },
        });
        return NextResponse.json(
            { 
                error: errorMessage,
                code: "INTERNAL_ERROR",
                requestId: requestId || undefined,
                message: "An unexpected error occurred. Please try again or contact support if the problem persists.",
                details: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 }
        );
    }
}

