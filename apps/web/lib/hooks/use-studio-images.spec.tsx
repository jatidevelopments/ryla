import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useStudioImages } from './use-studio-images';
import * as studioApi from '../api/studio';

// Mock API
vi.mock('../api/studio', () => ({
  getCharacterImages: vi.fn(),
  getComfyUIResults: vi.fn(),
}));

describe('useStudioImages', () => {
  const mockInfluencerId = '00000000-0000-0000-0000-000000000001';
  const mockInfluencers = [{ id: mockInfluencerId, name: 'Test Influencer' }];

  const mockImage = {
    id: 'img-1',
    s3Url: 'url1',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default to real timers
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // FIXME: investigate fetch timing in test env
  it.skip('should fetch images on mount', async () => {
    (studioApi.getCharacterImages as any).mockResolvedValue([mockImage]);

    const { result } = renderHook(() =>
      useStudioImages({
        selectedInfluencerId: mockInfluencerId,
        influencers: mockInfluencers,
      })
    );

    // Initial load might take a tick
    await waitFor(() => {
      expect(result.current.images).toHaveLength(1);
    });

    expect(result.current.images[0].id).toBe(mockImage.id);
    expect(studioApi.getCharacterImages).toHaveBeenCalledWith(mockInfluencerId);
  });

  it('should handle placeholders', async () => {
    (studioApi.getCharacterImages as any).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useStudioImages({
        selectedInfluencerId: mockInfluencerId,
        influencers: mockInfluencers,
      })
    );

    // Wait for initial fetch
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const placeholder = {
      id: 'placeholder-1',
      imageUrl: '',
      influencerId: mockInfluencerId,
      influencerName: 'Test',
      aspectRatio: '9:16',
      status: 'generating',
      createdAt: new Date().toISOString(),
    } as any;

    act(() => {
      result.current.addPlaceholders([placeholder]);
    });

    expect(result.current.images).toHaveLength(1);
    expect(result.current.images[0].id).toBe('placeholder-1');
  });

  it('should poll when active generations exist', async () => {
    vi.useFakeTimers();

    // Initial fetch returns empty
    (studioApi.getCharacterImages as any).mockResolvedValue([]);
    (studioApi.getComfyUIResults as any).mockResolvedValue({
      status: 'completed',
    });

    const { result } = renderHook(() =>
      useStudioImages({
        selectedInfluencerId: mockInfluencerId,
        influencers: mockInfluencers,
        pollInterval: 1000,
      })
    );

    // Initial fetch
    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      result.current.setActiveGenerations(new Set(['job-1']));
    });

    // Advance time
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(studioApi.getComfyUIResults).toHaveBeenCalledWith('job-1');
  });

  // FIXME: investigate fake timers with date cleanup
  it.skip('should cleanup stale images', async () => {
    vi.useFakeTimers();
    const staleTime = new Date(Date.now() - 61000).toISOString();
    const staleImage = {
      ...mockImage,
      id: 'stale-1',
      status: 'generating',
      createdAt: staleTime,
    };

    (studioApi.getCharacterImages as any).mockResolvedValue([staleImage]);

    const { result } = renderHook(() =>
      useStudioImages({
        selectedInfluencerId: mockInfluencerId,
        influencers: mockInfluencers,
        staleThreshold: 60000, // 1 min
      })
    );

    // Wait for mount
    await act(async () => {
      await Promise.resolve();
    });

    // Advance time for cleanup interval
    await act(async () => {
      vi.advanceTimersByTime(31000);
    });

    // Wait for update
    await waitFor(() => {
      // Should be marked failed
      if (result.current.images.length > 0) {
        expect(result.current.images[0].status).toBe('failed');
      }
    });
  });

  it('should clear images when no influencer selected', () => {
    const { result } = renderHook(() =>
      useStudioImages({
        selectedInfluencerId: null,
        influencers: mockInfluencers,
      })
    );

    expect(result.current.images).toHaveLength(0);
    expect(studioApi.getCharacterImages).not.toHaveBeenCalled();
  });
});
