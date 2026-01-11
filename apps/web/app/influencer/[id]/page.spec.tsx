import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InfluencerProfilePage from './page';
import * as navigation from 'next/navigation';

// Mock Hooks
const mockUseInfluencerData = vi.fn();
vi.mock('./hooks/useInfluencerData', () => ({
  useInfluencerData: () => mockUseInfluencerData(),
}));

const mockUseInfluencerImages = vi.fn();
vi.mock('./hooks/useInfluencerImages', () => ({
  useInfluencerImages: () => mockUseInfluencerImages(),
}));

// Mock Components
vi.mock('../../../components/influencer/InfluencerProfile', () => ({
  InfluencerProfile: ({ influencer }: any) => (
    <div data-testid="influencer-profile">{influencer.name}</div>
  ),
}));

vi.mock('../../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <div>{children}</div>,
}));

vi.mock(
  '../../../components/profile-pictures/ProfilePictureGenerationIndicator',
  () => ({
    ProfilePictureGenerationIndicator: () => (
      <div data-testid="generation-indicator" />
    ),
  })
);

vi.mock('./components/InfluencerTabs', () => ({
  InfluencerTabs: () => <div data-testid="influencer-tabs" />,
}));

// Mock UI Lib with cn
vi.mock('@ryla/ui', () => ({
  PageContainer: ({ children }: any) => <div>{children}</div>,
  cn: (...inputs: any[]) => inputs.join(' '),
}));

// Mock Navigation
vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
  useNotFound: vi.fn(),
}));

describe('InfluencerProfilePage', () => {
  const mockInfluencer = {
    id: 'inf-1',
    name: 'Test Influencer',
    likedCount: 10,
  };

  const defaultInfluencerData = {
    influencerId: 'inf-1',
    influencer: mockInfluencer,
    character: { id: 'char-1' },
    isLoading: false,
    allPosts: [],
    likedPosts: [],
    profilePicturesState: {},
    updateInfluencer: vi.fn(),
  };

  const defaultImagesData = {
    allImages: [],
    likedImages: [],
    isLoadingImages: false,
    handleImageLike: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInfluencerData.mockReturnValue(defaultInfluencerData);
    mockUseInfluencerImages.mockReturnValue(defaultImagesData);
  });

  it('should render loading state when loading', () => {
    mockUseInfluencerData.mockReturnValue({
      ...defaultInfluencerData,
      influencer: null,
      isLoading: true,
    });

    render(<InfluencerProfilePage />);
    expect(screen.getByText('Loading Profile')).toBeInTheDocument();
  });

  it('should call notFound when neither influencer nor character exists', () => {
    mockUseInfluencerData.mockReturnValue({
      ...defaultInfluencerData,
      influencer: null, // No influencer
      character: null, // No character
      isLoading: false,
    });

    render(<InfluencerProfilePage />);
    expect(navigation.notFound).toHaveBeenCalled();
  });

  it('should render syncing state when influencer mapping missing but character exists', () => {
    // This happens during initial creation or sync issues
    mockUseInfluencerData.mockReturnValue({
      ...defaultInfluencerData,
      influencer: null,
      character: { id: 'char-1' },
      isLoading: false,
    });

    render(<InfluencerProfilePage />);
    expect(
      screen.getByText('Synchronizing character data...')
    ).toBeInTheDocument();
  });

  it('should render profile content when data is ready', () => {
    render(<InfluencerProfilePage />);

    expect(screen.getByTestId('influencer-profile')).toHaveTextContent(
      'Test Influencer'
    );
    expect(screen.getByTestId('generation-indicator')).toBeInTheDocument();
  });

  it('should update influencer liked count when mismatch', () => {
    const updateInfluencer = vi.fn();
    mockUseInfluencerData.mockReturnValue({
      ...defaultInfluencerData,
      influencer: { ...mockInfluencer, likedCount: 0 },
      updateInfluencer,
      likedPosts: [{}], // 1 post
    });

    mockUseInfluencerImages.mockReturnValue({
      ...defaultImagesData,
      likedImages: [{}], // 1 image
    });

    // Total liked = 2. Server says 0.

    render(<InfluencerProfilePage />);

    expect(updateInfluencer).toHaveBeenCalledWith('inf-1', { likedCount: 2 });
  });
});
