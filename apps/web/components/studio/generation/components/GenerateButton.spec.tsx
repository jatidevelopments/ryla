import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { GenerateButton } from './GenerateButton';

// Mock Tooltip
vi.mock('../../../ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

vi.mock('@ryla/ui', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

describe('GenerateButton', () => {
  const defaultProps = {
    mode: 'creating' as const,
    canGenerate: true,
    creditsCost: 5,
    onGenerate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correct label for modes', () => {
    const { rerender } = render(
      <GenerateButton {...defaultProps} mode="creating" />
    );
    expect(screen.getByText('Generate')).toBeInTheDocument();

    rerender(<GenerateButton {...defaultProps} mode="editing" />);
    expect(screen.getByText('Edit')).toBeInTheDocument();

    rerender(<GenerateButton {...defaultProps} mode="upscaling" />);
    expect(screen.getByText('Upscale')).toBeInTheDocument();

    rerender(<GenerateButton {...defaultProps} mode="variations" />);
    expect(screen.getByText('Create Variations')).toBeInTheDocument();
  });

  it('should show credits cost', () => {
    render(<GenerateButton {...defaultProps} creditsCost={10} />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should be disabled if canGenerate is false', () => {
    render(<GenerateButton {...defaultProps} canGenerate={false} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    // Check tooltip content
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toHaveAttribute(
      'title',
      'Select an influencer and ensure you have enough credits'
    );
  });

  it('should call onGenerate when clicked', () => {
    render(<GenerateButton {...defaultProps} />);
    fireEvent.click(screen.getByText('Generate'));
    expect(defaultProps.onGenerate).toHaveBeenCalled();
  });

  it('should not call onGenerate when disabled', () => {
    render(<GenerateButton {...defaultProps} canGenerate={false} />);
    fireEvent.click(screen.getByText('Generate'));
    expect(defaultProps.onGenerate).not.toHaveBeenCalled();
  });
});
