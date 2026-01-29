import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import { CdnDebug } from './CdnDebug';
import { getCdnStatus } from '@/lib/cdn';

vi.mock('@/lib/cdn', () => ({
  getCdnStatus: vi.fn(() => ({
    enabled: true,
    url: 'https://cdn.example.com',
    debug: false,
  })),
}));

describe('CdnDebug', () => {
  beforeEach(() => {
    // Don't try to redefine location.origin - jsdom already provides it
    // The component will use window.location.origin if available, or fallback to default
    
    // Spy on document methods we need
    if (global.document) {
      vi.spyOn(global.document, 'querySelectorAll').mockReturnValue([] as any);
      if (global.document.head) {
        vi.spyOn(global.document.head, 'appendChild').mockImplementation(() => ({} as any));
        vi.spyOn(global.document.head, 'querySelector').mockReturnValue(null);
      }
      if (global.document.body) {
        vi.spyOn(global.document.body, 'querySelectorAll').mockReturnValue([] as any);
      }
    }
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    // Don't use fake timers - useEffect runs synchronously in tests
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should not render anything', () => {
    const { container } = render(<CdnDebug />);
    expect(container.firstChild).toBeNull();
  });

  it('should log CDN status on mount', async () => {
    render(<CdnDebug />);
    
    // Wait for useEffect to run
    await waitFor(() => {
      expect(getCdnStatus).toHaveBeenCalled();
      expect(console.group).toHaveBeenCalledWith('🌐 CDN Configuration Status');
    }, { timeout: 2000 });
  });

  it('should log CDN enabled status', async () => {
    render(<CdnDebug />);
    
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith('Enabled:', '✅ Yes');
      expect(console.log).toHaveBeenCalledWith('CDN URL:', 'https://cdn.example.com');
    }, { timeout: 2000 });
  });

  it('should warn when CDN is not enabled', async () => {
    (getCdnStatus as any).mockReturnValue({
      enabled: false,
      url: 'Not configured',
      debug: false,
    });

    render(<CdnDebug />);
    
    await waitFor(() => {
      expect(console.warn).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  it('should clean up observers on unmount', async () => {
    const mockDisconnect = vi.fn();
    const mockObserve = vi.fn();
    
    // Create proper constructor functions for observers
    class MockMutationObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
    }
    
    class MockPerformanceObserver {
      observe = mockObserve;
      disconnect = mockDisconnect;
    }
    
    global.MutationObserver = MockMutationObserver as any;
    global.PerformanceObserver = MockPerformanceObserver as any;
    
    // Enable debug mode to trigger observer creation
    (getCdnStatus as any).mockReturnValue({
      enabled: true,
      url: 'https://cdn.example.com',
      debug: true,
    });

    const { unmount } = render(<CdnDebug />);
    
    // Wait for component to mount and set up observers
    await waitFor(() => {
      expect(getCdnStatus).toHaveBeenCalled();
    });
    
    // Unmount should clean up observers
    await act(async () => {
      unmount();
      await Promise.resolve();
    });
    
    // Observers should be disconnected - the cleanup function in useEffect calls disconnect
    // Since we're using real timers now, the cleanup should happen synchronously
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
