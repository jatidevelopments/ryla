import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpriteIcon from './SpriteIcon';
import { SPRITE_ITEMS, SPRITE_URL } from '@/constants/sprite';
import { withCdn } from '@/lib/cdn';

vi.mock('@/constants/sprite', () => ({
  SPRITE_ITEMS: [
    { id: 'test-icon', x: 0, y: 0, w: 100, h: 100, title: 'Test Icon' },
  ],
  SPRITE_URL: '/sprite.png',
  SPRITE_W: 1000,
  SPRITE_H: 1000,
}));

vi.mock('@/lib/cdn', () => ({
  withCdn: vi.fn((url: string) => url),
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} data-testid="fallback-image" {...props} />
  ),
}));

describe('SpriteIcon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render sprite icon when item found', () => {
    const { container } = render(
      <SpriteIcon id="test-icon" size={50} />
    );
    
    const icon = container.querySelector('[role="img"]');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-label', 'Test Icon');
  });

  it('should render fallback image when item not found', () => {
    render(
      <SpriteIcon id="non-existent" src="/fallback.jpg" size={50} />
    );
    
    const image = screen.getByTestId('fallback-image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/fallback.jpg');
  });

  it('should use src to derive id when id not provided', () => {
    const { container } = render(
      <SpriteIcon src="/images/test-icon.jpg" size={50} />
    );
    
    const icon = container.querySelector('[role="img"]');
    expect(icon).toBeInTheDocument();
  });

  it('should support targetW and targetH instead of size', () => {
    const { container } = render(
      <SpriteIcon id="test-icon" targetW={100} targetH={150} />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '100px', height: '150px' });
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SpriteIcon id="test-icon" size={50} className="custom-class" />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should apply imageClassName', () => {
    const { container } = render(
      <SpriteIcon id="test-icon" size={50} imageClassName="image-class" />
    );
    
    const icon = container.querySelector('[role="img"]');
    expect(icon).toHaveClass('image-class');
  });

  it('should use title prop', () => {
    const { container } = render(
      <SpriteIcon id="test-icon" size={50} title="Custom Title" />
    );
    
    const icon = container.querySelector('[role="img"]');
    expect(icon).toHaveAttribute('title', 'Custom Title');
  });

  it('should return null when no fallback and item not found', () => {
    const { container } = render(
      <SpriteIcon id="non-existent" />
    );
    
    expect(container.firstChild).toBeNull();
  });
});
