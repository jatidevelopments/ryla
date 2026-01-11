import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AspectRatioFilter } from './AspectRatioFilter';
import type { AspectRatio } from '../generation/types';

// Mock Tooltip
vi.mock('../../ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

// Mock AspectRatioPicker
vi.mock('../generation/pickers/AspectRatioPicker', () => ({
  AspectRatioPicker: ({ onSelectMultiple, onClose }: any) => (
    <div data-testid="aspect-ratio-picker">
      <button onClick={() => onSelectMultiple(['9:16', '1:1'])}>
        Select Multiple
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('AspectRatioFilter', () => {
  it('should render "All" when no ratios are selected', () => {
    render(
      <AspectRatioFilter aspectRatios={[]} onAspectRatioChange={vi.fn()} />
    );
    expect(screen.getByText('All')).toBeInTheDocument();
  });

  it('should render the ratio when one is selected', () => {
    render(
      <AspectRatioFilter
        aspectRatios={['9:16']}
        onAspectRatioChange={vi.fn()}
      />
    );
    expect(screen.getByText('9:16')).toBeInTheDocument();
  });

  it('should render count when multiple are selected', () => {
    render(
      <AspectRatioFilter
        aspectRatios={['9:16', '1:1']}
        onAspectRatioChange={vi.fn()}
      />
    );
    expect(screen.getByText('2 selected')).toBeInTheDocument();
  });

  it('should toggle picker on button click', () => {
    render(
      <AspectRatioFilter aspectRatios={[]} onAspectRatioChange={vi.fn()} />
    );

    const button = screen.getByRole('button');
    expect(screen.queryByTestId('aspect-ratio-picker')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByTestId('aspect-ratio-picker')).toBeInTheDocument();

    // Test closing via picker close button (mocked)
    fireEvent.click(screen.getByText('Close'));
    expect(screen.queryByTestId('aspect-ratio-picker')).not.toBeInTheDocument();
  });

  it('should call onAspectRatioChange when selection changes', () => {
    const onAspectRatioChange = vi.fn();
    render(
      <AspectRatioFilter
        aspectRatios={[]}
        onAspectRatioChange={onAspectRatioChange}
      />
    );

    // Open picker
    fireEvent.click(screen.getByText('All'));
    // Trigger selection
    fireEvent.click(screen.getByText('Select Multiple'));

    expect(onAspectRatioChange).toHaveBeenCalledWith(['9:16', '1:1']);
  });
});
