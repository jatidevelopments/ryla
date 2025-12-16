/**
 * Finby Integration Test Script
 * 
 * This script helps test the Finby payment integration by:
 * 1. Testing the backend API endpoints
 * 2. Verifying payment setup
 * 3. Checking payment status
 * 
 * Usage:
 *   npm run test:finby
 *   npx tsx scripts/test-finby.ts
 * 
 * Make sure .env.local file exists with required variables
 */

import axios from 'axios';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from .env.local
try {
    const envPath = resolve(process.cwd(), '.env.local');
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
} catch (error) {
    console.warn('⚠️  Could not load .env.local file. Using defaults or system environment variables.');
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devapi.mydreamcompanion.com';
const FINBY_PROJECT_ID = process.env.FINBY_PROJECT_ID || '4107517694';

interface TestResult {
    name: string;
    success: boolean;
    message: string;
    data?: any;
}

const results: TestResult[] = [];

function logResult(result: TestResult) {
    results.push(result);
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    if (result.data) {
        console.log('   Data:', JSON.stringify(result.data, null, 2));
    }
}

async function testBackendConnection() {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        logResult({
            name: 'Backend Connection',
            success: true,
            message: 'Backend is reachable',
            data: { status: response.status }
        });
        return true;
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.response?.status === 404) {
            logResult({
                name: 'Backend Connection',
                success: false,
                message: 'Backend is not reachable or health endpoint not found',
                data: { error: error.message }
            });
        } else {
            logResult({
                name: 'Backend Connection',
                success: false,
                message: 'Backend connection failed',
                data: { error: error.message }
            });
        }
        return false;
    }
}

async function testPaymentSetup() {
    try {
        const testPayload = {
            productId: 1, // Use a test product ID
            email: 'test@example.com',
            cardHolder: 'Test User',
            billingStreet: '123 Test St',
            billingCity: 'Test City',
            billingPostcode: '12345',
            billingCountry: 'US',
            returnUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://goviral.ryla.ai',
            cancelUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://goviral.ryla.ai',
            errorUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://goviral.ryla.ai',
            notificationUrl: `${API_BASE_URL}/finby/notification`
        };

        const response = await axios.post(
            `${API_BASE_URL}/finby/setup-payment`,
            testPayload,
            { timeout: 10000 }
        );

        if (response.data && response.data.paymentUrl && response.data.reference) {
            logResult({
                name: 'Payment Setup',
                success: true,
                message: 'Payment setup successful',
                data: {
                    reference: response.data.reference,
                    paymentUrl: response.data.paymentUrl.substring(0, 50) + '...',
                    hasTransactionId: !!response.data.transactionId
                }
            });
            return response.data;
        } else {
            logResult({
                name: 'Payment Setup',
                success: false,
                message: 'Payment setup returned invalid response',
                data: response.data
            });
            return null;
        }
    } catch (error: any) {
        logResult({
            name: 'Payment Setup',
            success: false,
            message: 'Payment setup failed',
            data: {
                error: error.message,
                status: error.response?.status,
                response: error.response?.data
            }
        });
        return null;
    }
}

async function testPaymentStatus(reference: string) {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/finby/payment-status/${reference}`,
            { timeout: 5000 }
        );

        if (response.data && response.data.reference) {
            logResult({
                name: 'Payment Status Check',
                success: true,
                message: 'Payment status retrieved successfully',
                data: {
                    reference: response.data.reference,
                    status: response.data.status,
                    resultCode: response.data.resultCode,
                    paid_status: response.data.paid_status
                }
            });
            return response.data;
        } else {
            logResult({
                name: 'Payment Status Check',
                success: false,
                message: 'Payment status returned invalid response',
                data: response.data
            });
            return null;
        }
    } catch (error: any) {
        logResult({
            name: 'Payment Status Check',
            success: false,
            message: 'Payment status check failed',
            data: {
                error: error.message,
                status: error.response?.status,
                response: error.response?.data
            }
        });
        return null;
    }
}

async function testEnvironmentVariables() {
    const requiredVars = [
        'FINBY_PROJECT_ID',
        'FINBY_SECRET_KEY',
        'NEXT_PUBLIC_SITE_URL',
        'NEXT_PUBLIC_API_BASE_URL'
    ];

    const missing: string[] = [];
    const present: string[] = [];

    requiredVars.forEach(varName => {
        if (process.env[varName]) {
            present.push(varName);
        } else {
            missing.push(varName);
        }
    });

    if (missing.length === 0) {
        logResult({
            name: 'Environment Variables',
            success: true,
            message: 'All required environment variables are set',
            data: { present }
        });
    } else {
        logResult({
            name: 'Environment Variables',
            success: false,
            message: 'Some environment variables are missing',
            data: { missing, present }
        });
    }

    return missing.length === 0;
}

async function runTests() {
    console.log('🧪 Starting Finby Integration Tests\n');
    console.log(`API Base URL: ${API_BASE_URL}`);
    console.log(`Finby Project ID: ${FINBY_PROJECT_ID}\n`);
    console.log('─'.repeat(60));

    // Test 1: Environment Variables
    await testEnvironmentVariables();
    console.log('');

    // Test 2: Backend Connection
    const backendConnected = await testBackendConnection();
    console.log('');

    if (!backendConnected) {
        console.log('⚠️  Backend is not reachable. Skipping API tests.');
        console.log('   Make sure your backend API is running and accessible.');
        printSummary();
        return;
    }

    // Test 3: Payment Setup
    const paymentSetup = await testPaymentSetup();
    console.log('');

    // Test 4: Payment Status (if setup was successful)
    if (paymentSetup && paymentSetup.reference) {
        await testPaymentStatus(paymentSetup.reference);
        console.log('');
    }

    printSummary();
}

function printSummary() {
    console.log('─'.repeat(60));
    console.log('\n📊 Test Summary:\n');
    
    const passed = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const total = results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
        console.log('❌ Failed Tests:');
        results.filter(r => !r.success).forEach(r => {
            console.log(`   - ${r.name}: ${r.message}`);
        });
        console.log('');
    }

    console.log('💡 Next Steps:');
    console.log('   1. If backend connection failed, ensure the API is running');
    console.log('   2. If payment setup failed, check backend logs and Finby credentials');
    console.log('   3. For manual testing, use the payment form in the app');
    console.log('   4. Check Finby merchant portal for transaction logs');
    console.log('   5. Verify notification URL is accessible from Finby servers\n');
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

export { runTests, testBackendConnection, testPaymentSetup, testPaymentStatus };

