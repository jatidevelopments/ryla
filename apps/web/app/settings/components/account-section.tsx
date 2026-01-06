'use client';

import * as React from 'react';
import { Button, Label, Input } from '@ryla/ui';
import { useAuth } from '../../../lib/auth-context';

interface AccountSectionProps {
  profileName: string;
  profilePublicName: string;
  onNameChange: (value: string) => void;
  onPublicNameChange: (value: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function AccountSection({
  profileName,
  profilePublicName,
  onNameChange,
  onPublicNameChange,
  onSave,
  isSaving,
}: AccountSectionProps) {
  const { user } = useAuth();

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
      <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-white">Name</Label>
            <Input
              value={profileName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Username</Label>
            <Input
              value={profilePublicName}
              onChange={(e) => onPublicNameChange(e.target.value)}
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
          <p className="mt-1 text-xs text-white/40">Email changes aren't supported yet.</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Label className="text-white">Profile</Label>
            <p className="text-sm text-white/60">Update your name and username</p>
          </div>
          <Button variant="outline" size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </section>
  );
}

