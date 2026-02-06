'use client';

import * as React from 'react';
import { Button, Label, Input, Spinner } from '@ryla/ui';
import { useAuth } from '../../../lib/auth-context';
import { changePassword } from '../../../lib/auth';
import {
  PasswordStrength,
  isPasswordValid,
} from '../../../components/auth/PasswordStrength';
import { SettingsAlert } from './settings-alert';

interface SecuritySectionProps {
  onLogoutAll: () => void;
}

export function SecuritySection({ onLogoutAll }: SecuritySectionProps) {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const passwordsMatch =
    newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = confirmPassword && newPassword !== confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isPasswordValid(newPassword)) {
      setError('New password does not meet requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangingPassword(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sessions Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 text-emerald-400"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Active Sessions</h3>
              <p className="mt-1 text-sm text-white/60">
                Manage all devices signed into your account
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogoutAll}
            className="border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-500/10"
          >
            Logout All
          </Button>
        </div>
      </div>

      {/* Change Password Section */}
      {user?.hasPassword !== false && (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
          {!isChangingPassword ? (
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-6 w-6 text-blue-400"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Password</h3>
                  <p className="mt-1 text-sm text-white/60">
                    Change your account password
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="border-blue-500/30 text-blue-300 hover:border-blue-500/50 hover:bg-blue-500/10"
              >
                Change Password
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-base font-semibold text-white">Change Password</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setError(null);
                    setSuccess(null);
                  }}
                >
                  Cancel
                </Button>
              </div>

              <SettingsAlert error={error} success={success} />

              <form onSubmit={handlePasswordChange} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-sm text-white/80">
                    Current Password
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm text-white/80">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    />
                    <PasswordStrength
                      password={newPassword}
                      className="mt-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-new-password" className="text-sm text-white/80">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      required
                      className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                    />
                    {confirmPassword && (
                      <p
                        className={`text-xs mt-1 ${
                          passwordsDontMatch
                            ? 'text-red-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {passwordsDontMatch
                          ? 'Passwords do not match'
                          : 'Passwords match'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setError(null);
                      setSuccess(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={
                      isLoading ||
                      !passwordsMatch ||
                      !isPasswordValid(newPassword)
                    }
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Spinner size="sm" />
                        Updating...
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
