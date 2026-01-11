import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudioGallery } from './studio-gallery';
import { StudioImage } from './studio-image-card';

// Mock dependencies
vi.mock('@ryla/ui', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

// Mock StudioImageCard to avoid testing recursion and focus on Gallery logic
vi.mock('./studio-image-card', () => ({
  StudioImageCard: ({ image, isSelected, onSelect, onOpenDetails }: any) => (
    <div
      data-testid={`image-card-${image.id}`}
      data-selected={isSelected}
      onClick={() => onSelect?.(image)}
    >
      {image.imageUrl}
    </div>
  ),
}));

describe('StudioGallery', () => {
  const mockImages: StudioImage[] = [
    {
      id: '1',
      imageUrl: 'img1.jpg',
      influencerId: 'inf1',
      influencerName: 'Inf1',
      aspectRatio: '9:16',
      status: 'completed',
      createdAt: '2023-01-01',
    },
    {
      id: '2',
      imageUrl: 'img2.jpg',
      influencerId: 'inf1',
      influencerName: 'Inf1',
      aspectRatio: '9:16',
      status: 'completed',
      createdAt: '2023-01-02',
    },
  ];

  const defaultProps = {
    images: mockImages,
    selectedImage: null,
    onSelectImage: vi.fn(),
    onOpenDetails: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    render(<StudioGallery {...defaultProps} isLoading={true} />);
    // Check for skeletons (pulse animation class or simple count)
    // The component renders 18 divs for loading
    const skeletons = screen.getAllByText('', { selector: '.animate-pulse' });
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render empty state', () => {
    render(<StudioGallery {...defaultProps} images={[]} />);
    expect(screen.getByText('No images yet')).toBeInTheDocument();
    expect(screen.getByText(/Start generating/)).toBeInTheDocument();
  });

  it('should render images in grid', () => {
    render(<StudioGallery {...defaultProps} />);
    expect(screen.getByTestId('image-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('image-card-2')).toBeInTheDocument();
  });

  it('should highlight selected image', () => {
    render(<StudioGallery {...defaultProps} selectedImage={mockImages[0]} />);
    const card1 = screen.getByTestId('image-card-1');
    expect(card1).toHaveAttribute('data-selected', 'true');
    const card2 = screen.getByTestId('image-card-2');
    expect(card2).toHaveAttribute('data-selected', 'false');
  });

  it('should handle image selection', () => {
    render(<StudioGallery {...defaultProps} />);
    fireEvent.click(screen.getByTestId('image-card-1'));
    // The mock card calls onSelect on click
    expect(defaultProps.onSelectImage).toHaveBeenCalledWith(mockImages[0]);
  });
});
