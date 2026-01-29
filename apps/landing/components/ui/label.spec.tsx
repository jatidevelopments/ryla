import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

// Mock @radix-ui/react-label
vi.mock('@radix-ui/react-label', () => {
  const React = require('react');
  return {
    Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <label ref={ref} {...props}>{children}</label>
    )),
  };
});

describe('Label', () => {
  it('should render label', () => {
    render(<Label>Label Text</Label>);
    expect(screen.getByText('Label Text')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Label className="custom">Label</Label>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should be associated with form control', () => {
    render(
      <div>
        <Label htmlFor="input">Label</Label>
        <input id="input" />
      </div>
    );
    const label = screen.getByText('Label');
    expect(label).toHaveAttribute('for', 'input');
  });
});
