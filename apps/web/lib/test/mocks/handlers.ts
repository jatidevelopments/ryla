/**
 * MSW Handlers for Web App Tests
 * 
 * Mock API handlers for testing frontend components.
 */

import { http, HttpResponse } from 'msw';

// Base URL for API calls
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/login`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    });
  }),

  http.post(`${API_BASE}/auth/register`, () => {
    return HttpResponse.json({
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    });
  }),

  // User endpoints
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User',
      credits: 100,
    });
  }),

  // Influencer endpoints
  http.get(`${API_BASE}/influencers`, () => {
    return HttpResponse.json({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
      },
    });
  }),

  // Image endpoints
  http.get(`${API_BASE}/images`, () => {
    return HttpResponse.json({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 20,
      },
    });
  }),

  // Generation endpoints
  http.post(`${API_BASE}/generation/generate`, () => {
    return HttpResponse.json({
      jobId: 'test-job-id',
      status: 'pending',
    });
  }),
];
