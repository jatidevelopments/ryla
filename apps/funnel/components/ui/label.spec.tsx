import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from './label';

describe('Label', () => {
  it('should render label with children', () => {
    render(<Label>Email</Label>);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Label className="custom-class">Test</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveClass('custom-class');
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Label>Test</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('data-slot', 'label');
  });

  it('should support htmlFor attribute', () => {
    const { container } = render(<Label htmlFor="email-input">Email</Label>);
    const label = container.querySelector('label');
    expect(label).toHaveAttribute('for', 'email-input');
  });
});
