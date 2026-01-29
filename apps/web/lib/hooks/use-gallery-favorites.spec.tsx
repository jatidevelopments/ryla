import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGalleryFavorites } from './use-gallery-favorites';
import { trpc } from '../trpc';

// Mock TRPC
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseUtils = vi.fn();

vi.mock('../trpc', () => ({
  trpc: {
    galleryFavorites: {
      getFavoriteIds: {
        useQuery: (opts: any, config?: any) => mockUseQuery(opts, config),
      },
      toggleFavorite: {
        useMutation: (opts: any) => mockUseMutation(opts),
      },
      getFavorites: {
        invalidate: vi.fn(),
      },
    },
    useUtils: () => mockUseUtils(),
  },
}));

describe('useGalleryFavorites', () => {
  const mockUtils = {
    galleryFavorites: {
      getFavoriteIds: {
        invalidate: vi.fn(),
      },
      getFavorites: {
        invalidate: vi.fn(),
      },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUtils.mockReturnValue(mockUtils);
    mockUseQuery.mockReturnValue({
      data: { favoriteIds: ['item-1', 'item-2'] },
      isLoading: false,
    });
    mockUseMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
      isPending: false,
    });
  });

  it('should initialize with favorite IDs from query', () => {
    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    expect(result.current.favoriteIds).toEqual(new Set(['item-1', 'item-2']));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isToggling).toBe(false);
  });

  it('should return empty set if no favorites data', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    expect(result.current.favoriteIds).toEqual(new Set());
  });

  it('should check if item is favorited', () => {
    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    expect(result.current.isFavorited('item-1')).toBe(true);
    expect(result.current.isFavorited('item-2')).toBe(true);
    expect(result.current.isFavorited('item-3')).toBe(false);
  });

  it('should toggle favorite and invalidate queries', async () => {
    const mockMutateAsync = vi.fn().mockResolvedValue(undefined);
    const mockOnSuccess = vi.fn();
    
    mockUseMutation.mockImplementation((opts: any) => {
      // Call onSuccess immediately when mutation is created
      if (opts?.onSuccess) {
        opts.onSuccess();
      }
      return {
        mutateAsync: mockMutateAsync,
        isPending: false,
      };
    });

    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    await act(async () => {
      await result.current.toggleFavorite('item-3');
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      itemType: 'pose',
      itemId: 'item-3',
    });
    expect(mockUtils.galleryFavorites.getFavoriteIds.invalidate).toHaveBeenCalledWith({
      itemType: 'pose',
    });
    expect(mockUtils.galleryFavorites.getFavorites.invalidate).toHaveBeenCalled();
  });

  it('should respect enabled option', () => {
    let capturedConfig: any;
    mockUseQuery.mockImplementation((opts: any, config?: any) => {
      capturedConfig = config;
      return {
        data: { favoriteIds: [] },
        isLoading: false,
      };
    });

    renderHook(() =>
      useGalleryFavorites({ itemType: 'pose', enabled: false })
    );

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.enabled).toBe(false);
  });

  it('should default enabled to true', () => {
    let capturedConfig: any;
    mockUseQuery.mockImplementation((opts: any, config?: any) => {
      capturedConfig = config;
      return {
        data: { favoriteIds: [] },
        isLoading: false,
      };
    });

    renderHook(() => useGalleryFavorites({ itemType: 'pose' }));

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.enabled).toBe(true);
  });

  it('should show loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('should show toggling state', () => {
    mockUseMutation.mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: true,
    });

    const { result } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );

    expect(result.current.isToggling).toBe(true);
  });

  it('should work with different item types', () => {
    const { result: poseResult } = renderHook(() =>
      useGalleryFavorites({ itemType: 'pose' })
    );
    const { result: styleResult } = renderHook(() =>
      useGalleryFavorites({ itemType: 'style' })
    );

    expect(poseResult.current.favoriteIds).toEqual(new Set(['item-1', 'item-2']));
    expect(styleResult.current.favoriteIds).toEqual(new Set(['item-1', 'item-2']));
  });
});
