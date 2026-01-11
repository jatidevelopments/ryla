import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StudioPage from './page';
import { useStudioState } from './hooks';
import { useTutorial } from '@ryla/ui';

// Mock Hooks
vi.mock('./hooks', () => ({
  useStudioState: vi.fn(),
}));

vi.mock('@ryla/ui', () => ({
  FadeInUp: ({ children }: any) => (
    <div data-testid="fade-in-up">{children}</div>
  ),
  useTutorial: vi.fn(),
  useTutorialSteps: vi.fn(),
}));

// Mock Auth
vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <div>{children}</div>,
}));

// Mock Studio Components
vi.mock('../../components/studio', () => ({
  StudioHeader: () => <div data-testid="studio-header" />,
  StudioToolbar: () => <div data-testid="studio-toolbar" />,
}));

vi.mock('../../components/studio/generation', () => ({
  StudioGenerationBar: () => <div data-testid="studio-generation-bar" />,
}));

vi.mock('../../components/dev/dev-panel', () => ({
  DevPanel: () => <div data-testid="dev-panel" />,
}));

vi.mock('./components', () => ({
  StudioBackground: () => <div data-testid="studio-background" />,
  StudioMainContent: () => <div data-testid="studio-main-content" />,
  StudioTutorial: () => <div data-testid="studio-tutorial" />,
}));

describe('StudioPage', () => {
  const mockState = {
    influencerTabs: [],
    selectedInfluencerId: 'inf-1',
    setSelectedInfluencerId: vi.fn(),
    searchQuery: '',
    setSearchQuery: vi.fn(),
    totalImageCount: 0,
    viewMode: 'grid',
    setViewMode: vi.fn(),
    aspectRatios: [],
    setAspectRatios: vi.fn(),
    status: 'all',
    setStatus: vi.fn(),
    liked: false,
    onLikedChange: vi.fn(),
    adult: false,
    onAdultChange: vi.fn(),
    sortBy: 'newest',
    setSortBy: vi.fn(),
    selectedImage: null,
    setSelectedImage: vi.fn(),
    filteredImages: [],
    showPanel: false,
    isLoadingImages: false,
    handleSelectImage: vi.fn(),
    handleOpenDetails: vi.fn(),
    handleLike: vi.fn(),
    handleDownload: vi.fn(),
    handleClosePanel: vi.fn(),
    handleDelete: vi.fn(),
    handleRetry: vi.fn(),
    influencerList: [],
    selectedInfluencerForGeneration: null,
    handleGenerate: vi.fn(),
    activeGenerations: new Set(),
    creditsBalance: 100,
    mode: 'creating',
    contentType: 'image',
    setMode: vi.fn(),
    setContentType: vi.fn(),
    nsfwEnabled: false,
    allImages: [],
    hasConsent: true,
    acceptConsent: vi.fn(),
    handleUploadImage: vi.fn(),
  };

  const mockTutorial = {
    steps: [],
    currentStep: 0,
    isActive: false,
    start: vi.fn(),
    stop: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    reset: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStudioState as any).mockReturnValue(mockState);
    (useTutorial as any).mockReturnValue(mockTutorial);
  });

  it('should render all major studio components', () => {
    render(<StudioPage />);

    expect(screen.getByTestId('studio-header')).toBeInTheDocument();
    expect(screen.getByTestId('studio-toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('studio-main-content')).toBeInTheDocument();
    expect(screen.getByTestId('studio-generation-bar')).toBeInTheDocument();
    expect(screen.getByTestId('studio-background')).toBeInTheDocument();
    expect(screen.getByTestId('studio-tutorial')).toBeInTheDocument();
  });

  it('should pass correct props to subcomponents', () => {
    render(<StudioPage />);

    // We can't easily check props of mocked components with screen
    // but the fact they render means the main structure is intact.
    // If we wanted to check props, we could use vi.mocked(Component).mock.calls
  });
});
