import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../lib/test/mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}> {children} </div>,
    button: ({ children, ...props }: any) => (
      <button {...props}> {children} </button>
    ),
    span: ({ children, ...props }: any) => <span {...props}> {children} </span>,
  },
  AnimatePresence: ({ children }: any) => <>{children} </>,
}));

// Setup MSW server
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  // Clear localStorage between tests
  if (typeof localStorage !== 'undefined') {
    if (typeof localStorage.clear === 'function') {
      localStorage.clear();
    } else {
      // Fallback: clear manually if clear is not available
      const keys = Object.keys(localStorage);
      keys.forEach(key => localStorage.removeItem(key));
    }
  }
});

afterAll(() => {
  server.close();
});
