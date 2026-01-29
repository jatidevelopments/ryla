import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Toaster } from './sonner';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

vi.mock('sonner', () => ({
  Toaster: vi.fn(({ children, ...props }: any) => <div data-testid="sonner-toaster" {...props}>{children}</div>),
}));

describe('Toaster', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Sonner Toaster', () => {
    (useTheme as any).mockReturnValue({ theme: 'dark' });
    
    render(<Toaster />);
    
    expect(Sonner).toHaveBeenCalled();
    expect(useTheme).toHaveBeenCalled();
  });

  it('should pass theme from useTheme', () => {
    (useTheme as any).mockReturnValue({ theme: 'light' });
    
    render(<Toaster />);
    
    const callArgs = (Sonner as any).mock.calls[(Sonner as any).mock.calls.length - 1][0];
    expect(callArgs.theme).toBe('light');
  });

  it('should use system theme as default', () => {
    (useTheme as any).mockReturnValue({ theme: 'system' });
    
    render(<Toaster />);
    
    const callArgs = (Sonner as any).mock.calls[(Sonner as any).mock.calls.length - 1][0];
    expect(callArgs.theme).toBe('system');
  });

  it('should apply custom styles', () => {
    (useTheme as any).mockReturnValue({ theme: 'dark' });
    
    render(<Toaster />);
    
    const callArgs = (Sonner as any).mock.calls[(Sonner as any).mock.calls.length - 1][0];
    expect(callArgs.style).toHaveProperty('--normal-bg');
    expect(callArgs.className).toBe('toaster group');
  });
});
