import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as React from 'react';
import { useStudioFilters } from './use-studio-filters';
import type { StudioImage } from '../../components/studio/studio-image-card';

// Mock useLocalStorage to use actual React state
vi.mock('./use-local-storage', () => {
  const React = require('react');
  return {
    useLocalStorage: (key: string, initialValue: any) => {
      const [value, setValue] = React.useState(() => {
        if (typeof window === 'undefined') return initialValue;
        try {
          const item = window.localStorage.getItem(key);
          return item ? JSON.parse(item) : initialValue;
        } catch {
          return initialValue;
        }
      });

      const setter = React.useCallback((newValue: any) => {
        const finalValue = typeof newValue === 'function' ? newValue(value) : newValue;
        setValue(finalValue);
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(finalValue));
          } catch {
            // Ignore errors
          }
        }
      }, [key, value]);

      return [value, setter];
    },
  };
});

describe('useStudioFilters', () => {
  const mockImages: StudioImage[] = [
    {
      id: 'img-1',
      url: 'https://example.com/img1.jpg',
      thumbnailUrl: 'https://example.com/img1-thumb.jpg',
      prompt: 'A beautiful beach scene',
      influencerName: 'Influencer 1',
      scene: 'beach',
      environment: 'outdoor',
      aspectRatio: '16:9',
      status: 'completed',
      createdAt: '2024-01-01T00:00:00Z',
      isLiked: false,
      nsfw: false,
    },
    {
      id: 'img-2',
      url: 'https://example.com/img2.jpg',
      thumbnailUrl: 'https://example.com/img2-thumb.jpg',
      prompt: 'A cozy indoor scene',
      influencerName: 'Influencer 2',
      scene: 'indoor',
      environment: 'cozy',
      aspectRatio: '9:16',
      status: 'completed',
      createdAt: '2024-01-02T00:00:00Z',
      isLiked: true,
      nsfw: false,
    },
    {
      id: 'img-3',
      url: 'https://example.com/img3.jpg',
      thumbnailUrl: 'https://example.com/img3-thumb.jpg',
      prompt: 'Another beach scene',
      influencerName: 'Influencer 1',
      scene: 'beach',
      environment: 'outdoor',
      aspectRatio: '16:9',
      status: 'pending',
      createdAt: '2024-01-03T00:00:00Z',
      isLiked: false,
      nsfw: true,
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useStudioFilters());

    expect(result.current.viewMode).toBe('grid');
    expect(result.current.aspectRatios).toEqual([]);
    expect(result.current.status).toBe('all');
    expect(result.current.liked).toBe('all');
    expect(result.current.adult).toBe('all');
    expect(result.current.sortBy).toBe('newest');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.showPanel).toBe(true);
  });

  it('should filter by search query', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setSearchQuery('beach');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((img) => img.prompt?.toLowerCase().includes('beach') || img.scene?.toLowerCase().includes('beach'))).toBe(true);
  });

  it('should filter by aspect ratio', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setAspectRatios(['16:9']);
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((img) => img.aspectRatio === '16:9')).toBe(true);
  });

  it('should filter by status', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setStatus('completed');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((img) => img.status === 'completed')).toBe(true);
  });

  it('should filter by liked', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setLiked('liked');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].isLiked).toBe(true);
  });

  it('should filter by not-liked', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setLiked('not-liked');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((img) => !img.isLiked)).toBe(true);
  });

  it('should filter by adult content', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setAdult('not-adult');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(2);
    expect(filtered.every((img) => !img.nsfw)).toBe(true);
  });

  it('should filter by adult content only', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setAdult('adult');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].nsfw).toBe(true);
  });

  it('should sort by newest', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setSortBy('newest');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered[0].id).toBe('img-3');
    expect(filtered[1].id).toBe('img-2');
    expect(filtered[2].id).toBe('img-1');
  });

  it('should sort by oldest', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setSortBy('oldest');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered[0].id).toBe('img-1');
    expect(filtered[1].id).toBe('img-2');
    expect(filtered[2].id).toBe('img-3');
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setSearchQuery('beach');
      result.current.setAspectRatios(['16:9']);
      result.current.setStatus('completed');
    });

    const filtered = result.current.filterImages(mockImages);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe('img-1');
  });

  it('should reset all filters', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setAspectRatios(['16:9']);
      result.current.setStatus('completed');
      result.current.setLiked('liked');
      result.current.setAdult('not-adult');
      result.current.setSortBy('oldest');
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.aspectRatios).toEqual([]);
    expect(result.current.status).toBe('all');
    expect(result.current.liked).toBe('all');
    expect(result.current.adult).toBe('all');
    expect(result.current.sortBy).toBe('newest');
  });

  it('should update view mode', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setViewMode('list');
    });

    expect(result.current.viewMode).toBe('list');
  });

  it('should update show panel', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setShowPanel(false);
    });

    expect(result.current.showPanel).toBe(false);
  });

  it('should handle aspect ratio with function updater', () => {
    const { result } = renderHook(() => useStudioFilters());

    act(() => {
      result.current.setAspectRatios(['16:9']);
    });

    act(() => {
      result.current.setAspectRatios((prev) => [...prev, '9:16']);
    });

    expect(result.current.aspectRatios).toEqual(['16:9', '9:16']);
  });

  it('should migrate old string format to array format', () => {
    // Simulate old localStorage format
    localStorage.setItem('ryla-gallery-aspect-ratio', JSON.stringify('16:9'));

    const { result } = renderHook(() => useStudioFilters());

    // Should migrate to array format (now uses useEffect instead of setTimeout)
    expect(Array.isArray(result.current.aspectRatios)).toBe(true);
    expect(result.current.aspectRatios).toEqual(['16:9']);
  });
});
