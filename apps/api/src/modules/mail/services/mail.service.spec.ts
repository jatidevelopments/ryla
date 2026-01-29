import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

describe('MailService', () => {
  let service: MailService;
  let mockConfigService: ConfigService;
  let globalFetch: typeof fetch;

  beforeEach(() => {
    globalFetch = global.fetch;
    global.fetch = vi.fn();

    mockConfigService = {
      get: vi.fn(),
    } as unknown as ConfigService;

    service = new MailService(mockConfigService);
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.restoreAllMocks();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ messageId: '123' }),
      } as any);

      await service.sendEmail('test@example.com', 'Test Subject', '<p>Test HTML</p>');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.brevo.com/v3/smtp/email',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'api-key': 'test-api-key',
            'Content-Type': 'application/json',
          }),
          body: expect.stringContaining('test@example.com'),
        }),
      );
    });

    it('should throw error when Brevo config not found', async () => {
      vi.mocked(mockConfigService.get).mockReturnValue(undefined);

      await expect(
        service.sendEmail('test@example.com', 'Test', '<p>Test</p>'),
      ).rejects.toThrow('Email service not configured');
    });

    it('should throw error when API request fails', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request'),
      } as any);

      await expect(
        service.sendEmail('test@example.com', 'Test', '<p>Test</p>'),
      ).rejects.toThrow('HTTP 400');
    });

    it('should include textContent when provided', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

      await service.sendEmail(
        'test@example.com',
        'Test',
        '<p>HTML</p>',
        'Plain text',
      );

      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.textContent).toBe('Plain text');
    });

    it('should auto-generate textContent from HTML when not provided', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

      await service.sendEmail('test@example.com', 'Test', '<p>Test HTML</p>');

      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.textContent).toBe('Test HTML');
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should send welcome email', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

      await service.sendWelcomeEmail('test@example.com', 'John');

      expect(global.fetch).toHaveBeenCalled();
      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.subject).toBe('Welcome to RYLA');
      expect(body.htmlContent).toContain('John');
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email', async () => {
      const brevoConfig = {
        apiUrl: 'https://api.brevo.com',
        apiKey: 'test-api-key',
      };
      vi.mocked(mockConfigService.get).mockReturnValue(brevoConfig);
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      } as any);

      await service.sendPasswordResetEmail('test@example.com', 'https://ryla.ai/reset?token=123');

      expect(global.fetch).toHaveBeenCalled();
      const call = (global.fetch as any).mock.calls[0];
      const body = JSON.parse(call[1].body);
      expect(body.subject).toBe('Reset Your Password');
      expect(body.htmlContent).toContain('https://ryla.ai/reset?token=123');
    });
  });
});
