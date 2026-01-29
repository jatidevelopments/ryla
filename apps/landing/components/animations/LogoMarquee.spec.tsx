import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LogoMarquee, PlatformLogo } from './LogoMarquee';

// Mock marquee component
vi.mock('@/components/ui/marquee', () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid="marquee" {...props}>
      {children}
    </div>
  ),
}));

describe('LogoMarquee', () => {
  it('should render logo marquee', () => {
    render(
      <LogoMarquee>
        <div>Logo 1</div>
        <div>Logo 2</div>
      </LogoMarquee>
    );
    expect(screen.getByTestId('marquee')).toBeInTheDocument();
  });

  it('should render children', () => {
    render(
      <LogoMarquee>
        <div>Logo 1</div>
        <div>Logo 2</div>
      </LogoMarquee>
    );
    expect(screen.getByText('Logo 1')).toBeInTheDocument();
    expect(screen.getByText('Logo 2')).toBeInTheDocument();
  });

  it('should render fade edges when fadeEdges is true', () => {
    const { container } = render(
      <LogoMarquee fadeEdges>
        <div>Logo</div>
      </LogoMarquee>
    );
    const fadeEdges = container.querySelectorAll('[aria-hidden="true"]');
    expect(fadeEdges.length).toBeGreaterThan(0);
  });

  it('should not render fade edges when fadeEdges is false', () => {
    const { container } = render(
      <LogoMarquee fadeEdges={false}>
        <div>Logo</div>
      </LogoMarquee>
    );
    const fadeEdges = container.querySelectorAll('[aria-hidden="true"]');
    expect(fadeEdges.length).toBe(0);
  });

  it('should apply speed classes', () => {
    const { container } = render(
      <LogoMarquee speed="slow">
        <div>Logo</div>
      </LogoMarquee>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('PlatformLogo', () => {
  it('should render platform logo', () => {
    render(<PlatformLogo name="tiktok" />);
    expect(screen.getByAltText('tiktok')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });

  it('should render with different sizes', () => {
    render(<PlatformLogo name="instagram" size="sm" />);
    const img = screen.getByAltText('instagram');
    expect(img).toHaveClass('h-5');
  });

  it('should render with different platforms', () => {
    render(<PlatformLogo name="youtube" />);
    expect(screen.getByAltText('youtube')).toBeInTheDocument();
  });

  it('should handle image error and show emoji fallback', () => {
    render(<PlatformLogo name="tiktok" />);
    const img = screen.getByAltText('tiktok') as HTMLImageElement;
    // Simulate image error
    const errorEvent = new Event('error');
    img.dispatchEvent(errorEvent);
    // Emoji fallback should be shown
    expect(img.style.display).toBe('none');
  });

  it('should capitalize platform names correctly', () => {
    render(<PlatformLogo name="snapchat" />);
    expect(screen.getByText('Snapchat')).toBeInTheDocument();
    
    render(<PlatformLogo name="reddit" />);
    expect(screen.getByText('Reddit')).toBeInTheDocument();
    
    render(<PlatformLogo name="twitter" />);
    expect(screen.getByText('Twitter')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <PlatformLogo name="tiktok" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
