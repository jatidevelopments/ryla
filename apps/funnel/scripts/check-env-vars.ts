#!/usr/bin/env tsx
/**
 * Pre-deploy environment variable validation script
 * Ensures all required environment variables are set before deployment
 */

const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_CDN_URL',
    'NEXT_PUBLIC_DEBUG_CDN',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_POSTHOG_KEY',
] as const;

interface EnvVarCheck {
    name: string;
    value: string | undefined;
    isSet: boolean;
    isEmpty: boolean;
}

function checkEnvVars(): { allValid: boolean; missing: string[]; empty: string[] } {
    const checks: EnvVarCheck[] = REQUIRED_ENV_VARS.map((varName) => {
        const value = process.env[varName];
        return {
            name: varName,
            value,
            isSet: value !== undefined,
            isEmpty: value === undefined || value.trim() === '',
        };
    });

    const missing = checks.filter((check) => !check.isSet).map((check) => check.name);
    const empty = checks.filter((check) => check.isEmpty).map((check) => check.name);
    const allValid = missing.length === 0 && empty.length === 0;

    return { allValid, missing, empty };
}

function main() {
    console.log('🔍 Checking required environment variables for deployment...\n');

    const { allValid, missing, empty } = checkEnvVars();

    if (allValid) {
        console.log('✅ All required environment variables are set!\n');
        REQUIRED_ENV_VARS.forEach((varName) => {
            const value = process.env[varName];
            // Mask sensitive values (show only first/last few chars)
            const displayValue =
                varName.includes('KEY') || varName.includes('SECRET')
                    ? value?.substring(0, 8) + '...' + value?.substring(value.length - 4)
                    : value;
            console.log(`  ✓ ${varName}=${displayValue}`);
        });
        console.log('\n✅ Environment validation passed. Ready to deploy!');
        process.exit(0);
    } else {
        console.error('❌ Environment validation failed!\n');
        
        if (missing.length > 0) {
            console.error('Missing environment variables:');
            missing.forEach((varName) => {
                console.error(`  ✗ ${varName} - NOT SET`);
            });
            console.error('');
        }

        if (empty.length > 0) {
            console.error('Empty environment variables:');
            empty.forEach((varName) => {
                console.error(`  ✗ ${varName} - SET BUT EMPTY`);
            });
            console.error('');
        }

        console.error('💡 Please set all required environment variables before deploying.');
        console.error('💡 You can set them as build args in the deploy command or as Fly.io secrets.\n');
        process.exit(1);
    }
}

main();

