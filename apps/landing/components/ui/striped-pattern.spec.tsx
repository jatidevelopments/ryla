import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StripedPattern } from './striped-pattern';

describe('StripedPattern', () => {
  it('should render component', () => {
    const { container } = render(<StripedPattern />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<StripedPattern className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
