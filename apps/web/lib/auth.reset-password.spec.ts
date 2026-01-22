import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resetPassword } from './auth';

// Mock fetch globally
global.fetch = vi.fn();

describe('resetPassword', () => {
  const API_BASE_URL = 'http://localhost:3001';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = API_BASE_URL;
  });

  it('should successfully reset password with valid token', async () => {
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Password has been reset successfully' }),
    };

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    await resetPassword({
      token: 'valid-token-123',
      password: 'NewPassword123!',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/reset-password`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'valid-token-123',
          password: 'NewPassword123!',
        }),
      }
    );
  });

  it('should throw error for 401 (invalid/expired token)', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        message: 'Invalid or expired reset token',
      }),
    };

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    await expect(
      resetPassword({
        token: 'invalid-token',
        password: 'NewPassword123!',
      })
    ).rejects.toThrow('Invalid or expired reset token');
  });

  it('should throw error for other API errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({
        message: 'Internal server error',
      }),
    };

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    await expect(
      resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
      })
    ).rejects.toThrow('Internal server error');
  });

  it('should throw generic error when response has no message', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    };

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    await expect(
      resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
      })
    ).rejects.toThrow('Failed to reset password');
  });

  it('should handle network errors', async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));

    await expect(
      resetPassword({
        token: 'valid-token',
        password: 'NewPassword123!',
      })
    ).rejects.toThrow('Network error');
  });

  it('should use default API URL when NEXT_PUBLIC_API_URL is not set', async () => {
    delete process.env.NEXT_PUBLIC_API_URL;

    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Success' }),
    };

    vi.mocked(global.fetch).mockResolvedValueOnce(mockResponse as any);

    await resetPassword({
      token: 'valid-token',
      password: 'NewPassword123!',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/auth/reset-password',
      expect.any(Object)
    );
  });
});
