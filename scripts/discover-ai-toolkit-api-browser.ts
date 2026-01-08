/**
 * AI Toolkit API Discovery - Browser Automation
 * 
 * This script uses browser automation to discover AI Toolkit API endpoints
 * by navigating the web UI and capturing network requests.
 * 
 * Prerequisites:
 * 1. AI Toolkit pod deployed on RunPod
 * 2. HTTP service URL available
 * 3. Password for AI Toolkit
 * 
 * Usage:
 * pnpm tsx scripts/discover-ai-toolkit-api-browser.ts
 */

import { chromium } from 'playwright';

interface DiscoveredEndpoint {
  method: string;
  url: string;
  path: string;
  requestBody?: unknown;
  responseBody?: unknown;
  headers?: Record<string, string>;
  description: string;
}

const discoveredEndpoints: DiscoveredEndpoint[] = [];

async function discoverAIToolkitAPI() {
  const baseUrl = process.env.AI_TOOLKIT_BASE_URL;
  const password = process.env.AI_TOOLKIT_PASSWORD;

  if (!baseUrl || !password) {
    console.error('Missing environment variables:');
    console.error('  AI_TOOLKIT_BASE_URL - HTTP service URL from RunPod');
    console.error('  AI_TOOLKIT_PASSWORD - Password set in pod environment');
    process.exit(1);
  }

  console.log('🚀 Starting AI Toolkit API Discovery');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all network requests
  const requests: Array<{
    method: string;
    url: string;
    headers: Record<string, string>;
    postData?: string;
  }> = [];

  const responses: Array<{
    url: string;
    status: number;
    headers: Record<string, string>;
    body?: unknown;
  }> = [];

  page.on('request', (request) => {
    const url = request.url();
    // Only capture API calls (not static assets)
    if (
      url.includes('/api/') ||
      url.includes('/auth/') ||
      url.includes('/datasets') ||
      url.includes('/jobs') ||
      url.includes('/loras')
    ) {
      requests.push({
        method: request.method(),
        url,
        headers: request.headers(),
        postData: request.postData() || undefined,
      });
      console.log(`📤 ${request.method()} ${url}`);
    }
  });

  page.on('response', async (response) => {
    const url = response.url();
    if (
      url.includes('/api/') ||
      url.includes('/auth/') ||
      url.includes('/datasets') ||
      url.includes('/jobs') ||
      url.includes('/loras')
    ) {
      try {
        const contentType = response.headers()['content-type'] || '';
        let body: unknown;
        
        if (contentType.includes('application/json')) {
          body = await response.json();
        } else if (contentType.includes('text/')) {
          body = await response.text();
        }

        responses.push({
          url,
          status: response.status(),
          headers: response.headers(),
          body,
        });
        console.log(`📥 ${response.status()} ${url}`);
      } catch (error) {
        // Ignore errors reading response
      }
    }
  });

  try {
    // Step 1: Navigate to login page
    console.log('Step 1: Navigating to login page...');
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Step 2: Find password input and login
    console.log('Step 2: Attempting login...');
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill(password);
      
      // Look for login button
      const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign in"), button[type="submit"]').first();
      if (await loginButton.isVisible()) {
        await loginButton.click();
        await page.waitForTimeout(3000);
      } else {
        // Try pressing Enter
        await passwordInput.press('Enter');
        await page.waitForTimeout(3000);
      }
    }

    // Step 3: Wait for dashboard to load
    console.log('Step 3: Waiting for dashboard...');
    await page.waitForTimeout(3000);

    // Step 4: Try to create a dataset (if UI is available)
    console.log('Step 4: Looking for dataset creation...');
    try {
      const createDatasetButton = page.locator('button:has-text("New Dataset"), button:has-text("Create Dataset"), a:has-text("Datasets")').first();
      if (await createDatasetButton.isVisible({ timeout: 5000 })) {
        console.log('  Found dataset button, clicking...');
        await createDatasetButton.click();
        await page.waitForTimeout(2000);
      }
    } catch {
      console.log('  Dataset button not found, skipping...');
    }

    // Step 5: Try to navigate to jobs/training
    console.log('Step 5: Looking for training jobs...');
    try {
      const jobsButton = page.locator('button:has-text("Jobs"), a:has-text("Training"), a:has-text("Jobs")').first();
      if (await jobsButton.isVisible({ timeout: 5000 })) {
        console.log('  Found jobs button, clicking...');
        await jobsButton.click();
        await page.waitForTimeout(2000);
      }
    } catch {
      console.log('  Jobs button not found, skipping...');
    }

    // Wait a bit more for any async requests
    await page.waitForTimeout(5000);

    // Match requests with responses
    console.log('');
    console.log('📊 Matching requests with responses...');
    for (const request of requests) {
      const response = responses.find((r) => r.url === request.url);
      
      const path = new URL(request.url).pathname;
      const method = request.method;
      
      let requestBody: unknown;
      if (request.postData) {
        try {
          requestBody = JSON.parse(request.postData);
        } catch {
          requestBody = request.postData;
        }
      }

      discoveredEndpoints.push({
        method,
        url: request.url,
        path,
        requestBody,
        responseBody: response?.body,
        headers: request.headers,
        description: `${method} ${path}`,
      });
    }

    console.log('');
    console.log(`✅ Discovered ${discoveredEndpoints.length} API endpoints`);
    console.log('');

    // Save discovered endpoints
    const fs = await import('fs');
    const path = await import('path');
    
    const outputDir = path.join(process.cwd(), 'docs/technical/infrastructure/ai-toolkit');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputFile = path.join(outputDir, 'discovered-endpoints.json');
    fs.writeFileSync(
      outputFile,
      JSON.stringify(discoveredEndpoints, null, 2)
    );

    console.log(`💾 Saved to: ${outputFile}`);
    console.log('');

    // Generate summary
    console.log('📋 Endpoint Summary:');
    discoveredEndpoints.forEach((endpoint) => {
      console.log(`  ${endpoint.method} ${endpoint.path}`);
    });

  } catch (error) {
    console.error('❌ Error during discovery:', error);
  } finally {
    await browser.close();
  }
}

// Run if executed directly
if (require.main === module) {
  discoverAIToolkitAPI().catch(console.error);
}

export { discoverAIToolkitAPI };

