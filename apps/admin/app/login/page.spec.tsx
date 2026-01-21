/**
 * Login Page Tests
 * 
 * Tests for the login page component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsValue = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsValue.get(key),
  }),
}));

// Use MSW handlers for API mocking
import { server } from '@/lib/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockSearchParamsValue = new URLSearchParams();
    mockPush.mockClear();
    server.resetHandlers();
  });

  describe('rendering', () => {
    it('should render login form', () => {
      render(<LoginPage />);

      expect(screen.getByText('RYLA Admin')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access the admin panel')).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      const passwordInput = screen.getByPlaceholderText('••••••••');
      expect(passwordInput).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should render password visibility toggle', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      const toggleButton = screen.getByLabelText(/show password/i);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('form interactions', () => {
    it('should update email input', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'admin@example.com');

      expect(emailInput).toHaveValue('admin@example.com');
    });

    it('should update password input', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      const toggleButton = screen.getByLabelText(/show password/i);

      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();

      await user.click(screen.getByLabelText(/hide password/i));

      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('form submission', () => {
    it('should successfully login and redirect to dashboard', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const { email, password } = (await request.json()) as any;
          if (email === 'admin@example.com' && password === 'password123') {
            return HttpResponse.json({
              token: 'mock-jwt-token',
              admin: {
                id: 'admin-1',
                email: 'admin@example.com',
                name: 'Test Admin',
                role: 'super_admin',
                permissions: ['*'],
              },
            }, { status: 200 });
          }
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      
      // Submit form
      await user.click(submitButton);

      // Wait for successful login (token stored in localStorage)
      await waitFor(() => {
        expect(localStorage.getItem('admin_token')).toBe('mock-jwt-token');
      }, { timeout: 3000 });

      // Wait for redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      }, { timeout: 3000 });
    });

    it('should redirect to returnUrl if provided', async () => {
      const user = userEvent.setup();
      
      mockSearchParamsValue.set('returnUrl', encodeURIComponent('/users'));
      
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const { email, password } = (await request.json()) as any;
          if (email === 'admin@example.com' && password === 'password123') {
            return HttpResponse.json({
              token: 'mock-jwt-token',
              admin: {
                id: 'admin-1',
                email: 'admin@example.com',
                name: 'Test Admin',
                role: 'super_admin',
                permissions: ['*'],
              },
            }, { status: 200 });
          }
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/users');
      });
    });

    it('should not redirect to login page even if returnUrl is login', async () => {
      const user = userEvent.setup();
      
      mockSearchParamsValue.set('returnUrl', encodeURIComponent('/login'));
      
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const { email, password } = (await request.json()) as any;
          if (email === 'admin@example.com' && password === 'password123') {
            return HttpResponse.json({
              token: 'mock-jwt-token',
              admin: {
                id: 'admin-1',
                email: 'admin@example.com',
                name: 'Test Admin',
                role: 'super_admin',
                permissions: ['*'],
              },
            }, { status: 200 });
          }
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should handle invalid returnUrl gracefully', async () => {
      const user = userEvent.setup();
      
      mockSearchParamsValue.set('returnUrl', 'http://evil.com');
      
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const { email, password } = (await request.json()) as any;
          if (email === 'admin@example.com' && password === 'password123') {
            return HttpResponse.json({
              token: 'mock-jwt-token',
              admin: {
                id: 'admin-1',
                email: 'admin@example.com',
                name: 'Test Admin',
                role: 'super_admin',
                permissions: ['*'],
              },
            }, { status: 200 });
          }
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should display error message on login failure', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'wrong-password');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      expect(localStorage.getItem('admin_token')).toBe(null);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should display generic error message on network error', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.error();
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        // The error message might be "An error occurred" or the actual error message
        const errorElement = screen.queryByText(/error|failed/i);
        expect(errorElement).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should disable submit button while loading', async () => {
      const user = userEvent.setup();
      
      // Create a delayed response to test loading state
      let resolveRequest: () => void;
      const requestPromise = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.post('/api/auth/login', async () => {
          await requestPromise;
          return HttpResponse.json({
            token: 'mock-jwt-token',
            admin: {
              id: 'admin-1',
              email: 'admin@example.com',
              name: 'Test Admin',
              role: 'super_admin',
              permissions: ['*'],
            },
          }, { status: 200 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'password123');
      
      // Start the form submission (but don't await it)
      const submitPromise = user.click(submitButton);

      // Wait for loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(screen.getByText('Signing in...')).toBeInTheDocument();
      });

      // Resolve the request to allow it to complete
      resolveRequest!();

      // Wait for the form submission to complete
      await submitPromise;

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });

    it('should require email and password', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      // HTML5 validation should prevent submission
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');

      expect(emailInput).toBeInvalid();
      expect(passwordInput).toBeInvalid();
      // HTML5 validation prevents form submission, so no fetch call should be made
    });
  });

  describe('error handling', () => {
    it('should clear error message on new submission', async () => {
      const user = userEvent.setup();
      
      // First, trigger an error
      server.use(
        http.post('/api/auth/login', () => {
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'admin@example.com');
      await user.type(passwordInput, 'wrong-password');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Now try again with correct credentials
      server.use(
        http.post('/api/auth/login', async ({ request }) => {
          const { email, password } = (await request.json()) as any;
          if (email === 'admin@example.com' && password === 'correct-password') {
            return HttpResponse.json({
              token: 'mock-jwt-token',
              admin: {
                id: 'admin-1',
                email: 'admin@example.com',
                name: 'Test Admin',
                role: 'super_admin',
                permissions: ['*'],
              },
            }, { status: 200 });
          }
          return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        })
      );

      await user.clear(passwordInput);
      await user.type(passwordInput, 'correct-password');
      await user.click(submitButton);

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
      });
    });
  });
});
