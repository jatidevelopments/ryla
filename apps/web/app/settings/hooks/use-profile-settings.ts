'use client';

import * as React from 'react';
import { capture } from '@ryla/analytics';
import { trpc } from '../../../lib/trpc';
import { useAuth } from '../../../lib/auth-context';

/**
 * Hook for managing profile settings (name, username)
 */
export function useProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [profileName, setProfileName] = React.useState(user?.name ?? '');
  const [profilePublicName, setProfilePublicName] = React.useState(user?.publicName ?? '');
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = React.useState<string | null>(null);

  const updateProfileMutation = trpc.user.updateProfile.useMutation();

  // Keep profile form in sync if user changes (e.g., after refresh)
  React.useEffect(() => {
    setProfileName(user?.name ?? '');
    setProfilePublicName(user?.publicName ?? '');
  }, [user?.name, user?.publicName]);

  const handleSaveProfile = React.useCallback(async () => {
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
  }, [profileName, profilePublicName, updateProfileMutation, refreshUser]);

  return {
    profileName,
    setProfileName,
    profilePublicName,
    setProfilePublicName,
    actionError,
    actionSuccess,
    isSaving: updateProfileMutation.isPending,
    handleSaveProfile,
  };
}

