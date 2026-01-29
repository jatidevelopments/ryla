import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SafeSpriteIcon } from './SafeSpriteIcon';
import SpriteIcon from '@/components/SpriteIcon/SpriteIcon';
import { OptionImagePlaceholder } from './OptionImagePlaceholder';

vi.mock('@/components/SpriteIcon/SpriteIcon', () => ({
  default: ({ src, ...props }: any) => (
    src ? <div data-testid="sprite-icon" data-src={src} {...props} /> : null
  ),
}));

vi.mock('./OptionImagePlaceholder', () => ({
  OptionImagePlaceholder: ({ description }: any) => (
    <div data-testid="placeholder">{description}</div>
  ),
}));

describe('SafeSpriteIcon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render SpriteIcon when src is provided', () => {
    render(
      <SafeSpriteIcon
        src="/test.jpg"
        targetW={100}
        targetH={100}
        fallbackAlt="Test"
      />
    );
    
    expect(screen.getByTestId('sprite-icon')).toBeInTheDocument();
  });

  it('should render placeholder when src is empty', () => {
    render(
      <SafeSpriteIcon
        src=""
        targetW={100}
        targetH={100}
        fallbackAlt="Test"
      />
    );
    
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });

  it('should render placeholder when src is not provided', () => {
    render(
      <SafeSpriteIcon
        targetW={100}
        targetH={100}
        fallbackAlt="Test"
      />
    );
    
    expect(screen.getByTestId('placeholder')).toBeInTheDocument();
  });

  it('should render placeholder when SpriteIcon returns null', async () => {
    // Mock SpriteIcon to return null (image not found)
    vi.mocked(SpriteIcon).mockReturnValue(null);
    
    render(
      <SafeSpriteIcon
        src="/non-existent.jpg"
        targetW={100}
        targetH={100}
        fallbackAlt="Test"
      />
    );
    
    vi.advanceTimersByTime(100);
    
    await waitFor(() => {
      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    });
  });

  it('should use description for placeholder', () => {
    render(
      <SafeSpriteIcon
        src=""
        targetW={100}
        targetH={100}
        description="Custom description"
      />
    );
    
    expect(screen.getByText('Custom description')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SafeSpriteIcon
        src="/test.jpg"
        targetW={100}
        targetH={100}
        className="custom-class"
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should set width and height when center is false', () => {
    const { container } = render(
      <SafeSpriteIcon
        src="/test.jpg"
        targetW={200}
        targetH={150}
        center={false}
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '200px', height: '150px' });
  });

  it('should set 100% width and height when center is true', () => {
    const { container } = render(
      <SafeSpriteIcon
        src="/test.jpg"
        targetW={200}
        targetH={150}
        center={true}
      />
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveStyle({ width: '100%', height: '100%' });
  });
});
