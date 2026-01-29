#!/usr/bin/env tsx
/**
 * Pre-deploy validation script
 * Ensures all required build args are present in the deploy command
 */

const REQUIRED_BUILD_ARGS = [
    'NEXT_PUBLIC_CDN_URL',
    'NEXT_PUBLIC_DEBUG_CDN',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT',
    'NEXT_PUBLIC_POSTHOG_HOST',
    'NEXT_PUBLIC_POSTHOG_KEY',
] as const;

interface BuildArgCheck {
    name: string;
    found: boolean;
    value?: string;
}

function validateDeployCommand(): { allValid: boolean; missing: string[] } {
    // Read package.json to get the deploy command
    const fs = require('fs');
    const path = require('path');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const deployCommand = packageJson.scripts?.deploy || '';

    if (!deployCommand.includes('flyctl deploy')) {
        console.error('❌ Deploy script not found or invalid!');
        process.exit(1);
    }

    const checks: BuildArgCheck[] = REQUIRED_BUILD_ARGS.map((argName) => {
        // Match either quoted values: --build-arg KEY="value" or unquoted: --build-arg KEY=value
        const buildArgPattern = new RegExp(`--build-arg\\s+${argName}=(?:"([^"]+)"|([^\\s]+))`);
        const match = deployCommand.match(buildArgPattern);
        return {
            name: argName,
            found: match !== null,
            value: match ? (match[1] || match[2]) : undefined,
        };
    });

    const missing = checks.filter((check) => !check.found).map((check) => check.name);
    const allValid = missing.length === 0;

    return { allValid, missing };
}

function main() {
    console.log('🔍 Validating deploy command build arguments...\n');

    const { allValid, missing } = validateDeployCommand();

    if (allValid) {
        console.log('✅ All required build arguments are present in deploy command!\n');
        REQUIRED_BUILD_ARGS.forEach((argName) => {
            console.log(`  ✓ --build-arg ${argName}=...`);
        });
        console.log('\n✅ Deploy command validation passed. Ready to deploy!');
        process.exit(0);
    } else {
        console.error('❌ Deploy command validation failed!\n');
        console.error('Missing build arguments in deploy command:');
        missing.forEach((argName) => {
            console.error(`  ✗ --build-arg ${argName}=...`);
        });
        console.error('\n💡 Please add all required build arguments to the deploy script in package.json.');
        console.error('💡 Required build args:', REQUIRED_BUILD_ARGS.join(', '));
        console.error('');
        process.exit(1);
    }
}

main();

