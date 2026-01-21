/**
 * Global Test Setup
 * 
 * This file runs before all tests.
 * Use it for global mocks, setup, and configuration.
 */

import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from './mocks/server';
import '@testing-library/jest-dom';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/dashboard',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: 'img',
}));

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  // Clear localStorage between tests
  localStorage.clear();
});

afterAll(() => {
  server.close();
});

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.ADMIN_JWT_SECRET = 'test-jwt-secret';
  process.env.NODE_ENV = 'test';
  process.env.POSTGRES_ENVIRONMENT = 'local';
});
