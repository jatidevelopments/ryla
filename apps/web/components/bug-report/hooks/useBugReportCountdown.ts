import * as React from 'react';

interface UseBugReportCountdownOptions {
  enabled: boolean;
  duration: number;
  onComplete: () => void;
}

interface UseBugReportCountdownReturn {
  countdown: number;
  reset: () => void;
}

export function useBugReportCountdown({
  enabled,
  duration,
  onComplete,
}: UseBugReportCountdownOptions): UseBugReportCountdownReturn {
  const [countdown, setCountdown] = React.useState(duration);
  const countdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = React.useRef(onComplete);

  // Keep callback ref updated
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  React.useEffect(() => {
    if (enabled) {
      setCountdown(duration);

      // Start countdown
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      countdownTimeoutRef.current = interval;

      // Auto-close after duration
      autoCloseTimeoutRef.current = setTimeout(() => {
        onCompleteRef.current();
      }, duration * 1000);

      return () => {
        clearInterval(interval);
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
      };
    }
  }, [enabled, duration]);

  const reset = React.useCallback(() => {
    if (countdownTimeoutRef.current) {
      clearInterval(countdownTimeoutRef.current);
    }
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }
    setCountdown(duration);
  }, [duration]);

  return {
    countdown,
    reset,
  };
}

