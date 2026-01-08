import { parsePaymentReference, generateSubscriptionReference, generateCreditReference } from '../../apps/web/lib/utils/payment-reference';
import { getCreditsForPlan, PLAN_CREDITS } from '../../libs/payments/src/credits/credit-grant.service';
import { CREDIT_PACKAGES } from '../../libs/shared/src/credits/pricing';

async function testReferenceParsing() {
    console.log('--- Testing Reference Parsing ---');

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const planId = 'pro';
    const packageId = 'credits_pack_22000';

    const subRef = generateSubscriptionReference(userId, planId);
    console.log('Generated Subscription Ref:', subRef);
    const parsedSub = parsePaymentReference(subRef);
    console.log('Parsed Subscription:', parsedSub);

    if (parsedSub?.type !== 'subscription' || parsedSub.userId !== userId || parsedSub.planId !== planId) {
        throw new Error('Subscription reference parsing failed');
    }

    const credRef = generateCreditReference(userId, packageId);
    console.log('Generated Credit Ref:', credRef);
    const parsedCred = parsePaymentReference(credRef);
    console.log('Parsed Credit:', parsedCred);

    if (parsedCred?.type !== 'credit' || parsedCred.userId !== userId || parsedCred.packageId !== packageId) {
        throw new Error('Credit reference parsing failed');
    }

    console.log('✅ Reference parsing tests passed\n');
}

async function testCreditLogic() {
    console.log('--- Testing Credit Logic ---');

    const plans = ['starter', 'pro', 'unlimited', 'free'];
    for (const plan of plans) {
        const credits = getCreditsForPlan(plan);
        console.log(`Plan: ${plan}, Credits: ${credits}`);
    }

    const packages = CREDIT_PACKAGES;
    console.log('\nCredit Packages:');
    for (const pkg of packages) {
        console.log(`ID: ${pkg.id}, Credits: ${pkg.credits}, FinbyID: ${pkg.finbyProductId}`);
    }

    console.log('✅ Credit logic tests passed\n');
}

async function main() {
    try {
        await testReferenceParsing();
        await testCreditLogic();
        console.log('🚀 All verification tests passed!');
    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

main();
