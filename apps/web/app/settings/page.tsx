"use client";

import * as React from 'react';
import {
  PageContainer,
  Button,
  Label,
  Input,
  Textarea,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@ryla/ui';
import { capture } from '@ryla/analytics';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from "../../components/protected-route";
import { useAuth } from "../../lib/auth-context";
import { trpc } from '../../lib/trpc';
import { useCredits } from '../../lib/hooks/use-credits';
import { useSubscription } from '../../lib/hooks/use-subscription';
import { deleteAccount, logoutAllDevices } from '../../lib/auth';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { balance, isLoading: isCreditsLoading } = useCredits();
  const { tier, status: subscriptionStatus, isLoading: isSubscriptionLoading } =
    useSubscription();

  const [profileName, setProfileName] = React.useState(user?.name ?? '');
  const [profilePublicName, setProfilePublicName] = React.useState(
    user?.publicName ?? ''
  );

  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  React.useEffect(() => {
    capture('settings_viewed');
  }, []);

  React.useEffect(() => {
    // Keep profile form in sync if user changes (e.g., after refresh)
    setProfileName(user?.name ?? '');
    setProfilePublicName(user?.publicName ?? '');
  }, [user?.name, user?.publicName]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSaveProfile = async () => {
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateProfileMutation.mutateAsync({
        name: profileName.trim(),
        publicName: profilePublicName.trim(),
      });
      await refreshUser();
      capture('settings_profile_updated');
      setActionSuccess('Profile updated.');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const handleLogoutAll = async () => {
    setActionError(null);
    setActionSuccess(null);

    try {
      await logoutAllDevices();
      capture('auth_logout_all');
      router.push('/login');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to logout all devices');
    }
  };

  const handleDeleteAccount = async () => {
    setActionError(null);
    setActionSuccess(null);

    capture('account_deletion_started');

    try {
      await deleteAccount();
      capture('account_deleted');
      router.push('/register');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete account');
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/60">Manage your account and preferences</p>
      </div>

      {(actionError || actionSuccess) && (
        <div
          className={[
            'mb-6 rounded-lg border p-4 text-sm',
            actionError
              ? 'border-red-500/30 bg-red-500/10 text-red-200'
              : 'border-white/10 bg-white/5 text-white/80',
          ].join(' ')}
        >
          {actionError ?? actionSuccess}
        </div>
      )}

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">Name</Label>
              <Input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Username</Label>
              <Input
                value={profilePublicName}
                onChange={(e) => setProfilePublicName(e.target.value)}
                placeholder="public-name"
              />
              <p className="text-xs text-white/50">
                This is public. Avoid spaces and special characters.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <Label className="text-white">Email</Label>
            <p className="mt-1 text-sm text-white/60">{user?.email || 'Not set'}</p>
            <p className="mt-1 text-xs text-white/40">
              Email changes aren’t supported yet.
            </p>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Label className="text-white">Profile</Label>
              <p className="text-sm text-white/60">Update your name and username</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProfile}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Subscription</h2>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-white">
                  {isSubscriptionLoading ? 'Loading...' : `${tier} plan`}
                </Label>
                <span className="rounded-full bg-[var(--text-muted)]/20 px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                  {isSubscriptionLoading ? '...' : subscriptionStatus}
                </span>
              </div>
              <p className="text-sm text-white/60">Upgrade for more features</p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                Upgrade
              </Button>
            </Link>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Credits remaining</span>
              <span className="font-semibold text-white">
                {isCreditsLoading ? '...' : balance.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] opacity-30" />
            </div>
            <div className="mt-3">
              <Link href="/buy-credits">
                <Button variant="outline" size="sm">
                  Buy credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Security</h2>
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <Label className="text-white">Logout all devices</Label>
              <p className="text-sm text-white/60">
                Ends all active sessions (including this one)
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogoutAll}>
              Logout all
            </Button>
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Legal</h2>
        <div className="space-y-2">
          <Link
            href="/legal"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <span className="text-white">Terms of Service</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-white/40"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/legal"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <span className="text-white">Privacy Policy</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-white/40"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Danger zone</h2>
        <DeleteAccountDialog
          onDeleteConfirmed={handleDeleteAccount}
          subscriptionTier={tier}
        />
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

type DeleteReason =
  | 'too_expensive'
  | 'missing_features'
  | 'bugs'
  | 'not_using'
  | 'privacy_concerns'
  | 'other';

type DeleteStep = 'offer' | 'reason' | 'feedback' | 'confirm';

const REASON_OPTIONS: { value: DeleteReason; label: string; icon: string }[] = [
  { value: 'too_expensive', label: 'Too expensive', icon: '💰' },
  { value: 'missing_features', label: 'Missing features', icon: '🔧' },
  { value: 'bugs', label: 'Technical issues', icon: '🐛' },
  { value: 'not_using', label: 'Not using enough', icon: '📉' },
  { value: 'privacy_concerns', label: 'Privacy concerns', icon: '🔒' },
  { value: 'other', label: 'Other reason', icon: '💭' },
];

function DeleteAccountDialog({
  onDeleteConfirmed,
  subscriptionTier,
}: {
  onDeleteConfirmed: () => Promise<void>;
  subscriptionTier: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState<DeleteStep>('offer');
  const [reason, setReason] = React.useState<DeleteReason | null>(null);
  const [feedback, setFeedback] = React.useState('');
  const [confirmText, setConfirmText] = React.useState('');
  const [isDeleting, setIsDeleting] = React.useState(false);

  const reset = React.useCallback(() => {
    setStep('offer');
    setReason(null);
    setFeedback('');
    setConfirmText('');
    setIsDeleting(false);
  }, []);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      capture('account_deletion_modal_opened', { subscriptionTier });
    } else {
      capture('account_deletion_cancelled', { step });
      reset();
    }
  };

  const handleOfferClick = () => {
    capture('retention_offer_clicked', { subscriptionTier });
    setOpen(false);
  };

  const handleSelectReason = (r: DeleteReason) => {
    setReason(r);
    capture('account_deletion_reason_selected', { reason: r });
    setStep('feedback');
  };

  const handleFeedbackContinue = () => {
    capture('account_deletion_feedback_submitted', {
      reason,
      has_feedback: feedback.trim().length > 0,
      subscriptionTier,
    });
    setStep('confirm');
  };

  const handleDelete = async () => {
    if (confirmText.trim().toUpperCase() !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await onDeleteConfirmed();
      setOpen(false);
      reset();
    } catch {
      setIsDeleting(false);
    }
  };

  const stepNumber = { offer: 1, reason: 2, feedback: 3, confirm: 4 }[step];

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <Label className="text-red-200">Delete account</Label>
      <p className="mt-1 text-sm text-white/60">
        This action is permanent. Before we delete your account, we'll ask a few
        quick questions.
      </p>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Delete account
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-[360px] p-5">
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={[
                  'h-1 rounded-full transition-all duration-300',
                  n <= stepNumber ? 'w-10 bg-gradient-to-r from-[#9333EA] to-[#EC4899]' : 'w-6 bg-white/10',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Step 1: Retention Offer */}
          {step === 'offer' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#9333EA] to-[#EC4899] shadow-lg shadow-purple-500/25">
                  <span className="text-2xl">💜</span>
                </div>
                <DialogTitle className="text-xl font-semibold">Before you go...</DialogTitle>
                <DialogDescription className="mt-2 text-white/50">
                  We'd love to keep you around!
                </DialogDescription>
              </div>

              <div className="rounded-2xl border border-[#9333EA]/30 bg-gradient-to-b from-[#9333EA]/10 to-transparent p-5 text-center">
                <p className="text-base font-semibold text-white">
                  Get 50% off your next month
                </p>
                <p className="mt-1 text-sm text-white/50">
                  Stay with us at half the price
                </p>
                <Link href="/pricing?offer=retention50" onClick={handleOfferClick}>
                  <Button className="mt-4 w-full h-11 bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                    Claim 50% Off
                  </Button>
                </Link>
              </div>

              <button
                onClick={() => setStep('reason')}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors py-2"
              >
                No thanks, continue to delete
              </button>
            </div>
          )}

          {/* Step 2: Reason Selection */}
          {step === 'reason' && (
            <div className="space-y-5">
              <div className="text-center">
                <DialogTitle className="text-xl font-semibold">Why are you leaving?</DialogTitle>
                <DialogDescription className="mt-2 text-white/50">
                  Your feedback helps us improve
                </DialogDescription>
              </div>

              <div className="space-y-2">
                {REASON_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectReason(option.value)}
                    className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 text-left text-sm text-white/80 transition-all hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.05] text-base">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep('offer')}
                className="w-full text-center text-sm text-white/40 hover:text-white/60 transition-colors py-2"
              >
                ← Go back
              </button>
            </div>
          )}

          {/* Step 3: Optional Feedback */}
          {step === 'feedback' && (
            <div className="space-y-5">
              <div className="text-center">
                <DialogTitle className="text-xl font-semibold">Any feedback?</DialogTitle>
                <DialogDescription className="mt-2 text-white/50">
                  Optional – help us do better
                </DialogDescription>
              </div>

              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What could we have done better?"
                className="min-h-[120px] resize-none rounded-xl bg-white/[0.03] border-white/[0.08] placeholder:text-white/30 focus:border-white/20"
              />

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  onClick={() => setStep('reason')}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#9333EA] to-[#EC4899] text-white font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  onClick={handleFeedbackContinue}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Final Confirmation */}
          {step === 'confirm' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/20">
                  <span className="text-2xl">⚠️</span>
                </div>
                <DialogTitle className="text-xl font-semibold text-red-400">
                  Delete your account?
                </DialogTitle>
                <DialogDescription className="mt-2 text-white/50">
                  This action cannot be undone
                </DialogDescription>
              </div>

              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-200/80 text-center leading-relaxed">
                  All your data, influencers, and generated images will be permanently deleted.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-white/50">
                  Type <span className="font-semibold text-white">DELETE</span> to confirm
                </Label>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="h-11 rounded-xl bg-white/[0.03] border-white/[0.08] text-center uppercase tracking-[0.2em] font-medium placeholder:text-white/20 focus:border-red-500/30"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-11 rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]"
                  onClick={() => setStep('feedback')}
                  disabled={isDeleting}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-11 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-40 transition-all"
                  disabled={confirmText.trim().toUpperCase() !== 'DELETE' || isDeleting}
                  onClick={handleDelete}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Forever'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
