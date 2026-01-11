import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from './page';
import * as navigation from 'next/navigation';
import * as authContext from '../../lib/auth-context';
import * as subscriptionHook from '../../lib/hooks/use-subscription';
import * as profileSettingsHook from './hooks/use-profile-settings';
import * as authLib from '../../lib/auth';

// Mocks
vi.mock('@ryla/ui', () => ({
  PageContainer: ({ children }: any) => (
    <div data-testid="page-container">{children}</div>
  ),
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@ryla/analytics', () => ({
  capture: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  deleteAccount: vi.fn(),
  logoutAllDevices: vi.fn(),
}));

vi.mock('./components/account-section', () => ({
  AccountSection: () => <div data-testid="account-section" />,
}));
vi.mock('./components/subscription-section', () => ({
  SubscriptionSection: () => <div data-testid="subscription-section" />,
}));
vi.mock('./components/security-section', () => ({
  SecuritySection: ({ onLogoutAll }: any) => (
    <div data-testid="security-section">
      <button onClick={onLogoutAll}>Logout All</button>
    </div>
  ),
}));
vi.mock('./components/legal-section', () => ({
  LegalSection: () => <div data-testid="legal-section" />,
}));
vi.mock('./components/settings-alert', () => ({
  SettingsAlert: () => <div data-testid="settings-alert" />,
}));
vi.mock('./components/delete-account-dialog', () => ({
  DeleteAccountDialog: ({ onDeleteConfirmed }: any) => (
    <div data-testid="delete-account-dialog">
      <button onClick={onDeleteConfirmed}>Delete Account</button>
    </div>
  ),
}));

// Mock Hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));
vi.mock('../../lib/auth-context', () => ({
  useAuth: vi.fn(),
}));
vi.mock('../../lib/hooks/use-subscription', () => ({
  useSubscription: vi.fn(),
}));
vi.mock('./hooks/use-profile-settings', () => ({
  useProfileSettings: vi.fn(),
}));

describe('SettingsPage', () => {
  const mockRouter = { push: vi.fn() };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.useRouter as any).mockReturnValue(mockRouter);
    (authContext.useAuth as any).mockReturnValue({ logout: mockLogout });
    (subscriptionHook.useSubscription as any).mockReturnValue({ tier: 'free' });
    (profileSettingsHook.useProfileSettings as any).mockReturnValue({
      profileName: 'Test',
      setProfileName: vi.fn(),
      profilePublicName: 'TestPublic',
      setProfilePublicName: vi.fn(),
      actionError: null,
      actionSuccess: null,
      isSaving: false,
      handleSaveProfile: vi.fn(),
    });
  });

  it('should render all sections', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('account-section')).toBeInTheDocument();
    expect(screen.getByTestId('subscription-section')).toBeInTheDocument();
    expect(screen.getByTestId('security-section')).toBeInTheDocument();
    expect(screen.getByTestId('legal-section')).toBeInTheDocument();
    expect(screen.getByTestId('delete-account-dialog')).toBeInTheDocument();
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('should handle logout', async () => {
    render(<SettingsPage />);

    fireEvent.click(screen.getByText('Log Out'));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
  });

  it('should handle logout all devices', async () => {
    render(<SettingsPage />);

    // Click button inside mock SecuritySection
    fireEvent.click(screen.getByText('Logout All'));

    await waitFor(() => {
      expect(authLib.logoutAllDevices).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('should handle account deletion', async () => {
    render(<SettingsPage />);

    // Click button inside mock DeleteAccountDialog
    fireEvent.click(screen.getByText('Delete Account'));

    await waitFor(() => {
      expect(authLib.deleteAccount).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/register');
    });
  });
});
