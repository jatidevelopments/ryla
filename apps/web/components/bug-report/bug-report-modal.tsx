'use client';

import * as React from 'react';
import { Bug, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Textarea,
  Label,
} from '@ryla/ui';
import { capture } from '@ryla/analytics';
import { trpc } from '../../lib/trpc';
import { getConsoleLogBuffer } from '@ryla/shared';
import type { BrowserMetadata, ConsoleLogEntry } from '@ryla/shared';

export interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string; // Pre-fill if logged in
}

function getBrowserMetadata(): BrowserMetadata {
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

export function BugReportModal({
  isOpen,
  onClose,
  userEmail,
}: BugReportModalProps) {
  // Form state
  const [description, setDescription] = React.useState('');
  const [email, setEmail] = React.useState(userEmail || '');
  const [screenshot, setScreenshot] = React.useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = React.useState<File | null>(null);

  // Auto-captured data (not shown to user)
  const [consoleLogs, setConsoleLogs] = React.useState<ConsoleLogEntry[]>([]);
  const [browserMetadata, setBrowserMetadata] = React.useState<BrowserMetadata | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [countdown, setCountdown] = React.useState(5);
  const countdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const autoCloseTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Countdown timer effect
  React.useEffect(() => {
    if (submitSuccess) {
      setCountdown(5);
      
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

      // Auto-close after 5 seconds
      autoCloseTimeoutRef.current = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearInterval(interval);
        if (autoCloseTimeoutRef.current) {
          clearTimeout(autoCloseTimeoutRef.current);
        }
      };
    }
  }, [submitSuccess]);

  // tRPC mutation
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

  // Auto-capture console logs and browser metadata when modal opens (hidden from user)
  React.useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  // Handle manual screenshot file upload
  const handleScreenshotUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Image file must be less than 5MB');
      return;
    }

    setScreenshotFile(file);

    // Convert to base64 for preview and submission
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setScreenshot(base64String);
    };
    reader.onerror = () => {
      setSubmitError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshot(null);
    setScreenshotFile(null);
  };

  const handleSubmit = async () => {
    if (!isDescriptionValid) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitMutation.mutateAsync({
        description,
        email: email || undefined,
        includeScreenshot: !!screenshot,
        includeLogs: true, // Always include logs
        screenshot: screenshot || undefined,
        consoleLogs: consoleLogs.length > 0 ? consoleLogs : undefined,
        browserMetadata: browserMetadata || getBrowserMetadata(),
      });
    } catch (error) {
      // Error handled in onError callback
    }
  };

  const handleClose = () => {
    // Don't close while actively submitting (but allow closing after success)
    if (isSubmitting && !submitSuccess) return;

    // Clear timeouts
    if (countdownTimeoutRef.current) {
      clearInterval(countdownTimeoutRef.current);
    }
    if (autoCloseTimeoutRef.current) {
      clearTimeout(autoCloseTimeoutRef.current);
    }

    // Reset form
    setDescription('');
    setEmail(userEmail || '');
    setScreenshot(null);
    setScreenshotFile(null);
    setConsoleLogs([]);
    setBrowserMetadata(null);
    setSubmitError(null);
    setSubmitSuccess(false);
    setCountdown(5);
    onClose();
  };

  // Validation
  const isDescriptionValid = description.length >= 10;
  const canSubmit = isDescriptionValid && !isSubmitting;

  // Analytics: track modal open
  React.useEffect(() => {
    if (isOpen) {
      capture('bug_report_modal_opened', {
        page_url: window.location.href,
        is_authenticated: !!userEmail,
      });
    }
  }, [isOpen, userEmail]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121214] border-white/10"
        data-bug-report-modal
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-[var(--purple-500)]" />
            Report a Bug
          </DialogTitle>
          <DialogDescription>
            Help us improve by reporting issues you encounter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Success Message */}
          {submitSuccess && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-400">Thank you!</p>
                  <p className="text-xs text-green-400/70">
                    Your bug report has been submitted successfully. We'll review it and get back to
                    you if needed.
                  </p>
                </div>
              </div>
              {/* Close Button with Countdown */}
              <div className="flex justify-end">
                <Button
                  onClick={handleClose}
                  className="bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] hover:opacity-90"
                >
                  Close{countdown > 0 ? ` (${countdown})` : ''}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submitError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">Failed to submit bug report</p>
                <p className="text-xs text-red-400/70">{submitError}</p>
              </div>
            </div>
          )}

          {/* Form Fields - Only show when not successful */}
          {!submitSuccess && (
            <>
              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Describe the issue <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe the bug or issue you encountered..."
                  rows={4}
                  error={description.length > 0 && !isDescriptionValid}
                  disabled={isSubmitting}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  {description.length > 0 && !isDescriptionValid && (
                    <p className="text-xs text-red-400">
                      Description must be at least 10 characters
                    </p>
                  )}
                  <p className="text-xs text-white/40 ml-auto">
                    {description.length} / 10 minimum
                  </p>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional, for follow-up)</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isSubmitting}
                />
              </div>

              {/* Manual Screenshot Upload */}
              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot (optional)</Label>
                {!screenshot ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-lg border border-white/10 overflow-hidden">
                      <img
                        src={screenshot}
                        alt="Screenshot preview"
                        className="w-full h-auto max-h-64 object-contain bg-[#0f0f11]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveScreenshot}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      Remove Screenshot
                    </Button>
                  </div>
                )}
                <p className="text-xs text-white/40">
                  Upload a screenshot to help us understand the issue better
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer - Only show when not successful */}
        {!submitSuccess && (
          <DialogFooter className="flex flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

