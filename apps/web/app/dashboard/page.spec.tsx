import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './page';

// Mock dependencies
const mockUseAuth = vi.fn();
vi.mock('../../lib/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock TRPC
const mockUseQuery = vi.fn();
vi.mock('../../lib/trpc', () => ({
  trpc: {
    character: {
      list: {
        useQuery: (...args: any[]) => mockUseQuery(...args),
      },
    },
  },
}));

// Mock ProtectedRoute to just render children
vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <>{children}</>,
}));

// Mock UI components that might cause issues or are properly tested elsewhere
vi.mock('@ryla/ui', async () => {
  const actual = await vi.importActual('@ryla/ui');
  return {
    ...actual,
    FadeInUp: ({ children }: any) => <div>{children}</div>,
    StaggerChildren: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { name: 'Test User' } });
  });

  it('should render loading state initially', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<DashboardPage />);
    expect(screen.getByText('Loading Influencers')).toBeInTheDocument();
  });

  it('should render empty state when no influencers exist', () => {
    mockUseQuery.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText('No AI Influencers Yet')).toBeInTheDocument();
    expect(
      screen.getByText('Create your first AI influencer to get started')
    ).toBeInTheDocument();
  });

  it('should render influencer cards when data exists', () => {
    mockUseQuery.mockReturnValue({
      data: {
        items: [
          {
            id: '1',
            name: 'Test Influencer',
            handle: '@test',
            config: {
              bio: 'Test Bio',
              gender: 'female',
            },
            createdAt: new Date(),
          },
        ],
        total: 1,
      },
      isLoading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText('Test Influencer')).toBeInTheDocument();
    expect(screen.getByText('1 influencer created')).toBeInTheDocument();
  });

  it('should greet the user by name', () => {
    mockUseQuery.mockReturnValue({
      data: { items: [], total: 0 },
      isLoading: false,
    });

    render(<DashboardPage />);
    expect(screen.getByText('Welcome, Test')).toBeInTheDocument();
  });
});
