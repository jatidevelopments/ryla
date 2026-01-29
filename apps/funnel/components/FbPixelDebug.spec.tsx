import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { FbPixelDebug } from './FbPixelDebug';
import { getFacebookDebugStatus } from '@ryla/analytics';

vi.mock('@ryla/analytics', () => ({
  getFacebookDebugStatus: vi.fn(() => ({
    pixelId: 'test-pixel-id',
    fbqAvailable: true,
    queueLength: 0,
    sentEventIds: [],
  })),
}));

describe('FbPixelDebug', () => {
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Don't override window - jsdom provides it
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    // Don't use fake timers - useEffect runs synchronously in tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should not render anything', () => {
    const { container } = render(<FbPixelDebug />);
    expect(container.firstChild).toBeNull();
  });

  it('should log debug status on mount', async () => {
    render(<FbPixelDebug />);
    
    // Wait for useEffect to run
    await waitFor(() => {
      expect(getFacebookDebugStatus).toHaveBeenCalled();
      expect(consoleGroupSpy).toHaveBeenCalledWith('🔵 Facebook Pixel Status');
    }, { timeout: 2000 });
  });

  it('should log pixel status information', async () => {
    render(<FbPixelDebug />);
    
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Pixel ID:', 'test-pixel-id');
      expect(consoleLogSpy).toHaveBeenCalledWith('fbq Available:', '✅ Yes');
    }, { timeout: 2000 });
  });

  it('should warn when fbq is not available', async () => {
    (getFacebookDebugStatus as any).mockReturnValue({
      pixelId: 'test-pixel-id',
      fbqAvailable: false,
      queueLength: 0,
      sentEventIds: [],
    });

    render(<FbPixelDebug />);
    
    await waitFor(() => {
      expect(consoleWarnSpy).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should clean up interval on unmount', async () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = render(<FbPixelDebug />);
    
    // Wait for component to mount and set up interval
    await waitFor(() => {
      expect(getFacebookDebugStatus).toHaveBeenCalled();
    });
    
    // Unmount should clean up - do it in act to ensure React processes it
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    
    // Verify cleanup was called
    await waitFor(() => {
      expect(clearIntervalSpy).toHaveBeenCalled();
    }, { timeout: 2000 });
  });
});
