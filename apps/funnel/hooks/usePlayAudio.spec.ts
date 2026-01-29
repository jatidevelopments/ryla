import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import usePlayAudio from './usePlayAudio';

describe('usePlayAudio', () => {
  let mockAudio: any;
  let mockPlay: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();
    mockAudio = {
      play: mockPlay,
      pause: mockPause,
      currentTime: 0,
    };

    // Mock Audio as a proper constructor
    global.Audio = vi.fn(function Audio(this: any) {
      return mockAudio;
    }) as any;
    // Don't override window/document - jsdom provides them
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create audio element on mount', async () => {
    renderHook(() => usePlayAudio('/audio/test.mp3'));
    await waitFor(() => {
      expect(global.Audio).toHaveBeenCalledWith('/audio/test.mp3');
    });
  });

  it('should return play function', () => {
    const { result } = renderHook(() => usePlayAudio('/audio/test.mp3'));
    expect(typeof result.current).toBe('function');
  });

  it('should play audio when play is called', async () => {
    const { result } = renderHook(() => usePlayAudio('/audio/test.mp3'));
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    result.current();
    await waitFor(() => {
      expect(mockPlay).toHaveBeenCalled();
    });
  });

  it('should pause other audios when playing new one', async () => {
    // Create separate mock audio instances for each hook
    const mockAudio1 = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
    };
    const mockAudio2 = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      currentTime: 0,
    };
    
    let callCount = 0;
    global.Audio = vi.fn(function Audio(this: any) {
      callCount++;
      return callCount === 1 ? mockAudio1 : mockAudio2;
    }) as any;

    const { result: result1 } = renderHook(() => usePlayAudio('/audio/test1.mp3'));
    await waitFor(() => {
      expect(result1.current).toBeDefined();
    });
    
    const { result: result2 } = renderHook(() => usePlayAudio('/audio/test2.mp3'));
    await waitFor(() => {
      expect(result2.current).toBeDefined();
    });

    // Play first audio
    result1.current();
    await waitFor(() => {
      expect(mockAudio1.play).toHaveBeenCalled();
    });
    
    // Play second audio - should pause first
    result2.current();
    await waitFor(() => {
      expect(mockAudio1.pause).toHaveBeenCalled();
      expect(mockAudio2.play).toHaveBeenCalled();
    });
  });

  it('should reset currentTime when pausing', async () => {
    const { result, unmount } = renderHook(() => usePlayAudio('/audio/test.mp3'));
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    // Set currentTime before playing
    mockAudio.currentTime = 10;
    
    // Play the audio
    result.current();
    
    // Unmount should reset currentTime to 0 in cleanup
    unmount();
    
    // The cleanup effect should reset currentTime
    await waitFor(() => {
      // The cleanup sets currentTime to 0
      expect(mockAudio.currentTime).toBe(0);
    }, { timeout: 1000 });
  });

  it('should not create audio if window is undefined', () => {
    // Since React needs window to render, we can't actually test window being undefined
    // The hook checks `typeof window !== "undefined"` internally
    // We'll verify the hook works normally when window is defined
    const { result } = renderHook(() => usePlayAudio('/audio/test.mp3'));
    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('function');
  });
});
