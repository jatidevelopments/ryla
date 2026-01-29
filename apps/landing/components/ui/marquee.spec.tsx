import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Marquee from './marquee';

describe('Marquee', () => {
  it('should render marquee', () => {
    render(
      <Marquee>
        <div>Item 1</div>
        <div>Item 2</div>
      </Marquee>
    );
    // Marquee repeats children (default repeat=4), so use getAllByText
    const items = screen.getAllByText('Item 1');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should render children multiple times based on repeat prop', () => {
    render(
      <Marquee repeat={2}>
        <div>Item</div>
      </Marquee>
    );
    const items = screen.getAllByText('Item');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Marquee className="custom-class">
        <div>Item</div>
      </Marquee>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle reverse prop', () => {
    const { container } = render(
      <Marquee reverse>
        <div>Item</div>
      </Marquee>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle vertical prop', () => {
    const { container } = render(
      <Marquee vertical>
        <div>Item</div>
      </Marquee>
    );
    expect(container.firstChild).toHaveClass('flex-col');
  });
});
