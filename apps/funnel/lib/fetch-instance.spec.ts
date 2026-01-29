import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('fetch-instance', () => {
  const originalFetch = global.fetch;
  const originalEnv = process.env.NEXT_PUBLIC_API_BASE_URL;
  const mockLocalStorage = {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetModules();
    global.fetch = vi.fn() as any;
    // Add clear method to mock
    (mockLocalStorage as any).clear = vi.fn(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });
    vi.stubGlobal('localStorage', mockLocalStorage);
    // Set env var before importing
    process.env.NEXT_PUBLIC_API_BASE_URL = 'https://test-api.example.com';
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_API_BASE_URL = originalEnv;
    vi.restoreAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it('should make GET request to base URL', async () => {
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await fetchInstance('/test');
    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toContain('/test');
    expect(callArgs[1].method).toBe('GET');
  });

  it('should use default base URL when env var not set', async () => {
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
    vi.resetModules();
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await fetchInstance('/test');
    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toContain('https://devapi.mydreamcompanion.com/test');
  });

  it('should include Authorization header when token exists', async () => {
    mockLocalStorage.getItem.mockReturnValue('test-token');
    vi.resetModules();
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await fetchInstance('/test');
    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[1].headers.Authorization).toBe('Bearer test-token');
  });

  it('should make POST request with JSON body', async () => {
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await fetchInstance('/test', {
      method: 'POST',
      body: { key: 'value' },
    });

    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[1].method).toBe('POST');
    expect(callArgs[1].body).toBe(JSON.stringify({ key: 'value' }));
  });

  it('should throw error when response is not ok', async () => {
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    await expect(fetchInstance('/test')).rejects.toThrow('HTTP error! status: 404');
  });

  it('should include custom headers', async () => {
    const { default: fetchInstance } = await import('./fetch-instance');
    (global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await fetchInstance('/test', {
      headers: { 'X-Custom': 'value' },
    });

    expect(global.fetch).toHaveBeenCalled();
    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[1].headers['X-Custom']).toBe('value');
  });
});
