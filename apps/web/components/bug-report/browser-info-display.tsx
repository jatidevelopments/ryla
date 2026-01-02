'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, Monitor } from 'lucide-react';
import type { BrowserMetadata } from '@ryla/shared';

export interface BrowserInfoDisplayProps {
  metadata: BrowserMetadata | null;
}

export function BrowserInfoDisplay({ metadata }: BrowserInfoDisplayProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (!metadata) return null;

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span>Browser Information</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="rounded-lg bg-black/20 border border-white/10 p-3 space-y-2 text-xs">
          <div>
            <span className="text-white/40">User Agent:</span>
            <p className="text-white/70 mt-1 break-all">{metadata.userAgent}</p>
          </div>
          <div>
            <span className="text-white/40">URL:</span>
            <p className="text-white/70 mt-1 break-all">{metadata.url}</p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white/40">Viewport:</span>
              <p className="text-white/70 mt-1">
                {metadata.viewport.width} × {metadata.viewport.height}
              </p>
            </div>
            <div>
              <span className="text-white/40">Platform:</span>
              <p className="text-white/70 mt-1">{metadata.platform}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-white/40">Language:</span>
              <p className="text-white/70 mt-1">{metadata.language}</p>
            </div>
            <div>
              <span className="text-white/40">Timezone:</span>
              <p className="text-white/70 mt-1">{metadata.timezone}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

