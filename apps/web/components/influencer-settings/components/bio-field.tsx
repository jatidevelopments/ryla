'use client';

import * as React from 'react';
import { Textarea, Label, RylaButton } from '@ryla/ui';

interface BioFieldProps {
  value: string;
  error: string | null;
  hasChanged: boolean;
  isSaving: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

export function BioField({ value, error, hasChanged, isSaving, onChange, onSave }: BioFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="bio-input">Bio</Label>
      <p className="text-sm text-[var(--text-muted)]">
        A short description of your AI Influencer. Optional, max 500 characters.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Textarea
            id="bio-input"
            value={value}
            onChange={onChange}
            placeholder="Write a bio for your AI Influencer..."
            rows={3}
            className={error ? 'border-red-500/50' : ''}
          />
          <div className="flex items-center justify-between mt-1">
            {error && <p className="text-sm text-red-400">{error}</p>}
            <p className="text-xs text-[var(--text-muted)] ml-auto">{value.length}/500</p>
          </div>
        </div>
        <RylaButton
          onClick={onSave}
          disabled={!hasChanged || !!error || isSaving}
          variant="gradient"
          size="sm"
          className="self-start"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </RylaButton>
      </div>
    </div>
  );
}

