import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getOrCreateSessionId,
  createSession,
  updateSession,
  updateSessionEmail,
  updateSessionWaitlist,
  updateSessionStep,
  saveOption,
  saveAllOptions,
  getSessionOptions,
} from './session-service';

// Mock axios
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockGet = vi.fn();

vi.mock('@/lib/axios', () => ({
  default: {
    post: mockPost,
    put: mockPut,
    get: mockGet,
  },
}));

describe('session-service', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalEnableDev = process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API;
  const originalWindow = global.window;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NODE_ENV = 'production';
    process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = 'true';
    // Ensure window exists
    if (!global.window) {
      global.window = {} as any;
    }
    // Use real localStorage methods but spy on them
    Object.defineProperty(global.window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = originalEnableDev;
    global.window = originalWindow;
  });

  describe('getOrCreateSessionId', () => {
    it('should create new session ID when none exists', () => {
      const getItemMock = vi.fn().mockReturnValue(null);
      const setItemMock = vi.fn();
      (global.window.localStorage.getItem as any) = getItemMock;
      (global.window.localStorage.setItem as any) = setItemMock;
      
      const sessionId = getOrCreateSessionId();
      expect(sessionId).toBeTruthy();
      expect(setItemMock).toHaveBeenCalled();
    });

    it('should return existing session ID', () => {
      const getItemMock = vi.fn().mockReturnValue('existing-session-id');
      (global.window.localStorage.getItem as any) = getItemMock;
      
      const sessionId = getOrCreateSessionId();
      expect(sessionId).toBe('existing-session-id');
    });

    it('should return temp ID when window is undefined', () => {
      delete (global as any).window;
      const sessionId = getOrCreateSessionId();
      expect(sessionId).toContain('temp-');
    });
  });

  describe('createSession', () => {
    it('should create session in backend API', async () => {
      const mockSession = {
        id: '1',
        session_id: 'test-session',
        email: null,
        on_waitlist: false,
        current_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPost.mockResolvedValue({
        data: mockSession,
      });

      const result = await createSession({
        session_id: 'test-session',
        current_step: 1,
      });

      expect(result).toBeTruthy();
      expect(result?.session_id).toBe('test-session');
      expect(mockPost).toHaveBeenCalledWith('/funnel/sessions', {
        sessionId: 'test-session',
        currentStep: 1,
      });
    });

    it('should return null on error', async () => {
      mockPost.mockRejectedValue(new Error('API Error'));

      const result = await createSession({
        session_id: 'test-session',
      });

      expect(result).toBeNull();
    });

    it('should return null in development when backend API disabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = 'false';

      const result = await createSession({
        session_id: 'test-session',
      });

      expect(result).toBeNull();
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('updateSession', () => {
    it('should update session', async () => {
      const mockSession = {
        id: '1',
        session_id: 'test-session',
        email: 'test@example.com',
        on_waitlist: false,
        current_step: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPut.mockResolvedValue({
        data: mockSession,
      });

      const result = await updateSession('test-session', {
        email: 'test@example.com',
      });

      expect(result).toBeTruthy();
      expect(result?.email).toBe('test@example.com');
      expect(mockPut).toHaveBeenCalledWith('/funnel/sessions/test-session', {
        email: 'test@example.com',
      });
    });

    it('should return null in development when backend API disabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = 'false';

      const result = await updateSession('test-session', {
        email: 'test@example.com',
      });

      expect(result).toBeNull();
      expect(mockPut).not.toHaveBeenCalled();
    });
  });

  describe('updateSessionEmail', () => {
    it('should update session email', async () => {
      const mockSession = {
        id: '1',
        session_id: 'test-session',
        email: 'test@example.com',
        on_waitlist: false,
        current_step: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPut.mockResolvedValue({
        data: mockSession,
      });

      const result = await updateSessionEmail('test-session', 'test@example.com');
      expect(result).toBe(true);
    });
  });

  describe('updateSessionWaitlist', () => {
    it('should update waitlist status', async () => {
      const mockSession = {
        id: '1',
        session_id: 'test-session',
        email: null,
        on_waitlist: true,
        current_step: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPut.mockResolvedValue({
        data: mockSession,
      });

      const result = await updateSessionWaitlist('test-session', true);
      expect(result).toBe(true);
    });
  });

  describe('updateSessionStep', () => {
    it('should update session step', async () => {
      const mockSession = {
        id: '1',
        session_id: 'test-session',
        email: null,
        on_waitlist: false,
        current_step: 5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPut.mockResolvedValue({
        data: mockSession,
      });

      const result = await updateSessionStep('test-session', 5);
      expect(result).toBe(true);
    });
  });

  describe('saveOption', () => {
    it('should save option to backend API', async () => {
      mockPost.mockResolvedValue({
        data: { success: true },
      });

      const result = await saveOption('test-session', 'ethnicity', 'caucasian');
      expect(result).toBe(true);
      expect(mockPost).toHaveBeenCalledWith('/funnel/sessions/test-session/options', {
        optionKey: 'ethnicity',
        optionValue: 'caucasian',
      });
    });

    it('should return true in development when backend API disabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = 'false';

      const result = await saveOption('test-session', 'ethnicity', 'caucasian');
      expect(result).toBe(true);
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('saveAllOptions', () => {
    it('should save all options', async () => {
      mockPost.mockResolvedValue({
        data: { success: true },
      });

      const result = await saveAllOptions('test-session', {
        ethnicity: 'caucasian',
        hair_color: 'blonde',
      });
      expect(result).toBe(true);
      expect(mockPost).toHaveBeenCalledWith('/funnel/sessions/test-session/options/batch', {
        options: {
          ethnicity: 'caucasian',
          hair_color: 'blonde',
        },
      });
    });

    it('should return true for empty form data', async () => {
      const result = await saveAllOptions('test-session', {});
      expect(result).toBe(true);
      // Should not call API for empty data
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  describe('getSessionOptions', () => {
    it('should get session options', async () => {
      const mockOptions = [
        { id: '1', session_id: 'test-session', option_key: 'ethnicity', option_value: 'caucasian', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { id: '2', session_id: 'test-session', option_key: 'hair_color', option_value: 'blonde', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      ];

      mockGet.mockResolvedValue({
        data: mockOptions,
      });

      const result = await getSessionOptions('test-session');
      expect(result).toHaveLength(2);
      expect(mockGet).toHaveBeenCalledWith('/funnel/sessions/test-session/options');
    });

    it('should return empty array in development when backend API disabled', async () => {
      process.env.NODE_ENV = 'development';
      process.env.NEXT_PUBLIC_ENABLE_DEV_FUNNEL_API = 'false';

      const result = await getSessionOptions('test-session');
      expect(result).toEqual([]);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });
});
