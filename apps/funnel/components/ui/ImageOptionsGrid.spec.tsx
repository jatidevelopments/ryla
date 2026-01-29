import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ImageOptionsGrid } from './ImageOptionsGrid';
import { calculateGridLayout, getGridColumnsClass } from '@/utils/layout/calculateGridLayout';

vi.mock('@/utils/layout/calculateGridLayout', () => ({
  calculateGridLayout: vi.fn((count) => ({ columns: 3, rows: 2 })),
  getGridColumnsClass: vi.fn(() => 'grid-cols-3'),
}));

describe('ImageOptionsGrid', () => {
  const mockOptions = [
    { id: '1', value: 'option1', image: { src: '/img1.jpg', alt: 'Option 1' } },
    { id: '2', value: 'option2', image: { src: '/img2.jpg', alt: 'Option 2' } },
    { id: '3', value: 'option3', image: { src: '/img3.jpg', alt: 'Option 3' } },
  ];

  const mockRenderOption = vi.fn((option) => (
    <div key={option.id} data-testid={`option-${option.id}`}>
      {option.value}
    </div>
  ));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render grid with options', () => {
    render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
      />
    );

    expect(screen.getByTestId('option-1')).toBeInTheDocument();
    expect(screen.getByTestId('option-2')).toBeInTheDocument();
    expect(screen.getByTestId('option-3')).toBeInTheDocument();
  });

  it('should calculate grid layout based on options count', () => {
    render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
      />
    );

    expect(calculateGridLayout).toHaveBeenCalledWith(3);
  });

  it('should apply grid columns class', () => {
    const { container } = render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-3');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
        className="custom-class"
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('custom-class');
  });

  it('should apply gap classes', () => {
    const { container } = render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
        gap="lg"
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('gap-6');
  });

  it('should call renderOption for each option', () => {
    render(
      <ImageOptionsGrid
        options={mockOptions}
        renderOption={mockRenderOption}
      />
    );

    expect(mockRenderOption).toHaveBeenCalledTimes(3);
    expect(mockRenderOption).toHaveBeenCalledWith(mockOptions[0], 0);
    expect(mockRenderOption).toHaveBeenCalledWith(mockOptions[1], 1);
    expect(mockRenderOption).toHaveBeenCalledWith(mockOptions[2], 2);
  });

  it('should handle empty options array', () => {
    const { container } = render(
      <ImageOptionsGrid
        options={[]}
        renderOption={mockRenderOption}
      />
    );

    const grid = container.querySelector('.grid');
    expect(grid).toBeInTheDocument();
    expect(mockRenderOption).not.toHaveBeenCalled();
  });
});
