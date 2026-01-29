import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Video } from './video';
import { withCdn } from '@/lib/cdn';

vi.mock('@/lib/cdn', () => ({
  withCdn: vi.fn((path: string) => path),
}));

describe('Video', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render video element', () => {
    render(<Video src="/test.mp4" />);
    const video = screen.getByRole('video');
    expect(video).toBeInTheDocument();
  });

  it('should apply CDN to src', () => {
    render(<Video src="/test.mp4" />);
    expect(withCdn).toHaveBeenCalledWith('/test.mp4');
  });

  it('should apply CDN to poster', () => {
    render(<Video src="/test.mp4" poster="/poster.jpg" />);
    expect(withCdn).toHaveBeenCalledWith('/poster.jpg');
  });

  it('should apply CDN to sources', () => {
    render(
      <Video
        src="/test.mp4"
        sources={[
          { src: '/test.webm', type: 'video/webm' },
          { src: '/test.ogg', type: 'video/ogg' },
        ]}
      />
    );
    expect(withCdn).toHaveBeenCalledWith('/test.webm');
    expect(withCdn).toHaveBeenCalledWith('/test.ogg');
  });

  it('should apply custom className', () => {
    const { container } = render(<Video src="/test.mp4" className="custom-class" />);
    const video = container.querySelector('video');
    expect(video).toHaveClass('custom-class');
  });

  it('should apply objectFit style', () => {
    const { container } = render(<Video src="/test.mp4" objectFit="contain" />);
    const video = container.querySelector('video');
    expect(video).toHaveStyle({ objectFit: 'contain' });
  });

  it('should apply aspectRatio style', () => {
    const { container } = render(<Video src="/test.mp4" aspectRatio="16/9" />);
    const video = container.querySelector('video');
    expect(video).toHaveStyle({ aspectRatio: '16/9' });
  });

  it('should render source elements', () => {
    const { container } = render(
      <Video
        src="/test.mp4"
        sources={[
          { src: '/test.webm', type: 'video/webm' },
        ]}
      />
    );
    const source = container.querySelector('source');
    expect(source).toBeInTheDocument();
    expect(source).toHaveAttribute('type', 'video/webm');
  });

  it('should support ref forwarding', () => {
    const ref = vi.fn();
    render(<Video src="/test.mp4" ref={ref} />);
    expect(ref).toHaveBeenCalled();
  });
});
