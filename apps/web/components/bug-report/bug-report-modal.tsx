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
import {
  useBugReportForm,
  useBugReportScreenshot,
  useBugReportCountdown,
  useBugReportAutoCapture,
  useBugReportSubmission,
} from './hooks';

export interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string; // Pre-fill if logged in
}

export function BugReportModal({
  isOpen,
  onClose,
  userEmail,
}: BugReportModalProps) {
  // Form state
  const form = useBugReportForm({ initialEmail: userEmail });

  // Screenshot handling
  const screenshot = useBugReportScreenshot();

  // Auto-capture data
  const autoCapture = useBugReportAutoCapture({ enabled: isOpen });

  // Submission
  const submission = useBugReportSubmission({
    description: form.description,
    email: form.email,
    screenshot: screenshot.screenshot,
    consoleLogs: autoCapture.consoleLogs,
    browserMetadata: autoCapture.browserMetadata,
  });

  // Countdown for auto-close
  const handleCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    handleCloseRef.current = onClose;
  }, [onClose]);

  const handleCloseWithReset = React.useCallback(() => {
    if (submission.isSubmitting && !submission.submitSuccess) return;

    form.reset();
    screenshot.reset();
    submission.reset();
    countdown.reset();
    handleCloseRef.current();
  }, [form, screenshot, submission]);

  const countdown = useBugReportCountdown({
    enabled: submission.submitSuccess,
    duration: 5,
    onComplete: handleCloseWithReset,
  });

  // Handle screenshot upload
  const handleScreenshotUpload = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      screenshot.uploadScreenshot(file).catch(() => {
        // Error already set in hook
      });
    },
    [screenshot]
  );

  // Handle submit
  const handleSubmit = React.useCallback(async () => {
    if (!form.isDescriptionValid) return;
    await submission.submit();
  }, [form.isDescriptionValid, submission]);

  // Handle close
  const handleClose = React.useCallback(() => {
    handleCloseWithReset();
  }, [handleCloseWithReset]);

  // Combine errors (screenshot errors + submission errors)
  const displayError = screenshot.error || submission.submitError;

  // Analytics: track modal open
  React.useEffect(() => {
    if (isOpen) {
      capture('bug_report_modal_opened', {
        page_url: window.location.href,
        is_authenticated: !!userEmail,
      });
    }
  }, [isOpen, userEmail]);

  const canSubmit = form.canSubmit && !submission.isSubmitting;

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
          {submission.submitSuccess && (
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
                  Close{countdown.countdown > 0 ? ` (${countdown.countdown})` : ''}
                </Button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-400">
                  {submission.submitError ? 'Failed to submit bug report' : 'Error'}
                </p>
                <p className="text-xs text-red-400/70">{displayError}</p>
              </div>
            </div>
          )}

          {/* Form Fields - Only show when not successful */}
          {!submission.submitSuccess && (
            <>
              {/* Description Field */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Describe the issue <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => form.setDescription(e.target.value)}
                  placeholder="Please describe the bug or issue you encountered..."
                  rows={4}
                  error={form.description.length > 0 && !form.isDescriptionValid}
                  disabled={submission.isSubmitting}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  {form.description.length > 0 && !form.isDescriptionValid && (
                    <p className="text-xs text-red-400">
                      Description must be at least 10 characters
                    </p>
                  )}
                  <p className="text-xs text-white/40 ml-auto">
                    {form.description.length} / 10 minimum
                  </p>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional, for follow-up)</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => form.setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={submission.isSubmitting}
                />
              </div>

              {/* Manual Screenshot Upload */}
              <div className="space-y-2">
                <Label htmlFor="screenshot">Screenshot (optional)</Label>
                {!screenshot.screenshot ? (
                  <div className="flex items-center gap-2">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={submission.isSubmitting}
                      className="text-sm"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative rounded-lg border border-white/10 overflow-hidden">
                      <img
                        src={screenshot.screenshot}
                        alt="Screenshot preview"
                        className="w-full h-auto max-h-64 object-contain bg-[#0f0f11]"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={screenshot.removeScreenshot}
                      disabled={submission.isSubmitting}
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
        {!submission.submitSuccess && (
          <DialogFooter className="flex flex-row justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={submission.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || submission.isSubmitting}
              className="bg-gradient-to-r from-[var(--purple-600)] to-[var(--pink-500)] hover:opacity-90 disabled:opacity-50"
            >
              {submission.isSubmitting ? (
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

