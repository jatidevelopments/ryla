"use client";

import * as React from 'react';
import { PageContainer, Button } from '@ryla/ui';
import { capture } from '@ryla/analytics';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from "../../components/protected-route";
import { useAuth } from "../../lib/auth-context";
import { useSubscription } from '../../lib/hooks/use-subscription';
import { deleteAccount, logoutAllDevices } from '../../lib/auth';
import { useProfileSettings } from './hooks/use-profile-settings';
import { AccountSection } from './components/account-section';
import { SubscriptionSection } from './components/subscription-section';
import { SecuritySection } from './components/security-section';
import { LegalSection } from './components/legal-section';
import { SettingsAlert } from './components/settings-alert';
import { DeleteAccountDialog } from './components/delete-account-dialog';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { logout } = useAuth();
  const { tier } = useSubscription();

  // Profile settings hook
  const {
    profileName,
    setProfileName,
    profilePublicName,
    setProfilePublicName,
    actionError,
    actionSuccess,
    isSaving,
    handleSaveProfile,
  } = useProfileSettings();

  React.useEffect(() => {
    capture('settings_viewed');
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleLogoutAll = async () => {
    try {
      await logoutAllDevices();
      capture('auth_logout_all');
      router.push('/login');
    } catch (err) {
      // Error handling is done in the component
      console.error('Failed to logout all devices:', err);
    }
  };

  const handleDeleteAccount = async () => {
    capture('account_deletion_started');
    try {
      await deleteAccount();
      capture('account_deleted');
      router.push('/register');
    } catch (err) {
      // Error handling is done in the dialog
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/60">Manage your account and preferences</p>
      </div>

      <SettingsAlert error={actionError} success={actionSuccess} />

      <AccountSection
        profileName={profileName}
        profilePublicName={profilePublicName}
        onNameChange={setProfileName}
        onPublicNameChange={setProfilePublicName}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />

      <SubscriptionSection />

      <SecuritySection onLogoutAll={handleLogoutAll} />

      <LegalSection />

      {/* Danger Zone */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Danger zone</h2>
        <DeleteAccountDialog onDeleteConfirmed={handleDeleteAccount} subscriptionTier={tier} />
      </section>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        onClick={handleLogout}
      >
        Log Out
      </Button>
    </PageContainer>
  );
}

