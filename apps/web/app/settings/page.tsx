'use client';

import * as React from 'react';
import { PageContainer, Button } from '@ryla/ui';
import { capture } from '@ryla/analytics';
import { useRouter } from 'next/navigation';
import { User, CreditCard, Shield, FileText, Trash2, LogOut, ChevronRight, Sparkles } from 'lucide-react';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/auth-context';
import { useSubscription } from '../../lib/hooks/use-subscription';
import { deleteAccount, logoutAllDevices } from '../../lib/auth';
import { routes } from '@/lib/routes';
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
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

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
      router.push(routes.login);
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
      router.push(routes.register);
    } catch (err) {
      // Error handling is done in the dialog
      console.error('Failed to delete account:', err);
    }
  };

  // If a section is active, show detailed view
  if (activeSection === 'account') {
    return (
      <PageContainer>
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Settings
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Account Settings</h1>
          <p className="text-sm text-white/60">
            Manage your profile and account information
          </p>
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
      </PageContainer>
    );
  }

  if (activeSection === 'subscription') {
    return (
      <PageContainer>
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Settings
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Subscription & Billing</h1>
          <p className="text-sm text-white/60">
            Manage your subscription plan and credits
          </p>
        </div>

        <SubscriptionSection />
      </PageContainer>
    );
  }

  if (activeSection === 'security') {
    return (
      <PageContainer>
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Settings
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Security Settings</h1>
          <p className="text-sm text-white/60">
            Manage your password and active sessions
          </p>
        </div>

        <SecuritySection onLogoutAll={handleLogoutAll} />
      </PageContainer>
    );
  }

  if (activeSection === 'legal') {
    return (
      <PageContainer>
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Settings
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Legal</h1>
          <p className="text-sm text-white/60">
            View terms and privacy policies
          </p>
        </div>

        <LegalSection />
      </PageContainer>
    );
  }

  if (activeSection === 'danger') {
    return (
      <PageContainer>
        <button
          onClick={() => setActiveSection(null)}
          className="mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to Settings
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-red-400">Danger Zone</h1>
          <p className="text-sm text-white/60">
            Permanently delete your account and all data
          </p>
        </div>

        <section className="mb-8">
          <DeleteAccountDialog
            onDeleteConfirmed={handleDeleteAccount}
            subscriptionTier={tier}
          />
        </section>
      </PageContainer>
    );
  }

  // Main settings menu with card-based layout
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/60">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-4">
        {/* Account Settings Card - Purple accent */}
        <button
          onClick={() => setActiveSection('account')}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#9333ea]">
              <User className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-white">Account Settings</h3>
              <p className="text-sm text-white/60">Manage your profile and account information</p>
            </div>
            <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
          </div>
        </button>

        {/* Subscription Card - Blue accent */}
        <button
          onClick={() => setActiveSection('subscription')}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb]">
              <CreditCard className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-white">Subscription & Billing</h3>
              <p className="text-sm text-white/60">Manage your subscription plan and credits</p>
            </div>
            <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
          </div>
        </button>

        {/* Security Card - Green accent */}
        <button
          onClick={() => setActiveSection('security')}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#10b981] to-[#059669]">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-white">Security Settings</h3>
              <p className="text-sm text-white/60">Manage your password and active sessions</p>
            </div>
            <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
          </div>
        </button>

        {/* Legal Card - Orange accent */}
        <button
          onClick={() => setActiveSection('legal')}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c]">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-white">Legal</h3>
              <p className="text-sm text-white/60">View terms and privacy policies</p>
            </div>
            <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
          </div>
        </button>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-white/40">Danger Zone</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Danger Zone Card - Red accent */}
        <button
          onClick={() => setActiveSection('danger')}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-white/20 hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#ef4444] to-[#dc2626]">
              <Trash2 className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
              <p className="text-sm text-white/60">Permanently delete your account and all data</p>
            </div>
            <ChevronRight className="h-6 w-6 flex-shrink-0 text-white/40 transition-transform group-hover:translate-x-1 group-hover:text-white/60" />
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all hover:border-red-500/30 hover:bg-red-500/5"
        >
          <div className="flex items-center justify-center gap-3">
            <LogOut className="h-5 w-5 text-white/60 transition-colors group-hover:text-red-400" />
            <span className="text-base font-medium text-white/80 transition-colors group-hover:text-red-400">
              Log Out
            </span>
          </div>
        </button>
      </div>
    </PageContainer>
  );
}
