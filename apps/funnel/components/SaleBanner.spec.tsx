import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaleBanner from './SaleBanner';

describe('SaleBanner', () => {
  const originalSessionStorage = global.sessionStorage;

  beforeEach(() => {
    global.sessionStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as any;
  });

  afterEach(() => {
    global.sessionStorage = originalSessionStorage;
  });

  it('should render sale banner with discount text', () => {
    render(<SaleBanner />);
    expect(screen.getByText('-70%')).toBeInTheDocument();
  });

  it('should render premium text', () => {
    render(<SaleBanner />);
    // There are two elements with "Premium for" (mobile and desktop), use getAllByText
    const premiumTexts = screen.getAllByText(/Premium for/i);
    expect(premiumTexts.length).toBeGreaterThan(0);
  });

  it('should display countdown timer', () => {
    render(<SaleBanner />);
    // Countdown should be visible
    const timerElements = screen.getAllByText(/\d{2}/);
    expect(timerElements.length).toBeGreaterThan(0);
  });

  it('should initialize countdown from sessionStorage if available', () => {
    const savedTime = Date.now() - 300000; // 5 minutes ago
    (global.sessionStorage.getItem as any).mockReturnValue(savedTime.toString());

    render(<SaleBanner />);
    expect(global.sessionStorage.getItem).toHaveBeenCalledWith('countdownStart');
  });

  it('should create new countdown start if none exists', () => {
    (global.sessionStorage.getItem as any).mockReturnValue(null);

    render(<SaleBanner />);
    expect(global.sessionStorage.setItem).toHaveBeenCalledWith(
      'countdownStart',
      expect.any(String)
    );
  });
});
