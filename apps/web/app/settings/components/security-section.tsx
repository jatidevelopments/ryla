'use client';

import * as React from 'react';
import { Button, Label } from '@ryla/ui';

interface SecuritySectionProps {
  onLogoutAll: () => void;
}

export function SecuritySection({ onLogoutAll }: SecuritySectionProps) {
  return (
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
          <Button variant="outline" size="sm" onClick={onLogoutAll}>
            Logout all
          </Button>
        </div>
      </div>
    </section>
  );
}

