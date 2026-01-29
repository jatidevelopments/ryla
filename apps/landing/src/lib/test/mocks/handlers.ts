/**
 * MSW Handlers for Landing App Tests
 * 
 * Mock API handlers for testing landing page components.
 */

import { http, HttpResponse } from 'msw';

// Base URL for API calls
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const handlers = [
  // Health check
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({ status: 'ok' });
  }),

  // Analytics endpoints (if needed)
  http.post(`${API_BASE}/analytics/track`, () => {
    return HttpResponse.json({ success: true });
  }),
];
