import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import ResetPasswordPage from './page';
import * as auth from '@/lib/auth';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

// Mock auth module
vi.mock('@/lib/auth', () => ({
  resetPassword: vi.fn(),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock UI components
vi.mock('@ryla/ui', () => ({
  RylaInput: (props: any) => <input {...props} />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  default: {},
}));

describe('ResetPasswordPage', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  describe('Token Validation', () => {
    it('should show error when token is missing', () => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn(() => null),
      });

      render(<ResetPasswordPage />);

      expect(
        screen.getByText(/Invalid reset link/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeDisabled();
    });

    it('should render form when token is present', () => {
      const validToken = 'valid-token-123';
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key: string) => (key === 'token' ? validToken : null)),
      });

      render(<ResetPasswordPage />);

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByText('Reset Password')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key: string) => (key === 'token' ? 'valid-token' : null)),
      });
    });

    it('should validate password strength', async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      // Enter weak password
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      fireEvent.change(confirmInput, { target: { value: 'weak' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Password must be at least 8 characters with a lowercase letter and number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should validate password match', async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password456!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should accept valid password', async () => {
      vi.mocked(auth.resetPassword).mockResolvedValueOnce(undefined);

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(auth.resetPassword).toHaveBeenCalledWith({
          token: 'valid-token',
          password: 'NewPassword123!',
        });
      });
    });
  });

  describe('Password Reset Flow', () => {
    beforeEach(() => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key: string) => (key === 'token' ? 'valid-token' : null)),
      });
    });

    it('should show loading state during submission', async () => {
      vi.mocked(auth.resetPassword).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Resetting...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should show success message after successful reset', async () => {
      vi.mocked(auth.resetPassword).mockResolvedValueOnce(undefined);

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
        expect(screen.getByText('Password Updated')).toBeInTheDocument();
        expect(
          screen.getByText(/Your password has been successfully reset/i)
        ).toBeInTheDocument();
      });
    });

    it('should redirect to login after 3 seconds', async () => {
      vi.useFakeTimers();
      vi.mocked(auth.resetPassword).mockResolvedValueOnce(undefined);

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/auth');
      });

      vi.useRealTimers();
    });

    it('should show error message on API failure', async () => {
      const errorMessage = 'Invalid or expired reset token';
      vi.mocked(auth.resetPassword).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle 401 error (invalid/expired token)', async () => {
      const errorMessage = 'Invalid or expired reset token';
      vi.mocked(auth.resetPassword).mockRejectedValueOnce(
        new Error(errorMessage)
      );

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'NewPassword123!' } });
      fireEvent.change(confirmInput, { target: { value: 'NewPassword123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        // Form should still be visible (not success state)
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      });
    });
  });

  describe('UI Elements', () => {
    beforeEach(() => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key: string) => (key === 'token' ? 'valid-token' : null)),
      });
    });

    it('should display password requirements hint', () => {
      render(<ResetPasswordPage />);

      expect(
        screen.getByText(
          /Must be at least 8 characters with a lowercase letter and number/i
        )
      ).toBeInTheDocument();
    });

    it('should have link back to login', () => {
      render(<ResetPasswordPage />);

      const backLink = screen.getByText('Back to Sign In');
      expect(backLink).toBeInTheDocument();
      expect(backLink.closest('a')).toHaveAttribute('href', '/auth');
    });

    it('should show promotional images on desktop', () => {
      render(<ResetPasswordPage />);

      // Check if carousel indicators are present (indicating images loaded)
      const indicators = screen.getAllByLabelText(/Go to image/i);
      expect(indicators.length).toBeGreaterThan(0);
    });
  });

  describe('Password Strength Validation', () => {
    beforeEach(() => {
      (useSearchParams as any).mockReturnValue({
        get: vi.fn((key: string) => (key === 'token' ? 'valid-token' : null)),
      });
    });

    it('should reject password shorter than 8 characters', async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'Short1' } });
      fireEvent.change(confirmInput, { target: { value: 'Short1' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Password must be at least 8 characters with a lowercase letter and number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should reject password without lowercase letter', async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'PASSWORD123!' } });
      fireEvent.change(confirmInput, { target: { value: 'PASSWORD123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Password must be at least 8 characters with a lowercase letter and number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should reject password without number', async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'Password!' } });
      fireEvent.change(confirmInput, { target: { value: 'Password!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Password must be at least 8 characters with a lowercase letter and number/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should accept valid password with lowercase, number, and 8+ chars', async () => {
      vi.mocked(auth.resetPassword).mockResolvedValueOnce(undefined);

      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText('New Password');
      const confirmInput = screen.getByLabelText('Confirm Password');
      const submitButton = screen.getByText('Reset Password');

      fireEvent.change(passwordInput, { target: { value: 'validpass123' } });
      fireEvent.change(confirmInput, { target: { value: 'validpass123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(auth.resetPassword).toHaveBeenCalled();
      });
    });
  });
});
