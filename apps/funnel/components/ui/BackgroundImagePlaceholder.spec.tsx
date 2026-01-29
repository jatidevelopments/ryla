import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BackgroundImagePlaceholder } from './BackgroundImagePlaceholder';

describe('BackgroundImagePlaceholder', () => {
  it('should render placeholder with description', () => {
    render(<BackgroundImagePlaceholder description="Background image needed" />);
    expect(screen.getByText('Background image needed')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BackgroundImagePlaceholder description="Test" className="custom-class" />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveClass('custom-class');
  });

  it('should use default width and height', () => {
    const { container } = render(
      <BackgroundImagePlaceholder description="Test" />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveStyle({ width: '400px', height: '400px' });
  });

  it('should use custom width and height', () => {
    const { container } = render(
      <BackgroundImagePlaceholder description="Test" width={800} height={600} />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveStyle({ width: '800px', height: '600px' });
  });

  it('should render icon placeholder', () => {
    const { container } = render(
      <BackgroundImagePlaceholder description="Test" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
