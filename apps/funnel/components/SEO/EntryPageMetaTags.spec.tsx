import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { EntryPageMetaTags } from './EntryPageMetaTags';
import { withCdn } from '@/lib/cdn';

vi.mock('@/lib/cdn', () => ({
  withCdn: vi.fn((path: string) => path),
}));

describe('EntryPageMetaTags', () => {
  let createElementSpy: ReturnType<typeof vi.spyOn>;
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let querySelectorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Don't override document - jsdom provides it
    // Just spy on the methods we need
    createElementSpy = vi.spyOn(document, 'createElement');
    appendChildSpy = vi.spyOn(document.head, 'appendChild');
    querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('should not render anything', async () => {
    const { container } = render(<EntryPageMetaTags />);
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
  });

  it('should set meta tags on mount', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      expect(createElementSpy).toHaveBeenCalledWith('meta');
      expect(appendChildSpy).toHaveBeenCalled();
    });
  });

  it('should set description meta tag', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      // Should create meta tags
      expect(createElementSpy).toHaveBeenCalledWith('meta');
      // Should query for description meta tag
      expect(querySelectorSpy).toHaveBeenCalledWith('meta[name="description"]');
    });
  });

  it('should set Open Graph meta tags', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      // Should query for og:title meta tag
      expect(querySelectorSpy).toHaveBeenCalledWith('meta[property="og:title"]');
      expect(createElementSpy).toHaveBeenCalled();
    });
  });

  it('should set Twitter Card meta tags', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      // Should query for twitter:card meta tag
      expect(querySelectorSpy).toHaveBeenCalledWith('meta[name="twitter:card"]');
      expect(createElementSpy).toHaveBeenCalled();
    });
  });

  it('should create canonical link', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      // Should query for canonical link
      expect(querySelectorSpy).toHaveBeenCalledWith('link[rel="canonical"]');
      expect(createElementSpy).toHaveBeenCalledWith('link');
    });
  });

  it('should use CDN for video URL', async () => {
    render(<EntryPageMetaTags />);
    
    await waitFor(() => {
      expect(withCdn).toHaveBeenCalledWith('/video/ai_influencer_video_1.mp4');
    });
  });
});
