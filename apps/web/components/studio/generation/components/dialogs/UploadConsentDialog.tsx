'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
// import { cn } from '@ryla/ui';

interface UploadConsentDialogProps {
  onAccept: () => void;
  onReject: () => void;
  isOpen: boolean;
}

export function UploadConsentDialog({
  onAccept,
  onReject,
  isOpen,
}: UploadConsentDialogProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-lg bg-[#18181b] rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-yellow-400">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Upload Consent Required</h2>
              <p className="text-sm text-white/50">Please confirm your image ownership</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-white leading-relaxed">
              <strong className="text-yellow-400">Important:</strong> By uploading your own images, you confirm that:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">
                Your images contain <strong>only objects or things</strong> that you own or have rights to use
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">
                Your images do <strong>not contain images of other persons</strong> without their explicit consent
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-white/80">
                Your images do <strong>not contain nature or content</strong> that you don't have rights to use
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-xs text-white/60 leading-relaxed">
              This consent will be saved to your account and you won't be asked again. 
              Violation of these terms may result in account suspension.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-[#0d0d0f]">
          <button
            onClick={onReject}
            className="px-6 py-2.5 rounded-xl bg-white/5 text-white/80 font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-6 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
          >
            I Confirm & Accept
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

