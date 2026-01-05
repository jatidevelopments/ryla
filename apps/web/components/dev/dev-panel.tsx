'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';

interface DevPanelProps {
  /** Callback to reset tutorial for a specific page */
  onResetTutorial?: (tutorialId: string) => void;
}

/**
 * DevPanel - Development-only floating panel for debugging and testing
 * Only visible when running on localhost or in development mode
 */
export function DevPanel({ onResetTutorial }: DevPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Ctrl/Cmd + Shift + D to toggle panel
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Only show in development
  const isDev =
    typeof window !== 'undefined' &&
    (process.env.NODE_ENV === 'development' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (!isDev || !mounted) {
    return null;
  }

  const handleResetTutorial = (tutorialId: string) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`tutorial_${tutorialId}_completed`);
        onResetTutorial?.(tutorialId);
        // Close panel after reset
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to reset tutorial:', error);
      }
    }
  };

  const handleClearAllTutorials = () => {
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage);
        const tutorialKeys = keys.filter((key) => key.startsWith('tutorial_'));
        tutorialKeys.forEach((key) => localStorage.removeItem(key));
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to clear tutorials:', error);
      }
    }
  };

  const panelContent = (
    <>
      {/* Floating Button - Purple with question mark */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'h-12 w-12 rounded-full',
          'bg-gradient-to-br from-purple-500 to-pink-500',
          'hover:from-purple-400 hover:to-pink-400',
          'text-white shadow-lg shadow-purple-500/30',
          'flex items-center justify-center',
          'transition-all duration-200 hover:scale-110',
          'border border-white/20'
        )}
        aria-label="Open dev panel (Ctrl+Shift+D)"
        title="Dev Panel (Ctrl+Shift+D)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-6 w-6"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Modal */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.5 10a4.5 4.5 0 004.284-5.882c-.105-.324-.51-.391-.752-.15L15.34 6.66a.454.454 0 01-.493.101 3.482 3.482 0 01-1.608-1.607.454.454 0 01.1-.493l2.69-2.69c.243-.243.175-.647-.149-.752a4.5 4.5 0 00-5.873 4.575c.055.873-.128 1.808-.8 2.368l-7.23 6.024a2.724 2.724 0 103.837 3.837l6.024-7.23c.56-.672 1.495-.855 2.368-.8.096.007.193.01.291.01zM5 16a1 1 0 11-2 0 1 1 0 012 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-bold text-white">Dev Panel</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/40 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                  aria-label="Close dev panel"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Tutorial Reset Section */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 mb-2 uppercase tracking-wider">
                    Reset Tutorials
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleResetTutorial('studio')}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-xl',
                        'bg-white/5 hover:bg-white/10',
                        'text-white text-sm font-medium',
                        'transition-colors',
                        'flex items-center gap-3'
                      )}
                    >
                      <span className="text-purple-400">🎨</span>
                      Reset Studio Tutorial
                    </button>
                    {/* Add more tutorials here as needed */}
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={handleClearAllTutorials}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl',
                      'bg-red-500/10 hover:bg-red-500/20',
                      'text-red-400 text-sm font-medium',
                      'transition-colors',
                      'flex items-center justify-center gap-2'
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Clear All Tutorial States
                  </button>
                </div>

                {/* Environment Info */}
                <div className="pt-2 border-t border-white/5">
                  <div className="px-3 py-2 rounded-lg text-white/40 text-xs">
                    <span className="text-white/60">Page:</span>{' '}
                    {typeof window !== 'undefined' ? window.location.pathname : ''}
                    <br />
                    <span className="text-white/60">Shortcut:</span> Ctrl+Shift+D
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );

  return panelContent;
}
