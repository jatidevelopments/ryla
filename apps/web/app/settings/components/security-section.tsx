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
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-white">Security</h2>

      <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
        {/* Logout Section */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pb-4 border-b border-white/5">
          <div>
            <Label className="text-white">Logout all devices</Label>
            <p className="text-sm text-white/60">
              Ends all active sessions (including this one)
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogoutAll}>
            Logout all
          </Button>
        </div>

        {/* Change Password Section */}
        {user?.hasPassword !== false && (
          <div className="pt-2">
            {!isChangingPassword ? (
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <Label className="text-white">Password</Label>
                  <p className="text-sm text-white/60">
                    Change your account password
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change password
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium text-white">
                    Change Password
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-white/40 hover:text-white"
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

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                      />
                      <PasswordStrength
                        password={newPassword}
                        className="mt-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-new-password">
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

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={
                        isLoading ||
                        !passwordsMatch ||
                        !isPasswordValid(newPassword)
                      }
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
    </section>
  );
}
