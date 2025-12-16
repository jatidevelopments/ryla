/**
 * Live Payment Integration Test Script
 * 
 * Tests the deployed Finby payment integration on Fly.io
 * 
 * Usage:
 *   npm run test:payment:live
 *   npx tsx scripts/test-payment-live.ts
 */

import axios from 'axios';

const DEPLOYED_URL = 'https://funnel-v3-adult.fly.dev';

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

async function testDeployedApp() {
    try {
        const response = await axios.get(`${DEPLOYED_URL}/`, { timeout: 5000 });
        logResult({
            name: 'Deployed App',
            success: response.status === 200,
            message: `App is accessible (Status: ${response.status})`,
            data: { status: response.status }
        });
        return response.status === 200;
    } catch (error: any) {
        logResult({
            name: 'Deployed App',
            success: false,
            message: 'App is not accessible',
            data: { error: error.message }
        });
        return false;
    }
}

async function testPaymentSetup() {
    try {
        const testPayload = {
            productId: 1, // Monthly AI Influencer Subscription - $29.00
            email: 'test@example.com',
            cardHolder: 'Test User',
            billingStreet: '123 Test St',
            billingCity: 'Test City',
            billingPostcode: '12345',
            billingCountry: 'US',
        };

        const response = await axios.post(
            `${DEPLOYED_URL}/api/finby/setup-payment`,
            testPayload,
            { timeout: 10000 }
        );

        if (response.data && response.data.paymentUrl && response.data.reference) {
            // Verify the payment URL is a valid Finby URL
            const isValidFinbyUrl = response.data.paymentUrl.includes('amapi.finby.eu');
            const hasSignature = response.data.paymentUrl.includes('Signature=');
            
            logResult({
                name: 'Payment Setup',
                success: isValidFinbyUrl && hasSignature,
                message: isValidFinbyUrl && hasSignature 
                    ? 'Payment setup successful - valid Finby URL generated'
                    : 'Payment setup returned response but URL may be invalid',
                data: {
                    reference: response.data.reference,
                    paymentUrl: response.data.paymentUrl.substring(0, 80) + '...',
                    hasValidFinbyUrl: isValidFinbyUrl,
                    hasSignature: hasSignature,
                    urlLength: response.data.paymentUrl.length
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

async function testPaymentStatus() {
    try {
        const testReference = `test-${Date.now()}`;
        const response = await axios.get(
            `${DEPLOYED_URL}/api/finby/payment-status/${testReference}`,
            { timeout: 5000 }
        );

        if (response.data && response.data.reference) {
            logResult({
                name: 'Payment Status Check',
                success: true,
                message: 'Payment status endpoint is working',
                data: {
                    reference: response.data.reference,
                    status: response.data.status,
                    resultCode: response.data.resultCode
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

async function testNotificationEndpoint() {
    try {
        // Test that the endpoint exists and accepts requests
        const response = await axios.post(
            `${DEPLOYED_URL}/api/finby/notification`,
            {},
            { timeout: 5000, validateStatus: () => true } // Accept any status
        );

        // The endpoint should return 400 (bad request) for invalid notifications, not 404
        const isEndpointAvailable = response.status !== 404;
        
        logResult({
            name: 'Notification Endpoint',
            success: isEndpointAvailable,
            message: isEndpointAvailable 
                ? `Notification endpoint is accessible (Status: ${response.status})`
                : 'Notification endpoint not found',
            data: {
                status: response.status,
                statusText: response.statusText
            }
        });
        return isEndpointAvailable;
    } catch (error: any) {
        logResult({
            name: 'Notification Endpoint',
            success: false,
            message: 'Notification endpoint test failed',
            data: { error: error.message }
        });
        return false;
    }
}

async function runTests() {
    console.log('🧪 Testing Live Payment Integration\n');
    console.log(`Deployed URL: ${DEPLOYED_URL}\n`);
    console.log('─'.repeat(60));

    // Test 1: App accessibility
    const appAccessible = await testDeployedApp();
    console.log('');

    if (!appAccessible) {
        console.log('⚠️  App is not accessible. Skipping API tests.');
        printSummary();
        return;
    }

    // Test 2: Payment Setup
    const paymentSetup = await testPaymentSetup();
    console.log('');

    // Test 3: Payment Status
    await testPaymentStatus();
    console.log('');

    // Test 4: Notification Endpoint
    await testNotificationEndpoint();
    console.log('');

    printSummary(paymentSetup);
}

function printSummary(paymentSetup?: any) {
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

    if (paymentSetup && paymentSetup.paymentUrl) {
        console.log('💳 Payment URL Generated:');
        console.log(`   ${paymentSetup.paymentUrl.substring(0, 100)}...`);
        console.log('');
        console.log('📝 Next Steps:');
        console.log('   1. Copy the payment URL above');
        console.log('   2. Open it in a browser to test the Finby payment gateway');
        console.log('   3. Use test card: 4200 0000 0000 0000 (any CVV, future expiry)');
        console.log('   4. Complete the payment to test the full flow');
        console.log('   5. Check Finby merchant portal for transaction');
        console.log('');
    }

    console.log('💡 Manual Testing:');
    console.log(`   1. Visit: ${DEPLOYED_URL}`);
    console.log('   2. Navigate to payment step');
    console.log('   3. Submit payment form');
    console.log('   4. Use test card: 4200 0000 0000 0000');
    console.log('   5. Verify redirect and notification handling\n');
}

// Run tests if executed directly
if (require.main === module) {
    runTests().catch(error => {
        console.error('❌ Test execution failed:', error);
        process.exit(1);
    });
}

export { runTests, testDeployedApp, testPaymentSetup, testPaymentStatus, testNotificationEndpoint };

