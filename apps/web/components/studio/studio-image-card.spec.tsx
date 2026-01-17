import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudioImageCard, type StudioImage } from './studio-image-card';

// Mock dependencies
const mockIsMobile = vi.fn();
vi.mock('@ryla/ui', () => ({
  cn: (...args: any[]) => args.join(' '),
  useIsMobile: () => mockIsMobile(),
}));

vi.mock('../ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div title={content}>{children}</div>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} alt={props.alt || 'mock image'} />,
}));

describe('StudioImageCard', () => {
  const mockImage: StudioImage = {
    id: 'img-1',
    imageUrl: 'https://example.com/image.jpg',
    influencerId: 'inf-1',
    influencerName: 'Test Influencer',
    aspectRatio: '9:16',
    status: 'completed',
    createdAt: new Date().toISOString(),
  };

  const defaultProps = {
    image: mockImage,
    onSelect: vi.fn(),
    onOpenDetails: vi.fn(),
    onQuickLike: vi.fn(),
    onQuickDownload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockIsMobile.mockReturnValue(false);
  });

  it('should render completed image', () => {
    render(<StudioImageCard {...defaultProps} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', mockImage.imageUrl);
    expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
  });

  it('should render generating state', () => {
    const generatingImage = { ...mockImage, status: 'generating' as const };
    render(<StudioImageCard {...defaultProps} image={generatingImage} />);
    expect(screen.getByText('Generating...')).toBeInTheDocument();
    expect(screen.getByText('Generating')).toBeInTheDocument(); // Badge
  });

  it('should render failed state', () => {
    const failedImage = { ...mockImage, status: 'failed' as const };
    render(<StudioImageCard {...defaultProps} image={failedImage} />);
    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
  });

  it('should handle selection click on desktop', () => {
    render(<StudioImageCard {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Click to view details'));
    // On desktop, main click opens details if onOpenDetails is provided
    expect(defaultProps.onOpenDetails).toHaveBeenCalledWith(mockImage);
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('should handle selection click on mobile', () => {
    mockIsMobile.mockReturnValue(true);
    render(<StudioImageCard {...defaultProps} />);
    fireEvent.click(screen.getByTitle('Click to view details'));
    // On mobile, main click selects the image
    expect(defaultProps.onSelect).toHaveBeenCalledWith(mockImage);
    expect(defaultProps.onOpenDetails).not.toHaveBeenCalled();
  });

  it('should render actions on desktop hover', () => {
    // Note: hover state logic is CSS-based (group-hover), which is hard to test with RTL without checking styles.
    // However, we can check if the buttons exist in the DOM.
    render(<StudioImageCard {...defaultProps} image={{ ...mockImage, isLiked: true }} />);

    // Check like button
    const likeButton = screen.getByTitle('Like this image').parentElement; // Tooltip wraps button
    expect(likeButton).toBeInTheDocument();

    // Check download button
    const downloadButton = screen.getByTitle('Download image').parentElement;
    expect(downloadButton).toBeInTheDocument();
  });

  it('should handle like action', () => {
    render(<StudioImageCard {...defaultProps} />);
    const likeButton = screen
      .getByTitle('Like this image')
      .querySelector('button');
    fireEvent.click(likeButton!);
    expect(defaultProps.onQuickLike).toHaveBeenCalledWith(mockImage.id);
    // Should stop propagation
    expect(defaultProps.onOpenDetails).not.toHaveBeenCalled();
  });

  it('should handle download action', () => {
    render(<StudioImageCard {...defaultProps} />);
    const downloadButton = screen
      .getByTitle('Download image')
      .querySelector('button');
    fireEvent.click(downloadButton!);
    expect(defaultProps.onQuickDownload).toHaveBeenCalledWith(mockImage);
  });
});
