'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn, useIsMobile } from '@ryla/ui';

interface PickerDrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  anchorRef?: React.RefObject<HTMLElement | null>;
  desktopPosition?: 'top' | 'bottom';
  align?: 'left' | 'right';
  tabletBreakpoint?: number;
}

export function PickerDrawer({
  children,
  isOpen,
  onClose,
  title,
  className,
  anchorRef,
  desktopPosition = 'top',
  align = 'left',
  tabletBreakpoint = 768,
}: PickerDrawerProps) {
  const isMobile = useIsMobile(tabletBreakpoint);
  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0, right: 0 });
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Desktop positioning logic
  React.useEffect(() => {
    if (isMobile || !isOpen || !anchorRef?.current) return;

    const updatePosition = () => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        const top = desktopPosition === 'top' ? rect.top - 8 : rect.bottom + 8;
        const left = rect.left;
        const right = window.innerWidth - rect.right;

        setPosition({ top, left, right });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, isMobile, anchorRef, desktopPosition]);

  // Click outside listener
  React.useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const content = isMobile ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      {/* Bottom Sheet */}
      <div
        ref={ref}
        className={cn(
          'fixed inset-x-0 bottom-0 z-[9999] flex flex-col',
          'bg-[var(--bg-elevated)] rounded-t-[32px] border-t border-white/10',
          'max-h-[92vh] shadow-2xl overflow-hidden',
          'animate-in slide-in-from-bottom-full duration-300 ease-out',
          'w-full rounded-b-none'
        )}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header if title exists */}
        {title && (
          <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-1">
          {children}
        </div>
      </div>
    </>
  ) : (
    // Desktop Popover or Centered Modal
    <>
      {/* Backdrop for centered modal */}
      {!anchorRef && (
        <div
          className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}
      <div
        ref={ref}
        style={
          anchorRef
            ? {
                position: 'fixed',
                top: position.top,
                ...(align === 'right'
                  ? { right: position.right }
                  : { left: position.left }),
                transform:
                  desktopPosition === 'top' ? 'translateY(-100%)' : 'none',
              }
            : {
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
        className={cn(
          'z-[9999] bg-[var(--bg-elevated)] border border-white/10 shadow-2xl rounded-2xl overflow-hidden',
          !anchorRef && 'animate-in zoom-in-95 duration-200',
          className
        )}
      >
        {title && (
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="text-lg font-bold text-white">{title}</div>
            {!anchorRef && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className={cn(!anchorRef && 'p-4')}>{children}</div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
