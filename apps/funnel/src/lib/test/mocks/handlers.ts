/**
 * MSW Handlers for Funnel App Tests
 * 
 * Mock API handlers for testing funnel components.
 */

import { http, HttpResponse } from 'msw';

// Base URL for API calls
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const handlers = [
  // Payment endpoints
  http.post(`${API_BASE}/payments/create-checkout`, () => {
    return HttpResponse.json({
      checkoutUrl: 'https://finby.com/checkout/test',
      sessionId: 'test-session-id',
    });
  }),

  http.get(`${API_BASE}/payments/status/:sessionId`, () => {
    return HttpResponse.json({
      status: 'completed',
      subscriptionId: 'test-subscription-id',
    });
  }),

  // Character endpoints
  http.get(`${API_BASE}/characters/:id`, () => {
    return HttpResponse.json({
      id: 'test-character-id',
      name: 'Test Character',
      status: 'ready',
    });
  }),

  // User endpoints
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      credits: 100,
    });
  }),
];
