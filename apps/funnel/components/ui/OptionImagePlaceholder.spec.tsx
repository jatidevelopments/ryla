import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OptionImagePlaceholder } from './OptionImagePlaceholder';

describe('OptionImagePlaceholder', () => {
  it('should render placeholder with description', () => {
    render(<OptionImagePlaceholder description="Image needed" />);
    expect(screen.getByText('Image needed')).toBeInTheDocument();
  });

  it('should render label when provided', () => {
    render(<OptionImagePlaceholder description="Image needed" label="Test Label" />);
    expect(screen.getByText('Test Label')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <OptionImagePlaceholder description="Test" className="custom-class" />
    );
    const placeholder = container.firstChild as HTMLElement;
    expect(placeholder).toHaveClass('custom-class');
  });

  it('should render without label', () => {
    render(<OptionImagePlaceholder description="Image needed" />);
    expect(screen.getByText('Image needed')).toBeInTheDocument();
  });
});
