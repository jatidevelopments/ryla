import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrentLocale } from './useCurrentLocale';
import { useSearchParams } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

describe('useCurrentLocale', () => {
  it('should return default locale when no URL param', () => {
    (useSearchParams as any).mockReturnValue({
      get: () => null,
    });

    const { result } = renderHook(() => useCurrentLocale());
    expect(result.current.locale).toBe('en');
    expect(result.current.localeFromUrl).toBeNull();
    expect(result.current.isEnglish).toBe(true);
  });

  it('should return locale from URL param', () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'lang' ? 'es' : null),
    });

    const { result } = renderHook(() => useCurrentLocale());
    expect(result.current.locale).toBe('es');
    expect(result.current.localeFromUrl).toBe('es');
    expect(result.current.isSpanish).toBe(true);
  });

  it('should detect French locale', () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'lang' ? 'fr' : null),
    });

    const { result } = renderHook(() => useCurrentLocale());
    expect(result.current.locale).toBe('fr');
    expect(result.current.isFrench).toBe(true);
  });

  it('should return correct locale flags', () => {
    (useSearchParams as any).mockReturnValue({
      get: (key: string) => (key === 'lang' ? 'es' : null),
    });

    const { result } = renderHook(() => useCurrentLocale());
    expect(result.current.isEnglish).toBe(false);
    expect(result.current.isSpanish).toBe(true);
    expect(result.current.isFrench).toBe(false);
  });
});
