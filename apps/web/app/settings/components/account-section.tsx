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
    <div className="space-y-6">
      {/* Profile Information Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Profile Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm text-white/80">Name</Label>
            <Input
              value={profileName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Your name"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-white/80">Username</Label>
            <Input
              value={profilePublicName}
              onChange={(e) => onPublicNameChange(e.target.value)}
              placeholder="public-name"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/50">
              This is public. Avoid spaces and special characters.
            </p>
          </div>
        </div>
      </div>

      {/* Email Card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Email Address</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-purple-400"
              >
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {user?.email || 'Not set'}
              </p>
              <p className="text-xs text-white/50">
                Email changes aren&apos;t supported yet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="min-w-32 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
