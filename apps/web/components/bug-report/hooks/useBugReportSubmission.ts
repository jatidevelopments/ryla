import * as React from 'react';
import { capture } from '@ryla/analytics';
import { trpc } from '../../../lib/trpc';
import { getBrowserMetadata } from './useBugReportAutoCapture';
import type { BrowserMetadata, ConsoleLogEntry } from '@ryla/shared';

interface UseBugReportSubmissionOptions {
  description: string;
  email: string;
  screenshot: string | null;
  consoleLogs: ConsoleLogEntry[];
  browserMetadata: BrowserMetadata | null;
}

interface UseBugReportSubmissionReturn {
  isSubmitting: boolean;
  submitError: string | null;
  submitSuccess: boolean;
  submit: () => Promise<void>;
  reset: () => void;
}

export function useBugReportSubmission({
  description,
  email,
  screenshot,
  consoleLogs,
  browserMetadata,
}: UseBugReportSubmissionOptions): UseBugReportSubmissionReturn {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);

  const submitMutation = trpc.bugReport.submit.useMutation({
    onSuccess: (data) => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      capture('bug_report_submitted', {
        bug_report_id: data.bugReportId,
        has_screenshot: !!screenshot,
        has_logs: consoleLogs.length > 0,
        description_length: description.length,
        success: true,
      });
    },
    onError: (error) => {
      setSubmitError(error.message);
      setIsSubmitting(false);
      capture('bug_report_submitted', {
        has_screenshot: !!screenshot,
        has_logs: consoleLogs.length > 0,
        description_length: description.length,
        success: false,
        error: error.message,
      });
    },
  });

  const submit = React.useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitMutation.mutateAsync({
        description,
        email: email || undefined,
        includeScreenshot: !!screenshot,
        includeLogs: true,
        screenshot: screenshot || undefined,
        consoleLogs: consoleLogs.length > 0 ? consoleLogs : undefined,
        browserMetadata: browserMetadata || getBrowserMetadata(),
      });
    } catch (_error) {
      // Error handled in onError callback
    }
  }, [description, email, screenshot, consoleLogs, browserMetadata, submitMutation]);

  const reset = React.useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submit,
    reset,
  };
}

