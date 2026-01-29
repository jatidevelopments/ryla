#!/usr/bin/env tsx
/**
 * Test Modal endpoint with proper headers
 * 
 * Usage: tsx scripts/workflow-deployer/test-endpoint.ts <endpoint-url>
 */

import fetch from 'node-fetch';

const endpointUrl = process.argv[2];

if (!endpointUrl) {
  console.error('❌ Usage: tsx test-endpoint.ts <endpoint-url>');
  process.exit(1);
}

async function testEndpoint() {
  console.log(`🧪 Testing endpoint: ${endpointUrl}\n`);

  // Test root endpoint
  console.log('1️⃣  Testing root endpoint (/)...');
  try {
    const rootResponse = await fetch(`${endpointUrl}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    } as any);

    if (rootResponse.ok) {
      const data = await rootResponse.json();
      console.log('   ✅ Root endpoint: OK');
      console.log(`   Response: ${JSON.stringify(data)}`);
    } else {
      console.log(`   ❌ Root endpoint: HTTP ${rootResponse.status}`);
      const text = await rootResponse.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Root endpoint: ${error.message}`);
  }

  console.log('');

  // Test health endpoint
  console.log('2️⃣  Testing health endpoint (/health)...');
  try {
    const healthResponse = await fetch(`${endpointUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    } as any);

    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('   ✅ Health endpoint: OK');
      console.log(`   Response: ${JSON.stringify(data)}`);
    } else {
      console.log(`   ❌ Health endpoint: HTTP ${healthResponse.status}`);
      const text = await healthResponse.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Health endpoint: ${error.message}`);
  }

  console.log('');

  // Test generate endpoint (with minimal workflow)
  console.log('3️⃣  Testing generate endpoint (/generate)...');
  try {
    const generateResponse = await fetch(`${endpointUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        workflow: {
          '1': {
            class_type: 'SaveImage',
            inputs: {
              filename_prefix: 'test',
            },
          },
        },
      }),
      timeout: 60000, // 60s for generation
    } as any);

    if (generateResponse.ok) {
      const data = await generateResponse.json();
      console.log('   ✅ Generate endpoint: OK');
      console.log(`   Response keys: ${Object.keys(data).join(', ')}`);
    } else {
      console.log(`   ❌ Generate endpoint: HTTP ${generateResponse.status}`);
      const text = await generateResponse.text();
      console.log(`   Response: ${text.substring(0, 200)}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Generate endpoint: ${error.message}`);
    if (error.message.includes('timeout')) {
      console.log('   ⚠️  This may be normal for cold starts (2-5 minutes)');
    }
  }

  console.log('\n✅ Endpoint testing complete!');
}

testEndpoint().catch(console.error);
