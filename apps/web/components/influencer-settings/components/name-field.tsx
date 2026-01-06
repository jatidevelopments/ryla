'use client';

import * as React from 'react';
import { Input, Label, RylaButton } from '@ryla/ui';

interface NameFieldProps {
  value: string;
  error: string | null;
  hasChanged: boolean;
  isSaving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function NameField({ value, error, hasChanged, isSaving, onChange, onSave }: NameFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="name-input">Name</Label>
      <p className="text-sm text-[var(--text-muted)]">
        Your AI Influencer's display name. Must be 1-100 characters.
      </p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            id="name-input"
            type="text"
            value={value}
            onChange={onChange}
            placeholder="Influencer name"
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

