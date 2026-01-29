/**
 * Test Helper Utilities for Web App
 * 
 * Common utilities for writing web app tests.
 */

/**
 * Wait for a condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`waitFor timed out after ${timeout}ms`));
      } else {
        setTimeout(check, 50);
      }
    };
    
    check();
  });
}

/**
 * Create a mock Request object
 */
export function createMockRequest(
  options?: Partial<Request>
): Request {
  const url = options?.url || 'http://localhost:3000';
  const method = options?.method || 'GET';
  const headers = options?.headers || new Headers();
  
  return new Request(url, {
    method,
    headers,
    ...options,
  });
}

/**
 * Create a mock Response object
 */
export function createMockResponse(
  body?: any,
  status: number = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a mock Headers object
 */
export function createMockHeaders(
  overrides?: Record<string, string>
): Headers {
  const headers = new Headers();
  if (overrides) {
    Object.entries(overrides).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }
  return headers;
}
