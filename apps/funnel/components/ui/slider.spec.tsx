import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Slider } from './slider';

vi.mock('@radix-ui/react-slider', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="slider-root" {...props}>{children}</div>,
  Track: ({ children, ...props }: any) => <div data-testid="slider-track" {...props}>{children}</div>,
  Range: (props: any) => <div data-testid="slider-range" {...props} />,
  Thumb: (props: any) => <div data-testid="slider-thumb" {...props} />,
}));

describe('Slider', () => {
  it('should render Slider', () => {
    render(<Slider />);
    expect(screen.getByTestId('slider-root')).toBeInTheDocument();
  });

  it('should render slider track and range', () => {
    render(<Slider />);
    expect(screen.getByTestId('slider-track')).toBeInTheDocument();
    expect(screen.getByTestId('slider-range')).toBeInTheDocument();
  });

  it('should render thumb for default value', () => {
    render(<Slider defaultValue={[50]} />);
    const thumbs = screen.getAllByTestId('slider-thumb');
    expect(thumbs.length).toBeGreaterThan(0);
  });

  it('should render multiple thumbs for array value', () => {
    render(<Slider value={[20, 80]} />);
    const thumbs = screen.getAllByTestId('slider-thumb');
    expect(thumbs).toHaveLength(2);
  });

  it('should apply custom className', () => {
    const { container } = render(<Slider className="custom-class" />);
    const slider = container.querySelector('[data-slot="slider"]');
    expect(slider).toHaveClass('custom-class');
  });

  it('should use min and max props', () => {
    render(<Slider min={0} max={100} />);
    const slider = screen.getByTestId('slider-root');
    expect(slider).toHaveAttribute('min', '0');
    expect(slider).toHaveAttribute('max', '100');
  });
});
