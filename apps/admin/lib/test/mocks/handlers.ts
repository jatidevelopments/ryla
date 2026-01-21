/**
 * MSW Handlers for Frontend Tests
 * 
 * Mock API endpoints for testing React components
 */

import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:3000';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Mock successful login
    if (body.email === 'admin@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        admin: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Test Admin',
          role: 'super_admin',
          permissions: ['*'],
        },
      });
    }
    
    // Mock failed login
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.get(`${API_BASE}/api/auth/validate`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        admin: {
          id: 'admin-1',
          email: 'admin@example.com',
          name: 'Test Admin',
          role: 'super_admin',
          permissions: ['*'],
        },
      });
    }
    
    return HttpResponse.json(
      { message: 'Invalid token' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/api/auth/logout`, async () => {
    return HttpResponse.json({ success: true });
  }),
];
