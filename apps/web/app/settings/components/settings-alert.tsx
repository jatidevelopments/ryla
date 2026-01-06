'use client';

import * as React from 'react';

interface SettingsAlertProps {
  error: string | null;
  success: string | null;
}

export function SettingsAlert({ error, success }: SettingsAlertProps) {
  if (!error && !success) return null;

  return (
    <div
      className={[
        'mb-6 rounded-lg border p-4 text-sm',
        error
          ? 'border-red-500/30 bg-red-500/10 text-red-200'
          : 'border-white/10 bg-white/5 text-white/80',
      ].join(' ')}
    >
      {error ?? success}
    </div>
  );
}

