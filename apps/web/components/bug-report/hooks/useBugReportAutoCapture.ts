import * as React from 'react';
import { capture } from '@ryla/analytics';
import { getConsoleLogBuffer } from '@ryla/shared';
import type { BrowserMetadata, ConsoleLogEntry } from '@ryla/shared';

export function getBrowserMetadata(): BrowserMetadata {
  return {
    userAgent: navigator.userAgent,
    url: window.location.href,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

interface UseBugReportAutoCaptureOptions {
  enabled: boolean;
}

interface UseBugReportAutoCaptureReturn {
  consoleLogs: ConsoleLogEntry[];
  browserMetadata: BrowserMetadata | null;
}

export function useBugReportAutoCapture({
  enabled,
}: UseBugReportAutoCaptureOptions): UseBugReportAutoCaptureReturn {
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleLogEntry[]>([]);
  const [browserMetadata, setBrowserMetadata] = React.useState<BrowserMetadata | null>(null);

  React.useEffect(() => {
    if (enabled) {
      // Capture console logs automatically
      try {
        const buffer = getConsoleLogBuffer();
        const logs = buffer.getLogs();
        setConsoleLogs(logs);
        capture('bug_report_logs_captured', {
          log_count: logs.length,
          has_errors: logs.some((l) => l.level === 'error'),
          has_warnings: logs.some((l) => l.level === 'warn'),
        });
      } catch (error) {
        console.error('Console log capture failed:', error);
        capture('bug_report_logs_captured', {
          log_count: 0,
          has_errors: false,
          success: false,
        });
      }

      // Get browser metadata automatically
      setBrowserMetadata(getBrowserMetadata());
    }
  }, [enabled]);

  return {
    consoleLogs,
    browserMetadata,
  };
}

