'use client';

import * as React from 'react';
import { Input, Label, RylaButton } from '@ryla/ui';

interface HandleFieldProps {
  value: string;
  error: string | null;
  hasChanged: boolean;
  isSaving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function HandleField({ value, error, hasChanged, isSaving, onChange, onSave }: HandleFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="handle-input">Handle / Slug</Label>
      <p className="text-sm text-[var(--text-muted)]">
        Your AI Influencer&apos;s unique identifier. Must be unique, 3-30 characters, letters, numbers,
        hyphens, and underscores only.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="handle-input"
            type="text"
            value={value}
            onChange={onChange}
            placeholder="@username"
            className={error ? 'border-red-500/50' : ''}
          />
          {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
        </div>
        <RylaButton
          onClick={onSave}
          disabled={!hasChanged || !!error || isSaving}
          variant="gradient"
          size="sm"
        >
          {isSaving ? 'Saving...' : 'Save'}
        </RylaButton>
      </div>
    </div>
  );
}

