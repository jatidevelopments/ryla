/**
 * AI Toolkit API Discovery Script
 * 
 * This script helps discover the actual API endpoints used by AI Toolkit
 * by monitoring network requests when interacting with the web UI.
 * 
 * Usage:
 * 1. Deploy AI Toolkit pod on RunPod
 * 2. Get the HTTP service URL
 * 3. Run this script to capture API calls
 * 
 * Or use browser DevTools manually:
 * 1. Open AI Toolkit web UI
 * 2. Open DevTools → Network tab
 * 3. Perform actions (login, create dataset, start training)
 * 4. Document all API calls
 */

import * as fs from 'fs';
import * as path from 'path';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requestBody?: Record<string, unknown>;
  responseExample?: Record<string, unknown>;
  headers?: Record<string, string>;
}

const discoveredEndpoints: ApiEndpoint[] = [];

/**
 * Add discovered endpoint
 */
function addEndpoint(endpoint: Omit<ApiEndpoint, 'description'> & { description?: string }) {
  discoveredEndpoints.push({
    method: endpoint.method,
    path: endpoint.path,
    description: endpoint.description || `${endpoint.method} ${endpoint.path}`,
    requestBody: endpoint.requestBody,
    responseExample: endpoint.responseExample,
    headers: endpoint.headers,
  });
}

/**
 * Generate TypeScript client code from discovered endpoints
 */
function generateClientCode(): string {
  const imports = `import fetch from 'node-fetch';\n\n`;
  
  const classStart = `export class AIToolkitClient {
  private baseUrl: string;
  private password: string;
  private sessionToken?: string;

  constructor(config: { baseUrl: string; password: string }) {
    this.baseUrl = config.baseUrl.replace(/\\/$/, '');
    this.password = config.password;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    const url = \`\${this.baseUrl}\${path}\`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (this.sessionToken) {
      requestHeaders['Authorization'] = \`Bearer \${this.sessionToken}\`;
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(\`\${method} \${path} failed: \${response.statusText}\`);
    }

    return response.json();
  }

`;

  const methods = discoveredEndpoints.map((endpoint) => {
    const methodName = endpoint.path
      .split('/')
      .filter((p) => p && !p.startsWith(':'))
      .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');

    const params = endpoint.path
      .match(/:(\w+)/g)
      ?.map((p) => p.slice(1))
      .join(', ') || '';

    const bodyParam = endpoint.requestBody ? 'body: unknown' : '';
    const allParams = [params, bodyParam].filter(Boolean).join(', ');

    return `
  /**
   * ${endpoint.description}
   */
  async ${methodName}(${allParams}): Promise<unknown> {
    return this.request('${endpoint.method}', '${endpoint.path}', ${bodyParam ? 'body' : 'undefined'});
  }`;
  }).join('\n');

  const classEnd = `}\n`;

  return imports + classStart + methods + classEnd;
}

/**
 * Save discovered endpoints to JSON
 */
function saveEndpoints() {
  const outputDir = path.join(__dirname, '../docs/technical/infrastructure/ai-toolkit');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const endpointsFile = path.join(outputDir, 'discovered-endpoints.json');
  fs.writeFileSync(
    endpointsFile,
    JSON.stringify(discoveredEndpoints, null, 2)
  );

  console.log(`✅ Saved ${discoveredEndpoints.length} endpoints to ${endpointsFile}`);
}

/**
 * Save generated client code
 */
function saveClientCode() {
  const code = generateClientCode();
  const outputFile = path.join(__dirname, '../libs/business/src/services/ai-toolkit-client.generated.ts');
  fs.writeFileSync(outputFile, code);
  console.log(`✅ Generated client code to ${outputFile}`);
}

// Example: Add endpoints as you discover them
// Uncomment and modify based on actual API discovery

/*
// Authentication
addEndpoint({
  method: 'POST',
  path: '/api/auth/login',
  description: 'Authenticate with password',
  requestBody: { password: 'string' },
  responseExample: { token: 'string', sessionId: 'string' },
});

// Datasets
addEndpoint({
  method: 'GET',
  path: '/api/datasets',
  description: 'List all datasets',
});

addEndpoint({
  method: 'POST',
  path: '/api/datasets',
  description: 'Create new dataset',
  requestBody: { name: 'string', imageUrls: ['string'] },
});

addEndpoint({
  method: 'GET',
  path: '/api/datasets/:id',
  description: 'Get dataset details',
});

// Training Jobs
addEndpoint({
  method: 'POST',
  path: '/api/jobs',
  description: 'Create training job',
  requestBody: {
    datasetId: 'string',
    name: 'string',
    baseModel: 'string',
    triggerWord: 'string',
  },
});

addEndpoint({
  method: 'GET',
  path: '/api/jobs/:id',
  description: 'Get job status',
});

// LoRA Downloads
addEndpoint({
  method: 'GET',
  path: '/api/jobs/:id/loras',
  description: 'List available LoRA versions',
});

addEndpoint({
  method: 'GET',
  path: '/api/jobs/:id/loras/:version/download',
  description: 'Download LoRA file',
});
*/

if (require.main === module) {
  console.log('AI Toolkit API Discovery Script');
  console.log('================================');
  console.log('');
  console.log('This script helps document discovered API endpoints.');
  console.log('Edit this file to add endpoints as you discover them.');
  console.log('');
  console.log('To discover endpoints:');
  console.log('1. Open AI Toolkit web UI in browser');
  console.log('2. Open DevTools → Network tab');
  console.log('3. Perform actions (login, create dataset, etc.)');
  console.log('4. Copy API calls to this script using addEndpoint()');
  console.log('5. Run: pnpm tsx scripts/discover-ai-toolkit-api.ts');
  console.log('');
  
  if (discoveredEndpoints.length > 0) {
    saveEndpoints();
    saveClientCode();
  } else {
    console.log('⚠️  No endpoints discovered yet. Add them to this script first.');
  }
}

export { addEndpoint, saveEndpoints, saveClientCode, generateClientCode };

