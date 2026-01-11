import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGallery } from './ImageGallery';
import { useLightbox } from './hooks/useLightbox';
import { useImageActions } from './hooks/useImageActions';
import { useIsMobile } from '@ryla/ui';

// Mock Hooks
vi.mock('./hooks/useLightbox', () => ({
  useLightbox: vi.fn(),
}));

vi.mock('./hooks/useImageActions', () => ({
  useImageActions: vi.fn(),
}));

vi.mock('@ryla/ui', () => ({
  useIsMobile: vi.fn(),
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock Components
vi.mock('./components/GalleryEmptyState', () => ({
  GalleryEmptyState: ({ message }: any) => <div>{message}</div>,
}));

vi.mock('./components/GalleryImage', () => ({
  GalleryImage: ({ image, onClick, onLike }: any) => (
    <div data-testid="gallery-image">
      <span>{image.id}</span>
      <button onClick={onClick}>Open</button>
      <button onClick={onLike}>Like</button>
    </div>
  ),
}));

vi.mock('./components/LightboxModal', () => ({
  LightboxModal: ({ onClose }: any) => (
    <div data-testid="lightbox-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../studio', () => ({
  StudioDetailPanel: ({ onClose }: any) => (
    <div data-testid="studio-detail-panel">
      <button onClick={onClose}>ClosePanel</button>
    </div>
  ),
}));

describe('ImageGallery', () => {
  const mockImages = [
    { id: '1', url: 'img1.jpg', aspectRatio: '1:1' },
    { id: '2', url: 'img2.jpg', aspectRatio: '1:1' },
  ];

  const mockLightbox = {
    selectedIndex: null,
    openLightbox: vi.fn(),
    closeLightbox: vi.fn(),
    goToPrevious: vi.fn(),
    goToNext: vi.fn(),
    canGoPrevious: false,
    canGoNext: false,
  };

  const mockActions = {
    handleLike: vi.fn(),
    handleDownload: vi.fn(),
    handleEditInStudio: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLightbox as any).mockReturnValue(mockLightbox);
    (useImageActions as any).mockReturnValue(mockActions);
    (useIsMobile as any).mockReturnValue(false); // Desktop default
  });

  it('should render empty state when no images', () => {
    render(
      <ImageGallery images={[]} influencerId="inf-1" emptyMessage="Empty" />
    );
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });

  it('should render image grid on desktop', () => {
    render(<ImageGallery images={mockImages} influencerId="inf-1" />);
    expect(screen.getAllByTestId('gallery-image')).toHaveLength(2);
  });

  it('should open lightbox on desktop click', () => {
    render(<ImageGallery images={mockImages} influencerId="inf-1" />);

    fireEvent.click(screen.getAllByText('Open')[0]);
    expect(mockLightbox.openLightbox).toHaveBeenCalledWith(0);
  });

  it('should render lightbox when selectedIndex is not null', () => {
    (useLightbox as any).mockReturnValue({ ...mockLightbox, selectedIndex: 0 });
    render(<ImageGallery images={mockImages} influencerId="inf-1" />);

    expect(screen.getByTestId('lightbox-modal')).toBeInTheDocument();
  });

  it('should show mobile detail panel on mobile click', () => {
    (useIsMobile as any).mockReturnValue(true);
    render(<ImageGallery images={mockImages} influencerId="inf-1" />);

    fireEvent.click(screen.getAllByText('Open')[0]);
    expect(screen.getByTestId('studio-detail-panel')).toBeInTheDocument();
  });

  it('should call handleLike handler', () => {
    render(<ImageGallery images={mockImages} influencerId="inf-1" />);

    fireEvent.click(screen.getAllByText('Like')[0]);
    expect(mockActions.handleLike).toHaveBeenCalled();
  });
});
