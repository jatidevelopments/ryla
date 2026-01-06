'use client';

import * as React from 'react';

/**
 * Hook for copying text to clipboard with feedback state
 */
export function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const copy = React.useCallback(async (text: string, id?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  return {
    copied,
    copiedId,
    copy,
  };
}

