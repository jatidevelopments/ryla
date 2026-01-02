'use client';

import * as React from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@ryla/ui';
import type { ConsoleLogEntry } from '@ryla/shared';

export interface ConsoleLogsPreviewProps {
  logs: ConsoleLogEntry[];
  isCapturing: boolean;
}

function getLogLevelIcon(level: ConsoleLogEntry['level']) {
  switch (level) {
    case 'error':
      return <AlertCircle className="h-3 w-3 text-red-400" />;
    case 'warn':
      return <AlertTriangle className="h-3 w-3 text-yellow-400" />;
    case 'info':
      return <Info className="h-3 w-3 text-blue-400" />;
    default:
      return null;
  }
}

function getLogLevelClass(level: ConsoleLogEntry['level']): string {
  switch (level) {
    case 'error':
      return 'text-red-400';
    case 'warn':
      return 'text-yellow-400';
    case 'info':
      return 'text-blue-400';
    case 'debug':
      return 'text-purple-400';
    default:
      return 'text-white/70';
  }
}

export function ConsoleLogsPreview({
  logs,
  isCapturing,
}: ConsoleLogsPreviewProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  if (isCapturing) {
    return (
      <div className="flex items-center justify-center h-16 rounded-lg border border-white/10 bg-white/5">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[var(--purple-500)] border-t-transparent" />
          <span className="text-xs text-white/60">Collecting console logs...</span>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
        <AlertCircle className="h-4 w-4 text-yellow-400" />
        <div className="flex-1">
          <p className="text-xs font-medium text-yellow-400">No console logs available</p>
          <p className="text-xs text-yellow-400/70">You can still submit without logs</p>
        </div>
      </div>
    );
  }

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
          <span className="text-xs font-medium text-white">{logs.length}</span>
          <span className="text-xs text-white/60">logs captured</span>
        </div>
        {errorCount > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-red-500/20 border border-red-500/30 px-2 py-1">
            <AlertCircle className="h-3 w-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">{errorCount} errors</span>
          </div>
        )}
        {warnCount > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-yellow-500/20 border border-yellow-500/30 px-2 py-1">
            <AlertTriangle className="h-3 w-3 text-yellow-400" />
            <span className="text-xs font-medium text-yellow-400">{warnCount} warnings</span>
          </div>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto flex items-center gap-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-2 py-1 text-xs text-white/70 hover:text-white transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-3 w-3" />
              Hide logs
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" />
              View logs
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="max-h-[200px] overflow-y-auto rounded-lg bg-black/20 border border-white/10 p-3 font-mono text-xs space-y-1">
          {logs.map((log, idx) => (
            <div key={idx} className={cn('flex items-start gap-2', getLogLevelClass(log.level))}>
              <span className="text-white/40 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <div className="flex items-start gap-1.5 flex-1 min-w-0">
                {getLogLevelIcon(log.level)}
                <span className="break-words flex-1">{log.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

