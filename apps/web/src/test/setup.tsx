import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
    form: ({ children, ...props }: any) => <form {...props}> {children} </form>,
  },
  AnimatePresence: ({ children }: any) => <>{children} </>,
}));
