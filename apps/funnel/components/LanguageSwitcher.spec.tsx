import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';
import { useRouter, useSearchParams } from 'next/navigation';
import { locales } from '@/i18n/config';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  useSearchParams: vi.fn(),
}));

vi.mock('@/i18n/config', () => ({
  locales: ['en', 'es', 'fr'],
}));

describe('LanguageSwitcher', () => {
  const mockPush = vi.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as any).mockReturnValue(mockSearchParams);
  });

  it('should render language buttons for all locales', () => {
    render(<LanguageSwitcher />);
    
    locales.forEach((locale) => {
      expect(screen.getByText(locale.toUpperCase())).toBeInTheDocument();
    });
  });

  it('should highlight current language', () => {
    mockSearchParams.set('lang', 'es');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    const { container } = render(<LanguageSwitcher />);
    const buttons = container.querySelectorAll('button');
    
    // Find the Spanish button
    const spanishButton = Array.from(buttons).find((btn) => 
      btn.textContent === 'ES'
    );
    
    expect(spanishButton).toHaveClass('bg-primary-gradient');
  });

  it('should use default language when no lang param', () => {
    mockSearchParams.delete('lang');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    const { container } = render(<LanguageSwitcher />);
    const buttons = container.querySelectorAll('button');
    
    // English should be highlighted by default
    const englishButton = Array.from(buttons).find((btn) => 
      btn.textContent === 'EN'
    );
    
    expect(englishButton).toHaveClass('bg-primary-gradient');
  });

  it('should switch language when button clicked', () => {
    mockSearchParams.set('lang', 'en');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    render(<LanguageSwitcher />);
    
    const spanishButton = screen.getByText('ES');
    fireEvent.click(spanishButton);

    expect(mockPush).toHaveBeenCalledWith('/?lang=es');
  });

  it('should preserve other search params when switching language', () => {
    mockSearchParams.set('lang', 'en');
    mockSearchParams.set('utm_source', 'test');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    render(<LanguageSwitcher />);
    
    const spanishButton = screen.getByText('ES');
    fireEvent.click(spanishButton);

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('utm_source=test'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('lang=es'));
  });

  it('should not switch when searchParams is null', () => {
    (useSearchParams as any).mockReturnValue(null);

    render(<LanguageSwitcher />);
    
    const spanishButton = screen.getByText('ES');
    fireEvent.click(spanishButton);

    expect(mockPush).not.toHaveBeenCalled();
  });
});
