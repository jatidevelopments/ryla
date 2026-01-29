import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { EntryPageStructuredData } from './EntryPageStructuredData';
import { StructuredData } from './StructuredData';
import { withCdn } from '@/lib/cdn';

vi.mock('./StructuredData', () => ({
  StructuredData: vi.fn(() => null),
}));

vi.mock('@/lib/cdn', () => ({
  withCdn: vi.fn((path: string) => path),
}));

describe('EntryPageStructuredData', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Don't try to redefine location.origin - jsdom already provides it
    // The component will use window.location.origin if available, or fallback to the default
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.clearAllMocks();
  });

  it('should render multiple StructuredData components', async () => {
    render(<EntryPageStructuredData />);
    
    // Should render 4 structured data components
    await waitFor(() => {
      expect(StructuredData).toHaveBeenCalledTimes(4);
    });
  });

  it('should render SoftwareApplication structured data', async () => {
    render(<EntryPageStructuredData />);
    
    await waitFor(() => {
      const calls = (StructuredData as any).mock.calls;
      const softwareAppCall = calls.find((call: any[]) => call[0]?.id === 'software-application');
      expect(softwareAppCall).toBeTruthy();
      expect(softwareAppCall[0].data['@type']).toBe('SoftwareApplication');
    });
  });

  it('should render WebSite structured data', async () => {
    render(<EntryPageStructuredData />);
    
    await waitFor(() => {
      const calls = (StructuredData as any).mock.calls;
      const websiteCall = calls.find((call: any[]) => call[0]?.id === 'website');
      expect(websiteCall).toBeTruthy();
      expect(websiteCall[0].data['@type']).toBe('WebSite');
    });
  });

  it('should render Organization structured data', async () => {
    render(<EntryPageStructuredData />);
    
    await waitFor(() => {
      const calls = (StructuredData as any).mock.calls;
      const orgCall = calls.find((call: any[]) => call[0]?.id === 'organization');
      expect(orgCall).toBeTruthy();
      expect(orgCall[0].data['@type']).toBe('Organization');
    });
  });

  it('should render HowTo structured data', async () => {
    render(<EntryPageStructuredData />);
    
    await waitFor(() => {
      const calls = (StructuredData as any).mock.calls;
      const howToCall = calls.find((call: any[]) => call[0]?.id === 'howto');
      expect(howToCall).toBeTruthy();
      expect(howToCall[0].data['@type']).toBe('HowTo');
    });
  });

  it('should use CDN for video and logo paths', async () => {
    render(<EntryPageStructuredData />);
    
    await waitFor(() => {
      expect(withCdn).toHaveBeenCalledWith('/video/ai_influencer_video_1.mp4');
      expect(withCdn).toHaveBeenCalledWith('/favicon/android-chrome-512x512.png');
    });
  });
});
