import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock axios before importing the service
vi.mock('@/lib/axios', () => {
  const mockPost = vi.fn();
  return {
    default: {
      post: mockPost,
    },
    __mocks: {
      post: mockPost,
    },
  };
});

import { authService } from './auth-service';
import axios from '@/lib/axios';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should sign up user', async () => {
      const mockResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
        token: 'auth-token-123',
      };

      (axios.post as any).mockResolvedValue({
        data: mockResponse,
      });

      const result = await authService.signUp({
        email: 'test@example.com',
        password: 'password123',
      } as any);

      expect(result).toEqual(mockResponse);
      expect(axios.post).toHaveBeenCalledWith('/auth/signup/adult/v3', {
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
